// source: 'body' (default) | 'query' | 'params'
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ status: 'fail', message });
  }
  next();
};

export default validate;
