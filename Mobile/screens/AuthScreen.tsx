import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { login, register, LoginCredentials, UserDTO } from '../utils/authApi';
import { appState } from '../utils/appState';

export const AuthScreen = ({ navigation }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!firstName || !lastName))) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const credentials: LoginCredentials = { email, password };
        const response = await login(credentials);
        if (response.token) {
          // Mettre à jour l'état de l'application
          appState.setState({
            isLoggedIn: true,
            user: response.user
          });
        }
      } else {
        const userData: UserDTO = {
          email,
          password,
          firstName,
          lastName,
          role: 'STUDENT', // Rôle par défaut
        };
        const response = await register(userData);
        if (response.token) {
          // Mettre à jour l'état de l'application
          appState.setState({
            isLoggedIn: true,
            user: response.user
          });
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Une erreur est survenue lors de l\'authentification'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
      
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        <Text style={styles.switchButtonText}>
          {isLogin
            ? "Pas encore de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 