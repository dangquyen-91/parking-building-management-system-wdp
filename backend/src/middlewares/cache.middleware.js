export const privateCache = (maxAge = 30) => (_req, res, next) => {
  res.set('Cache-Control', `private, max-age=${maxAge}`);
  next();
};

export const noCache = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};
