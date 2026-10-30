import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Smartphone, Eye, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 lg:space-y-32 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 lg:pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-arch-100 border border-arch-300 text-xs font-mono uppercase tracking-wider text-arch-700">
                <Sparkles className="w-3.5 h-3.5 text-arch-accent" />
                <span>Spatial Architectural Visualization</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-arch-900 leading-[1.12]">
                Explore your future home <br className="hidden sm:inline" />
                <span className="italic font-normal text-arch-accent">before you visit it.</span>
              </h1>

              <p className="text-base sm:text-lg text-arch-600 max-w-xl leading-relaxed">
                VistaAR transforms residential property discovery through realistic 3D architectural modeling, room-level interior exploration, and true-to-scale mobile augmented reality.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded font-medium text-sm transition-all shadow-md hover:shadow-lg group"
                >
                  <span>Explore Properties</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about-ar"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-arch-100 hover:bg-arch-200 border border-arch-300 text-arch-800 rounded font-medium text-sm transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-arch-accent" />
                  <span>How AR Works</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-arch-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-serif text-lg font-bold text-arch-900">1:1 Scale</div>
                  <div className="text-arch-500">True Metric Proportions</div>
                </div>
                <div>
                  <div className="font-serif text-lg font-bold text-arch-900">Room-by-Room</div>
                  <div className="text-arch-500">Furnished Walkthrough</div>
                </div>
                <div>
                  <div className="font-serif text-lg font-bold text-arch-900">Mobile AR</div>
                  <div className="text-arch-500">Physical Placement</div>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Hero Featured Property */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl bg-arch-50 border border-arch-300 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col">
                  {/* Large Featured Property Image Area */}
                  <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden bg-arch-200">
                    <img
                      src="/images/properties/glass-pavilion-hero.jpg"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.triedFallback) {
                          target.dataset.triedFallback = 'true';
                          target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
                        }
                      }}
                      alt="The Glass Pavilion — Modern Architectural Residence"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-arch-950/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 bg-arch-900/90 backdrop-blur-md text-arch-50 text-[11px] font-mono tracking-wider uppercase rounded-full font-medium shadow-sm">
                        Featured Residence
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-[10px] font-mono uppercase tracking-wider rounded-full font-semibold shadow-sm">
                        1:1 Scale AR Ready
                      </span>
                    </div>

                    {/* Bottom Image Callout */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none text-[11px] font-mono">
                      <span className="text-arch-200 tracking-wide">
                        Cantilevered Architectural Pavilion
                      </span>
                      <span className="text-arch-300">
                        Pacific Palisades, CA
                      </span>
                    </div>
                  </div>

                  {/* Information Section */}
                  <div className="p-6 sm:p-7 space-y-4 bg-arch-50">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-xs font-mono text-arch-500 uppercase tracking-wider">
                        Guide Price
                      </span>
                      <span className="font-mono text-2xl font-bold text-arch-900 tracking-tight">
                        {formatCurrency(18500000, 'INR')}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-2xl font-bold text-arch-900 tracking-tight">
                        The Glass Pavilion
                      </h3>
                      <p className="text-xs sm:text-sm text-arch-600 leading-relaxed line-clamp-2">
                        Contemporary cantilevered villa featuring panoramic glazing, integrated timber deck, and 14.9-meter architectural facade.
                      </p>
                    </div>

                    {/* Architectural Specifications Strip */}
                    <div className="pt-3 pb-1 border-t border-arch-200 grid grid-cols-3 gap-2 text-xs text-arch-700">
                      <div>
                        <div className="text-[10px] font-mono text-arch-400 uppercase">Bedrooms</div>
                        <div className="font-semibold text-arch-900">4 Beds</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-arch-400 uppercase">Bathrooms</div>
                        <div className="font-semibold text-arch-900">3.5 Baths</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-arch-400 uppercase">Built-Up Area</div>
                        <div className="font-mono font-semibold text-arch-900">342 m² (3,681 ft²)</div>
                      </div>
                    </div>

                    {/* Prominent Dark Inspection Button */}
                    <div className="pt-2">
                      <Link
                        to="/properties/glass-pavilion"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg group"
                      >
                        <Eye className="w-4 h-4 text-arch-accent" />
                        <span>Inspect in 3D & AR</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Triad Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-arch-accent font-semibold">
            Spatial Technology
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-arch-900">
            A New Standard for Property Inspection
          </h2>
          <p className="text-arch-600 text-sm sm:text-base">
            Conventional 2D photography cannot communicate spatial volume or lighting. VistaAR combines three interactive visualization dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 bg-arch-100 border border-arch-200 rounded-xl space-y-4 hover:border-arch-300 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-arch-900 text-arch-accent flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-arch-900">
              Interactive 3D Showroom
            </h3>
            <p className="text-sm text-arch-600 leading-relaxed">
              Orbit around high-precision architectural models, adjust camera framing, inspect structural elevations, and view exterior facades from any angle.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 bg-arch-100 border border-arch-200 rounded-xl space-y-4 hover:border-arch-300 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-arch-900 text-arch-accent flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-arch-900">
              Interior Spatial Walkthrough
            </h3>
            <p className="text-sm text-arch-600 leading-relaxed">
              Step inside fully-furnished apartments. Switch smoothly between the living salon, culinary kitchen, bedroom, home office, and spa bath without wall clipping.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 bg-arch-100 border border-arch-200 rounded-xl space-y-4 hover:border-arch-300 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-arch-900 text-arch-accent flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-arch-900">
              Real-Scale Mobile AR
            </h3>
            <p className="text-sm text-arch-600 leading-relaxed">
              Place houses and estates directly onto physical ground using a compatible smartphone. Walk around the perimeter at true 1:1 scale before building starts.
            </p>
          </div>
        </div>
      </section>

      {/* AR Workflow Guide Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-arch-900 text-arch-100 rounded-2xl p-8 sm:p-12 lg:p-16 border border-arch-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-arch-accent font-semibold">
              Augmented Reality Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-arch-50">
              Experience properties in your physical environment
            </h2>
            <p className="text-arch-300 text-sm sm:text-base leading-relaxed">
              Compatible Android smartphones (via Google Scene Viewer and ARCore) project the architectural estate onto your lawn, patio, or tabletop. On desktop computers, an automatic QR-code handoff makes launching on mobile seamless.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-arch-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-arch-accent" /> Android Scene Viewer
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-arch-accent" /> 1:1 Metric Scale
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-arch-accent" /> Zero App Installation
              </span>
            </div>
            <div className="pt-4">
              <Link
                to="/about-ar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-arch-accent hover:bg-arch-accentDark text-white rounded text-sm font-semibold transition-colors"
              >
                <span>Read Full AR Technical Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
