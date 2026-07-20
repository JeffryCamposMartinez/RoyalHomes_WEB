import React, { useEffect, useRef } from 'react';

export default function AdSenseBlock({ 
  slot = '8250857236', 
  format = 'auto', 
  responsive = 'true', 
  style = { display: 'block', width: '100%', minHeight: '90px' } 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
        // Prevent "No slot size for availableWidth=0" error by checking if it's visible
        if (adRef.current.offsetWidth > 0 || adRef.current.clientWidth > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (err) {
      console.error('Error loading AdSense:', err);
    }
  }, []);

  return (
    <ins 
      ref={adRef}
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-2952671334472955"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}
