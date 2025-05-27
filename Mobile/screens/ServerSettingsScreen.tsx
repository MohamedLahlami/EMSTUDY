import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { serverConfig } from "../utils/serverConfig";
import { toast } from "sonner-native";

export default function ServerSettingsScreen() {
  const navigation = useNavigation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Show the current URL on mount
    setUrl(serverConfig.getBaseUrl());
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    setSaving(true);
    try {
      await serverConfig.setCustomUrl(url);
      toast.success("Server URL updated!");
      navigation.goBack();
    } catch (e) {
      toast.error("Failed to update server URL");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await serverConfig.reset();
      setUrl(serverConfig.getBaseUrl());
      toast.success("Server URL reset to default");
    } catch (e) {
      toast.error("Failed to reset server URL");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#008d36" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Server Settings</Text>
      <Text style={styles.label}>Backend API URL:</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://192.168.11.194:8080"
      />
      <View style={{ height: 16 }} />
      <Button
        title={saving ? "Saving..." : "Save"}
        color="#008d36"
        onPress={handleSave}
        disabled={saving}
      />
      <View style={{ height: 16 }} />
      <Button
        title="Reset to Default"
        color="#008d36"
        onPress={handleReset}
        disabled={saving}
      />
      <View style={{ height: 16 }} />
      <Button
        title="Back"
        color="#008d36"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#008d36",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    width: "100%",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});
