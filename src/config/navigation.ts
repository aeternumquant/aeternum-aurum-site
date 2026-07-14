/**
 * Fonte única de verdade da navegação (Etapa 7 da reorganização).
 *
 * Header e Footer DERIVAM daqui, para nunca mais dessincronizarem.
 *   - inMenu:   aparece no menu principal (Header).
 *   - inFooter: aparece na navegação do rodapé (Footer).
 *
 * A ordem do array é a ordem de exibição. As rotas foram confirmadas
 * contra App.tsx (Soluções = /framework; Liquidação = /pagamentos-globais).
 */
export interface NavItem {
  label: string;
  path: string;
  inMenu: boolean;
  inFooter: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  // 6 abas do menu principal, na ordem final
  { label: "Início", path: "/", inMenu: true, inFooter: true },
  { label: "Soluções", path: "/framework", inMenu: true, inFooter: true },
  { label: "Commodities", path: "/commodities", inMenu: true, inFooter: true },
  { label: "Liquidação", path: "/pagamentos-globais", inMenu: true, inFooter: true },
  { label: "Tecnologia", path: "/tecnologia", inMenu: true, inFooter: true },
  { label: "Pesquisa", path: "/research", inMenu: true, inFooter: true },
  // Só no rodapé (saíram do menu principal, mas as páginas seguem existindo)
  { label: "Relatórios", path: "/reports", inMenu: false, inFooter: true },
  { label: "Acesso", path: "/acesso", inMenu: false, inFooter: true },
];

export const MENU_ITEMS = NAV_ITEMS.filter((i) => i.inMenu);
export const FOOTER_ITEMS = NAV_ITEMS.filter((i) => i.inFooter);
