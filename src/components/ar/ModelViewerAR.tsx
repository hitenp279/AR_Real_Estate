import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@google/model-viewer';
import { generateQRCodeSVG } from '../../utils/qrCode';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  X,
} from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface ModelViewerARProps {
  modelUrl: string;
  propertyTitle: string;
  className?: string;
  onLoaded?: () => void;
  onError?: (err: Error) => void;
}

export const ModelViewerAR: React.FC<ModelViewerARProps> = ({
  modelUrl,
  propertyTitle,
  className = '',
  onLoaded,
  onError,
}) => {
  const modelViewerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [devicePlatform, setDevicePlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

  // Detect runtime device capabilities & configure meshopt decoder for model-viewer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ModelViewerClass = customElements.get('model-viewer') as any;
      if (ModelViewerClass && !ModelViewerClass.meshoptDecoderLocation) {
        ModelViewerClass.meshoptDecoderLocation = '/libs/meshopt_decoder.js';
      }
    }

    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) {
      setDevicePlatform('android');
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setDevicePlatform('ios');
    } else {
      setDevicePlatform('desktop');
    }
  }, []);

  // Register model-viewer event listeners
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadError(null);
      if (onLoaded) onLoaded();
    };

    const handleError = (e: any) => {
      console.error('model-viewer error:', e);
      const msg = 'Failed to load AR model asset in WebGL runtime.';
      setLoadError(msg);
      if (onError) onError(new Error(msg));
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [onLoaded, onError]);

  // URL for mobile QR code handoff (prefers configured public HTTPS URL if set)
  const publicBaseUrl = (import.meta as any).env?.VITE_PUBLIC_URL;
  const currentUrl =
    typeof window !== 'undefined'
      ? publicBaseUrl
        ? `${publicBaseUrl.replace(/\/$/, '')}${window.location.pathname}`
        : window.location.href
      : '';
  const qrUrl = generateQRCodeSVG(currentUrl, 200);

  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [currentUrl]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col ${className}`}
      style={{ minHeight: '480px' }}
      data-testid="model-viewer-ar-container"
    >
      {/* Top Architectural Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/90 border-b border-slate-800 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
            Augmented Reality & Spatial Placement
          </h3>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            model-viewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {devicePlatform === 'desktop' ? (
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-semibold text-xs rounded-lg shadow-md transition-all active:scale-95"
              aria-label="Open Mobile AR QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Experience on Phone in AR</span>
            </button>
          ) : devicePlatform === 'android' ? (
            <button
              onClick={() => {
                if (modelViewerRef.current) {
                  modelViewerRef.current.activateAR();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold text-xs rounded-lg shadow-md transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch AR Scene Viewer</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-amber-400 px-2 py-1 bg-amber-950/60 border border-amber-800 rounded">
              iOS 3D View (USDZ required for Quick Look)
            </span>
          )}
        </div>
      </div>

      {/* Main model-viewer Element */}
      <div className="relative flex-1 w-full h-[480px] sm:h-[540px] bg-slate-950">
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          alt={`3D and AR model of ${propertyTitle}`}
          ar
          ar-modes="webxr scene-viewer"
          ar-scale="auto"
          camera-controls
          touch-action="pan-y"
          interaction-prompt="auto"
          shadow-intensity="1.2"
          shadow-softness="0.8"
          exposure="1.0"
          style={{ width: '100%', height: '100%', outline: 'none' }}
        >
          {/* Custom AR Button Slot */}
          <button
            slot="ar-button"
            className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-semibold text-xs rounded-xl shadow-2xl backdrop-blur-md active:scale-95 transition-transform"
          >
            <Smartphone className="w-4 h-4" />
            <span>View in your space (1:1 Scale)</span>
          </button>
        </model-viewer>

        {/* Loading Indicator */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 z-10">
            <div className="w-10 h-10 rounded-full border-3 border-slate-700 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-slate-300">
              Initializing WebXR & Scene Viewer runtime...
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h4 className="font-serif text-base font-bold text-white">
              AR Viewer Initialization Alert
            </h4>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {loadError} Interactive 3D WebGL mode remains available.
            </p>
          </div>
        )}

        {/* Platform Status Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-800 shadow-md backdrop-blur">
            <span
              className={`w-2 h-2 rounded-full ${
                devicePlatform === 'android'
                  ? 'bg-emerald-400 animate-pulse'
                  : devicePlatform === 'ios'
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
              }`}
            />
            {devicePlatform === 'android' ? (
              <span>Android ARCore Scene Viewer Ready</span>
            ) : devicePlatform === 'ios' ? (
              <span>iOS 3D Interactive View Active</span>
            ) : (
              <span>Desktop 3D View · QR Handoff Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Honest Architectural AR Placement Disclosure */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <strong>AR Verification Standard:</strong> Launching AR opens the native Scene Viewer viewer; physical surface tracking requires physical floor illumination and ARCore compatibility.
          </span>
        </span>
        <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
          ar-scale="auto" · True 1:1 Scale
        </span>
      </div>

      {/* Desktop QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          data-testid="ar-qr-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close QR Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-800">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-white">
                Place Residence in Your Space
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan with an Android or compatible smartphone camera to launch the real-time AR surface placement session.
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-3 bg-white rounded-xl inline-block shadow-lg mx-auto">
              <img
                src={qrUrl}
                alt="QR Code to open property in mobile AR"
                className="w-44 h-44 object-contain"
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div className="text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 font-mono">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-[10px] flex-shrink-0">
                  1
                </span>
                <span>Open smartphone camera & scan the QR code.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-[10px] flex-shrink-0">
                  2
                </span>
                <span>Ensure phone is on same Wi-Fi / HTTPS connection.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-[10px] flex-shrink-0">
                  3
                </span>
                <span>Tap "View in your space" and aim at the floor.</span>
              </div>
            </div>

            {/* Copy Link Action */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Page URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
