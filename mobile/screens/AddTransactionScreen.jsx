import { View, Text, StyleSheet } from "react-native";

export default function AddTransactionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Transaction Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});