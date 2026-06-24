function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Erro interno do servidor',
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
