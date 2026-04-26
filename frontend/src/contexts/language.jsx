"use client"

import { createContext, useContext, useState, useCallback } from "react"
import translations from "@/i18n"

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rp-lang") || "en"
    }
    return "en"
  })

  const setLang = useCallback((newLang) => {
    setLangState(newLang)
    if (typeof window !== "undefined") {
      localStorage.setItem("rp-lang", newLang)
    }
  }, [])

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || translations.en?.[key] || key
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ t, lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
