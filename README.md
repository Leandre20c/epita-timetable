# EPITA Timetable

Application mobile pour consulter l'emploi du temps EPITA de manière intuitive et moderne.

## 📱 Aperçu

EPITA Timetable permet aux étudiants d'EPITA de :
- Consulter leur emploi du temps en temps réel
- Naviguer par jour, semaine ou mois
- Recevoir des notifications en cas de changements
- Accéder à leurs cours même hors ligne (cache)

### Captures d'écran

v1
<img width="1080/3" height="2400/3" alt="image" src="https://github.com/user-attachments/assets/a9d9daaf-b037-498f-96f5-adf3295c25ab" />


## 🚀 Installation

### Pour les utilisateurs

#### Android
1. **Installation directe (Recommandée)**
   - Ouvrez ce lien sur votre téléphone : [Télécharger EPITA Timetable](https://expo.dev/accounts/leandre20c/projects/epita-timetable/builds/4ce00e16-1f2b-47f5-b91c-86000387b29b)
   - Téléchargez le fichier APK
   - Autorisez l'installation depuis "Sources inconnues" dans vos paramètres
   - Installez l'application

2. **Via QR Code**
   - Scannez le QR Code disponible dans les [Releases](../../releases)

#### iOS
*Version iOS en développement*

### Configuration requise
- Android 5.0+ (API niveau 21)
- Connexion internet pour la synchronisation
- 50 MB d'espace libre

## 📖 Guide d'utilisation

### Première utilisation
1. Lancez l'application
2. L'emploi du temps se synchronise automatiquement
3. Naviguez entre les différentes vues (jour/semaine/mois)

### Fonctionnalités principales

#### Navigation
- **Vue jour** : Planning détaillé de la journée
- **Vue semaine** : Vue d'ensemble hebdomadaire
- **Vue mois** : Calendrier mensuel avec événements

#### Notifications
- Activation automatique des notifications de changements
- Alertes en cas de cours annulés ou déplacés
- Rappels avant les cours

#### Mode hors ligne
- Cache automatique des données
- Consultation possible sans connexion
- Synchronisation lors de la reconnexion

### Raccourcis utiles
- Tapez sur un cours pour voir les détails
- Glissez horizontalement pour changer de semaine
- Tirez vers le bas pour actualiser

## 🛠️ Pour les développeurs

### Stack technique
- **Framework** : React Native 0.81.4 avec Expo SDK 54
- **Navigation** : Expo Router 6.0.7
- **UI** : React Native avec composants natifs
- **État** : React Hooks + Context API
- **Build** : EAS Build
- **Languages** : TypeScript

### Installation du projet

```bash
# Cloner le repository
git clone https://github.com/votre-username/epita-timetable.git
cd epita-timetable

# Installer les dépendances
npm install

# Lancer en développement
npx expo start
```

### Architecture du projet

```
epita-timetable/
├── app/                    # Pages et navigation (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   └── _layout.tsx        # Layout principal
├── components/            # Composants réutilisables
├── services/             # Services (API, notifications)
│   ├── CalendarService.ts # Gestion du calendrier ICS
│   └── NotificationService.ts # Notifications
├── types/                # Types TypeScript
├── hooks/                # Hooks personnalisés
└── assets/              # Images et ressources
```

### Scripts disponibles

```bash
# Développement
npm start                 # Lancer Expo
npm run android          # Lancer sur Android
npm run ios              # Lancer sur iOS

# Build
npm run build:android    # Build Android
npm run build:ios        # Build iOS

# Tests et qualité
npm run lint             # ESLint
npm run type-check       # Vérification TypeScript
```

### Contribuer

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📋 Changelog

### Version 1.0.0 (Actuelle)
- ✅ Synchronisation emploi du temps EPITA
- ✅ Navigation jour/semaine/mois
- ✅ Notifications de changements
- ✅ Mode hors ligne
- ✅ Interface moderne et intuitive

### Prochaines versions
- 🔄 Version iOS
- 🔄 Widget Android
- 🔄 Intégration calendrier système
- 🔄 Partage de cours
- 🔄 Mode sombre

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
- **Email** : [votre-email@epita.fr]
- **Discord EPITA** : #timetable-app

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Équipe pédagogique EPITA pour l'accès aux données
- Communauté React Native et Expo
- Beta testeurs étudiants EPITA

---

**Fait avec ❤️ par un étudiant EPITA pour les étudiants EPITA**
