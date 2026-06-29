import React, { createContext, useContext, useEffect } from "react";
import { translations } from "../utils/translations";

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const lang = "ar";

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    localStorage.setItem("chess_lang", "ar");
  }, []);

  const t = (key) => translations.ar[key] || String(key);

  return (
    <LanguageContext.Provider value={{ lang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("يجب استخدام useLanguage داخل LanguageProvider");
  }
  return context;
}
