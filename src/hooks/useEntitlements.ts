import { useAuth, type Plan } from "../context/AuthContext";

/**
 * useEntitlements — o front usa isto para DECIDIR O QUE MOSTRAR. Nunca e a unica
 * defesa: a RLS ja filtrou no servidor (o dado completo nao chega ao navegador
 * do usuario gratis).
 *
 * EIXO DE DEGRADACAO (decidido): GRANULARIDADE. Gratis ve por ESTADO; pago
 * (terminal+) ve por MUNICIPIO. O plano vem de current_plan() (a tabela).
 */
const RANK: Record<Plan, number> = { free: 0, terminal: 1, partners: 2, aurum: 3 };

export function useEntitlements() {
  const { plan, planLoading, loading, isAuthenticated, refreshPlan } = useAuth();

  const atLeast = (min: Plan) => RANK[plan] >= RANK[min];

  return {
    plan,
    loading: loading || planLoading,
    isAuthenticated,
    refreshPlan,

    isPaid: atLeast("terminal"),

    // granularidade geografica
    canSeeEstado: () => true, // estado e aberto (inclusive p/ free logado)
    canSeeMunicipio: () => atLeast("terminal"), // municipio exige assinatura

    // series/blocos que exigem um plano minimo (alguns aparecem, mas travados)
    canSeeSerie: (min: Plan = "free") => atLeast(min),

    atLeast,
  };
}
