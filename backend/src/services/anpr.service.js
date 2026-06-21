import AppError from '../utils/appError.js';

export const readLicensePlate = async (imageBase64) => {
  const token = process.env.PLATE_RECOGNIZER_TOKEN;
  if (!token) throw new AppError('ANPR service not configured (missing PLATE_RECOGNIZER_TOKEN)', 503);

  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64, 'base64');

  const form = new FormData();
  form.append('upload', new Blob([imageBuffer], { type: 'image/jpeg' }), 'plate.jpg');
  form.append('regions', 'vn');

  let res;
  try {
    res = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: form,
    });
  } catch (err) {
    throw new AppError(`ANPR service unreachable: ${err.message}`, 502);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AppError(`ANPR service error ${res.status}: ${text}`, 502);
  }

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;

  return {
    plate: result.plate.toUpperCase().replace(/\s/g, ''),
    confidence: result.score,
    region: result.region?.code || null,
  };
};
