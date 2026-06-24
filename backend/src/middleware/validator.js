function validateFields(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || val === '';
    });
    if (missing.length) {
      return res.status(400).json({
        error: true,
        message: `Campos obrigatórios: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { validateFields };
