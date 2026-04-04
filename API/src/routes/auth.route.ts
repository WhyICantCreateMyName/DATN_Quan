import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// Đăng nhập User
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { memberProfile: true, trainerProfile: true }
    });

    if (!user || user.passwordHash !== password) {
      res.status(401).json({ error: 'Sai số điện thoại hoặc mật khẩu!' });
      return;
    }

    // Sinh Token
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Gắn vào HttpOnly Cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Dùng false trên localhost
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: `Lỗi Server: ${error.message}` });
  }
});

// Lấy thông tin phiên đăng nhập
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    // Giải mã token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Tìm lấy user object đầy đủ
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { memberProfile: true, trainerProfile: true }
    });

    if (!user) {
      res.status(401).json({ error: 'User không tồn tại' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ' });
  }
});

// Đăng Xuất
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('jwt');
  res.json({ message: 'Đã đăng xuất' });
});

export default router;
