import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { api } from "@/lib/api";

export type DbUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isBlocked?: boolean; // 🚨 NEW: Added to type
};

type AuthContextType = {
  dbUser: DbUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          const response = await api.getMe();
          
          // 🚨 NEW: If the database says they are blocked, kick them out of Firebase instantly
          if (response.user.isBlocked) {
            throw new Error("ACCOUNT_BLOCKED");
          }
          
          setDbUser(response.user);
        } catch (err: any) {
          console.error("Database sync failed, logging out:", err);
          await signOut(auth);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in popup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
  };

  return (
    <AuthContext.Provider value={{ dbUser, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);