import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { getAuthData } from "../utils/tokenStorage";
import { serverConfig } from "../utils/serverConfig";
import { toast } from "sonner-native";

export default function CreateMaterialScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || {};

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "image/*",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown",
      ],
      copyToCacheDirectory: true,
    });
    if (result.type === "success") {
      setFile(result);
    }
  };

  const handleSubmit = async () => {
    if (!title || !file) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setLoading(true);
    try {
      const authData = await getAuthData();
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });
      const baseUrl = serverConfig.getBaseUrl();
      const url = `${baseUrl}/materials?title=${encodeURIComponent(
        title
      )}&courseId=${courseId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData?.token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload material");
      }
      toast.success("Material uploaded successfully!");
      navigation.goBack();
    } catch (error) {
      toast.error(error.message || "Failed to upload material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Material for Course ID: {courseId}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Material Title"
        value={title}
        onChangeText={setTitle}
      />
      <Button
        title={file ? `File: ${file.name}` : "Pick File"}
        color="#008d36"
        onPress={pickFile}
      />
      <View style={{ height: 16 }} />
      {loading ? (
        <ActivityIndicator size="large" color="#008d36" />
      ) : (
        <Button title="Submit" color="#008d36" onPress={handleSubmit} />
      )}
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#008d36",
  },
  input: {
    width: "100%",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
