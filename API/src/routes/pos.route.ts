import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Danh sách hàng hoá POS
router.get('/products', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    let limit = Math.max(1, Number(req.query.limit) || 30);
    limit = Math.min(limit, 50);

    const total = await prisma.product.count();
    const products = await prisma.product.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Lỗi' });
  }
});

// Nhập thêm hàng hoá
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, price, stock, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: { name, price, stock, imageUrl }
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chức năng Tạo Hóa Đơn Lễ Tân (POS Invoice)
router.post('/invoice', async (req: Request, res: Response) => {
  try {
    const { cashierId, memberId, items, paymentMethod } = req.body;
    
    // Tính tổng tiền
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    const invoice = await prisma.invoice.create({
      data: {
        cashierId: Number(cashierId),
        memberId: memberId ? Number(memberId) : null,
        totalAmount: subTotal,
        paymentMethod: paymentMethod || 'CASH',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId ? Number(item.productId) : undefined,
            planId: item.planId ? Number(item.planId) : undefined,
            quantity: item.quantity,
            subTotal: item.price * item.quantity
          }))
        }
      },
      include: { items: true }
    });

    // AUTO-SUBSCRIBE CHO THẺ TẬP
    if (memberId) {
       for (const item of items) {
          if (item.planId) {
             const plan = await prisma.membershipPlan.findUnique({ where: { id: Number(item.planId) } });
             if (plan) {
                await prisma.memberSubscription.create({
                   data: {
                      memberId: Number(memberId),
                      planId: plan.id,
                      startDate: new Date(),
                      endDate: new Date(new Date().setDate(new Date().getDate() + plan.durationDays)),
                      remainingPtSessions: plan.ptSessions,
                      status: 'ACTIVE'
                   }
                });
             }
          }
       }
    }

    // CẬP NHẬT KPI & HOA HỒNG
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // 1. Cập nhật doanh số vào KPI của người bán
    await prisma.staffKPI.updateMany({
       where: { userId: Number(cashierId), month, year },
       data: { achievedAmount: { increment: subTotal } }
    });

    // 2. Tính hoa hồng bán hàng (SALE)
    for (const item of invoice.items) {
       if (item.planId) {
          const rate = await prisma.commissionRate.findFirst({
             where: { 
                OR: [
                   { planId: item.planId },
                   { applyTo: 'SALE', planId: null }
                ]
             }
          });

          if (rate) {
             let amount = 0;
             if (rate.type === 'PERCENTAGE') amount = (item.subTotal * rate.value) / 100;
             else amount = rate.value;

             if (amount > 0) {
                await prisma.commissionLog.create({
                   data: {
                      userId: Number(cashierId),
                      amount,
                      reason: `Hoa hồng bán gói tập ID: ${item.planId}`,
                      invoiceItemId: item.id
                   }
                });
             }
          }
       }
    }

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật thông tin hàng hóa
router.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, price, stock, imageUrl } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { name, price, stock, imageUrl }
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa hàng hóa
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
