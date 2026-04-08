import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api } from "../../services/api";
import { theme } from "../../styles/theme";

type BalanceStats = {
  total_income: string;
  total_expense: string;
  balance: string;
};

type CategoryStatsItem = {
  category_id: number;
  category_name: string;
  category_type: "income" | "expense";
  total_amount: string;
};

type PeriodStats = {
  start_date: string;
  end_date: string;
  total_income: string;
  total_expense: string;
  balance: string;
};

export default function StatisticsScreen() {
  const [balanceStats, setBalanceStats] = useState<BalanceStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatsItem[]>([]);
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

    return { start, end };
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);

      const { start, end } = getMonthRange();

      const [balanceResponse, categoriesResponse, periodResponse] =
        await Promise.all([
          api.get("/stats/balance"),
          api.get("/stats/categories"),
          api.get("/stats/period", {
            params: {
              start_date: start,
              end_date: end,
            },
          }),
        ]);

      setBalanceStats(balanceResponse.data);
      setCategoryStats(categoriesResponse.data);
      setPeriodStats(periodResponse.data);
    } catch (error) {
      console.log("Failed to load statistics:", error);
      Alert.alert("Error", "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Statistics</Text>
      <Text style={styles.subtitle}>Your finance overview</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      <View style={styles.mainCard}>
        <Text style={styles.cardLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{balanceStats?.balance ?? "0.00"}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>Total Income</Text>
          <Text style={styles.incomeValue}>
            {balanceStats?.total_income ?? "0.00"}
          </Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardLabel}>Total Expense</Text>
          <Text style={styles.expenseValue}>
            {balanceStats?.total_expense ?? "0.00"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>This Month</Text>
      <View style={styles.periodCard}>
        <Text style={styles.periodText}>
          {periodStats?.start_date} → {periodStats?.end_date}
        </Text>
        <Text style={styles.periodStat}>
          Income: {periodStats?.total_income ?? "0.00"}
        </Text>
        <Text style={styles.periodStat}>
          Expense: {periodStats?.total_expense ?? "0.00"}
        </Text>
        <Text style={styles.periodBalance}>
          Balance: {periodStats?.balance ?? "0.00"}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>By Category</Text>
      {categoryStats.length === 0 ? (
        <Text style={styles.emptyText}>No category statistics yet</Text>
      ) : (
        categoryStats.map((item) => (
          <View key={item.category_id} style={styles.categoryCard}>
            <View>
              <Text style={styles.categoryName}>{item.category_name}</Text>
              <Text style={styles.categoryType}>{item.category_type}</Text>
            </View>

            <Text
              style={
                item.category_type === "income"
                  ? styles.incomeValue
                  : styles.expenseValue
              }
            >
              {item.total_amount}
            </Text>
          </View>
        ))
      )}
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
    marginBottom: 20,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  mainCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  balanceValue: {
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
  cardLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  periodCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  periodText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 10,
  },
  periodStat: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 6,
  },
  periodBalance: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  categoryType: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.muted,
  },
});