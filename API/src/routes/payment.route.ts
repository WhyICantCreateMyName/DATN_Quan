import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.post('/momo', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    if (!amount) {
      res.status(400).json({ error: 'Thiếu số tiền thanh toán' });
      return;
    }

    const mockMomoResponse = {
      partnerCode: "MOMO_TEST_SANDBOX",
      orderId: orderId || `MOMO_${Date.now()}`,
      requestId: `REQ_${Date.now()}`,
      amount: amount,
      responseTime: Date.now(),
      message: "Success",
      resultCode: 0,
      // QRCode giả lập sử dụng API tạo QR miễn phí (QR Code Data là deep link chuyển hướng)
      payUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MomoPayment_${amount}_${orderId}`,
      shortLink: "https://momo.vn/mock-sandbox"
    };

    res.json(mockMomoResponse);
  } catch (error: any) {
    res.status(500).json({ error: `Momo Sandbox Error: ${error.message}` });
  }
});

export default router;
