export const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const error = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
