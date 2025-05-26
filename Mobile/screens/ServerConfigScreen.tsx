import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { serverConfig } from "../utils/serverConfig";
import { apiService } from "../utils/apiService";
import { toast } from "sonner-native";

export default function ServerConfigScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Charger l'URL actuelle du serveur
    const loadServerUrl = async () => {
      setServerUrl(serverConfig.getBaseUrl());
    };

    loadServerUrl();
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setIsConnected(null);
    setDiagnosticInfo(null);

    try {
      // D'abord, mettre à jour l'URL du serveur
      if (serverUrl) {
        await serverConfig.setCustomUrl(serverUrl);
      }

      // Ensuite, tester la connexion
      const isConnected = await apiService.testServerConnection();
      setIsConnected(isConnected);

      if (isConnected) {
        toast.success("Connexion au serveur réussie!");
      } else {
        // Exécuter les diagnostics pour aider l'utilisateur
        await runDiagnostics();
        toast.error("Impossible de se connecter au serveur.");
      }
    } catch (error) {
      console.error("Test connection error:", error);
      setIsConnected(false);
      toast.error("Erreur lors du test de connexion.");
      await runDiagnostics();
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      const diagnostics = await serverConfig.diagnose();
      setDiagnosticInfo(diagnostics);
    } catch (error) {
      console.error("Diagnostics error:", error);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      "Réinitialiser la configuration",
      "Êtes-vous sûr de vouloir réinitialiser la configuration du serveur aux valeurs par défaut?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Réinitialiser",
          onPress: async () => {
            await serverConfig.reset();
            setServerUrl(serverConfig.getBaseUrl());
            setIsConnected(null);
            setDiagnosticInfo(null);
            toast.success("Configuration réinitialisée");
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuration du serveur</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>URL du serveur</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:8080"
          autoCapitalize="none"
          keyboardType="url"
          editable={!isLoading}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Tester la connexion</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        {isConnected !== null && (
          <View style={styles.resultContainer}>
            <MaterialIcons
              name={isConnected ? "check-circle" : "error"}
              size={24}
              color={isConnected ? "#008d36" : "#d32f2f"}
            />
            <Text
              style={[
                styles.resultText,
                { color: isConnected ? "#008d36" : "#d32f2f" },
              ]}
            >
              {isConnected
                ? "Connexion établie avec succès"
                : "Impossible de se connecter au serveur"}
            </Text>
          </View>
        )}

        {diagnosticInfo && !isConnected && (
          <View style={styles.diagnosticContainer}>
            <Text style={styles.diagnosticTitle}>
              Informations de diagnostic
            </Text>
            <View style={styles.diagnosticItem}>
              <Text style={styles.diagnosticLabel}>URL utilisée:</Text>
              <Text style={styles.diagnosticValue}>
                {diagnosticInfo.baseUrl}
              </Text>
            </View>
            <View style={styles.diagnosticItem}>
              <Text style={styles.diagnosticLabel}>Plateforme:</Text>
              <Text style={styles.diagnosticValue}>
                {diagnosticInfo.platform}
              </Text>
            </View>
            <View style={styles.diagnosticItem}>
              <Text style={styles.diagnosticLabel}>URL personnalisée:</Text>
              <Text style={styles.diagnosticValue}>
                {diagnosticInfo.customUrl ? "Oui" : "Non"}
              </Text>
            </View>
            {diagnosticInfo.error && (
              <View style={styles.diagnosticItem}>
                <Text style={styles.diagnosticLabel}>Erreur:</Text>
                <Text style={[styles.diagnosticValue, { color: "#d32f2f" }]}>
                  {diagnosticInfo.error}
                </Text>
              </View>
            )}

            <Text style={styles.diagnosticTip}>Assurez-vous que:</Text>
            <Text style={styles.diagnosticDetail}>
              1. Votre serveur Spring Boot est bien démarré
            </Text>
            <Text style={styles.diagnosticDetail}>
              2. Le port 8080 n'est pas bloqué par un pare-feu
            </Text>
            <Text style={styles.diagnosticDetail}>
              3. Votre appareil et serveur sont sur le même réseau (ou utilisez
              l'URL correcte pour votre environnement)
            </Text>
          </View>
        )}

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Aide</Text>
          <Text style={styles.helpText}>
            • En local (émulateur Android): http://10.0.2.2:8080
          </Text>
          <Text style={styles.helpText}>
            • En local (iOS simulator): http://192.168.11.170:8080
          </Text>
          <Text style={styles.helpText}>
            • Appareil physique: http://[IP_ORDINATEUR]:8080
          </Text>
          <Text style={styles.helpNote}>
            Assurez-vous que votre appareil et votre serveur sont sur le même
            réseau, et que le port 8080 n'est pas bloqué par un pare-feu.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  testButton: {
    backgroundColor: "#008d36",
  },
  resetButton: {
    backgroundColor: "#d32f2f",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    gap: 10,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "500",
  },
  diagnosticContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    gap: 8,
  },
  diagnosticTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  diagnosticItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  diagnosticLabel: {
    fontWeight: "bold",
    marginRight: 5,
    flex: 0.4,
  },
  diagnosticValue: {
    flex: 0.6,
  },
  diagnosticTip: {
    marginTop: 15,
    fontWeight: "bold",
  },
  diagnosticDetail: {
    marginLeft: 10,
    marginTop: 5,
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
  },
  helpNote: {
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
    color: "#555",
  },
});
