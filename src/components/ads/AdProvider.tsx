import { useEffect } from 'react';

export default function AdProvider() {
  useEffect(() => {
    const network = document.querySelector('[data-ad-network]')?.getAttribute('data-ad-network');
    if (!network || network === 'none') return;

    // Load the ad network script based on configuration
    switch (network) {
      case 'adsense': {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        const clientId = document.querySelector('meta[name="adsense-client"]')?.getAttribute('content');
        if (clientId) script.dataset.adClient = clientId;
        document.head.appendChild(script);
        break;
      }
      case 'ezoic':
      case 'mediavine':
        // These networks inject their own scripts via DNS/header integration
        break;
    }
  }, []);

  return null;
}
