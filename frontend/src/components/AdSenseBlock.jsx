import React, { useEffect, useRef } from 'react';

export default function AdSenseBlock({ 
  slot = '8250857236', 
  responsive = 'true', 
  className = ''
}) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.getAttribute('data-ad-status')) {
        // Double check it has physical width before pushing
        const width = adRef.current.offsetWidth || adRef.current.parentElement.offsetWidth;
        if (width > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (err) {
      console.error('Error loading AdSense:', err);
    }
  }, []);

  return (
    <div style={{ width: '100%', display: 'block', overflow: 'hidden' }} className={className}>
      <ins 
        ref={adRef}
        className="adsbygoogle h-[100px] md:h-[250px]"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-2952671334472955"
        data-ad-slot={slot}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
