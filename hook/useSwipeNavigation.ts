// hook/useSwipeNavigation.ts - Final version - Bug : les events crads ne se render pas assze vite
// Ducoup quand on swipe on render a coté de l'ecran puis on fait la transition
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

interface UseSwipeNavigationProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft,
  canSwipeRight
}: UseSwipeNavigationProps) => {

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(10) // Distance minimale avant de détecter le geste
    .failOffsetY([-20, 20]) // Échoue si mouvement vertical > 20px
    .activeOffsetX([-30, 30]) // Active seulement après 30px horizontaux
    .onUpdate((event) => {
      // Seulement si le mouvement est principalement horizontal
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX * 0.4;
      }
    })
    .onEnd((event) => {
      const { translationX, translationY } = event;
      
      // Vérifier que c'est bien un swipe horizontal
      if (Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > 70) {
        if (translationX > 50 && canSwipeRight) {
          translateX.value = withTiming(300, { duration: 100 }, () => {
            runOnJS(onSwipeRight)();
            translateX.value = -600;
          translateX.value = withTiming(0, { duration: 150 });
          });
        } else if (translationX < -50 && canSwipeLeft) {
          translateX.value = withTiming(-300, { duration: 100 }, () => {
            runOnJS(onSwipeLeft)();
            translateX.value = 600;
          translateX.value = withTiming(0, { duration: 150 });
          });
        } else {
          translateX.value = withTiming(0, { duration: 200 });
        }
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  return { panGesture, translateX };
};