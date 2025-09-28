// config/subjectColors.ts
export const SUBJECT_COLORS: { [key: string]: string } = {
  // Prédéfinis en rouge
  'Examen': '#e74c3c',
  'QCM': '#e74c3c', 
  'Rattrapages': '#e74c3c',
  'Rattrapage': '#e74c3c',
  'Contrôle': '#e74c3c',
  'Partiel': '#e74c3c',
  'Test': '#e74c3c',
  
  // Couleurs par défaut (seront ajoutées au fur et à mesure)
  // Les nouvelles couleurs seront sauvegardées automatiquement
};

// Couleurs disponibles pour le sélecteur
export const AVAILABLE_COLORS = [
  // Chaudes
  { name: 'Bordeaux', value: '#8b0000' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Rose', value: '#da5b85ff' },
  { name: 'Orange', value: '#ff9800' },
  { name: 'Doré', value: '#ffc107' },
  
  // Froides
  { name: 'Pourpre', value: '#6a1b9a' },
  { name: 'Lavande', value: '#b39ddb' },
  { name: 'Indigo', value: '#3949ab' },
  { name: 'Bleu', value: '#1976d2' },
  { name: 'Cyan', value: '#0097a7' },
  
  // Vertes et neutres
  { name: 'Olive', value: '#827717' },
  { name: 'Vert', value: '#388e3c' },
  { name: 'Marron', value: '#5d4037' },
  { name: 'Gris', value: '#616161' },
  { name: 'Anthracite', value: '#37474f' },
];

export const DEFAULT_COLOR = '#3498db';