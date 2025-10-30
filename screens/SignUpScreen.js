import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { TextInput, Button, Card, Text, HelperText, ActivityIndicator, Divider } from 'react-native-paper';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const nav = useNavigation();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSignUp = async () => {
    setErr('');
    if (!isLoaded) return;

    setLoading(true);

    signUp.create({
        emailAddress: email.trim(),
        password,
        username: username.trim(),
      }).then(async (res) => {
        if (res.status === 'complete') {
          await setActive({ session: res.createdSessionId });
          Toast.show({ type: 'success', text1: 'Account created' });
        }
      }).catch(() => {
        setErr('Registration failed.');
        Toast.show({ type: 'error', text1: 'Failed registration' });
      }).finally(() => setLoading(false));
  };

  const redirectUrl = Linking.createURL('sso-callback');

  const startOAuth = async (strategy) => {
    setErr('');
    startSSOFlow({ strategy, redirectUrl }).then(async ({ createdSessionId, setActive: setActiveSSO }) => {
        if (createdSessionId) {
          await setActiveSSO?.({ session: createdSessionId });
          Toast.show({ type: 'success', text1: 'Signed in with service provider' });
        }
      }).catch(() => {
        setErr('signing in with service provider failed.');
        Toast.show({ type: 'error', text1: 'Signing with service provider failed' });
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, padding: 24, backgroundColor: '#F8FBFA', justifyContent: 'center' }}
    >
      <Card mode="elevated" style={{ borderRadius: 16, paddingVertical: 12 }}>
        <Card.Content>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text variant="headlineMedium" style={{ fontWeight: '700' }}> Create account </Text>
            <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 4 }}>
              Let´s start with Username, email and password
            </Text>
          </View>

          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            mode="outlined"
            style={{ marginBottom: 8 }}/>

            <HelperText type="error" visible={!!err && !username}>oops, you forgot username</HelperText>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={{ marginBottom: 8 }}/>

          <HelperText type="error" visible={!!err && !email}>Email is required</HelperText>

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={<TextInput.Icon icon={secure ? 'eye-off' : 'eye'} onPress={() => setSecure(s => !s)} />}
            mode="outlined"
            style={{ marginBottom: 8 }}/>

          <HelperText type="error" visible={!!err && !password}>Did you remember to put an password</HelperText>

          {!!err && <Text style={{ color: '#b00020', marginBottom: 8 }}>{err}</Text>}

          <Button mode="contained" onPress={onSignUp} disabled={loading} style={{ marginTop: 4, paddingVertical: 6, borderRadius: 12, backgroundColor: '#52946B' }}>
            {loading ? (<ActivityIndicator animating size="small" />) : ('Create an account')}
          </Button>

          <Divider style={{ marginVertical: 16 }} />
          <Text style={{ textAlign: 'center', opacity: 0.8, marginBottom: 12 }}>Or continue with</Text>

          <Button mode="outlined" icon="google" onPress={() => startOAuth('oauth_google')} style={{ borderRadius: 12, marginBottom: 8 }} textColor="#52946B">
            Google </Button>

          <Button mode="outlined" icon="apple" onPress={() => startOAuth('oauth_apple')} style={{ borderRadius: 12 }} textColor="#52946B">
            Apple </Button>

          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text>
              Already have an account?{' '}
              <Text style={{ color: '#2e7d32', fontWeight: '700' }} onPress={() => nav.navigate('SignIn')}>
                Sign in </Text>
            </Text>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}
