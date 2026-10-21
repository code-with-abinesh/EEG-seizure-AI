import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Analysis', href: '/analyze' },
  { label: 'Technology', href: '/#technology' },
  { label: 'About', href: '/#about' },
];

const EEGLogo: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NeuroTrace AI logo mark">
    <rect width="32" height="32" rx="8" fill="#087A46" />
    <path
      d="M4 16 L7 16 L9 10 L11 22 L13 13 L15 19 L17 8 L19 24 L21 14 L23 18 L25 16 L28 16"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="16" cy="16" r="2" fill="white" opacity="0.3" />
  </svg>
);

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (location.pathname !== '/') {
        window.location.href = href;
      }
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'bg-[#FCFBF5] shadow-sm border-b border-[#DDE4DC]'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="NeuroTrace AI - Home"
          >
            <EEGLogo />
            <span
              className="font-display font-700 text-[17px] tracking-tight text-[#111614] group-hover:text-[#087A46] transition-colors duration-200"
              style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}
            >
              NeuroTrace AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLink(e, link.href)}
                className="px-4 py-2 text-sm font-medium text-[#5F6862] hover:text-[#111614] rounded-lg hover:bg-[#DCEBDD] transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/analyze"
              id="nav-analyze-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#087A46] hover:bg-[#005C35] active:bg-[#004A2A] transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Analyze EEG
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#5F6862] hover:text-[#111614] hover:bg-[#DCEBDD] transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle mobile navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLink(e, link.href)}
                className="px-4 py-3 text-sm font-medium text-[#111614] hover:bg-[#DCEBDD] rounded-lg transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/analyze"
              id="nav-mobile-analyze-cta"
              className="mt-2 mx-2 inline-flex justify-center items-center px-5 py-3 rounded-full text-sm font-semibold text-white bg-[#087A46] hover:bg-[#005C35] transition-all duration-200"
            >
              Analyze EEG
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
