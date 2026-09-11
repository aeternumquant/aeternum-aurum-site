import { useState } from "react";
import GlobalFlowMap from "../../maps/GlobalFlowMap";
import { COMMANDS, type ModuleCommand } from "../commands";
import { ModuleCard } from "../ModuleCard";

/**
 * Mapa mundial de fluxo de commodities — embrulha o GlobalFlowMap (self-contido:
 * seleção de commodity + dados de trade_flows internos), sem reescrita. Fica ao
 * lado da tabela macro no layout. Atualizar = remonta (key).
 */
export default function MapaMundial({ onRemove, onExpand }: { escopo?: string; expanded?: boolean; onRemove?: () => void; onExpand?: () => void }) {
  const [k, setK] = useState(0);
  return (
    <ModuleCard command={COMMANDS.cflow as ModuleCommand} state="ready" dataDate="fluxos anuais (Comex)"
      onRemove={onRemove} onExpand={onExpand} onRefresh={() => setK((v) => v + 1)}>
      <div className="p-2"><GlobalFlowMap key={k} /></div>
    </ModuleCard>
  );
}
