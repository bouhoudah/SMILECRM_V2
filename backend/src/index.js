import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { corsMiddleware } from './middleware/cors.js';

// Import des routes
import utilisateurRoutes from './routes/utilisateurs.js';
import contactRoutes from './routes/contacts.js';
import contratRoutes from './routes/contrats.js';
import partenaireRoutes from './routes/partenaires.js';
import documentsRoutes from './routes/documents.js';
import authRoutes from './routes/auth.js';
import commentaireRoutes from './routes/commentaire.js';

// Configuration des variables d'environnement
dotenv.config();

// Création de l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'API fonctionnelle!' });
});

// Routes
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/contrats', contratRoutes);
app.use('/api/partenaires', partenaireRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/commentaire', commentaireRoutes);


app.use('/uploads', express.static('uploads'));



// Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
