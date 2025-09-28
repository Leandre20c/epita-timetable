// services/SubjectColorService.ts - Version nettoyée
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COLOR, SUBJECT_COLORS } from '../config/subjectColors';

const STORAGE_KEY = 'subject_colors';

// Liste unique des mots-clés importants
const IMPORTANT_KEYWORDS = [
  'qcm', 'examen', 'exam', 'controle', 'partiel', 'test', 'rattrapage', 'projet', 'stage', 'soutenance'
];

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

  private findMainKeyword(title: string): string | null {
    const keywords = this.extractKeywords(title);
    
    // Chercher le premier mot-clé important trouvé
    for (const keyword of keywords) {
      if (IMPORTANT_KEYWORDS.includes(keyword)) {
        return keyword;
      }
    }
    
    return null;
  }

  private findColorByKeywords(title: string): string | null {
    console.log(`Recherche couleur pour: "${title}"`);
    
    const keywords = this.extractKeywords(title);
    console.log('Mots-clés extraits:', keywords);
    
    // 1. PRIORITÉ : Recherche par mots-clés importants
    for (const keyword of keywords) {
      if (IMPORTANT_KEYWORDS.includes(keyword)) {
        if (this.colors[keyword]) {
          console.log(`✅ Trouvé mot-clé important "${keyword}": ${this.colors[keyword]}`);
          return this.colors[keyword];
        }
      }
    }

    // 2. Recherche exacte (titre complet)
    if (this.colors[title]) {
      console.log(`✅ Trouvé exact: ${this.colors[title]}`);
      return this.colors[title];
    }
    
    // 3. Recherche exacte insensible à la casse
    const titleLower = title.toLowerCase();
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
      console.log(`💾 Sauvegarde couleur pour: "${subjectName}" → ${color}`);
      
      const normalizedName = subjectName.trim();
      const mainKeyword = this.findMainKeyword(normalizedName);
      
      let keyToUse: string;
      
      if (mainKeyword) {
        // Utiliser le mot-clé principal
        keyToUse = mainKeyword;
        console.log(`🎯 Utilisation du mot-clé: "${mainKeyword}"`);
        
        // Supprimer les anciennes entrées spécifiques qui contiennent ce mot-clé
        const toDelete: string[] = [];
        for (const [subject] of Object.entries(this.colors)) {
          if (subject !== keyToUse && this.extractKeywords(subject).includes(mainKeyword)) {
            toDelete.push(subject);
          }
        }
        
        toDelete.forEach(key => {
          console.log(`🗑️ Suppression de l'entrée en conflit: "${key}"`);
          delete this.colors[key];
        });
      } else {
        // Pas de mot-clé important, utiliser le nom complet
        keyToUse = normalizedName;
        console.log(`📝 Utilisation du nom complet: "${normalizedName}"`);
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
      console.log(`✅ Couleur sauvegardée: ${keyToUse} → ${color}`);
      
      // Notifier les listeners
      this.notifyListeners();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde couleur:', error);
      throw error;
    }
  }

  // Méthode publique pour obtenir le mot-clé principal (utile pour l'UI)
  getMainKeyword(title: string): string | null {
    return this.findMainKeyword(title);
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