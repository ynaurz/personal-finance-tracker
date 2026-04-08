import AppNavigator from "./app/navigation/AppNavigator";
import { AuthProvider } from "./app/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}