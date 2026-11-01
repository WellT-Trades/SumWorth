import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { login, register } from '../api';
import { Colors } from '../theme';
import { saveToken } from '../tokenStorage';

type Props = {
  colors: Colors;
  onLoggedIn: () => void;
};

export default function LoginScreen({ colors, onLoggedIn }: Props) {
  const styles = createStyles(colors);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const token =
        mode === 'login'
          ? await login(email, password)
          : await register(email, password);
      await saveToken(token);
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.heading}>SumWorth</Text>
          <Text style={styles.tagline}>
            Your money. Your worth. One clear picture.
          </Text>

          <View style={styles.card}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textFaint}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textFaint}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <View style={styles.buttonRow}>
              <Button
                title={
                  busy
                    ? 'Please wait...'
                    : mode === 'login'
                    ? 'Log in'
                    : 'Create account'
                }
                onPress={submit}
                disabled={busy}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title={
                  mode === 'login'
                    ? 'New here? Create an account'
                    : 'Already registered? Log in'
                }
                onPress={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 48,
      paddingBottom: 48,
    },
    content: { width: '100%', maxWidth: 480 },
    heading: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    tagline: {
      marginTop: 8,
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
    card: {
      marginTop: 32,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { fontSize: 16, fontWeight: '600', color: colors.text },
    input: {
      marginTop: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      color: colors.text,
      fontSize: 16,
    },
    error: { marginTop: 12, fontSize: 14, color: colors.danger },
    buttonRow: { marginTop: 12, alignItems: 'center' },
  });
  