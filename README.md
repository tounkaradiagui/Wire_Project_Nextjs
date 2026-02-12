# 🎓 Application de Gestion des Absences

> Application web moderne pour la gestion académique et le suivi des absences dans un établissement éducatif, construite avec **Next.js**, **TypeScript**, **Turbopack** et une **architecture microservices**.

---

## 📌 Présentation

Cette application vise à centraliser et simplifier la gestion des absences, des notes, des emplois du temps et de la communication entre **administrateurs**, **enseignants**, **élèves** et **parents**. Elle propose une interface rapide, sécurisée et évolutive adaptée aux besoins des établissements scolaires modernes.

---

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité

* Inscription utilisateur
* Connexion sécurisée
* Gestion des rôles et permissions
* Protection des routes sensibles

---

### 👥 Espaces Utilisateurs

#### 👨‍👩‍👧 Parent d’élève

* Consultation des absences, notes, cours et emplois du temps
* Communication directe avec les enseignants
* Gestion du profil personnel

#### 🎒 Élève

* Consultation des cours, notes et emplois du temps
* Déclaration d’absences (avec justificatif optionnel)
* Réception de messages des enseignants
* Gestion du profil

#### 👩‍🏫 Enseignant

* Gestion et suivi des absences par classe
* Communication avec les parents
* Consultation des notes et emplois du temps
* Accès aux matières enseignées
* Gestion du profil

#### 🧑‍💼 Administrateur

* Accès complet à toutes les fonctionnalités
* Gestion des utilisateurs (élèves, parents, enseignants, secrétaires)
* Gestion des niveaux, classes et matières
* Supervision globale du système

#### 🗂️ Secrétaire

* Accès administratif partiel
* Gestion académique (hors utilisateurs et niveaux)
* Communication avec tous les acteurs

---

### 🔔 Fonctionnalités en Cours

* Notifications automatiques des absences envoyées aux parents
* Historique et statistiques des absences

---

## 🛠️ Stack Technique

* **Framework** : Next.js (App Router)
* **Bundler** : Turbopack
* **Langage** : TypeScript
* **UI** : Tailwind CSS
* **Backend** : Architecture Microservices
* **ORM** : Prisma
* **Base de données** : PostgreSQL
* **Authentification** : JWT / Auth Provider (selon configuration)

---

## 🧱 Architecture

Architecture basée sur des microservices pour assurer la scalabilité et la maintenabilité :

* Service d’authentification
* Service de gestion des utilisateurs
* Service académique (absences, notes, classes)
* Service de notifications
* API Gateway

---

## ⚙️ Installation & Configuration

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/
cd gestion-absences
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configuration de l’environnement

```bash
cp .env.example .env.local
```

Configurer les variables :

* Base de données
* Services backend
* Clés d’authentification

### 4️⃣ Lancer le projet en développement

```bash
npm run dev
```

### 5️⃣ Build production (optionnel)

```bash
npm run build
npm start
```

---

## 🧪 Utilisation

* Accéder à l’application via : `http://localhost:3000`
* Créer un compte ou se connecter
* Naviguer selon le rôle attribué

---

## 🤝 Contribution

Les contributions sont bienvenues 🙌

1. Forker le dépôt
2. Créer une branche (`feature/ma-fonctionnalite`)
3. Commiter vos changements
4. Pousser la branche
5. Ouvrir une Pull Request

---

## 📄 Licence

Distribué sous licence **MIT**. Voir le fichier `LICENSE` pour plus d’informations.

---

## 📬 Contact

📧 Email : **[tounkaradiagui@gmail.com](mailto:tounkaradiagui@gmail.com)**
🐙 GitHub : Ouvrez une issue pour toute question ou suggestion

---

> ✨ Projet conçu pour évoluer avec les besoins réels des établissements éducatifs modernes.