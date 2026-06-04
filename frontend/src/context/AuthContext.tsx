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
          // 1. Try to find the user in your database
          const response = await api.getMe();
          setDbUser(response.user);
        } catch (err) {
          console.log("New user detected. Falling back to Google Profile data.");
          
          // 2. CRITICAL FIX: If they are a new user (Sign Up), use their Google data!
          // This ensures the Navbar updates instantly with their name.
          setDbUser({
            id: firebaseUser.uid,
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName || "New User",
            email: firebaseUser.email || "",
            role: "USER",
          });
          
          // Note: In the future, you can add a call here to save this new user to your database:
          // await api.createUser({ email: firebaseUser.email, name: firebaseUser.displayName });
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