import React from 'react';
import { Link } from 'react-router-dom';

const FooterLogo: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#087A46" />
    <path
      d="M4 16 L7 16 L9 10 L11 22 L13 13 L15 19 L17 8 L19 24 L21 14 L23 18 L25 16 L28 16"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Analyze', to: '/analyze' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Technology', href: '/#technology' },
  ];

  return (
    <footer
      className="bg-[#111614] text-[#FCFBF5]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <FooterLogo />
              <span
                className="font-display font-bold text-base text-white"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                NeuroTrace AI
              </span>
            </div>
            <p
              className="text-sm text-[#5F6862] leading-relaxed max-w-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              AI-assisted EEG signal analysis for research and education.
              Not intended for clinical use.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A2420] border border-[#2A3830] text-[10px] font-semibold text-[#5F6862]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#087A46]" aria-hidden="true" />
              Research prototype · 2025–{year}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="text-[10px] font-bold text-[#5F6862] uppercase tracking-widest mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Navigation
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-[#DCEBDD] hover:text-white transition-colors duration-150"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-[#DCEBDD] hover:text-white transition-colors duration-150"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1F2B26] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-[12px] text-[#5F6862]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            © {year} NeuroTrace AI · Research prototype
          </p>
          <p
            className="text-[11px] text-[#3A4D44]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Not a medical device. Not for clinical use.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
