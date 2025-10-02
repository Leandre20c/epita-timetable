// hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // État initial
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
      setConnectionType(state.type);
    });

    // Écouter les changements
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      setConnectionType(state.type);
      
      if (!online) {
        console.log('📡 Connexion perdue - Mode hors-ligne activé');
      } else {
        console.log('📡 Connexion rétablie');
      }
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, connectionType };
}