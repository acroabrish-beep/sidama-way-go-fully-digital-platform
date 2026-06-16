import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch the user role from Firestore /users/{uid}
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || null);
          } else {
            // Check if this is the default admin email to auto-boostrap
            if (currentUser.email === "admin@hawassa.gov.et") {
              const defaultAdminData = {
                name: "Super Admin Haile",
                email: "admin@hawassa.gov.et",
                role: "super_admin",
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, defaultAdminData);
              setRole("super_admin");
            } else {
              setRole(null);
            }
          }
        } catch (error) {
          console.error("Error reading role from Firestore:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
