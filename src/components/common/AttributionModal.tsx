import React, { useEffect } from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attribution-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-arch-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-arch-50 border border-arch-300 rounded-lg shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close licensing modal"
          className="absolute top-5 right-5 p-2 text-arch-500 hover:text-arch-900 transition-colors rounded-full hover:bg-arch-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-arch-200 text-arch-accent rounded">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 id="attribution-title" className="text-xl font-serif font-semibold text-arch-900">
              Licensing & 3D Asset Attribution
            </h2>
            <p className="text-sm text-arch-600">
              VistaAR strictly respects open-access 3D creators and Creative Commons licensing.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-arch-700">
          {/* Asset 1: Modern Apartment */}
          <div className="p-4 bg-arch-100 border border-arch-200 rounded-lg">
            <h3 className="font-semibold text-arch-900 text-base mb-1">
              "Modern Apartment" Interior Model
            </h3>
            <p className="mb-2">
              Used in VistaAR for the interior spatial walkthrough, room-by-room inspection, and floor-plan alignment.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <dt className="text-arch-500 font-mono uppercase">Author</dt>
                <dd className="font-medium text-arch-900">Visthétique</dd>
              </div>
              <div>
                <dt className="text-arch-500 font-mono uppercase">License</dt>
                <dd className="font-medium text-arch-900">
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-arch-accent hover:text-arch-accentDark inline-flex items-center gap-1"
                  >
                    CC BY 4.0 <ExternalLink className="w-3 h-3" />
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-arch-500 font-mono uppercase">Original Source</dt>
                <dd className="truncate">
                  <a
                    href="https://sketchfab.com/3d-models/modern-apartment-1fbb649cd6624f2bb7b7d6e30c6533a5"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-arch-accent hover:text-arch-accentDark inline-flex items-center gap-1 truncate"
                  >
                    Sketchfab — Modern Apartment by Visthétique <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </dd>
              </div>
            </dl>
            <div className="text-xs text-arch-600 bg-arch-50 p-2.5 rounded border border-arch-200">
              <strong>Modifications Note:</strong> In compliance with Section 3(a)(1)(B) of CC BY 4.0, the asset's materials and geometries are preserved while downsampling and Draco/WebP optimization are prepared for production mobile WebGL performance.
            </div>
          </div>

          {/* Asset 2: Modern House */}
          <div className="p-4 bg-arch-100 border border-arch-200 rounded-lg">
            <h3 className="font-semibold text-arch-900 text-base mb-1">
              "Modern House" Exterior Model
            </h3>
            <p className="mb-2">
              Used in VistaAR for exterior 3D orbit visualization and real-scale mobile augmented reality placement.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <dt className="text-arch-500 font-mono uppercase">Publisher / Source</dt>
                <dd className="font-medium text-arch-900">Grab3D</dd>
              </div>
              <div>
                <dt className="text-arch-500 font-mono uppercase">License Designation</dt>
                <dd className="font-medium text-arch-900">CC0 (Public Domain Dedication)</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-arch-500 font-mono uppercase">Source URL</dt>
                <dd>
                  <a
                    href="https://grab3d.com/models/buildings/modern-house/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-arch-accent hover:text-arch-accentDark inline-flex items-center gap-1"
                  >
                    Grab3D — Modern House <ExternalLink className="w-3 h-3" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Demonstration Notice */}
          <div className="text-xs text-arch-500 border-t border-arch-200 pt-3">
            <strong>Demonstration Notice:</strong> VistaAR is an engineering and architectural demonstration product. Property listings, pricing, and locations are curated sample data for demonstration purposes only.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-arch-800 text-arch-50 rounded hover:bg-arch-900 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
