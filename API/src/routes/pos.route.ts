import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Danh sách hàng hoá POS & Kho (có tìm kiếm & phân trang)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    let limit = Math.max(1, Number(req.query.limit) || 30);
    limit = Math.min(limit, 100);
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where: any = search
      ? { name: { contains: search } }
      : {};

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' }
    });

    res.json({
      data: products,
      page,
      limit,
      total
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách sản phẩm' });
  }
});

// 2. Chi tiết 1 sản phẩm
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Nhập thêm hàng hoá mới
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, price, stock, imageUrl } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Tên và giá sản phẩm là bắt buộc' });
    }
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock) || 0,
        imageUrl: imageUrl || null
      }
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Cập nhật thông tin hàng hóa & tồn kho
router.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, price, stock, imageUrl } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const product = await prisma.product.update({
      where: { id },
      data
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Xóa hàng hóa
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Chức năng Tạo Hóa Đơn Lễ Tân (POS Invoice) - ACID Transaction chuẩn mực
router.post('/invoice', async (req: Request, res: Response) => {
  try {
    const { cashierId, memberId, items, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng không có sản phẩm nào' });
    }

    if (!cashierId) {
      return res.status(400).json({ error: 'Thiếu thông tin nhân viên thu ngân (cashierId)' });
    }

    const invoice = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const itemCreates: any[] = [];

      // 1. Kiểm tra từng mặt hàng, trừ tồn kho và tính tổng tiền
      for (const item of items) {
        const qty = Math.max(1, Number(item.quantity) || 1);

        if (item.productId) {
          const prodId = Number(item.productId);
          const prod = await tx.product.findUnique({ where: { id: prodId } });
          if (!prod) {
            throw new Error(`Sản phẩm ID ${prodId} không tồn tại trong hệ thống.`);
          }
          if (prod.stock < qty) {
            throw new Error(`Sản phẩm "${prod.name}" chỉ còn ${prod.stock} trong kho, không đủ bán số lượng ${qty}.`);
          }

          // Trừ tồn kho tức thì
          await tx.product.update({
            where: { id: prodId },
            data: { stock: { decrement: qty } }
          });

          const subTotal = prod.price * qty;
          calculatedTotal += subTotal;

          itemCreates.push({
            productId: prodId,
            quantity: qty,
            unitPrice: prod.price,
            subTotal
          });
        } else if (item.planId) {
          const planId = Number(item.planId);
          const plan = await tx.membershipPlan.findUnique({ where: { id: planId } });
          if (!plan) {
            throw new Error(`Gói tập ID ${planId} không tồn tại.`);
          }

          const subTotal = plan.price * qty;
          calculatedTotal += subTotal;

          itemCreates.push({
            planId: planId,
            quantity: qty,
            unitPrice: plan.price,
            subTotal
          });

          // Nếu có hội viên, tự động kích hoạt thẻ & nạp buổi PT vào ví
          if (memberId) {
            const mId = Number(memberId);
            for (let k = 0; k < qty; k++) {
              const existingSub = await tx.memberSubscription.findFirst({
                where: { memberId: mId, status: 'ACTIVE' },
                include: { plan: true }
              });

              if (existingSub && existingSub.plan.tag === plan.tag) {
                // Cùng phân khúc: Cộng dồn thời hạn và hợp đồng
                const newEndDate = new Date(existingSub.endDate);
                newEndDate.setDate(newEndDate.getDate() + plan.durationDays);
                await tx.memberSubscription.update({
                  where: { id: existingSub.id },
                  data: {
                    endDate: newEndDate,
                    grantedPtSessions: existingSub.grantedPtSessions + plan.ptSessions
                  }
                });
              } else {
                // Khác phân khúc hoặc chưa có: Khởi tạo gói mới
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + plan.durationDays);
                await tx.memberSubscription.create({
                  data: {
                    memberId: mId,
                    planId: plan.id,
                    startDate: new Date(),
                    endDate,
                    grantedPtSessions: plan.ptSessions,
                    status: 'ACTIVE'
                  }
                });
              }

              // Nạp buổi PT vào ví MemberProfile
              await tx.memberProfile.update({
                where: { id: mId },
                data: { remainingPtSessions: { increment: plan.ptSessions } }
              });
            }
          }
        }
      }

      // 2. Tạo bản ghi Hóa đơn chính thức
      const createdInvoice = await tx.invoice.create({
        data: {
          cashierId: Number(cashierId),
          memberId: memberId ? Number(memberId) : null,
          totalAmount: calculatedTotal,
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: itemCreates
          }
        },
        include: {
          items: {
            include: { product: true, plan: true }
          },
          cashier: { select: { id: true, fullName: true, phone: true } },
          member: {
            include: {
              user: { select: { id: true, fullName: true, phone: true } }
            }
          }
        }
      });

      // 3. Cập nhật doanh số vào KPI nhân viên thu ngân
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      await tx.staffKPI.updateMany({
        where: { userId: Number(cashierId), month, year },
        data: { achievedAmount: { increment: calculatedTotal } }
      });

      // 4. Tính hoa hồng bán hàng (SALE) cho các gói tập
      for (const item of createdInvoice.items) {
        if (item.planId) {
          const rate = await tx.commissionRate.findFirst({
            where: {
              OR: [
                { planId: item.planId },
                { applyTo: 'SALE', planId: null }
              ]
            }
          });

          if (rate) {
            let amount = 0;
            if (rate.type === 'PERCENTAGE') {
              amount = (item.subTotal * rate.value) / 100;
            } else {
              amount = rate.value;
            }

            if (amount > 0) {
              await tx.commissionLog.create({
                data: {
                  userId: Number(cashierId),
                  amount,
                  reason: `Hoa hồng bán gói tập: ${item.plan?.name || item.planId}`,
                  invoiceItemId: item.id
                }
              });
            }
          }
        }
      }

      return createdInvoice;
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Lỗi xử lý hóa đơn' });
  }
});

// 7. Danh sách lịch sử hóa đơn (Invoices History)
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    let limit = Math.max(1, Number(req.query.limit) || 20);
    limit = Math.min(limit, 100);
    const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;
    const cashierId = req.query.cashierId ? Number(req.query.cashierId) : undefined;

    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (cashierId) where.cashierId = cashierId;

    const total = await prisma.invoice.count({ where });
    const invoices = await prisma.invoice.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        cashier: { select: { id: true, fullName: true, phone: true } },
        member: {
          include: {
            user: { select: { id: true, fullName: true, phone: true } }
          }
        },
        items: {
          include: {
            product: true,
            plan: true
          }
        }
      }
    });

    res.json({
      data: invoices,
      total,
      page,
      limit
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy lịch sử hóa đơn' });
  }
});

// 8. Chi tiết 1 hóa đơn
router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        cashier: { select: { id: true, fullName: true, phone: true } },
        member: {
          include: {
            user: { select: { id: true, fullName: true, phone: true } }
          }
        },
        items: {
          include: {
            product: true,
            plan: true
          }
        }
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
