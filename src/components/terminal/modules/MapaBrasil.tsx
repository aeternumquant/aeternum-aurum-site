import { useState } from "react";
import BrazilMap from "../../maps/BrazilMap";
import { COMMANDS } from "../commands";
import { ModuleCard } from "../ModuleCard";

/**
 * O mapa do Brasil (que já existia) VIRA um módulo do painel — sem reescrita. O
 * BrazilMap segue usando o LAYERS/LayerConfig internamente; aqui só o embrulhamos
 * no contrato do card (título, fonte ZARC, menu). Atualizar = remonta o mapa (key).
 */
export default function MapaBrasil({ onRemove, onExpand }: { escopo?: string; onRemove?: () => void; onExpand?: () => void }) {
  const [k, setK] = useState(0);
  return (
    <ModuleCard command={COMMANDS.mapa} state="ready" dataDate="ZARC vigente"
      onRemove={onRemove} onExpand={onExpand} onRefresh={() => setK((v) => v + 1)}>
      <div className="p-3"><BrazilMap key={k} /></div>
    </ModuleCard>
  );
}
