import React, { createContext, useState, useContext, useEffect } from "react";
import { translations } from "../utils/translations";

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  // Read initial language from localStorage, default to Arabic "ar" as requested by the user
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem("chess_lang");
    return (saved === "en" || saved === "ar") ? saved : "ar";
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("chess_lang", newLang);
  };

  useEffect(() => {
    // Dynamically update document direction based on language
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    const dict = translations[lang] || translations["ar"];
    return dict[key] || translations["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
