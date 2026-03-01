# 🎓 Application SaaS de Gestion des Absences

Plateforme web moderne dédiée aux établissements scolaires pour la gestion académique, le suivi des absences et l’administration éducative.  
Construite avec **Next.js**, **TypeScript**, **Turbopack** et une architecture évolutive orientée SaaS.

---

## 📌 Présentation

Cette application centralise et simplifie la gestion :

- 📅 Des séances de cours (Sessions)
- ❌ Des absences
- 📘 Des leçons
- 👥 Des utilisateurs et rôles
- 🏫 De la structure académique

Elle repose sur une logique académique réelle :

> Une absence est toujours liée à une **séance précise d’un cours donné**, et non simplement à une matière.

### 🎯 Objectifs

- ✅ Une gestion fiable
- ✅ Une traçabilité complète
- ✅ Une architecture scalable
- ✅ Une base solide pour évoluer vers un véritable SaaS multi-établissements

---

# 🚀 Fonctionnalités

## 🔐 Authentification & Sécurité

- Inscription et connexion sécurisée
- Gestion des rôles et permissions
- Protection des routes sensibles
- Activation / Bannissement d’utilisateurs
- Soft Delete (aucune suppression définitive critique)
- Journalisation des actions sensibles (Audit Log – backend)

---

## 👥 Espaces Utilisateurs

### 👨‍👩‍👧 Parent d’élève

- Consultation des absences
- Consultation des notes
- Visualisation des emplois du temps
- Communication avec les enseignants
- Gestion du profil personnel

---

### 🎒 Élève

- Consultation des cours et séances
- Consultation des notes
- Visualisation de l’historique des absences
- Réception de messages
- Gestion du profil

---

### 👩‍🏫 Enseignant

- Gestion des séances de cours
- Marquage des absences par session
- Consultation des matières enseignées
- Communication avec parents et élèves
- Gestion du profil

---

### 🧑‍💼 Administrateur

- Accès global à la plateforme
- Gestion des utilisateurs
- Gestion des niveaux, classes et matières
- Supervision des sessions et absences
- Contrôle d’activation / bannissement

---

### 👑 Super Admin (SaaS)

- Contrôle total du système
- Supervision des établissements (évolution future)
- Journal d’audit global
- Gestion avancée des accès

---

### 🗂️ Secrétaire

- Gestion académique partielle
- Communication interne
- Suivi administratif

---

# 🧠 Logique Académique Implémentée

## 📘 Lesson (Cours)

Représente une matière ou un chapitre spécifique.  
Exemple : _Mathématiques – Chapitre 2_

---

## 🗓 Session (Séance)

Représente un cours réel tenu à une date précise.

**Exemple :**

```
Lesson : Mathématiques – Chapitre 2
Session : 24/02/2026 à 08h00
```

Une **Session** est liée à :

- Un Lesson
- Un Teacher
- Plusieurs Attendances

---

## ❌ Attendance (Absence)

Une absence est obligatoirement liée à :

- Une Session
- Un Élève

Cela garantit une traçabilité académique rigoureuse.

---

# 🏗 Stack Technique

- **Framework** : Next.js (App Router)
- **Bundler** : Turbopack
- **Langage** : TypeScript
- **UI** : Tailwind CSS
- **Validation** : Zod
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Authentification** : Auth Provider (ex: Clerk ou JWT selon configuration)
- **Architecture** : Microservices + logique SaaS

---

# 🧱 Architecture

Architecture modulaire orientée microservices :

- 🔐 Service d’authentification
- 👥 Service utilisateurs
- 🎓 Service académique (Lessons, Sessions, Attendance)
- 🔔 Service notifications (en cours)
- 📊 Service audit & logs
- 🌐 API Gateway

---

# 📦 Fonctionnalités Déjà Implémentées

- Modèle Lesson
- Modèle Session
- Modèle Attendance
- Relations propres entre modèles
- Validation Zod robuste
- Pré-remplissage correct des DateTime
- Soft Delete sur modèles critiques
- Super Admin
- Bannissement utilisateur
- Base Audit Log
- Structure évolutive SaaS

---

# 🔜 Fonctionnalités en Cours / À Venir

- 🔔 Notifications automatiques aux parents
- 📊 Statistiques avancées des absences
- 🔍 Filtres et tri dynamiques dans les tableaux
- 🖨 Carte scolaire imprimable
- 📝 Bulletins scolaires
- 📈 Tableau de bord analytique
- 📤 Export PDF / Excel
- 📅 Génération automatique des sessions
- 🌍 Multi-établissements (vision SaaS complète)

---

# ⚙️ Installation & Configuration

## 1️⃣ Cloner le projet

```bash
git clone https://github.com/
cd gestion-absences
```

## 2️⃣ Installer les dépendances

```bash
npm install
```

## 3️⃣ Configuration de l’environnement

```bash
cp .env.example .env.local
```

Configurer :

- Base de données PostgreSQL
- Clés d’authentification
- Services backend
- Variables Prisma

## 4️⃣ Migration de la base de données

```bash
npx prisma migrate dev
```

## 5️⃣ Lancer le projet

```bash
npm run dev
```

Application accessible via :

```
http://localhost:3000
```

---

# 🧪 Build Production

```bash
npm run build
npm start
```

---

# 🤝 Contribution

Les contributions sont les bienvenues 🙌

1. Fork du dépôt
2. Création d’une branche (`feature/ma-fonctionnalite`)
3. Commit des changements
4. Push de la branche
5. Ouverture d’une Pull Request

---

# 📄 Licence

Distribué sous licence **MIT**.  
Voir le fichier `LICENSE` pour plus d’informations.

---

# 📬 Contact

📧 Email : **tounkaradiagui@gmail.com**  
🐙 GitHub : Ouvrez une issue pour toute question ou suggestion.

---

> ✨ Conçu pour évoluer vers une solution SaaS complète adaptée aux établissements éducatifs modernes et à forte croissance.
