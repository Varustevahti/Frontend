import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { TextInput, Button, Card, Text, HelperText, ActivityIndicator, Divider } from 'react-native-paper';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const nav = useNavigation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSignInPress = async () => {

    setLoading(true);
    try {
      const response = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      if (response.status === 'complete') {
        await setActive({ session: response.createdSessionId });
        Toast.show({ type: 'success', text1: 'Signed in' });
      } 
    } catch (e) {
      setErr('Sign in failed.');
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const redirectUrl = Linking.createURL('sso-callback');

  const startOAuth = async (strategy) => {

    try {
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        await setActiveSSO?.({ session: createdSessionId });
        Toast.show({ type: 'success', text1: 'Signed in with service provider' });
        return;
      }
    } catch (e) {
      console.log(`Service provider error (${strategy}):`, e);
      Alert.alert('Service providers sign-in failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, padding: 24, backgroundColor: '#F8FBFA', justifyContent: 'center' }}>
      <Card mode="elevated" style={{ borderRadius: 16, paddingVertical: 12 }}>
        <Card.Content>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text variant="headlineMedium" style={{ fontWeight: '850' }}> Varustevahti </Text>
            <Text variant="bodyMedium" style={{ opacity: 0.8, marginTop: 5 }}> Sign in to continue </Text>
          </View>

          <TextInput
            label="Email or Username"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={{ marginBottom: 8 }}/>

          <HelperText type="error" visible={!!err && !identifier}>
            Email or username is required
          </HelperText>

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={<TextInput.Icon icon={secure ? 'eye-off-outline' : 'eye-outline'} onPress={() => setSecure(s => !s)} />}
            mode="outlined"
            style={{ marginBottom: 8 }}/>

          <HelperText type="error" visible={!!err && !password}>
            Password is required
          </HelperText>

          <Button mode="contained" onPress={onSignInPress} disabled={loading} buttonColor="#52946B"
            style={{ marginTop: 4, paddingVertical: 6, borderRadius: 12 }}>
            {loading ? <ActivityIndicator animating size="small" /> : 'Sign In'} </Button>

          <Divider style={{ marginVertical: 16 }} />
          <Text style={{ textAlign: 'center', marginBottom: 12 }}>
            or continue with
          </Text>

          <Button mode="outlined" icon="google"
            onPress={() => startOAuth('oauth_google')} textColor="#52946B"
            style={{ borderRadius: 10, marginBottom: 8 }}> Continue with Google </Button>

          <Button mode="outlined" icon="apple"
            onPress={() => startOAuth('oauth_apple')} textColor="#52946B"
            style={{ borderRadius: 10 }}> Continue with Apple </Button>

          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text>
              Don’t have an account?
              <Text style={{ color: '#2e7d32', fontWeight: '700' }}
                onPress={() => nav.navigate('SignUp')}> Sign Up </Text>
            </Text>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}


