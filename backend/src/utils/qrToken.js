import crypto from 'crypto';

const getSecret = () => process.env.QR_SECRET || 'change-me-in-production';

const sign = (payload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
};

// Entry QR: generated once when a subscription becomes active, reused by the
// resident at every check-in until the subscription expires.
export const signSubscriptionQRToken = (subscriptionId, licensePlate) => {
  return sign({
    type: 'subscription_entry',
    subId: subscriptionId.toString(),
    plate: licensePlate.toUpperCase().replace(/\s/g, ''),
    iat: Date.now(),
  });
};

// Walk-in ticket: minted the moment the gate camera reads a plate with no
// subscription behind it. Re-scanned to confirm check-in, then kept as-is
// (never re-minted) for the whole visit — the same QR is presented again at
// checkout, just like a physical parking ticket stub.
export const signWalkInTicket = (licensePlate) => {
  return sign({
    type: 'walkin_ticket',
    plate: licensePlate.toUpperCase().replace(/\s/g, ''),
    iat: Date.now(),
  });
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
