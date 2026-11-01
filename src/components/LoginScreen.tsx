import { useState } from 'react';
import {
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { forgotPassword, login, register, resetPassword } from '../api';
import { Colors } from '../theme';
import { saveToken } from '../tokenStorage';

type Props = {
  colors: Colors;
  onLoggedIn: () => void;
};

type Mode = 'login' | 'register' | 'forgot' | 'reset';

const TITLES: Record<Mode, string> = {
  login: 'Log in',
  register: 'Create account',
  forgot: 'Reset your password',
  reset: 'Enter your code',
};

const ACTIONS: Record<Mode, string> = {
  login: 'Log in',
  register: 'Create account',
  forgot: 'Send me a code',
  reset: 'Set new password',
};

export default function LoginScreen({ colors, onLoggedIn }: Props) {
  const styles = createStyles(colors);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const goTo = (next: Mode) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const submit = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if ((mode === 'login' || mode === 'register') && !password) {
      setError('Please enter your password.');
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'reset' && !code.trim()) {
      setError('Please enter the code.');
      return;
    }
    if (mode === 'reset' && password.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'login' || mode === 'register') {
        const token =
          mode === 'login'
            ? await login(email, password)
            : await register(email, password);
        await saveToken(token);
        onLoggedIn();
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setMode('reset');
        setInfo(
          'If that email is registered, a code has been sent. Enter it below.'
        );
      } else {
        await resetPassword(email, code, password);
        setPassword('');
        setCode('');
        setMode('login');
        setInfo('Password updated. Please log in.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const showPasswordField = mode !== 'forgot';

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
            <Text style={styles.title}>{TITLES[mode]}</Text>

            {info !== '' && <Text style={styles.info}>{info}</Text>}

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

            {mode === 'reset' && (
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor={colors.textFaint}
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setError('');
                }}
                keyboardType="number-pad"
                maxLength={6}
              />
            )}

            {showPasswordField && (
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={mode === 'reset' ? 'New password' : 'Password'}
                  placeholderTextColor={colors.textFaint}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.toggle}
                >
                  <Text style={styles.toggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            )}

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <View style={styles.buttonRow}>
              <Button
                title={busy ? 'Please wait...' : ACTIONS[mode]}
                onPress={submit}
                disabled={busy}
              />
            </View>

            {mode === 'login' && (
              <View style={styles.buttonRow}>
                <Button
                  title="Forgot password?"
                  onPress={() => goTo('forgot')}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <Button
                title={
                  mode === 'login'
                    ? 'New here? Create an account'
                    : mode === 'register'
                    ? 'Already registered? Log in'
                    : 'Back to log in'
                }
                onPress={() => goTo(mode === 'login' ? 'register' : 'login')}
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
    passwordRow: { justifyContent: 'center' },
    passwordInput: { paddingRight: 64 },
    toggle: { position: 'absolute', right: 12, top: 24 },
    toggleText: { fontSize: 14, color: colors.textMuted },
    info: { marginTop: 12, fontSize: 14, color: colors.textMuted },
    error: { marginTop: 12, fontSize: 14, color: colors.danger },
    buttonRow: { marginTop: 12, alignItems: 'center' },
  });
