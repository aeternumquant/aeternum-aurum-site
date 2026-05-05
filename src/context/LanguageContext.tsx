import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "pt-BR" | "en-US" | "es-ES" | "it-IT";

type TranslationMap = Record<string, string>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Lazy-load translations
const translationCache: Partial<Record<Locale, TranslationMap>> = {};

async function loadTranslation(locale: Locale): Promise<TranslationMap> {
  if (translationCache[locale]) return translationCache[locale]!;
  try {
    const mod = await import(`../i18n/${locale}.ts`);
    translationCache[locale] = mod.default;
    return mod.default;
  } catch {
    return {};
  }
}

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem("aa-locale");
    if (stored && ["pt-BR", "en-US", "es-ES", "it-IT"].includes(stored)) {
      return stored as Locale;
    }
  } catch {}
  return "pt-BR";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  const [translations, setTranslations] = useState<TranslationMap>({});

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem("aa-locale", newLocale); } catch {}
    loadTranslation(newLocale).then(setTranslations);
  }, []);

  // Load initial translations
  useState(() => {
    loadTranslation(locale).then(setTranslations);
  });

  const t = useCallback((key: string, fallback?: string): string => {
    if (locale === "pt-BR") return fallback || key;
    return translations[key] || fallback || key;
  }, [locale, translations]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
