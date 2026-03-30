import { useEffect } from 'react';

/**
 * AdProvider — loads ad network scripts and manages ad display.
 *
 * CRITICAL LOGIC:
 * 1. Check if user is premium via /api/auth/me
 * 2. If premium → remove ALL ad slots from DOM (zero ads)
 * 3. If free → load the configured ad network script
 * 4. If no network configured → do nothing
 *
 * This runs client-side because tool pages are statically prerendered
 * and don't have server-side premium status.
 */
export default function AdProvider() {
  useEffect(() => {
    const adSlots = document.querySelectorAll('.ad-slot');
    if (adSlots.length === 0) return;

    const network = adSlots[0]?.getAttribute('data-ad-network');
    if (!network || network === 'none') {
      // No ad network configured — remove ad containers to clean up layout
      adSlots.forEach((slot) => slot.remove());
      return;
    }

    // Check premium status before loading any ads
    checkPremiumAndLoadAds(network, adSlots);
  }, []);

  return null;
}

async function checkPremiumAndLoadAds(network: string, adSlots: NodeListOf<Element>) {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (data.isPremium) {
      // Premium user — remove ALL ad slots, show zero ads
      adSlots.forEach((slot) => slot.remove());
      return;
    }
  } catch {
    // Auth check failed (probably not logged in) — show ads
  }

  // Free user — load the ad network
  switch (network) {
    case 'adsense':
      loadAdSense();
      break;
    case 'ezoic':
      // Ezoic injects via DNS integration — just initialize
      adSlots.forEach((slot) => initAdSlot(slot));
      break;
    case 'mediavine':
      // Mediavine injects via header script — just initialize
      adSlots.forEach((slot) => initAdSlot(slot));
      break;
  }
}

function loadAdSense() {
  // Load the AdSense script
  const clientId = document.querySelector('meta[name="adsense-client"]')?.getAttribute('content');
  if (!clientId) return;

  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.adClient = clientId;
  document.head.appendChild(script);

  // Initialize each ad slot after script loads
  script.onload = () => {
    document.querySelectorAll('.ad-slot').forEach((slot) => {
      initAdSenseSlot(slot, clientId);
    });
  };
}

function initAdSenseSlot(slot: Element, clientId: string) {
  const sizes = slot.getAttribute('data-ad-sizes') || '728x90';
  const position = slot.getAttribute('data-ad-position') || '';

  // Create the AdSense ins element
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.dataset.adClient = clientId;
  ins.dataset.adFormat = 'auto';
  ins.dataset.fullWidthResponsive = 'true';

  // For sticky bottom, use fixed height
  if (position === 'sticky-bottom') {
    ins.dataset.adFormat = 'horizontal';
    ins.style.height = '50px';
  }

  // For in-content rectangle, use rectangle format
  if (position === 'in-content') {
    ins.dataset.adFormat = 'rectangle';
  }

  slot.appendChild(ins);

  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  } catch {
    // Ad blocker or script failure — slot stays empty
  }
}

function initAdSlot(slot: Element) {
  // For non-AdSense networks, just mark the slot as ready
  slot.setAttribute('data-ad-ready', 'true');
}
