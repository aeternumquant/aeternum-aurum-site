import { useState } from "react";
import BrazilMap from "../../maps/BrazilMap";
import { COMMANDS, type ModuleCommand } from "../commands";
import { ModuleCard } from "../ModuleCard";

/**
 * O mapa do Brasil (que já existia) VIRA um módulo do painel — sem reescrita. O
 * BrazilMap segue usando o LAYERS/LayerConfig internamente; aqui só o embrulhamos
 * no contrato do card (título, fonte ZARC, menu). Atualizar = remonta o mapa (key).
 */
export default function MapaBrasil({ escopo, expanded, onRemove, onExpand, dossie }: { escopo?: string; expanded?: boolean; onRemove?: () => void; onExpand?: () => void; dossie?: boolean }) {
  const [k, setK] = useState(0);
  return (
    <ModuleCard command={COMMANDS.mapa as ModuleCommand} state="ready" dataDate="ZARC vigente"
      onRemove={onRemove} onExpand={onExpand} onRefresh={() => setK((v) => v + 1)}>
      {/* compacto (na linha, ~462px) engrossa o stroke municipal; expandido volta ao normal */}
      <div className="p-3"><BrazilMap key={k} compact={!expanded} escopo={escopo} dossie={dossie} /></div>
    </ModuleCard>
  );
}
