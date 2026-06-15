import crypto from 'crypto';

const getSecret = () => process.env.QR_SECRET || 'change-me-in-production';

export const signQRToken = (sessionId, licensePlate) => {
  const payload = {
    sid: sessionId.toString(),
    plate: licensePlate.toUpperCase().replace(/\s/g, ''),
    iat: Date.now(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
};

export const verifyQRToken = (token) => {
  if (!token || typeof token !== 'string') return { valid: false, reason: 'missing_token' };

  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return { valid: false, reason: 'malformed_token' };

  const data = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  if (sig !== expected) return { valid: false, reason: 'invalid_signature' };

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'malformed_payload' };
  }
};
