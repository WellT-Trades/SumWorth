import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to SumWorth.</Text>
      <Text>Your money. Your worth. One clear picture.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012e36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
  }
});
