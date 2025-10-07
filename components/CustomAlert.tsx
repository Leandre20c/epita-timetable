// components/CustomAlert.tsx
import { AlertTriangle, Info, LogOut, UserRoundCheck, X } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'deconnexion';
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Annuler',
  type = 'success',
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { 
          icon: <UserRoundCheck size={32} color="white" strokeWidth={2.5} />, 
          color: '#10b981' 
        };
      case 'error':
        return { 
          icon: <X size={32} color="white" strokeWidth={3} />, 
          color: '#ef4444' 
        };
      case 'warning':
        return { 
          icon: <AlertTriangle size={32} color="white" strokeWidth={2.5} />, 
          color: '#f59e0b' 
        };
      case 'info':
        return { 
          icon: <Info size={32} color="white" strokeWidth={2.5} />, 
          color: '#3b82f6' 
        };
      case 'deconnexion':
        return { 
          icon: <LogOut size={32} color="white" strokeWidth={3} />, 
          color: '#ef4444' 
        };
      default:
        return { 
          icon: <UserRoundCheck size={32} color="white" strokeWidth={2.5} />, 
          color: '#10b981' 
        };
    }
  };

  const { icon, color } = getIconAndColor();
  const isConfirmation = !!onCancel; // Si onCancel existe, c'est une confirmation

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icône */}
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            {icon}
          </View>

          {/* Titre */}
          <Text style={styles.title}>{title}</Text>

          {/* Message optionnel */}
          {message && <Text style={styles.message}>{message}</Text>}
          
          {/* Boutons */}
          {isConfirmation ? (
            // Mode confirmation : 2 boutons
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: color }]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Mode simple : 1 bouton
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: color }]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Bouton simple (1 seul)
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Boutons de confirmation (2 boutons)
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});