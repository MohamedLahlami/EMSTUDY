import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { toast } from "sonner-native";
import { serverConfig } from "../utils/serverConfig";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    studentGroup: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const baseUrl = serverConfig.getBaseUrl();

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      toast.success("Registration successful!");
      navigation.navigate("Login");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Register</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, username: text }))
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                secureTextEntry
              />
            </View>

            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === "Student" && styles.activeRole,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, role: "Student" }))
                }
              >
                <Text
                  style={[
                    styles.roleText,
                    formData.role === "Student" && styles.activeRoleText,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === "Teacher" && styles.activeRole,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, role: "Teacher" }))
                }
              >
                <Text
                  style={[
                    styles.roleText,
                    formData.role === "Teacher" && styles.activeRoleText,
                  ]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>

            {formData.role === "Student" && (
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="group"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Student Group"
                  value={formData.studentGroup}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, studentGroup: text }))
                  }
                />
              </View>
            )}

            {formData.role === "Teacher" && (
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="description"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bio"
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#008d36",
    alignItems: "center",
  },
  activeRole: {
    backgroundColor: "#008d36",
  },
  roleText: {
    color: "#008d36",
    fontWeight: "600",
  },
  activeRoleText: {
    color: "#fff",
  },
  registerButton: {
    backgroundColor: "#008d36",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
