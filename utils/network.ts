import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // isInternetReachable can be null on first load, so we safely check it.
      // If it's null but isConnected is true, we might assume online to prevent false offline flags.
      setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}

export const checkIsOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!state.isConnected && state.isInternetReachable !== false;
};
