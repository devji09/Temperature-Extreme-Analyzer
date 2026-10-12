import React, { useState, useEffect } from 'react';
import { ThermometerSun, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'analyze', label: 'Analyze Temperatures' },
    { id: 'algorithm', label: 'Algorithm' },
    { id: 'about', label: 'About Project' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#F8F5EC]/95 backdrop-blur-md border-b border-[#E8E2D6]'
          : 'bg-[#F8F5EC] border-b border-[#E8E2D6]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (single line) */}
        <a
          href="#top"
          className="flex items-center gap-2.5 text-[#252820] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E58A45] rounded-sm whitespace-nowrap shrink-0"
          aria-label="ThermoScope — Temperature Extremes Analyzer"
        >
          <ThermometerSun className="w-5 h-5 text-[#E58A45] shrink-0" strokeWidth={1.8} />
          <span className="font-serif text-xl font-semibold tracking-tight">ThermoScope</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Primary Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E58A45] rounded-sm ${
                  isActive
                    ? 'text-[#252820] font-semibold'
                    : 'text-[#77776B] hover:text-[#252820]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#E58A45] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#analyze"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('analyze');
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-[#FFFDF7] bg-[#252820] hover:bg-[#3A3E33] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E58A45]"
          >
            Start Analyzing
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8E2D6] bg-[#FFFDF7] text-[#252820] hover:border-[#252820]/30 transition-colors focus-visible:outline-2 focus-visible:outline-[#E58A45]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF7] border-b border-[#E8E2D6] px-4 pt-2 pb-4 space-y-1">
          <p className="px-3 py-1 text-xs text-[#77776B]">
            Temperature Extremes Analyzer
          </p>
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F8F5EC] text-[#252820] font-semibold'
                    : 'text-[#77776B] hover:bg-[#F8F5EC] hover:text-[#252820]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
};
