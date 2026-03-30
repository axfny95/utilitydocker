export type AdNetwork = 'adsense' | 'ezoic' | 'mediavine' | 'none';
export type AdSlotPosition =
  | 'after-tool'
  | 'in-content'
  | 'sidebar'
  | 'sticky-bottom'
  | 'blog-mid'
  | 'homepage-mid';

export const ACTIVE_NETWORK: AdNetwork =
  (import.meta.env.PUBLIC_AD_NETWORK as AdNetwork) || 'none';

export const AD_SLOTS: Record<AdSlotPosition, { id: string; sizes: string }> = {
  'after-tool': { id: 'slot-after-tool', sizes: '728x90,320x100' },
  'in-content': { id: 'slot-in-content', sizes: '336x280,300x250' },
  sidebar: { id: 'slot-sidebar', sizes: '300x250,300x600' },
  'sticky-bottom': { id: 'slot-sticky', sizes: '320x50' },
  'blog-mid': { id: 'slot-blog-mid', sizes: '728x90,320x100' },
  'homepage-mid': { id: 'slot-homepage', sizes: '728x90,320x100' },
};
