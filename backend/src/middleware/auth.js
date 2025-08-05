import { AuthenticationError } from '../utils/errors.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('Token manquant');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Token invalide');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new AuthenticationError('Accès non autorisé');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};