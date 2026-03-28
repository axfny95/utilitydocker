export type AdNetwork = 'adsense' | 'ezoic' | 'mediavine' | 'none';
export type AdSlotPosition = 'leaderboard' | 'sidebar' | 'in-content' | 'sticky-bottom';

export const ACTIVE_NETWORK: AdNetwork =
  (import.meta.env.PUBLIC_AD_NETWORK as AdNetwork) || 'none';

export const AD_SLOTS: Record<AdSlotPosition, { id: string; sizes: string }> = {
  leaderboard: { id: 'slot-leaderboard', sizes: '728x90,970x90' },
  sidebar: { id: 'slot-sidebar', sizes: '300x250,300x600' },
  'in-content': { id: 'slot-in-content', sizes: '728x90,336x280' },
  'sticky-bottom': { id: 'slot-sticky', sizes: '728x90,320x50' },
};
