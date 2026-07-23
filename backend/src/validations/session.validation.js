import Joi from 'joi';

export const checkInSchema = Joi.object({
  vehicleType: Joi.string().valid('motorcycle', 'car').required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),

  // Optional: residents are bound to their reserved slot via subscription;
  // walk-ins are auto-assigned a visitor floor (counter-based, no fixed slot).
  slotId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'car',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  // Optional: system auto-picks the first row with capacity if not provided.
  rowId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'motorcycle',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  note: Joi.string().trim().max(300).allow('', null),

  // Required for everyone: residents present their subscription QR, walk-ins
  // present the ticket from /session/entry-qr. Both must encode the same
  // plate the gate camera just read.
  qrToken: Joi.string().required(),
});

export const requestEntryQRSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});

export const checkoutSchema = Joi.object({
  qrToken: Joi.string().required(),
  scannedPlate: Joi.string().trim().min(4).max(20).required(),
});

// Lost-QR checkout: no QR; staff verifies vehicle papers, only the camera plate.
export const lostQrCheckoutSchema = Joi.object({
  method: Joi.string().valid('cash', 'transfer').default('cash'),
  scannedPlate: Joi.string().trim().min(4).max(20).required(),
  note: Joi.string().trim().max(300).allow('', null),
});

export const lookupSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});

export const scanPlateSchema = Joi.object({
  image: Joi.string().required(),
});

export const verifyQRSchema = Joi.object({
  qrToken: Joi.string().required(),
  scannedPlate: Joi.string().trim().min(4).max(20).required(),
});
