import express from 'express';
import {
  registerUtilisateur,
  loginUtilisateur,
  getAllUsers,
  deleteUser,
  updateUser,            // ✅ Ajouté ici
  forgotPassword,
  resetPassword
} from '../controllers/Auth.js';


const router = express.Router();

// Routes d’authentification
router.post('/register', registerUtilisateur);
router.post('/login', loginUtilisateur);

// Routes utilisateurs
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser); // 👈 route ajoutée
router.put('/users/:id', updateUser); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);




export default router;
