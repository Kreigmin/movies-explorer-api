const BASE_ERROR_CODE = 500;

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const { statusCode = BASE_ERROR_CODE, message } = err;
  res.status(statusCode).send({
    message: statusCode === BASE_ERROR_CODE ? 'На сервере произошла ошибка' : message,
  });
};
