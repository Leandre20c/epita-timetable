<div align="center">
  <img width="192" height="192" alt="notification-icon" src="https://github.com/user-attachments/assets/ea01ea5c-6bff-4b64-8019-8dee7021647d" />

  # EpiTime
  
  **Application mobile pour consulter l'emploi du temps EPITA**
  
  [![Version](https://img.shields.io/badge/version-1.2.1-blue.svg)](https://github.com/Leandre20c/epita-timetable/releases)
  [![Platform](https://img.shields.io/badge/platform-Android-blue.svg)](https://github.com/Leandre20c/epita-timetable)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Downloads](https://img.shields.io/github/downloads/Leandre20c/epita-timetable/total.svg?color=blue)](https://github.com/Leandre20c/epita-timetable/releases)
</div>

## 📚 Sommaire

- **Pour les utilisateurs**
  - [Aperçu](#-aperçu)
  - ⭐ [Installation](#-installation)
  - [Guide d'utilisation](#-guide-dutilisation)
  - [Changelog](#-changelog)


- **Technique** -- Developpeurs
  - [Stack technique](#️-pour-les-développeurs)
  - [Fonctionnement avec Zeus](#-fonctionnement-avec-zeus)
  - [Migration vers Auriga](#-zeus-et-auriga)


- **Communauté**
  - [Signaler un bug](#-signaler-un-bug)
  - [Demandes de fonctionnalités](#-demandes-de-fonctionnalités)
  - [Support](#-support)


- **Informations**
  - [Licence](#-licence)
  - [Remerciements](#-remerciements)

---

## 📱 Aperçu

EpiTime permet aux étudiants d'EPITA de :
- <img src="https://api.iconify.design/lucide:clock.svg?color=%233498DB" width="20"/> Consulter leur emploi du temps synchronisé avec [Zeus](https://zeus.ionis-it.com/home)
- <img src="https://api.iconify.design/lucide:calendar-days.svg?color=%233498DB" width="20"/> Naviguer par jour ou par semaine
- <img src="https://api.iconify.design/lucide:graduation-cap.svg?color=%233498DB" width="20"/> Possibilité de choisir sa classe
- <img src="https://api.iconify.design/lucide:save.svg?color=%233498DB" width="20"/> Enregistrement dans le cache

### Captures d'écran

<img width="265" height="600" alt="image" src="https://github.com/user-attachments/assets/a9d9daaf-b037-498f-96f5-adf3295c25ab" />


## 🚀 Installation

### Pour les utilisateurs

#### Android
1. **Installation directe (Recommandée)**
   - Rendez-vous dans [Releases](../../releases)
   - Téléchargez le fichier APK de la dernière version (en haut du README)
   - Autorisez l'installation depuis "Sources inconnues" dans vos paramètres
   - Installez l'application

#### iOS
*Version iOS en développement*

### Configuration requise
- Android 5.0+ (API niveau 21)
- Connexion internet pour la synchronisation
- 50 MB d'espace libre

## 📖 Guide d'utilisation

### Première utilisation
1. Lancez l'application
2. Connectez vous à votre compte Office360 dans la section Profil
3. Selectionnez un groupe
4. L'emploi du temps se synchronise automatiquement
5. Naviguez entre les différentes vues (jour/semaine/profil)

### Installation du projet

```bash
# Cloner le repository
git clone https://github.com/votre-username/epita-timetable.git
cd epita-timetable

# Installer les dépendances
npm install

# Lancer en développement
npx expo start --go
```

### Contribuer

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📋 Changelog

### Version 1.0.0
- ✅ Synchronisation emploi du temps EPITA
- ✅ Navigation jour/semaine/mois
- ✅ Notifications de changements
- ✅ Mode hors ligne
- ✅ Interface moderne et intuitive
### Version 1.1.0
- ✅ Swipe Gauche / Droite
- ✅ Boutons de navigations retirés
- ✅ UI & UX plus moderne et intuitive
- ✅ Possibilité d'associer une couleur par cours
- ✅ Couleurs logiques
- ✅ Création d'un logo
- ✅ Changement de nom -> EpiTime
### Version 1.2.0 (Actuelle)
- ✅ Scroll plus tolérant
- ✅ Choisir sa classe
- ✅ Meilleure pop-up pour l'affichage d'un cours
- ✅ Tab Profil -> Connection et choisir sa classe
### Version 1.2.2 (à venir)
- ✅ Mode hors-ligne (cache)
- ✅ Optimisations des fichiers, composants pour éviter la répétition


### Prochaines versions - Ordre d'importance
- 🔄 Restructuration de l'app par modules / Optimisations
- 🔄 Widget Android
- 🔄 Visualisation par Mois
- 🔄 Mode sombre
- 🔄 Gestion de notifications
- 🔄 Version iOS

---
# Technique

## 🛠️ Pour les développeurs

### Stack technique
- **Framework** : React Native 0.81.4 avec Expo SDK 54
- **Navigation** : Expo Router 6.0.7
- **UI** : React Native avec composants natifs
- **État** : React Hooks + Context API
- **API** : [Swagger Zeus](https://zeus.ionis-it.com/swagger/index.html)
- **Build** : EAS Build
- **Languages** : TypeScript
- 
## 🔧 Fonctionnement avec Zeus

Documentation officielle de l'API - [Swagger Zeus](https://zeus.ionis-it.com/swagger/index.html)

### Architecture de récupération des données

#### 1. Authentification en deux étapes

```bash
Utilisateur → Office365 (OAuth 2.0) → Token Office365 → Token Office365 → Zeus API → JWT EPITA
```
**Endpoint d'authentification** :
```
POST /api/User/OfficeLogin
Body: { "accessToken": "token_office365" }
Réponse: "jwt_epita_token"
```

#### 2. Récupération de la hiérarchie des groupes

Avant d'accéder à l'emploi du temps, l'utilisateur doit sélectionner son groupe :
```
GET /api/group/hierarchy
Authorization: Bearer {JWT_EPITA}
```
**Structure de réponse** :
```json
[
  {
    "id": 1,
    "name": "EPITA",
    "children": [
      {
        "id": 100,
        "name": "ING1",
        "children": [
          {
            "id": 1001,
            "name": "ING1 - Groupe 1",
            "path": "epita/ing1/groupe_1"
          }
        ]
      }
    ]
  }
]
```
L'utilisateur choisi ensuite son groupe

#### 3. Téléchargement de l'emploi du temps
Une fois le groupe sélectionné :
```bash
GET /api/group/{groupId}/ics?startDate=2025-01-01
Authorization: Bearer {JWT_EPITA}
Accept: text/calendar
```
En retour, un fichier [ICS](https://fr.wikipedia.org/wiki/ICalendar) contenant les cours du groupe.

### Flux complet :

  1. Connexion Office365 → Token Office365
  2. Échange avec Zeus → JWT EPITA
  3. Récupération hiérarchie → Arbre des groupes
  4. Sélection du groupe → Sauvegardé localement
  5. Téléchargement calendrier → Fichier ICS
  6. Parsing et affichage → Emploi du temps

## 🔄 Zeus et Auriga

Nous avons connaissance de la volonté d'EPITA de migrer vers [Auriga](https://auriga.epita.fr/).

**Pas d'inquiétude !** Une solution a été trouvée pour récupérer les cours depuis Auriga.

### 🔄 Comment ça va fonctionner ?

#### L'authentification reste identique
Vous continuerez à vous connecter avec votre compte Office365, exactement comme aujourd'hui.

#### L'API Auriga simplifie tout

**Actuellement avec Zeus** :
- Vous devez sélectionner votre groupe manuellement
- L'application télécharge un fichier ICS qu'elle doit parser

**Bientôt avec Auriga** :
- Le système détecte automatiquement votre groupe
- L'application reçoit directement votre emploi du temps au format JSON
- Plus besoin de sélectionner votre classe à chaque fois !

#### Migration transparente

L'application détectera automatiquement quelle API est disponible (Zeus ou Auriga) et s'adaptera sans intervention de votre part. Pendant la transition, les deux systèmes coexisteront.

---

### 📝 Pour les développeurs

**Endpoint principal Auriga** :

```bash
GET https://auriga.epita.fr/api/plannings/me
```

**Modifications prévues** :
- Nouveau service `AurigaService.ts` pour gérer l'API Auriga
- Adaptateur pour convertir les données Auriga vers le format actuel
- Détection automatique de l'API disponible
- Suppression du système de sélection de groupe (automatique avec Auriga)

La migration sera effectuée dès que les emplois du temps seront disponibles sur Auriga.

## 🐛 Signaler un bug

Si vous rencontrez un problème :

1. **Vérifiez** que vous avez la dernière version
2. **Consultez** les [Issues existantes](../../issues)
3. **Créez un nouveau ticket** si nécessaire avec :
   - Description du problème
   - Étapes pour reproduire
   - Version Android
   - Captures d'écran si pertinentes

### Template de bug report

```markdown
**Description**
Description claire du problème

**Reproduction**
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer

**Captures d'écran**
Si applicable

**Environnement:**
- Appareil : [Samsung Galaxy S21]
- Version Android : [12]
- Version app : [1.0.0]
```

## 💡 Demandes de fonctionnalités

Pour proposer une nouvelle fonctionnalité :

1. Vérifiez qu'elle n'existe pas déjà dans les [Issues](../../issues)
2. Créez un ticket avec le label `enhancement`
3. Décrivez clairement le besoin et l'usage

## 📞 Support

- **Issues GitHub** : Pour bugs et fonctionnalités
- **Email** : leandre.vincent@epita.fr

---
## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Claude par anthropic
- Bêta testeurs étudiants EPITA

---

**Par un étudiant d'Epita**
**Non affilié à Epita**
**Projet étudiant à but non lucratif**
