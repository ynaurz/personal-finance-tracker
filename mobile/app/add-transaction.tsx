import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { api } from "../services/api";
import { theme } from "../styles/theme";

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

type TransactionType = "income" | "expense";

export default function AddTransactionScreen() {
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setSelectedCategoryId(filteredCategories[0].id);
    } else {
      setSelectedCategoryId(null);
    }
  }, [type, categories]);

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.log("Failed to load categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a title");
      return;
    }

    if (!amount.trim() || Number(amount) <= 0) {
      Alert.alert("Validation", "Please enter a valid amount");
      return;
    }

    if (!transactionDate.trim()) {
      Alert.alert("Validation", "Please enter a date");
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert("Validation", "Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/transactions/", {
        title: title.trim(),
        amount: Number(amount),
        type,
        note: note.trim() || null,
        transaction_date: transactionDate,
        category_id: selectedCategoryId,
      });

      Alert.alert("Success", "Transaction created successfully");
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      console.log("Failed to create transaction:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to create transaction"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Transaction</Text>
      <Text style={styles.subtitle}>Create a new income or expense entry</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && styles.typeButtonActive,
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === "expense" && styles.typeButtonTextActive,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && styles.typeButtonActive,
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === "income" && styles.typeButtonTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Lunch, Salary"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 15.50"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={transactionDate}
        onChangeText={setTransactionDate}
      />

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Optional note"
        multiline
        value={note}
        onChangeText={setNote}
      />

      <Text style={styles.label}>Category</Text>
      {filteredCategories.length === 0 ? (
        <Text style={styles.emptyText}>No categories available for this type</Text>
      ) : (
        filteredCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategoryId === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategoryId(category.id)}
          >
            <View style={styles.categoryInfo}>
              <View
                style={[styles.colorDot, { backgroundColor: category.color }]}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategoryId === category.id &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? "Saving..." : "Save Transaction"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  categoryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
  },
  categoryButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#DBEAFE",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: theme.colors.primary,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
  },
  emptyText: {
    color: theme.colors.muted,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});