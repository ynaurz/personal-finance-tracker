import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";

type AuthContextType = {
  token: string | null;
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("access_token");

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        await fetchCurrentUser(storedToken);
      }
    } catch (error) {
      console.log("Failed to load stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async (authToken: string) => {
    try {
      api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.log("Failed to fetch current user:", error);
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const response = await api.post("/auth/login", body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const newToken = response.data.access_token;

    await AsyncStorage.setItem("access_token", newToken);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    setToken(newToken);

    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data);
  };

  const register = async (email: string, username: string, password: string) => {
    await api.post("/auth/register", {
      email,
      username,
      password,
    });

    await login(email, password);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}