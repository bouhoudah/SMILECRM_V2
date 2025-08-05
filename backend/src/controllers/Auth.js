import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 👉 Inscription
export const registerUtilisateur = async (req, res) => {
  try {
    const { email, password, nom, role, avatar, agencyId } = req.body;

    if (!email || !password || !nom || !role) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.utilisateur.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        role,
        avatar,
        agencyId,
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Erreur création utilisateur :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 👉 Connexion
export const loginUtilisateur = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = await prisma.utilisateur.findUnique({ where: { email } });

  if (!user || !user.password) {
    return res.status(401).json({ error: 'Utilisateur ou mot de passe incorrect' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  res.status(200).json({
    id: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role
  });
};

// 👉 Récupération des utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        avatar: true,
        role: true,
      }
    });

    res.status(200).json(users);
  } catch (err) {
    console.error('Erreur récupération utilisateurs :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 👉 Suppression d’un utilisateur
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.utilisateur.delete({
      where: {
        id: parseInt(id, 10), // ✅ ici c’est bien parseInt car id est un Int
      },
    });

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression utilisateur :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
};
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nom, email, role, avatar } = req.body;

  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        email,
        role,
        avatar
      }
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Erreur mise à jour utilisateur :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
};
import crypto from 'crypto';




export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1h

    await prisma.utilisateur.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: expiration
      }
    });

    // ⚠️ Tu dois envoyer ce lien par mail dans une vraie app :
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    console.log("Lien de réinitialisation :", resetUrl);

    res.status(200).json({ message: "Lien de réinitialisation envoyé", resetUrl });
  } catch (err) {
    console.error("Erreur forgotPassword :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await prisma.utilisateur.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gte: new Date()
        }
      }
    });

    if (!user) return res.status(400).json({ error: "Token invalide ou expiré" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null
      }
    });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur resetPassword :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
