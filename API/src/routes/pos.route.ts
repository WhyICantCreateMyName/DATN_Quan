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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi' });
  }
});

// Nhập thêm hàng hoá
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, price, stock }
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

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
