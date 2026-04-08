import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect, router } from "expo-router";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../styles/theme";

type BalanceStats = {
  total_income: string;
  total_expense: string;
  balance: string;
};

type Transaction = {
  id: number;
  title: string;
  amount: string;
  type: "income" | "expense";
  note: string | null;
  transaction_date: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
};

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<BalanceStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [statsResponse, transactionsResponse] = await Promise.all([
        api.get("/stats/balance"),
        api.get("/transactions/?limit=10"),
      ]);

      setStats(statsResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.log("Failed to load data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Hello, {user?.username ?? "User"}</Text>
      <Text style={styles.subtitle}>Here is your finance overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Balance</Text>
        <Text style={styles.balance}>{stats?.balance ?? "0.00"}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.incomeValue}>
            {stats?.total_income ?? "0.00"}
          </Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>Expense</Text>
          <Text style={styles.expenseValue}>
            {stats?.total_expense ?? "0.00"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/add-transaction" as any)}
      >
        <Text style={styles.primaryButtonText}>Add Transaction</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions yet</Text>
      ) : (
        transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: tx.category?.color || "#ccc" },
                ]}
              />
              <View>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txMeta}>
                  {tx.category?.name} • {tx.transaction_date}
                </Text>
              </View>
            </View>

            <Text
              style={
                tx.type === "income"
                  ? styles.incomeValue
                  : styles.expenseValue
              }
            >
              {tx.type === "income" ? "+" : "-"}
              {tx.amount}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/(tabs)/categories" as any)}
      >
        <Text style={styles.primaryButtonText}>Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/(tabs)/statistics" as any)}
      >
        <Text style={styles.primaryButtonText}>Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
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
    padding: theme.spacing.lg,
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  smallCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.success,
  },
  expenseValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.danger,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  emptyText: {
    color: theme.colors.muted,
    marginBottom: 12,
  },
  txCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  txMeta: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
  },
  logoutButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  logoutButtonText: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
});