import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "pt-BR", label: "PORTUGUÊS", flag: "🇧🇷" },
  { code: "en-US", label: "ENGLISH", flag: "🇺🇸" },
  { code: "es-ES", label: "ESPAÑOL", flag: "🇪🇸" },
  { code: "it-IT", label: "ITALIANO", flag: "🇮🇹" },
];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: typeof LANGUAGES[0]) => {
    setActiveLang(lang);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-white/5 rounded-sm hover:border-white/20 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        <span className="text-[9px] tracking-widest font-sans uppercase text-muted-foreground hidden lg:block">
          {activeLang.code.split("-")[0]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-36 bg-background/95 backdrop-blur-md border border-white/10 p-1 flex flex-col z-50 rounded-sm shadow-xl"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04] transition-colors rounded-sm ${
                  activeLang.code === lang.code ? "bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-sm leading-none">{lang.flag}</span>
                <span className="text-[10px] tracking-[0.1em] font-sans uppercase">
                  {lang.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
