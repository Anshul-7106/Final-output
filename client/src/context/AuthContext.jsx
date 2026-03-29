import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ADMIN_EMAILS = [
  "admin@gmail.com",
  "sudha@gmail.com",
  "sudhanshray10@gmail.com",
  "vs5825982@gmail.com"
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role = ADMIN_EMAILS.includes(firebaseUser.email) ? 'admin' : 'user';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: role,
          photoURL: firebaseUser.photoURL,
          firebaseUser
        });
        localStorage.setItem('token', firebaseUser.accessToken);
        localStorage.setItem('user', JSON.stringify({ email: firebaseUser.email, role }));
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      if (userData.name) {
        await firebaseUpdateProfile(userCredential.user, { displayName: userData.name });
        // Update local state early to reflect name change immediately 
        const role = ADMIN_EMAILS.includes(userCredential.user.email) ? 'admin' : 'user';
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userData.name,
          role: role,
          photoURL: userCredential.user.photoURL,
          firebaseUser: userCredential.user
        });
      }
      return { success: true };
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Google Login failed';
      setError(message);
      return { success: false, message };
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      if (auth.currentUser && userData.name) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: userData.name });
        setUser(prev => ({ ...prev, name: userData.name }));
        return { success: true };
      }
      return { success: false, message: 'No user to update' };
    } catch (err) {
      const message = err.message || 'Profile update failed';
      setError(message);
      return { success: false, message };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
        return { success: true, message: 'Password updated' };
      }
      return { success: false, message: 'No authenticated user' };
    } catch (err) {
      const message = err.message || 'Password update failed';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    updatePassword,
    setUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
