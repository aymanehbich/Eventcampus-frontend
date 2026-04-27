# EventCampus

> Plateforme officielle des clubs et de leurs événements universitaires

---

## Objet du projet

**EventCampus** est une application web responsive développée dans le cadre du module **DevOps — Master ISI**. Elle répond à un problème concret vécu au quotidien sur les campus universitaires : la dispersion des informations liées aux événements et aux clubs étudiants sur de multiples canaux non officiels (WhatsApp, affiches papier, pages Facebook).

L'application centralise en une seule plateforme la découverte, la création et la gestion des événements organisés par les clubs du campus. Chaque événement est obligatoirement rattaché à un club — la navigation est bidirectionnelle : la page d'un événement renvoie vers son club, et la page d'un club affiche tous ses événements.

Elle s'adresse à trois types d'utilisateurs :
- **Étudiant** — consulter les événements, s'inscrire, rejoindre des clubs
- **Organisateur** — gérer son club, créer des événements, communiquer avec ses membres
- **Administrateur** — valider les contenus, gérer les rôles, superviser la plateforme

Le projet est développé en **4 sprints de 2 semaines** (+ 1 Sprint 0 de conception) selon la méthodologie **Scrum**.

---

## Membres de l'équipe

| Nom | Rôle Scrum | Responsabilités |
|---|---|---|
| **Hbich Aymane** | Product Owner | Définit les besoins, priorise le backlog, valide les livrables |
| **Elkabbaoui Houcine** | Scrum Master | Anime les cérémonies Scrum, lève les obstacles, coordonne l'équipe |
| **Aarab Aymane** | Développeur Frontend | Pages, composants, UI clubs et événements (interface unifiée) |
| **Guenna Ikram** | Développeur Backend | API REST, base de données, authentification |

---

## Stack technique

| Côté | Technologie |
|---|---|
| Frontend | React (Vite) + React Router + Axios |
| Backend | Laravel 11 + Laravel Sanctum |
| Base de données | MySQL |
| Authentification | JWT via Laravel Sanctum |
| Gestion de projet | Jira |
| Versioning | Git + GitHub |
| Communication | Discord |
| Maquettes | Figma |

---

## Liste des fonctionnalités principales

### 🎓 Espace Étudiant
- Consulter la liste des événements à venir (avec club organisateur cliquable)
- Filtrer les événements par catégorie, date ou club organisateur
- S'inscrire à un événement en un clic
- Annuler une inscription
- Rejoindre une liste d'attente quand un événement est complet
- Consulter l'annuaire des clubs avec leurs événements
- Envoyer une demande pour rejoindre un club
- Naviguer depuis un événement vers son club et inversement (navigation bidirectionnelle)
- Recevoir un email de rappel J-1 avant un événement
- Gérer son profil, ses inscriptions et ses clubs

### 🏛️ Espace Organisateur
- Créer et gérer la page officielle de son club (nom, logo, description, catégorie)
- Créer des événements rattachés automatiquement à son club
- Modifier et supprimer ses événements
- Voir la liste des inscrits à chaque événement
- Gérer la liste d'attente d'un événement complet
- Accepter ou refuser les demandes d'adhésion au club
- Envoyer des messages aux membres du club (messagerie interne)
- Accéder à un tableau de bord de ses activités

### 🔐 Authentification & Rôles
- Inscription en tant qu'étudiant (rôle par défaut)
- Connexion avec toggle Étudiant / Organisateur
- Demande de rôle organisateur (étudiant existant ou nouveau compte)
- Gestion des rôles multiples via la table UserRole (un utilisateur peut être étudiant ET organisateur)

### ⚙️ Espace Administrateur
- Valider ou refuser les événements soumis par les organisateurs
- Valider la création de nouveaux clubs
- Valider les demandes de rôle organisateur
- Suspendre ou supprimer un club
- Activer / désactiver un rôle spécifique d'un utilisateur
- Consulter le tableau de bord : événements validés, clubs actifs, taux d'inscription, demandes en attente

---

## Contraintes v1.0

- **1 organisateur = 1 club** — un responsable gère exactement un club
- **Tout événement appartient à un club** — pas d'événements indépendants
- **Événements institutionnels hors scope** — journées portes ouvertes, conférences de professeurs non couvertes (prévu en v2.0)
- **Validation admin obligatoire** — tout nouveau club, événement ou demande de rôle doit être validé

---


## Structure du projet

```
eventcampus/
├── eventcampus-back/      # Backend Laravel 11
└── eventcampus-front/    # Frontend React (Vite)
```

---

## Lancement du projet

### Backend
```bash
cd eventcampus-back
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd eventcampus-front
npm install
npm run dev
```
