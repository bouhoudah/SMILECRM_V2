import { ValidationError } from '../utils/errors.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        throw new ValidationError('Données invalides', error.details);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};