import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Shield, Heart } from 'lucide-react';
import { AttributionModal } from './AttributionModal';

export const Footer: React.FC = () => {
  const [attributionOpen, setAttributionOpen] = useState(false);

  return (
    <>
      <footer className="bg-arch-900 text-arch-300 border-t border-arch-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Column 1: Brand & Identity */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-arch-800 text-arch-accent flex items-center justify-center font-serif text-base font-bold">
                  <Box className="w-4 h-4" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-arch-50">
                  Vista<span className="text-arch-accent">AR</span>
                </span>
              </div>
              <p className="text-arch-400 text-sm max-w-md leading-relaxed">
                "Explore your future home before you visit it." VistaAR bridges physical reality and architectural conception with interactive 3D spaces and real-scale mobile augmented reality.
              </p>
              <div className="pt-2 text-xs text-arch-500">
                Designed for prospective buyers, investors, and forward-thinking architectural studios.
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-arch-400 mb-4 font-semibold">
                Platform
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/properties" className="text-arch-300 hover:text-arch-50 transition-colors">
                    Property Showcase
                  </Link>
                </li>
                <li>
                  <Link to="/about-ar" className="text-arch-300 hover:text-arch-50 transition-colors">
                    Augmented Reality Guide
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setAttributionOpen(true)}
                    aria-label="View Licensing and 3D Model Credits"
                    className="text-arch-300 hover:text-arch-50 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-arch-accent" />
                    Asset Licensing & Credits
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Open Access Notice */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-arch-400 mb-4 font-semibold">
                Licensing & Heritage
              </h3>
              <p className="text-xs text-arch-400 leading-relaxed mb-3">
                Features architectural 3D works licensed under <strong className="text-arch-200">CC-BY-4.0</strong> by <em className="text-arch-200">Visthétique</em> (Sketchfab) and <strong className="text-arch-200">CC0</strong> by <em className="text-arch-200">Grab3D</em>.
              </p>
              <button
                onClick={() => setAttributionOpen(true)}
                className="text-xs text-arch-accent hover:underline flex items-center gap-1 font-mono"
              >
                View detailed attribution statement →
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-arch-800 flex flex-col sm:flex-row items-center justify-between text-xs text-arch-500 gap-4">
            <p>
              © {new Date().getFullYear()} VistaAR. Sample architectural demonstration platform.
            </p>
            <p className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-arch-accent inline" /> for precision spatial design.
            </p>
          </div>
        </div>
      </footer>

      <AttributionModal
        isOpen={attributionOpen}
        onClose={() => setAttributionOpen(false)}
      />
    </>
  );
};
