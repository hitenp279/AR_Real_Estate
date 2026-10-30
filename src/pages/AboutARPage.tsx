import React from 'react';
import { Smartphone, CheckCircle, HelpCircle, QrCode, Shield, Camera } from 'lucide-react';

export const AboutARPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-arch-accent font-semibold">
          <Smartphone className="w-4 h-4" />
          <span>Technical Architecture</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-arch-900">
          Augmented Reality in VistaAR
        </h1>
        <p className="text-arch-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          How VistaAR brings true-scale 3D architectural models into physical reality without requiring proprietary app downloads.
        </p>
      </div>

      {/* Grid of Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Android Scene Viewer */}
        <div className="p-6 bg-arch-100 border border-arch-200 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-arch-900 text-arch-accent flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-arch-900">Android Scene Viewer</h3>
              <span className="text-xs font-mono text-arch-500">Google Play Services for AR (ARCore)</span>
            </div>
          </div>
          <p className="text-sm text-arch-600 leading-relaxed">
            On compatible Android devices, tapping "View in AR" launches Google Scene Viewer. The system uses camera sensors, computer vision, and surface tracking to project the estate onto real-world flat ground at exact 1:1 metric scale.
          </p>
          <ul className="text-xs text-arch-700 space-y-2 pt-2 border-t border-arch-200">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> True 1:1 human proportions or tabletop scale
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> Surface plane detection & ambient lighting estimation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> Requires secure HTTPS origin
            </li>
          </ul>
        </div>

        {/* Desktop QR Code Handoff */}
        <div className="p-6 bg-arch-100 border border-arch-200 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-arch-900 text-arch-accent flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-arch-900">Seamless QR Handoff</h3>
              <span className="text-xs font-mono text-arch-500">Cross-Device Synchronization</span>
            </div>
          </div>
          <p className="text-sm text-arch-600 leading-relaxed">
            Desktop web browsers do not possess spatial tracking hardware. When clicking "View in AR" on a desktop screen, VistaAR generates a mobile QR code that allows instant handoff to your mobile device's camera.
          </p>
          <ul className="text-xs text-arch-700 space-y-2 pt-2 border-t border-arch-200">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> Instant transition from desktop to phone
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> Preserves currently inspected property
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-arch-accent" /> Zero registration required
            </li>
          </ul>
        </div>
      </div>

      {/* Device Compatibility Matrix */}
      <div className="bg-arch-50 border border-arch-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-arch-accent" />
          <h2 className="font-serif text-xl font-bold text-arch-900">
            Device Compatibility & Technical Requirements
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-arch-200 text-xs font-mono text-arch-500 uppercase">
                <th className="pb-3 font-semibold">Environment</th>
                <th className="pb-3 font-semibold">Mechanism</th>
                <th className="pb-3 font-semibold">AR Experience</th>
                <th className="pb-3 font-semibold">Fallback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arch-200 text-xs text-arch-700">
              <tr>
                <td className="py-3 font-medium text-arch-900">Android (Chrome/Samsung)</td>
                <td className="py-3 font-mono">Scene Viewer / WebXR</td>
                <td className="py-3 text-green-700 font-semibold">Full 1:1 Ground Placement</td>
                <td className="py-3 text-arch-500">Interactive 3D Orbit</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-arch-900">iOS (Safari)</td>
                <td className="py-3 font-mono">Quick Look / 3D Canvas</td>
                <td className="py-3 text-arch-800">Interactive 3D WebGL (USDZ deferred)</td>
                <td className="py-3 text-arch-500">Interactive 3D Orbit</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-arch-900">Desktop (Windows/Mac/Linux)</td>
                <td className="py-3 font-mono">Three.js WebGL</td>
                <td className="py-3 text-arch-600">3D Showroom + QR Mobile Handoff</td>
                <td className="py-3 text-arch-500">N/A (Full 3D active)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-arch-100 rounded-lg text-xs text-arch-600 space-y-1">
          <div className="font-semibold text-arch-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-arch-accent" />
            HTTPS & Security Notice
          </div>
          <p>
            Real-world mobile AR strictly requires a secure context (HTTPS) to access camera streams and hardware sensors. In local testing, tools like <code>vite-plugin-basic-ssl</code> or tunneling are used.
          </p>
        </div>
      </div>
    </div>
  );
};
