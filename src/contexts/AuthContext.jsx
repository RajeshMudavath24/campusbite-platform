import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getIdTokenResult, setPersistence, browserLocalPersistence } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      console.error('[Auth] Firebase not initialized. Check env variables.');
      setError('Service unavailable. Please try again later.');
      setLoading(false);
      return;
    }
    
    // Set persistence to local storage to prevent cross-tab logout issues
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('[Auth] Persistence setting failed:', error);
    });
    
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const tokenResult = await getIdTokenResult(fbUser, true);
          const role = tokenResult?.claims?.role || 'student';
          setUser({
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email,
            role,
            displayName: fbUser.displayName || null,
          });
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('[Auth] token/claims error', e);
        setError('Authentication error.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, (e) => {
      console.error('[Auth] state change error', e);
      setError('Authentication unavailable.');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password, role = 'student') => {
    setError(null);
    if (!auth) throw new Error('Service unavailable');
    try {
      // Set persistence before signing in
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // For demo purposes, we'll use the role from the form
      // In production, you'd set custom claims on the server side
      const userData = { 
        id: cred.user.uid, 
        uid: cred.user.uid, 
        email: cred.user.email, 
        role: role,
        name: cred.user.displayName || email.split('@')[0]
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (e) {
      const message = e?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    try {
      if (auth) signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
