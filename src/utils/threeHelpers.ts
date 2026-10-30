import * as THREE from 'three';

/**
 * Checks whether WebGL / WebGL2 rendering is supported in the current browser environment.
 */
export const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * Computes bounding box, center vector, and maximum dimension for auto-framing.
 */
export const calculateModelBounds = (object: THREE.Object3D) => {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  
  box.getCenter(center);
  box.getSize(size);
  
  const maxDim = Math.max(size.x, size.y, size.z);
  return { box, center, size, maxDim };
};

/**
 * Recursively disposes geometries, materials, and textures to prevent WebGL memory leaks.
 */
export const disposeThreeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => disposeMaterial(mat));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
};

const disposeMaterial = (material: THREE.Material) => {
  material.dispose();
  // Dispose all associated textures
  const mat = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(mat)) {
    const value = mat[key];
    if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
      (value as THREE.Texture).dispose();
    }
  }
};
