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
  { name: 'Rouge', value: '#e74c3c' },
  { name: 'Bleu', value: '#3498db' },
  { name: 'Vert', value: '#27ae60' },
  { name: 'Orange', value: '#f39c12' },
  { name: 'Violet', value: '#9b59b6' },
  { name: 'Turquoise', value: '#1abc9c' },
  { name: 'Jaune', value: '#f1c40f' },
  { name: 'Rose', value: '#e91e63' },
  { name: 'Indigo', value: '#3f51b5' },
  { name: 'Cyan', value: '#00bcd4' },
  { name: 'Marron', value: '#795548' },
  { name: 'Gris', value: '#607d8b' }
];

export const DEFAULT_COLOR = '#3498db';