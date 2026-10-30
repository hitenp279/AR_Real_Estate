import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as THREE from 'three';
import * as threeHelpers from '../utils/threeHelpers';
import { ThreeCanvas } from '../components/viewer/ThreeCanvas';
import { LUMINA_PENTHOUSE_ROOMS } from '../data/apartmentRooms';

describe('ThreeCanvas & 3D Math Helper Suite', () => {
  it('computes accurate bounding box, center, and max dimension for architectural geometry', () => {
    // Construct synthetic 3D geometry matching modern-house dimensions (15m x 8m x 10m)
    const geometry = new THREE.BoxGeometry(15, 8, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 4, 0); // elevated ground plane

    const { box, center, size, maxDim } = threeHelpers.calculateModelBounds(mesh);

    expect(size.x).toBeCloseTo(15, 1);
    expect(size.y).toBeCloseTo(8, 1);
    expect(size.z).toBeCloseTo(10, 1);
    expect(maxDim).toBeCloseTo(15, 1);
    expect(center.y).toBeCloseTo(4, 1);
    expect(box.min.y).toBeCloseTo(0, 1);
    expect(box.max.y).toBeCloseTo(8, 1);
  });

  it('safely disposes Three.js geometries, materials, and textures without throwing', () => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const texture = new THREE.Texture();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    const geoDisposeSpy = vi.spyOn(geometry, 'dispose');
    const matDisposeSpy = vi.spyOn(material, 'dispose');
    const texDisposeSpy = vi.spyOn(texture, 'dispose');

    threeHelpers.disposeThreeObject(mesh);

    expect(geoDisposeSpy).toHaveBeenCalledOnce();
    expect(matDisposeSpy).toHaveBeenCalledOnce();
    expect(texDisposeSpy).toHaveBeenCalledOnce();
  });

  it('evaluates WebGL availability cleanly in browser environments', () => {
    const isSupported = threeHelpers.checkWebGLSupport();
    expect(typeof isSupported).toBe('boolean');
  });

  it('renders WebGL unsupported fallback when graphics hardware context is unavailable in JSDOM', () => {
    render(
      <ThreeCanvas
        modelUrl="/models/modern-house.glb"
        propertyTitle="The Glass Pavilion"
      />
    );

    // In headless JSDOM without WebGL context, fallback is triggered gracefully
    expect(
      screen.getByLabelText(/Interactive 3D Architectural Viewer for The Glass Pavilion/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/WebGL Hardware Acceleration Required/i)
    ).toBeInTheDocument();
  });

  it('isolates keyboard events when text inputs or textareas are focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(
      <ThreeCanvas
        modelUrl="/models/modern-house.glb"
        propertyTitle="The Glass Pavilion"
      />
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { passive: false });

    // Simulate keydown event on input
    const event = new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    input.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('supports active room change and renders canvas container with correct ARIA label', () => {
    const { rerender } = render(
      <ThreeCanvas
        modelUrl="/models/modern_apartment_optimized.glb"
        propertyTitle="The Lumina Penthouse"
        activeInteriorRoom={null}
      />
    );

    expect(
      screen.getByLabelText(/Interactive 3D Architectural Viewer for The Lumina Penthouse/i)
    ).toBeInTheDocument();

    // Rerender with active room
    rerender(
      <ThreeCanvas
        modelUrl="/models/modern_apartment_optimized.glb"
        propertyTitle="The Lumina Penthouse"
        activeInteriorRoom={LUMINA_PENTHOUSE_ROOMS[0]}
      />
    );

    expect(
      screen.getByLabelText(/Interactive 3D Architectural Viewer for The Lumina Penthouse/i)
    ).toBeInTheDocument();
  });
});
