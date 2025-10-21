# Application de Gestion des Absences avec Next.js, Turbopack et Microservices

## Description

Cette application web est conçue pour faciliter la gestion des absences dans un établissement éducatif. Développée avec Next.js, Turbopack et une architecture de microservices, elle offre une interface moderne et performante pour les administrateurs, enseignants, élèves, parents et secrétaires. L'application permet de suivre les absences, consulter les notes, emplois du temps, et communiquer entre les différents acteurs de l'établissement.

## Fonctionnalités

### Tâches Réalisées

1. **Page de Bienvenue**

   - Barre de navigation avec liens vers : Nom de l'établissement, Accueil, À Propos, Contact, Connexion
   - Carousel d'images représentant le site et ses activités
   - Sections de la page d'accueil :
     - Description de l'établissement
     - Vidéos YouTube de la vie quotidienne (visionnable en plein écran)
     - Informations sur l'admission et horaires
     - Formulaire de contact (nom, prénom, email, sujet, message)
   - Footer avec navigation et adresses

2. **Page "À Propos"**

   - Informations générales sur l'établissement et le personnel
   - Téléchargement du cahier des charges

3. **Page "Contact"**

   - Formulaire obligatoire : nom, prénom, email, sujet, message

4. **Authentification Utilisateur**

   - Inscription : nom, prénom, email, mot de passe, confirmation
   - Connexion : email, mot de passe

5. **Administration**
   - **Utilisateur Parent d'Élève** :
     - Inscrire/modifier ses enfants
     - Consulter absences, cours, notes, emplois du temps des enfants
     - Envoyer messages privés aux enseignants
     - Gérer son profil
   - **Utilisateur Élève** :
     - Connexion et consultation de cours, emplois du temps, notes
     - Renseigner absences (avec justificatif optionnel)
     - Recevoir messages des enseignants
     - Gérer son profil
   - **Utilisateur Enseignant** :
     - Assigner et consulter absences de sa classe
     - Envoyer messages aux parents
     - Consulter notes et emplois du temps de la classe
     - Accéder à ses matières
     - Gérer son profil
   - **Utilisateur Administrateur** :
     - Tous les droits
     - Gérer utilisateurs, niveaux scolaires, classes, matières
     - Gérer son profil
   - **Utilisateur Secrétaire** :
     - Droits similaires à l'administrateur sauf gestion utilisateurs/niveaux
     - Initier messages privés avec tous les utilisateurs

### Tâches en Cours

6. **Notifications**
   - Envoi automatique de notifications aux parents concernant les absences de leurs enfants

## Installation

1. Cloner le dépôt :

   ```
   git clone [URL du dépôt]
   ```

2. Installer les dépendances :

   ```
   npm install
   ```

3. Configurer l'environnement :

   - Copier `.env.example` vers `.env.local`
   - Configurer les variables d'environnement pour les microservices et la base de données

4. Démarrer le serveur de développement :

   ```
   npm run dev
   ```

5. (Optionnel) Construire pour la production :
   ```
   npm run build
   npm start
   ```

## Utilisation

- Accéder à l'application via le navigateur à l'adresse locale (généralement http://localhost:3000)
- S'inscrire ou se connecter selon le rôle
- Naviguer dans les différentes sections selon les permissions

## Technologies Utilisées

- Next.js (avec Turbopack pour un développement rapide)
- React
- TypeScript
- Tailwind CSS
- Architecture de microservices
- Base de données (MySQL/PostgreSQL ou autre selon configuration)

## Architecture

L'application utilise une architecture de microservices pour une meilleure scalabilité et maintenabilité. Les services incluent :

- Service d'authentification
- Service de gestion des utilisateurs
- Service de gestion des absences
- Service de notifications
- Etc.

## Contribution

Les contributions sont les bienvenues. Veuillez suivre les étapes suivantes :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commiter vos changements (`git commit -am 'Ajouter NouvelleFonctionnalite'`)
4. Pousser vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence [MIT](LICENSE).

## Contact

Pour toute question ou suggestion, veuillez contacter tounkaradiagui@gmail.com ou ouvrir une issue sur GitHub.
