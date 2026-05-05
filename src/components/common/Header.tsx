import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WireframeCube } from "./WireframeCube";
import { Menu, X, ArrowRight } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { label: "Início", to: "/" },
  { label: "Framework", to: "/framework" },
  { label: "Alocações", to: "/alocacoes" },
  { label: "Pesquisa", to: "/research" },
  { label: "Commodities", to: "/commodities" },
  { label: "Tecnologia", to: "/tecnologia" },
  { label: "Execução", to: "/execucao" },
  { label: "Relatórios", to: "/reports" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 glass-header ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <motion.button
            className="text-muted-foreground hover:text-foreground transition-colors p-1 md:hidden"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Abrir menu"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {menuAberto ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="m"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <NavLink
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMenuAberto(false)}
          >
            <WireframeCube className="w-6 h-6" animate={false} />
            <span className="font-display text-[11px] tracking-[0.22em] uppercase text-foreground/60 group-hover:text-foreground/90 transition-colors hidden sm:block">
              Aeternum Aurum
            </span>
          </NavLink>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.slice(1).map((link) => {
            const ativo =
              link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase font-sans transition-all duration-200 ${
                  ativo
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: CTA + Auth Buttons */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {isAuthenticated ? (
            <>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center px-3 py-1.5 border border-white/10 text-muted-foreground text-[9px] tracking-[0.2em] uppercase font-sans hover:border-white/25 hover:text-foreground transition-all duration-300 rounded-sm"
              >
                Sair
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#C6A85A]/70 text-[#C6A85A] text-[9px] tracking-[0.2em] uppercase font-sans font-normal rounded-sm hover:bg-[#C6A85A]/10 hover:border-[#C6A85A] transition-all duration-300 group"
              >
                <span>Portal</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/acesso")}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#C6A85A]/70 text-[#C6A85A] text-[9px] tracking-[0.2em] uppercase font-sans font-normal rounded-sm hover:bg-[#C6A85A]/10 hover:border-[#C6A85A] transition-all duration-300 group"
              >
                <span>Acesso</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <NavLink
                to="/login"
                className="flex items-center px-3 py-1.5 border border-white/10 text-muted-foreground text-[9px] tracking-[0.2em] uppercase font-sans hover:border-white/25 hover:text-foreground transition-all duration-300 rounded-sm"
              >
                Login
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 bg-background/98 backdrop-blur-xl md:hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-0.5">
              {NAV_LINKS.map((link, i) => {
                const ativo =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.to);
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setMenuAberto(false)}
                      className={`block py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase font-sans border-l transition-all duration-200 ${
                        ativo
                          ? "border-primary text-primary bg-primary/[0.03]"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/[0.01]"
                      }`}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                );
              })}

              {/* Mobile CTA Button */}
              <div className="pt-3 mt-2 border-t border-white/5 space-y-2">
                {isAuthenticated ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: NAV_LINKS.length * 0.04, duration: 0.3 }}
                      onClick={() => {
                        navigate("/reports");
                        setMenuAberto(false);
                      }}
                      className="w-full py-3 px-3 bg-transparent border border-[#C6A85A]/70 text-[#C6A85A] text-[10px] tracking-[0.2em] uppercase font-sans font-normal rounded-sm hover:bg-[#C6A85A]/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Portal Restrito
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + 1) * 0.04, duration: 0.3 }}
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMenuAberto(false);
                      }}
                      className="w-full py-3 px-3 border border-white/10 text-muted-foreground text-[10px] tracking-[0.2em] uppercase font-sans hover:border-white/25 hover:text-foreground transition-all duration-300 flex items-center justify-center"
                    >
                      Sair
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: NAV_LINKS.length * 0.04, duration: 0.3 }}
                    onClick={() => {
                      navigate("/acesso");
                      setMenuAberto(false);
                    }}
                    className="w-full py-3 px-3 bg-transparent border border-[#C6A85A]/70 text-[#C6A85A] text-[10px] tracking-[0.2em] uppercase font-sans font-normal rounded-sm hover:bg-[#C6A85A]/10 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Solicitar Acesso
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
