import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthData {
  token: string;
  role: string;
}

export const setAuthData = async (data: AuthData) => {
  try {
    await AsyncStorage.setItem('authData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export const getAuthData = async (): Promise<AuthData | null> => {
  try {
    const data = await AsyncStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

export const removeAuthData = async () => {
  try {
    await AsyncStorage.removeItem('authData');
  } catch (error) {
    console.error('Error removing auth data:', error);
  }
};