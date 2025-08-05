import Joi from 'joi';

export const contactSchema = Joi.object({
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  email: Joi.string().email().required(),
  telephone: Joi.string().required(),
  types: Joi.object({
    particulier: Joi.boolean().required(),
    professionnel: Joi.boolean().required(),
    professionalType: Joi.string().when('professionnel', {
      is: true,
      then: Joi.string().required()
    })
  }).required(),
  statut: Joi.string().valid('prospect', 'client').required(),
  entreprise: Joi.string().when('types.professionnel', {
    is: true,
    then: Joi.string().required()
  }),
  siret: Joi.string().when('types.professionnel', {
    is: true,
    then: Joi.string().length(14).required()
  })
});

export const contractSchema = Joi.object({
  clientId: Joi.string().required(),
  type: Joi.string().valid('auto', 'habitation', 'santé', 'prévoyance', 'multirisque', 'responsabilité civile').required(),
  categorie: Joi.string().valid('particulier', 'professionnel').required(),
  montantAnnuel: Joi.number().positive().required(),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().greater(Joi.ref('dateDebut')).required(),
  partenaire: Joi.string().required(),
  commissionPremiereAnnee: Joi.number().min(0).max(100).required(),
  commissionAnneesSuivantes: Joi.number().min(0).max(100).required(),
  fraisDossier: Joi.number().min(0).required(),
  fraisDossierRecurrent: Joi.boolean().required()
});

export const partnerSchema = Joi.object({
  nom: Joi.string().required(),
  type: Joi.string().valid('assureur', 'courtier grossiste').required(),
  produits: Joi.array().items(Joi.string()).required(),
  statut: Joi.string().valid('actif', 'inactif').required(),
  contactPrincipal: Joi.string().required(),
  email: Joi.string().email().required(),
  telephone: Joi.string().required(),
  siteWeb: Joi.string().uri().allow(''),
  intranetUrl: Joi.string().uri().allow('')
});