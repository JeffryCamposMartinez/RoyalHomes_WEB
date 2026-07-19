import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from './Icons';

function Footer() {
  const [contactInfo, setContactInfo] = useState(null);
  const [footerText, setFooterText] = useState('Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/contact`);
        if (res.ok) {
          const data = await res.json();
          setContactInfo(data);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      }
      
      try {
        const resHero = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/hero`);
        if (resHero.ok) {
          const heroData = await resHero.json();
          if (heroData && heroData.footer_text) {
            setFooterText(heroData.footer_text);
          }
        }
      } catch (err) {
        console.error('Error fetching footer text:', err);
      }
    };
    fetchContact();
  }, []);

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 pt-16 pb-8 px-container-margin-mobile md:px-container-margin-desktop relative z-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-8 mt-4">
              <img src="/images/logo/logo_completo_negro.png" alt="Royal Home" className="h-32 md:h-40 object-contain scale-[2] origin-center md:origin-left" />
            </div>
            <p className="font-body-md text-on-surface-variant max-w-sm leading-relaxed">
              {footerText}
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-label-md text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/30 pb-2 w-max">Enlaces Rápidos</h3>
            <nav className="flex flex-col gap-4">
              <Link to="/" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">Tienda</Link>
              <a href="#" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">Guía de Cuidado</a>
              <a href="#" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">Envíos y Devoluciones</a>
              <a href="#" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">Política de Privacidad</a>
            </nav>
          </div>

          {/* Contact & Socials */}
          {contactInfo && (
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="font-label-md text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/30 pb-2 w-max">Atención al Cliente</h3>
              <div className="flex flex-col gap-4 font-body-sm text-on-surface-variant mb-8">
                {contactInfo.whatsapp && (
                  <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    {contactInfo.whatsapp}
                  </a>
                )}
                {contactInfo.email_contacto && (
                  <a href={`mailto:${contactInfo.email_contacto}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    {contactInfo.email_contacto}
                  </a>
                )}
                {contactInfo.telefono && (
                  <a href={`tel:${contactInfo.telefono.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </div>
                    {contactInfo.telefono}
                  </a>
                )}
              </div>

              {(contactInfo.instagram_url || contactInfo.facebook_url) && (
                <div className="flex gap-4">
                  {contactInfo.instagram_url && (
                    <a href={contactInfo.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface transition-all hover:scale-105 hover:shadow-sm">
                      <InstagramIcon className="w-5 h-5" />
                    </a>
                  )}
                  {contactInfo.facebook_url && (
                    <a href={contactInfo.facebook_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface transition-all hover:scale-105 hover:shadow-sm">
                      <FacebookIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/30 py-6 flex justify-center items-center">
          <p className="font-caption text-caption text-on-surface-variant uppercase tracking-widest text-center">
            © {new Date().getFullYear()} ROYAL HOME. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
