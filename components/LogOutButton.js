import React from 'react';
import { IconButton } from 'react-native-paper';
import { useAuth } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';

export default function LogoutButton() {
  const { signOut } = useAuth();

  const onPress = async () => {
    try {
      await signOut();
      Toast.show({ type: 'success', text1: 'Signed out' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Sign out failed' });
      console.log(e);
    }
  };

  return <IconButton icon="logout" onPress={onPress} />;
}
