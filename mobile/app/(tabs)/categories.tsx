import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api } from "../../services/api";
import { theme } from "../../styles/theme";
import { router } from "expo-router"

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  user_id: number;
  created_at: string;
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.log("Failed to load categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleDelete = (categoryId: number, categoryName: string) => {
    Alert.alert(
      "Delete category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/categories/${categoryId}`);
              setCategories((prev) => prev.filter((item) => item.id !== categoryId));
            } catch (error: any) {
              console.log("Failed to delete category:", error);
              Alert.alert(
                "Cannot delete",
                error?.response?.data?.detail || "Category may be used in transactions"
              );
            }
          },
        },
      ]
    );
  };

  const incomeCategories = categories.filter((item) => item.type === "income");
  const expenseCategories = categories.filter((item) => item.type === "expense");

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <View>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryMeta}>{item.icon}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.name)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Manage your income and expense categories</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => router.push("/create-category" as any)}
          >
            <Text style={styles.refreshButtonText}>Add Category</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={loadCategories}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Income</Text>
          {incomeCategories.length === 0 ? (
            <Text style={styles.emptyText}>No income categories yet</Text>
          ) : (
            incomeCategories.map((item) => (
              <View key={item.id}>{renderCategory({ item })}</View>
            ))
          )}

          <Text style={styles.sectionTitle}>Expense</Text>
          {expenseCategories.length === 0 ? (
            <Text style={styles.emptyText}>No expense categories yet</Text>
          ) : (
            expenseCategories.map((item) => (
              <View key={item.id}>{renderCategory({ item })}</View>
            ))
          )}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
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
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginBottom: 24,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  categoryMeta: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
  },
  deleteButtonText: {
    color: theme.colors.danger,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.muted,
    marginBottom: 12,
  },
});