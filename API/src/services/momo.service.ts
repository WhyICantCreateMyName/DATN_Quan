import crypto from 'crypto';

const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  // RedirectUrl cho Mobile nên là Deep Link (Ví dụ: exp:// cho Expo hoặc titangym:// cho App thật)
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'exp://192.168.0.100:8081',
  ipnUrl: process.env.MOMO_IPN_URL || 'https://robert-leafiest-kristen.ngrok-free.dev/api/payment/momo-ipn',
};

const buildCreateSignature = (payload: any) => {
  const { accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType } = payload;
  return `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
};

const sign = (rawSignature: string) => {
  return crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');
};

export const momoService = {
  async createPayment({ orderId, requestId, orderInfo, amount, extraData = '', redirectUrl }: any) {
    const payloadForSignature = {
      accessKey: MOMO_CONFIG.accessKey,
      amount: String(amount),
      extraData,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      orderId,
      orderInfo,
      partnerCode: MOMO_CONFIG.partnerCode,
      redirectUrl: redirectUrl || MOMO_CONFIG.redirectUrl,
      requestId,
      requestType: 'captureWallet',
    };

    const rawSignature = buildCreateSignature(payloadForSignature);
    const signature = sign(rawSignature);

    const requestBody = {
      ...payloadForSignature,
      signature,
      lang: 'vi',
    };

    const response = await fetch(MOMO_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data;
  },

  verifySignature(payload: any) {
    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = payload;
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const checkSignature = sign(rawSignature);
    return checkSignature === signature;
  }
};
