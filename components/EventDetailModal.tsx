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
      return { text: 'Terminé', color: COLORS.text.secondary };
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
        return { text: `Dans ${diffDays}j`, color: COLORS.text.secondary };
      }
    }
  };

  // Helper functions pour détecter le mot-clé
  const extractKeywords = (title: string): string[] => {
    return title
      .toLowerCase()
      .trim()
      .split(/[\s\-_()[\]{}.,;:!?]+/)
      .filter(word => word.length > 1);
  };

  const findMainKeyword = (title: string): string | null => {
    const keywords = extractKeywords(title);
    const importantKeywords = [
      'qcm', 'examen', 'exam', 'controle', 'partiel', 'test', 'rattrapage',
      'tp', 'td', 'cm', 'cours', 'projet', 'stage', 'soutenance'
    ];

    for (const keyword of keywords) {
      if (importantKeywords.includes(keyword)) {
        return keyword.toUpperCase();
      }
    }
    return null;
  };

  const status = getEventStatus();
  const mainKeyword = findMainKeyword(event.summary);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        {/* Header */}
        <View style={modalStyles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={modalStyles.modalCloseButton}>
            <X size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={modalStyles.modalHeaderTitle}>Détails du cours</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Titre avec couleur */}
          <View style={[modalStyles.sectionWithBorder, { borderLeftColor: selectedColor }]}>
            <Text style={styles.eventTitle}>{event.summary}</Text>
            <View style={[modalStyles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={modalStyles.statusText}>{status.text}</Text>
            </View>
          </View>

          {/* Informations principales */}
          <View style={[modalStyles.section, { marginTop: 0, gap: SPACING.md }]}>
            <View style={modalStyles.infoRow}>
              <Calendar size={20} color={COLORS.text.secondary} />
              <Text style={modalStyles.infoText}>{formatEventDate(event.startTime)}</Text>
            </View>

            <View style={modalStyles.infoRow}>
              <Clock size={20} color={COLORS.text.secondary} />
              <Text style={modalStyles.infoText}>
                {ICSParser.formatTime(event.startTime)} - {ICSParser.formatTime(event.endTime)}
              </Text>
              <Text style={styles.duration}>({getDuration()})</Text>
            </View>

            {event.location && (
              <View style={modalStyles.infoRow}>
                <MapPin size={20} color={COLORS.text.secondary} />
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
          <View style={[styles.actionsSection]}>
            {/* Notification (pour plus tard) */}
            <TouchableOpacity style={modalStyles.actionButton} disabled>
              <Bell size={20} color={COLORS.text.secondary} />
              <Text style={[modalStyles.actionText, { color: COLORS.text.secondary }]}>
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
            <View style={[modalStyles.section, { marginTop: 0 }]}>
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
        </ScrollView>
      </View>
    </Modal>
  );
};

// Styles spécifiques au modal (non réutilisables)
const styles = StyleSheet.create({
  placeholder: {
    width: 32
  },
  content: {
    flex: 1
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm
  },
  duration: {
    fontSize: 14,
    color: COLORS.text.secondary
  },
  actionsSection: {
    margin: SPACING.lg,
    marginTop: 0,
    gap: SPACING.sm
  },
  comingSoon: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic'
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: SPACING.sm
  },
  keywordInfo: {
    backgroundColor: COLORS.background,
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
    color: COLORS.text.secondary,
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
    color: COLORS.text.secondary
  }
});