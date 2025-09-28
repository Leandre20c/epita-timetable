// services/SubjectColorService.ts - Fix de la logique de recherche
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COLOR, SUBJECT_COLORS } from '../config/subjectColors';

const STORAGE_KEY = 'subject_colors';

class SubjectColorService {
  private static instance: SubjectColorService;
  private colors: { [key: string]: string } = { ...SUBJECT_COLORS };
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  static getInstance(): SubjectColorService {
    if (!SubjectColorService.instance) {
      SubjectColorService.instance = new SubjectColorService();
    }
    return SubjectColorService.instance;
  }

  addListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Erreur listener couleur:', error);
      }
    });
  }

  async loadColors(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedColors = JSON.parse(stored);
        this.colors = { ...SUBJECT_COLORS, ...savedColors };
        console.log('Couleurs chargées:', this.colors);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Erreur chargement couleurs:', error);
      this.colors = { ...SUBJECT_COLORS };
      this.isLoaded = true;
    }
  }

  private extractKeywords(title: string): string[] {
    return title
      .toLowerCase()
      .trim()
      .split(/[\s\-_()[\]{}.,;:!?]+/)
      .filter(word => word.length > 1);
  }

  private findColorByKeywords(title: string): string | null {
    console.log(`Recherche couleur pour: "${title}"`);
    console.log('Couleurs disponibles:', Object.keys(this.colors));
    
    const titleLower = title.toLowerCase();
    const keywords = this.extractKeywords(title);
    console.log('Mots-clés extraits:', keywords);
    
    // 1. PRIORITÉ : Recherche par mots-clés importants D'ABORD
    const importantKeywords = [
      'qcm', 'examen', 'exam', 'controle', 'partiel', 'test', 'rattrapage',
      'tp', 'td', 'cm', 'cours', 'projet', 'stage', 'soutenance'
    ];

    for (const keyword of keywords) {
      if (importantKeywords.includes(keyword)) {
        // Chercher ce mot-clé dans les couleurs configurées
        if (this.colors[keyword]) {
          console.log(`✅ Trouvé mot-clé important "${keyword}": ${this.colors[keyword]}`);
          return this.colors[keyword];
        }
        
        // Chercher dans les clés existantes
        for (const [subject, color] of Object.entries(this.colors)) {
          if (subject.toLowerCase() === keyword) {
            console.log(`✅ Trouvé mot-clé important dans clés "${keyword}": ${color}`);
            return color;
          }
        }
      }
    }

    // 2. Recherche exacte (titre complet) SEULEMENT SI pas de mot-clé important
    if (this.colors[title]) {
      console.log(`✅ Trouvé exact: ${this.colors[title]}`);
      return this.colors[title];
    }
    
    // 3. Recherche exacte insensible à la casse
    for (const [subject, color] of Object.entries(this.colors)) {
      if (subject.toLowerCase() === titleLower) {
        console.log(`✅ Trouvé exact (case insensitive): ${color}`);
        return color;
      }
    }

    // 4. Recherche par inclusion de mots-clés
    for (const keyword of keywords) {
      for (const [subject, color] of Object.entries(this.colors)) {
        if (subject.toLowerCase().includes(keyword)) {
          console.log(`✅ Trouvé inclusion "${keyword}" dans "${subject}": ${color}`);
          return color;
        }
      }
    }

    console.log(`❌ Aucune couleur trouvée pour "${title}"`);
    return null;
  }

  getColorBySubjectName(subjectName: string): string {
    if (!this.isLoaded) {
      console.warn('Service pas encore chargé');
      return DEFAULT_COLOR;
    }

    const foundColor = this.findColorByKeywords(subjectName);
    const finalColor = foundColor || DEFAULT_COLOR;
    console.log(`🎨 Couleur finale pour "${subjectName}": ${finalColor}`);
    return finalColor;
  }

  async setColorForSubject(subjectName: string, color: string): Promise<void> {
    try {
      console.log(`💾 AVANT - Couleurs:`, this.colors);
      
      const normalizedName = subjectName.trim();
      const keywords = this.extractKeywords(normalizedName);
      
      // Trouver le mot-clé principal
      const importantKeywords = [
        'qcm', 'examen', 'exam', 'controle', 'partiel', 'test', 'rattrapage', 'projet',
        'stage', 'soutenance', 'QCM', 'Examen', 'Exam', 'Controle', 'Partiel', 'Test', 'Rattrapage',
      ];

      let keyToUse = normalizedName; // Par défaut, utiliser le nom complet
      let foundImportantKeyword = false;

      // Priorité aux mots-clés importants
      for (const keyword of keywords) {
        if (importantKeywords.includes(keyword)) {
          keyToUse = keyword;
          foundImportantKeyword = true;
          console.log(`🎯 Utilisation du mot-clé: "${keyword}"`);
          break;
        }
      }

      // Si on utilise un mot-clé important, supprimer les anciennes entrées spécifiques
      if (foundImportantKeyword) {
        // Supprimer l'entrée spécifique pour éviter les conflits
        if (this.colors[normalizedName]) {
          console.log(`🗑️ Suppression de l'entrée spécifique: "${normalizedName}"`);
          delete this.colors[normalizedName];
        }
        
        // Supprimer toutes les entrées qui contiennent ce mot-clé pour éviter les doublons
        const toDelete: string[] = [];
        for (const [subject] of Object.entries(this.colors)) {
          if (subject !== keyToUse && this.extractKeywords(subject).includes(keyToUse)) {
            toDelete.push(subject);
          }
        }
        
        toDelete.forEach(key => {
          console.log(`🗑️ Suppression de l'entrée en conflit: "${key}"`);
          delete this.colors[key];
        });
      }

      // Sauvegarder avec la clé choisie
      this.colors[keyToUse] = color;
      
      // Sauvegarder dans AsyncStorage
      const customColors: { [key: string]: string } = {};
      for (const [subject, col] of Object.entries(this.colors)) {
        if (!SUBJECT_COLORS[subject] || SUBJECT_COLORS[subject] !== col) {
          customColors[subject] = col;
        }
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customColors));
      console.log(`💾 AsyncStorage:`, customColors);
      
      // Notifier immédiatement
      this.notifyListeners();
      
    } catch (error) {
      console.error('Erreur sauvegarde couleur:', error);
      throw error;
    }
  }

  getAllColors(): { [key: string]: string } {
    return { ...this.colors };
  }

  async resetColors(): Promise<void> {
    try {
      this.colors = { ...SUBJECT_COLORS };
      await AsyncStorage.removeItem(STORAGE_KEY);
      this.notifyListeners();
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    }
  }

  forceUpdate(): void {
    this.notifyListeners();
  }
}

export default SubjectColorService.getInstance();