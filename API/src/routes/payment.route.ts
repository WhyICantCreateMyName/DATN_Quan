import { Router } from 'express';
import type { Request, Response } from 'express';
import { momoService } from '../services/momo.service.js';
import { PrismaClient } from '@prisma/client';

import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// Helper để lấy Member ID từ Token
const getMemberId = async (req: Request) => {
  const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
    return member?.id || null;
  } catch (e) { return null; }
};

router.post('/momo', async (req: Request, res: Response) => {
  try {
    let { amount, planId, memberId, redirectUrl } = req.body;
    console.log('Payment Request:', { amount, planId, memberId, redirectUrl });

    if (!memberId) {
      memberId = await getMemberId(req);
      console.log('Resolved MemberId:', memberId);
    }

    if (!amount || !planId || !memberId) {
      console.log('Missing Info:', { amount, planId, memberId });
      res.status(400).json({ error: 'Thiếu thông tin thanh toán' });
      return;
    }

    const orderId = `TITAN_${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toan goi tap Titan Gym #${planId}`;
    
    // Luu thong tin extra de IPN dung
    const extraData = Buffer.from(JSON.stringify({ memberId, planId })).toString('base64');

    console.log('Calling MoMo Service...');
    const result = await momoService.createPayment({
      orderId,
      requestId,
      orderInfo,
      amount,
      extraData,
      redirectUrl // Truyen redirectUrl tu client vao
    });
    console.log('MoMo Result:', result);

    res.json(result);
  } catch (error: any) {
    console.error('MoMo Error Caught:', error);
    res.status(500).json({ error: `Momo Error: ${error.message}` });
  }
});

// MoMo IPN (Instant Payment Notification)
router.post('/momo-ipn', async (req: Request, res: Response) => {
  console.log('MoMo IPN Received:', req.body);
  const { resultCode, extraData } = req.body;

  if (resultCode === 0 && extraData) {
    try {
      const { memberId, planId } = JSON.parse(Buffer.from(extraData, 'base64').toString());
      
      // Goi logic tu membership route (hoac copy vao day)
      // De don gian, ta se thuc hien subscribe luon o day
      const plan = await prisma.membershipPlan.findUnique({ where: { id: Number(planId) } });
      if (plan) {
         const existingSub = await prisma.memberSubscription.findFirst({
            where: { memberId: Number(memberId), status: 'ACTIVE' },
            include: { plan: true }
         });

         if (existingSub && existingSub.plan.tag === plan.tag) {
            const newEndDate = new Date(existingSub.endDate);
            newEndDate.setDate(newEndDate.getDate() + plan.durationDays);
            await prisma.memberSubscription.update({
               where: { id: existingSub.id },
               data: { 
                  endDate: newEndDate,
                  remainingPtSessions: existingSub.remainingPtSessions + plan.ptSessions
               }
            });
         } else {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);
            await prisma.memberSubscription.create({
               data: {
                  memberId: Number(memberId),
                  planId: Number(planId),
                  startDate: new Date(),
                  endDate,
                  remainingPtSessions: plan.ptSessions,
                  status: 'ACTIVE'
               }
            });
         }
         console.log('Successfully activated subscription via MoMo IPN');
      }
    } catch (e) {
      console.error('IPN Processing Error:', e);
    }
  }

  res.status(204).send();
});

export default router;
