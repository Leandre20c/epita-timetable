// components/OfflineBanner.tsx
import { Cable } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native'; // ← View vient de react-native
import { COLORS } from '../styles/screenStyles';

type OfflineBannerProps = {
  message?: string;
  submessage?: string;
  backgroundColor?: string;
  textColor?: string;
};

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'Mode hors-ligne - Utilisation du cache',
  submessage = 'Votre emploi du temps peut ne pas être à jour',
  backgroundColor = COLORS.danger,
  textColor = 'white',
}) => {
  return (
    <View style={[styles.banner, { backgroundColor }]}>
      <Cable 
        size={20} 
        color={textColor}
        strokeWidth={2.5}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.text, { color: textColor }]}>
        {message}
        {"\n"}
        {submessage && <Text style={styles.subtext}>{submessage}</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',  // Centre tout horizontalement
    alignItems: 'center',      // Aligne icône + texte verticalement
    gap: 8,                    // Espace entre icône et texte
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.5,
    fontWeight: '500',
  },
});