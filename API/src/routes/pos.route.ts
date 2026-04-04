import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Danh sách hàng hoá POS
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
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
    // items: [{ productId, quantity, price }, { planId, quantity, price }]
    
    // Tính tổng tiền
    const subTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    // Note: Ở đây chỉ lưu log Invoice, nếu muốn bán gói tập thì gọi API /membership/subscribe sau
    const invoice = await prisma.invoice.create({
      data: {
        cashierId: Number(cashierId),
        memberId: memberId ? Number(memberId) : undefined,
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
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
