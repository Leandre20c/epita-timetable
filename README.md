# 📅 App emploi du temps EPITA

Une application mobile React Native développée avec Expo pour consulter votre emploi du temps Epita à tout moment.

## 🎯 Fonctionnalités

- ✅ **Synchronisation automatique** avec l'API Ionis-IT
- ✅ **Interface mobile native** optimisée iOS/Android
- ✅ **Rafraîchissement automatique** toutes les 5 minutes
- ✅ **Navigation par date** intuitive
- ✅ **Code couleur par matière** pour une meilleure lisibilité
- ✅ **Informations détaillées** : horaires, salles, descriptions
- ✅ **Mode hors ligne** avec cache intelligent
- ✅ **Indicateurs de statut** : cours en cours, à venir, terminé

- Seulement pour Rennes SPE groupe A


## 🚀 Installation rapide

### Prérequis
- Node.js (v16 ou plus récent)
- npm ou yarn
- Expo CLI
- Expo Go app sur votre téléphone

### 1. Créer le projet
```bash
npx create-expo-app mon-emploi-du-temps
cd mon-emploi-du-temps
```

### 2. Installer les dépendances
```bash
npm install @expo/vector-icons
```

### 3. Copier les fichiers
Copiez tous les fichiers fournis dans la structure suivante :

```
mon-emploi-du-temps/
├── App.js
├── package.json
├── app.json
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── DateNavigator.js
│   │   ├── EventCard.js
│   │   ├── EmptyState.js
│   │   ├── LoadingScreen.js
│   │   ├── QuickNavigation.js
│   │   └── UpdateInfo.js
│   ├── screens/
│   │   └── ScheduleScreen.js
│   ├── services/
│   │   └── ScheduleService.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── colorUtils.js
│   │   └── icsParser.js
│   ├── styles/
│   │   └── globalStyles.js
│   └── constants/
│       └── config.js
```

### 4. Lancer l'application
```bash
npx expo start
```

### 5. Tester sur votre téléphone
1. Téléchargez **Expo Go** depuis l'App Store/Play Store
2. Scannez le QR code affiché dans le terminal
3. L'app se lance automatiquement !

## 📱 Utilisation

### Navigation
- **Flèches gauche/droite** : Naviguer entre les jours
- **Bouton "Aujourd'hui"** : Retour rapide à la date actuelle
- **Pull-to-refresh** : Actualiser manuellement

### Codes couleur des matières
- 🔵 **Physique** : Bleu
- 🟣 **Mathématiques** : Violet
- 🟢 **Algorithmique** : Vert
- 🟠 **Programmation** : Orange
- 🟡 **Méthodologie** : Jaune
- 🔴 **Examens** : Rouge
- 🩵 **Anglais** : Rose
- ⚫ **Événements spéciaux** : Gris foncé

### Indicateurs de statut
- ⏰ **Cours à venir** : Icône horloge
- ▶️ **Cours en cours** : Icône play vert
- ✅ **Cours terminé** : Icône check gris

## 🔧 Configuration

### Personnaliser l'URL ICS
Modifiez l'URL dans `src/constants/config.js` :
```javascript
export const API_CONFIG = {
  ICS_URL: 'https://zeus.ionis-it.com/api/group/VOTRE_GROUPE/ics/VOTRE_TOKEN',
  // ...
};
```

### Modifier les couleurs
Personnalisez les couleurs dans `src/utils/colorUtils.js` :
```javascript
export const SUBJECT_COLORS = {
  'votre_matiere': {
    primary: '#VOTRE_COULEUR',
    light: '#VOTRE_COULEUR_CLAIRE',
    dark: '#VOTRE_COULEUR_FONCEE'
  },
  // ...
};
```

## 🏗️ Architecture du projet

### Structure modulaire
- **components/** : Composants React réutilisables
- **screens/** : Écrans de l'application
- **services/** : Logique métier et appels API
- **utils/** : Fonctions utilitaires
- **styles/** : Styles globaux
- **constants/** : Configuration et constantes

### Gestion des données
- **ScheduleService** : Gestion des appels API avec cache
- **ICSParser** : Parseur ICS robuste avec gestion d'erreurs
- **Cache intelligent** : Évite les requêtes inutiles

### Gestion des erreurs
- Messages d'erreur contextuels
- Fallbacks pour données corrompues
- Retry automatique en cas d'échec réseau

## 📦 Déploiement

### Build de production
```bash
# Android
npx expo build:android

# iOS (nécessite compte développeur Apple)
npx expo build:ios

# Ou avec EAS Build (recommandé)
npm install -g @expo/eas-cli
eas build --platform android
```

### Publication sur les stores
```bash
# Android Play Store
eas submit --platform android

# iOS App Store
eas submit --platform ios
```

## 🛠️ Développement

### Scripts disponibles
```bash
npm start          # Lancer le serveur de développement
npm run android    # Lancer sur émulateur Android
npm run ios        # Lancer sur simulateur iOS
npm run web        # Lancer en mode web
npm run tunnel     # Mode tunnel pour tests à distance
```

### Debug
- Les logs sont disponibles dans la console Expo
- Utilisez Flipper pour le debug avancé
- React Developer Tools pour l'inspection des composants

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🐛 Signaler un bug

Ouvrez une issue sur GitHub avec :
- Description détaillée du problème
- Étapes pour reproduire
- Screenshots si applicable
- Version de l'app et du système

## 📞 Support

- 📧 Email : votre-email@example.com
- 💬 Discord : Votre#Discord
- 🐦 Twitter : @VotreTwitter

---