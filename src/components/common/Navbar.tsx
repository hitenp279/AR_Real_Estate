import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Eye, Box } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Explore Properties', path: '/properties', icon: Compass },
    { label: 'AR Experience', path: '/about-ar', icon: Eye },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-arch-50/95 backdrop-blur-md border-b border-arch-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-arch-accent rounded-sm"
            >
              <div className="w-10 h-10 rounded bg-arch-900 text-arch-50 flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:bg-arch-accent transition-colors">
                <Box className="w-5 h-5 text-arch-200 group-hover:text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-arch-900 leading-none">
                  Vista<span className="text-arch-accent">AR</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-mono text-arch-500 mt-1">
                  Architectural Spatial Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-colors py-1 border-b-2 ${
                      active
                        ? 'border-arch-accent text-arch-900 font-semibold'
                        : 'border-transparent text-arch-600 hover:text-arch-900 hover:border-arch-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-arch-400" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Primary Action Button */}
              <Link
                to="/properties"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-arch-50 bg-arch-900 hover:bg-arch-800 rounded transition-all shadow-sm hover:shadow"
              >
                View Catalog
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="p-2 text-arch-700 hover:text-arch-900 hover:bg-arch-200 rounded transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-arch-200 bg-arch-100 px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    active
                      ? 'bg-arch-200 text-arch-900 font-semibold'
                      : 'text-arch-700 hover:bg-arch-200 hover:text-arch-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-arch-500" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-arch-200">
              <Link
                to="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-arch-50 bg-arch-900 rounded"
              >
                View All Properties
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
