import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-transaction" />
          <Stack.Screen name="create-category" />
        </>
      ) : (
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}