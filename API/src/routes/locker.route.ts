import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 1. Lấy danh sách toàn bộ dãy Locker
router.get('/', async (req: Request, res: Response) => {
  try {
    const rows = await prisma.lockerRow.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Tạo dãy Locker mới (Khởi tạo mảng layout)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, rowCount, colCount } = req.body;
    
    // Khởi tạo layout null (AVAILABLE)
    // rowCount: số hàng (x), colCount: số cột (y)
    const layout = Array.from({ length: Number(rowCount) }, () => 
      Array.from({ length: Number(colCount) }, () => null)
    );

    const row = await prisma.lockerRow.create({
      data: {
        name,
        rowCount: Number(rowCount),
        colCount: Number(colCount),
        layout: layout as any
      }
    });
    res.json(row);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Cập nhật trạng thái từng ô Locker (Chiếm dụng, Giải phóng, Báo hỏng)
router.patch('/:id/cell', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { x, y, value } = req.body; // x, y là index (0-based)
    // value: number (memberId), null (Available), hoặc "BROKEN"

    const lockerRow = await prisma.lockerRow.findUnique({ where: { id } });
    if (!lockerRow) return res.status(404).json({ error: 'Không tìm thấy dãy locker' });

    let layout = lockerRow.layout as any[][];
    if (x >= 0 && x < lockerRow.rowCount && y >= 0 && y < lockerRow.colCount) {
      layout[x][y] = value;
    } else {
      return res.status(400).json({ error: 'Vị trí không hợp lệ' });
    }

    const updated = await prisma.lockerRow.update({
      where: { id },
      data: { layout: layout as any }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Xóa dãy Locker
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.lockerRow.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
