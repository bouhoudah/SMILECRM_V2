import { ValidationError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      details: err.details
    });
  }

  // Erreur Supabase
  if (err.code && err.message) {
    return res.status(400).json({
      error: 'Erreur base de données',
      message: err.message,
      code: err.code
    });
  }

  res.status(500).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
};