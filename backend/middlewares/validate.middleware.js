export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    const formattedErrors = {};

    err.inner.forEach((error) => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = error.message;
      }
    });

    return res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
};
