// components/EventDetailModal.tsx
import {
    Bell,
    Calendar,
    Check,
    Clock,
    MapPin,
    Palette,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { AVAILABLE_COLORS } from '../config/subjectColors';
import { ICSParser } from '../services/ICSParser';
import SubjectColorService from '../services/SubjectColorService';
import { COLORS, SPACING, modalStyles } from '../styles/screenStyles';
import { CalendarEvent } from '../types/CalendarTypes';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isVisible: boolean;
  onClose: () => void;
  onColorChanged?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isVisible,
  onClose,
  onColorChanged
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');

  if (!event) return null;

  const currentColor = SubjectColorService.getColorBySubjectName(event.summary);

  // Mettre à jour la couleur sélectionnée quand le modal s'ouvre
  useEffect(() => {
    if (isVisible) {
      setSelectedColor(currentColor);
    }
  }, [isVisible, currentColor]);

  const handleColorSelect = async (color: string) => {
    try {
      // Mettre à jour immédiatement l'affichage
      setSelectedColor(color);
      
      await SubjectColorService.setColorForSubject(event.summary, color);
      
      // Déclencher immédiatement le callback pour re-render en arrière-plan
      onColorChanged?.();
      
      console.log(`✅ Couleur mise à jour: ${color}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la couleur');
      // Remettre l'ancienne couleur en cas d'erreur
      setSelectedColor(currentColor);
    }
  };

  const formatEventDate = (date: Date): string => {
    const today = new Date();
    const eventDate = new Date(date);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (eventDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    
    return eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDuration = (): string => {
    const diffMs = event.endTime.getTime() - event.startTime.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const getEventStatus = (): { text: string; color: string } => {
    const now = new Date();
    const startTime = event.startTime.getTime();
    const endTime = event.endTime.getTime();
    const currentTime = now.getTime();

    if (currentTime >= startTime && currentTime <= endTime) {
      return { text: 'En cours', color: COLORS.danger };
    } else if (currentTime > endTime) {
      return { text: 'Terminé', color: COLORS.light.text.secondary };
    } else {
      const diffToStart = startTime - currentTime;
      const diffMinutes = Math.round(diffToStart / 60000);
      const diffHours = Math.round(diffToStart / 3600000);
      const diffDays = Math.round(diffToStart / 86400000);
      
      if (diffMinutes < 60) {
        return { text: `Dans ${diffMinutes}min`, color: COLORS.warning };
      } else if (diffHours < 24) {
        return { text: `Dans ${diffHours}h`, color: COLORS.primary };
      } else {
        return { text: `Dans ${diffDays}j`, color: COLORS.light.text.secondary };
      }
    }
  };

  const status = getEventStatus();
  const mainKeyword = SubjectColorService.getMainKeyword(event.summary);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay semi-transparent cliquable */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popupContainer}>
          {/* Container qui ne propage pas le clic */}
          <Pressable onPress={() => {}} style={styles.popupContent}>
            
            {/* Header compact */}
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle} numberOfLines={2}>
                {event.summary}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={COLORS.light.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable */}
            <ScrollView style={styles.popupScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionInPopup}>
                
                {/* Status avec couleur */}
                <View style={[styles.statusSection]}>
                  <View style={[modalStyles.statusBadge, { backgroundColor: status.color }]}>
                    <Text style={modalStyles.statusText}>{status.text}</Text>
                  </View>
                </View>

                {/* Informations principales */}
                <View style={[modalStyles.section, { marginTop: 0, gap: SPACING.md, borderLeftWidth: 5, borderLeftColor: selectedColor }]}>
                  <View style={modalStyles.infoRow}>
                    <Calendar size={20} color={COLORS.light.text.secondary} />
                    <Text style={modalStyles.infoText}>{formatEventDate(event.startTime)}</Text>
                  </View>

                  <View style={modalStyles.infoRow}>
                    <Clock size={20} color={COLORS.light.text.secondary} />
                    <Text style={modalStyles.infoText}>
                      {ICSParser.formatTime(event.startTime)} - {ICSParser.formatTime(event.endTime)}
                    </Text>
                    <Text style={styles.duration}>({getDuration()})</Text>
                  </View>

                  {event.location && (
                    <View style={modalStyles.infoRow}>
                      <MapPin size={20} color={COLORS.light.text.secondary} />
                      <Text style={modalStyles.infoText}>{event.location}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {event.description && (
                  <View style={[modalStyles.section, { marginTop: 0 }]}>
                    <Text style={modalStyles.sectionTitle}>Description</Text>
                    <Text style={modalStyles.descriptionText}>{event.description}</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsSection}>
                  {/* Notification (pour plus tard) */}
                  <TouchableOpacity style={modalStyles.actionButton} disabled>
                    <Bell size={20} color={COLORS.light.text.secondary} />
                    <Text style={[modalStyles.actionText, { color: COLORS.light.text.secondary }]}>
                      Ajouter une notification
                    </Text>
                    <Text style={styles.comingSoon}>(Bientôt)</Text>
                  </TouchableOpacity>

                  {/* Changement de couleur */}
                  <TouchableOpacity 
                    style={modalStyles.actionButton}
                    onPress={() => setShowColorPicker(true)}
                  >
                    <Palette size={20} color={COLORS.primary} />
                    <Text style={[modalStyles.actionText, { color: COLORS.primary }]}>
                      Changer la couleur
                    </Text>
                    <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                  </TouchableOpacity>
                </View>

                {/* Sélecteur de couleurs */}
                {showColorPicker && (
                  <View style={[modalStyles.section, { marginTop: SPACING.xs, marginHorizontal: -SPACING.xs }]}>
                    <Text style={modalStyles.sectionTitle}>Choisir une couleur</Text>
                    <Text style={modalStyles.secondaryText}>
                      {mainKeyword 
                        ? `Cette couleur sera appliquée à tous les cours au mot-clé associés`
                        : `Cette couleur sera appliquée uniquement au cours "${event.summary}"`
                      }
                    </Text>
                    
                    {/* Afficher le mot-clé détecté */}
                    {mainKeyword && (
                      <View style={styles.keywordInfo}>
                        <Text style={styles.keywordText}>
                          Mot-clé détecté : <Text style={styles.keywordHighlight}>{mainKeyword}</Text>
                        </Text>
                      </View>
                    )}
                    
                    <View style={modalStyles.colorGrid}>
                      {AVAILABLE_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color.value}
                          style={[
                            modalStyles.colorOption,
                            { backgroundColor: color.value },
                            selectedColor === color.value && modalStyles.selectedColorOption
                          ]}
                          onPress={() => handleColorSelect(color.value)}
                        >
                          {selectedColor === color.value && (
                            <Check size={16} color="white" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.cancelColorButton}
                      onPress={() => setShowColorPicker(false)}
                    >
                      <Text style={styles.cancelColorText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

// Styles spécifiques au modal (non réutilisables)
const styles = StyleSheet.create({
  // === NOUVEAUX STYLES POPUP ===
  
  // Overlay qui couvre tout l'écran
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  
  // Container de la popup
  popupContainer: {
    width: '100%',
    maxWidth: 420, // Largeur maximale pour les tablets
    maxHeight: '85%', // Hauteur maximale
  },
  
  // Contenu de la popup
  popupContent: {
    backgroundColor: COLORS.light.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  
  // Header compact de la popup
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    backgroundColor: COLORS.light.cardBackground,
  },
  
  // Titre dans la popup
  popupTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    marginRight: SPACING.md,
  },
  
  // Bouton fermer
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Zone scrollable du contenu
  popupScrollContent: {
    maxHeight: '100%',
  },
  
  // Ajustements pour le contenu dans la popup
  sectionInPopup: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Section status adaptée
  statusSection: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  
  // === STYLES EXISTANTS ADAPTÉS ===
  
  duration: {
    fontSize: 14,
    color: COLORS.light.text.secondary
  },
  actionsSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm
  },
  comingSoon: {
    fontSize: 12,
    color: COLORS.light.text.secondary,
    fontStyle: 'italic'
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginLeft: SPACING.sm
  },
  keywordInfo: {
    backgroundColor: COLORS.light.background,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed'
  },
  keywordText: {
    fontSize: 14,
    color: COLORS.light.text.secondary,
    textAlign: 'center'
  },
  keywordHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary
  },
  cancelColorButton: {
    alignItems: 'center',
    padding: SPACING.md
  },
  cancelColorText: {
    fontSize: 16,
    color: COLORS.light.text.secondary
  }
});