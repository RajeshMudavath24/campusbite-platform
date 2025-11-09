import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages, getTranslation } from '../utils/languages';
import { storage } from '../utils/helpers';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = storage.get('language');
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language preference to localStorage
    storage.set('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key) => {
    return getTranslation(key, currentLanguage);
  };

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
