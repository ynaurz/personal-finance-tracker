import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { api } from "../services/api";
import { theme } from "../styles/theme";

type CategoryType = "income" | "expense";

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#F59E0B",
  "#7C3AED",
  "#0EA5E9",
];

export default function CreateCategoryScreen() {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("📦");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter category name");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/categories/", {
        name: name.trim(),
        type,
        color,
        icon,
      });

      Alert.alert("Success", "Category created");
      router.replace("/(tabs)/categories" as any);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to create category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Category</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && styles.active,
          ]}
          onPress={() => setType("expense")}
        >
          <Text style={styles.typeText}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && styles.active,
          ]}
          onPress={() => setType("income")}
        >
          <Text style={styles.typeText}>Income</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Food, Salary"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Icon (emoji)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 🍔"
        value={icon}
        onChangeText={setIcon}
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorBox,
              { backgroundColor: c },
              color === c && styles.selectedColor,
            ]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Creating..." : "Create Category"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  active: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: "#fff",
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});