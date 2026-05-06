import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/common/Header";
import CursorGlow from "./components/common/CursorGlow";
import { useLenis } from "./hooks/useLenis";

// Importações Críticas (Carregam na hora)
import Home from "./pages/Home";

// Lazy Loading para Rotas Secundárias (Carregam sob demanda)
const FrameworkPage = lazy(() => import("./pages/Framework"));
const AlocacoesPage = lazy(() => import("./pages/Alocacoes"));
const ResearchPage = lazy(() => import("./pages/dashboard/Research"));
const CommoditiesPage = lazy(() => import("./pages/dashboard/Commodities"));
const AcessoPage = lazy(() => import("./pages/auth/Acesso"));
const ReportsPage = lazy(() => import("./pages/dashboard/Reports"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const TecnologiaPage = lazy(() => import("./pages/dashboard/Tecnologia"));
const ArticleReader = lazy(() => import("./pages/ArticleReader"));
const ExecucaoPage = lazy(() => import("./pages/dashboard/Execucao"));
const NotFound = lazy(() => import("./pages/not-found"));

import PrivateRoute from "./routes/PrivateRoute";

const pageTransition = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(2px)" },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  // Loading State minimalista e elegante (estética de Terminal)
  const TerminalLoader = () => (
    <div className="w-full h-screen flex items-center justify-center bg-background text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
      <span className="animate-pulse">Loading modules...</span>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<TerminalLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Rotas Públicas - General Pages */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/framework" element={<PageWrapper><FrameworkPage /></PageWrapper>} />
          <Route path="/commodities" element={<PageWrapper><CommoditiesPage /></PageWrapper>} />
          <Route path="/tecnologia" element={<PageWrapper><TecnologiaPage /></PageWrapper>} />
          <Route path="/alocacoes" element={<PageWrapper><AlocacoesPage /></PageWrapper>} />
          <Route path="/execucao" element={<PageWrapper><ExecucaoPage /></PageWrapper>} />

          {/* Rotas Públicas - Authentication */}
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/acesso" element={<PageWrapper><AcessoPage /></PageWrapper>} />

          {/* Rotas Públicas - Research Section (Blurred Premium Content) */}
          <Route path="/research" element={<PageWrapper><ResearchPage /></PageWrapper>} />
          <Route path="/research/:id" element={<PageWrapper><ArticleReader /></PageWrapper>} />

          {/* Rotas Protegidas - Reports Only */}
          <Route path="/reports" element={
            <PrivateRoute>
              <PageWrapper><ReportsPage /></PageWrapper>
            </PrivateRoute>
          } />

          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function AppInner() {
  useLenis();
  return (
    <>
      <CursorGlow />
      <Header />
      <AnimatedRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}