import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  checkWebGLSupport,
  calculateModelBounds,
  disposeThreeObject,
} from '../../utils/threeHelpers';
import {
  DimensionUnit,
  formatArea,
  formatDimensions,
  formatLength,
} from '../../utils/dimensionUnits';
import { RoomZone } from '../../types/floorPlan';
import { InteriorRoomView } from '../../types/interiorNavigation';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Info,
  Layers,
  Keyboard,
  X,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface ThreeCanvasProps {
  modelUrl: string;
  propertyTitle: string;
  className?: string;
  selectedZone?: RoomZone | null;
  activeInteriorRoom?: InteriorRoomView | null;
  activeUnit?: DimensionUnit;
  onClearZone?: () => void;
  onLoaded?: () => void;
  onError?: (err: Error) => void;
}

interface WalkableBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Calibrated walkable boundaries for interior rooms (in model space)
const ROOM_WALKABLE_BOUNDS: Record<string, WalkableBounds> = {
  living: { minX: -5.0, maxX: 0.2, minZ: 0.2, maxZ: 3.2 },
  kitchen: { minX: -4.8, maxX: 0.5, minZ: -1.6, maxZ: 1.2 },
  office: { minX: 1.8, maxX: 5.8, minZ: -1.2, maxZ: 1.6 },
  bath: { minX: 6.5, maxX: 8.4, minZ: -0.9, maxZ: 1.8 },
  bedroom: { minX: 9.0, maxX: 13.0, minZ: -1.0, maxZ: 2.5 },
};

const APARTMENT_OVERVIEW_BOUNDS: WalkableBounds = {
  minX: -5.2,
  maxX: 13.2,
  minZ: -1.8,
  maxZ: 3.4,
};

const PAVILION_BOUNDS: WalkableBounds = {
  minX: -12.0,
  maxX: 12.0,
  minZ: -12.0,
  maxZ: 12.0,
};

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  modelUrl,
  propertyTitle,
  className = '',
  selectedZone = null,
  activeInteriorRoom = null,
  activeUnit = 'metric',
  onClearZone,
  onLoaded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelSpecs, setModelSpecs] = useState<{
    width: number;
    height: number;
    depth: number;
  } | null>(null);

  // Controls Guide & Speed States
  const [isControlsGuideOpen, setIsControlsGuideOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [movementSpeed, setMovementSpeed] = useState<number>(1.8); // m/s default

  // Three.js internal references for lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const highlightBoxRef = useRef<THREE.Box3Helper | null>(null);

  // Local clipping plane for apartment ceiling cutaway (Y = 2.70m)
  // Clips only the ceiling slab (> 2.70m) while preserving all furniture and bedding (<= 2.40m)
  const ceilingClipPlaneRef = useRef<THREE.Plane>(
    new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.70)
  );

  // Transition & Interpolation references
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetControlsRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Keyboard navigation references
  const keysDownRef = useRef<Record<string, boolean>>({});
  const movementSpeedRef = useRef<number>(1.8);
  movementSpeedRef.current = movementSpeed;

  const initialCameraState = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Cancel any active lerp transition so user manual interaction has immediate 100% control
  const cancelTransition = useCallback(() => {
    if (isTransitioningRef.current) {
      isTransitioningRef.current = false;
      targetCamPosRef.current = null;
      targetControlsRef.current = null;
    }
  }, []);

  // Controlled architectural cutaway for Lumina Penthouse
  // Hides the front exterior wall and clips only the flat ceiling slab (>2.70m) in overview,
  // while preserving all furniture (Eames chair seats, planters, desks) and bedding.
  // Restores full room enclosure and overhead ceiling during interior room walkthroughs.
  const updateApartmentCutaway = useCallback((model: THREE.Object3D, isOverview: boolean) => {
    model.traverse(child => {
      const mesh = child as THREE.Mesh;

      // 1. Front corridor exterior wall (Plane002_SprayedWallTexture_0)
      if (child.name === 'Plane002_SprayedWallTexture_0') {
        child.visible = !isOverview;
      }

      // 2. Ceiling clipping in optimized model (Apple_Adaptor_White1_0)
      if (child.name === 'Apple_Adaptor_White1_0') {
        child.visible = true;
        if (mesh.isMesh && mesh.material) {
          const planes = isOverview ? [ceilingClipPlaneRef.current] : null;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
              m.clippingPlanes = planes;
              m.clipShadows = true;
              m.needsUpdate = true;
            });
          } else {
            mesh.material.clippingPlanes = planes;
            mesh.material.clipShadows = true;
            mesh.material.needsUpdate = true;
          }
        }
      }

      // 3. Ceiling in unoptimized model (Plane002_White1_0)
      if (child.name === 'Plane002_White1_0') {
        child.visible = !isOverview;
      }
    });
  }, []);

  // Camera Reset Handler (R key or Reset Button)
  const handleResetCamera = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    if (activeInteriorRoom) {
      // Reset to selected room viewpoint
      targetCamPosRef.current = new THREE.Vector3(...activeInteriorRoom.eyePosition);
      targetControlsRef.current = new THREE.Vector3(...activeInteriorRoom.targetPosition);
      isTransitioningRef.current = true;
      return;
    }

    if (selectedZone) {
      const zoneCenter = new THREE.Vector3(...selectedZone.centroid3D);
      targetControlsRef.current = zoneCenter;
      targetCamPosRef.current = new THREE.Vector3(
        zoneCenter.x + (zoneCenter.x >= 0 ? 6.5 : -6.5),
        zoneCenter.y + 4.5,
        zoneCenter.z + 7.5
      );
      isTransitioningRef.current = true;
      return;
    }

    if (initialCameraState.current) {
      if (highlightBoxRef.current && sceneRef.current) {
        sceneRef.current.remove(highlightBoxRef.current);
        highlightBoxRef.current.dispose();
        highlightBoxRef.current = null;
      }
      if (modelRef.current && modelUrl.includes('modern_apartment')) {
        updateApartmentCutaway(modelRef.current, true);
      }
      targetCamPosRef.current = initialCameraState.current.position.clone();
      targetControlsRef.current = initialCameraState.current.target.clone();
      isTransitioningRef.current = true;

      if (onClearZone) onClearZone();
    }
  }, [activeInteriorRoom, selectedZone, onClearZone, modelUrl, updateApartmentCutaway]);

  // Fullscreen Toggle Handler
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Update 3D Zone Highlight & Camera Focus when selectedZone changes
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!scene || !camera || !controls) return;

    // Clean up previous highlight box
    if (highlightBoxRef.current) {
      scene.remove(highlightBoxRef.current);
      highlightBoxRef.current.dispose();
      highlightBoxRef.current = null;
    }

    if (selectedZone) {
      // 1. Create 3D bounding box helper
      const box = new THREE.Box3(
        new THREE.Vector3(...selectedZone.bounds3D.min),
        new THREE.Vector3(...selectedZone.bounds3D.max)
      );
      const helper = new THREE.Box3Helper(box, new THREE.Color(0x06b6d4)); // cyan-500
      scene.add(helper);
      highlightBoxRef.current = helper;

      // 2. Compute smooth target interpolation
      const zoneCenter = new THREE.Vector3(...selectedZone.centroid3D);
      targetControlsRef.current = zoneCenter;

      // Position camera at a sensible offset facing this zone
      const offset = new THREE.Vector3(
        zoneCenter.x + (zoneCenter.x >= 0 ? 6.5 : -6.5),
        zoneCenter.y + 4.5,
        zoneCenter.z + 7.5
      );
      targetCamPosRef.current = offset;
      isTransitioningRef.current = true;
    }
  }, [selectedZone]);

  // Update 3D Camera Focus when activeInteriorRoom changes
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const model = modelRef.current;
    if (!camera || !controls) return;

    const isApartment = modelUrl.includes('modern_apartment');

    if (activeInteriorRoom) {
      // In interior room mode: restore full wall enclosure and overhead ceiling
      if (model && isApartment) {
        updateApartmentCutaway(model, false);
      }
      targetCamPosRef.current = new THREE.Vector3(...activeInteriorRoom.eyePosition);
      targetControlsRef.current = new THREE.Vector3(...activeInteriorRoom.targetPosition);
      isTransitioningRef.current = true;

      camera.fov = activeInteriorRoom.fov;
      camera.updateProjectionMatrix();
      controls.minDistance = 0.2;
      controls.maxDistance = 25.0;
      controls.maxPolarAngle = Math.PI - 0.05;

      // Focus canvas so keyboard navigation is immediately active without extra clicks
      canvasRef.current?.focus({ preventScroll: true });
    } else if (initialCameraState.current && !selectedZone) {
      // In overview: apply dollhouse cutaway (hide outer wall, clip ceiling slab)
      if (model && isApartment) {
        updateApartmentCutaway(model, true);
      }
      targetCamPosRef.current = initialCameraState.current.position.clone();
      targetControlsRef.current = initialCameraState.current.target.clone();
      isTransitioningRef.current = true;

      camera.fov = isApartment ? 40 : 45;
      camera.updateProjectionMatrix();
      controls.maxPolarAngle = Math.PI / 2 - 0.02;
    }
  }, [activeInteriorRoom, selectedZone, modelUrl, updateApartmentCutaway]);

  // Keyboard Navigation Event Listeners
  useEffect(() => {
    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in form inputs, textareas, etc.
      if (isInteractiveElement(e.target) || isInteractiveElement(document.activeElement)) {
        return;
      }

      // Avoid intercepting browser shortcuts (Ctrl/Alt/Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Reset viewpoint on R
      if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetCamera();
        return;
      }

      const navCodes = [
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'KeyQ',
        'KeyE',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ];

      if (navCodes.includes(e.code)) {
        // Prevent default page scroll on arrow keys when viewer is active
        if (e.code.startsWith('Arrow')) {
          e.preventDefault();
        }
        // Manual key input cancels any active lerp transition
        cancelTransition();
        keysDownRef.current[e.code] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysDownRef.current[e.code]) {
        delete keysDownRef.current[e.code];
      }
    };

    const handleBlur = () => {
      keysDownRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleResetCamera, cancelTransition]);

  // Initialize Three.js WebGL Scene
  const initViewer = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Check WebGL support
    if (!checkWebGLSupport()) {
      setIsWebGlSupported(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 2. Setup Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f5f2);
    sceneRef.current = scene;

    // 3. Setup Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 4. Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    // 5. Setup OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above ground plinth
    controls.minDistance = 1.5;
    controls.maxDistance = 60.0;
    controlsRef.current = controls;

    // Manual mouse/touch interaction immediately takes precedence over camera transition lerp
    controls.addEventListener('start', () => {
      cancelTransition();
    });

    // 6. Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf2, 1.85);
    sunLight.position.set(24, 32, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -18;
    sunLight.shadow.camera.right = 18;
    sunLight.shadow.camera.top = 18;
    sunLight.shadow.camera.bottom = -18;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xd9eafd, 0.65);
    fillLight.position.set(-20, 15, -18);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.45);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // 7. Load GLB Model
    const isApartment = modelUrl.includes('modern_apartment');
    const loader = new GLTFLoader();

    try {
      loader.setMeshoptDecoder(MeshoptDecoder);
    } catch {
      // Meshopt decoder fallback
    }

    loader.load(
      modelUrl,
      gltf => {
        const model = gltf.scene;
        modelRef.current = model;

        model.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.roughness !== undefined) {
              mat.roughness = Math.max(mat.roughness, 0.25);
            }
          }
        });

        scene.add(model);

        // 8. Auto-framing based on actual transformed bounds
        const { center, size, maxDim } = calculateModelBounds(model);
        setModelSpecs({
          width: Number(size.x.toFixed(1)),
          height: Number(size.y.toFixed(1)),
          depth: Number(size.z.toFixed(1)),
        });

        if (isApartment) {
          updateApartmentCutaway(model, true);
        }

        const fovRad = camera.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.45;

        let initialPos: THREE.Vector3;
        let initialTarget = center.clone();

        if (isApartment) {
          // Elevated architectural dollhouse cutaway perspective revealing all 5 furnished rooms
          initialPos = new THREE.Vector3(
            center.x - 2.5,
            center.y + 14.5,
            center.z + 10.5
          );
          initialTarget = new THREE.Vector3(center.x, 1.0, center.z);
          camera.fov = 40;
          camera.updateProjectionMatrix();
        } else {
          // Front-quarter architectural elevation for the exterior pavilion
          initialPos = new THREE.Vector3(
            center.x + cameraDistance * 0.72,
            center.y + cameraDistance * 0.32,
            center.z + cameraDistance * 0.82
          );
        }

        camera.position.copy(initialPos);
        controls.target.copy(initialTarget);

        controls.minDistance = isApartment ? 1.5 : maxDim * 0.35;
        controls.maxDistance = maxDim * 3.8;
        controls.update();

        // Save for Camera Reset
        initialCameraState.current = {
          position: initialPos.clone(),
          target: initialTarget.clone(),
        };

        if (typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__VISTA_VIEWER__ = {
            camera,
            controls,
            scene,
            model,
            initialCameraState: initialCameraState.current,
          };
        }

        setIsLoading(false);
        setLoadingProgress(100);
        if (onLoaded) onLoaded();
      },
      xhr => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        } else {
          setLoadingProgress(prev => Math.min(prev + 10, 90));
        }
      },
      err => {
        console.error('Error loading 3D GLB model:', err);
        const errorMsg =
          'Failed to load architectural 3D model asset. Verify network connection and asset file.';
        setError(errorMsg);
        setIsLoading(false);
        if (onError) onError(new Error(errorMsg));
      }
    );

    // 9. Animation Render Loop with Smooth Target Lerping & Walkable Keyboard Navigation
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1); // clamp delta to avoid tunneling

      // A. Smooth camera interpolation during viewpoint transitions
      if (isTransitioningRef.current) {
        if (targetControlsRef.current && controlsRef.current) {
          controlsRef.current.target.lerp(targetControlsRef.current, 0.08);
        }
        if (targetCamPosRef.current && cameraRef.current) {
          cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
        }

        // Check if camera has reached the destination threshold
        if (
          targetCamPosRef.current &&
          targetControlsRef.current &&
          cameraRef.current &&
          controlsRef.current
        ) {
          const posDist = cameraRef.current.position.distanceTo(targetCamPosRef.current);
          const targetDist = controlsRef.current.target.distanceTo(targetControlsRef.current);
          if (posDist < 0.02 && targetDist < 0.02) {
            cameraRef.current.position.copy(targetCamPosRef.current);
            controlsRef.current.target.copy(targetControlsRef.current);
            targetCamPosRef.current = null;
            targetControlsRef.current = null;
            isTransitioningRef.current = false;
          }
        }
      }

      // B. Keyboard WASD & Arrow Keys Navigation with Collision Bounds
      const keys = keysDownRef.current;
      const hasMovementKeys =
        keys['KeyW'] ||
        keys['KeyS'] ||
        keys['KeyA'] ||
        keys['KeyD'] ||
        keys['ArrowUp'] ||
        keys['ArrowDown'] ||
        keys['ArrowLeft'] ||
        keys['ArrowRight'];

      const hasYawKeys = keys['KeyQ'] || keys['KeyE'];

      if (
        !isTransitioningRef.current &&
        cameraRef.current &&
        controlsRef.current &&
        (hasMovementKeys || hasYawKeys)
      ) {
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        const currentSpeed = movementSpeedRef.current;

        // Determine active walkable bounding box
        let bounds: WalkableBounds;
        if (activeInteriorRoom && ROOM_WALKABLE_BOUNDS[activeInteriorRoom.id]) {
          bounds = ROOM_WALKABLE_BOUNDS[activeInteriorRoom.id];
        } else if (isApartment) {
          bounds = APARTMENT_OVERVIEW_BOUNDS;
        } else {
          bounds = PAVILION_BOUNDS;
        }

        // Horizontal movement calculation
        if (hasMovementKeys) {
          const forward = new THREE.Vector3();
          cam.getWorldDirection(forward);
          forward.y = 0;
          if (forward.lengthSq() > 0.0001) {
            forward.normalize();
          } else {
            forward.set(0, 0, -1);
          }

          const right = new THREE.Vector3().crossVectors(forward, cam.up).normalize();

          const moveDir = new THREE.Vector3(0, 0, 0);
          if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(forward);
          if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(forward);
          if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(right);
          if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(right);

          if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            const stepDist = currentSpeed * delta;
            const deltaMove = moveDir.multiplyScalar(stepDist);

            const candidateX = cam.position.x + deltaMove.x;
            const candidateZ = cam.position.z + deltaMove.z;

            // Constrain camera position to verified walkable room geometry
            const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, candidateX));
            const clampedZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, candidateZ));

            const actualDeltaX = clampedX - cam.position.x;
            const actualDeltaZ = clampedZ - cam.position.z;

            cam.position.x += actualDeltaX;
            cam.position.z += actualDeltaZ;
            ctrl.target.x += actualDeltaX;
            ctrl.target.z += actualDeltaZ;

            // Preserve constant eye-level height in interior room walkthroughs
            if (activeInteriorRoom) {
              cam.position.y = activeInteriorRoom.eyePosition[1];
            }
          }
        }

        // Yaw Rotation (Q: turn left, E: turn right)
        if (hasYawKeys) {
          let yawRate = 0;
          if (keys['KeyQ']) yawRate += 1.4; // rad/s
          if (keys['KeyE']) yawRate -= 1.4;

          if (yawRate !== 0) {
            const yawAngle = yawRate * delta;
            const viewVec = ctrl.target.clone().sub(cam.position);
            viewVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle);
            ctrl.target.copy(cam.position).add(viewVec);
          }
        }
      }

      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 10. ResizeObserver for responsive canvas scaling
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 11. Cleanup function on unmount
    return () => {
      resizeObserver.disconnect();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (highlightBoxRef.current) {
        highlightBoxRef.current.dispose();
        highlightBoxRef.current = null;
      }
      if (modelRef.current) disposeThreeObject(modelRef.current);
      if (sceneRef.current) disposeThreeObject(sceneRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [modelUrl, activeInteriorRoom, cancelTransition, onLoaded, onError]);

  useEffect(() => {
    const cleanup = initViewer();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initViewer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-arch-100 border border-arch-300 shadow-lg select-none ${className}`}
      style={{ minHeight: '480px' }}
      aria-label={`Interactive 3D Architectural Viewer for ${propertyTitle}`}
      data-testid="three-canvas-container"
    >
      {/* Three.js WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={cancelTransition}
        onWheel={cancelTransition}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
        tabIndex={0}
        aria-label="3D Viewport canvas. Press WASD or arrows to navigate, Q/E to turn, R to reset viewpoint."
      />

      {/* Loading Progress State */}
      {isLoading && (
        <div className="absolute inset-0 bg-arch-100/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 z-20">
          <div className="w-12 h-12 rounded-full border-3 border-arch-300 border-t-arch-accent animate-spin" />
          <div className="text-center space-y-2">
            <h4 className="font-serif text-lg font-bold text-arch-900">
              Loading 3D Architectural Model
            </h4>
            <p className="text-xs text-arch-600 font-mono">
              Calibrating geometry & PBR materials... {loadingProgress}%
            </p>
          </div>
          {/* Progress Bar */}
          <div className="w-48 h-1.5 bg-arch-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-arch-accent transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Fallback State */}
      {error && (
        <div className="absolute inset-0 bg-arch-100/98 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="font-serif text-lg font-bold text-arch-900">
              Model Rendering Interrupted
            </h4>
            <p className="text-xs text-arch-600 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={initViewer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-arch-900 text-arch-50 rounded text-xs font-semibold uppercase tracking-wider hover:bg-arch-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* WebGL Unsupported Fallback */}
      {!isWebGlSupported && (
        <div className="absolute inset-0 bg-arch-100 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
          <AlertTriangle className="w-8 h-8 text-arch-accent" />
          <h4 className="font-serif text-lg font-bold text-arch-900">
            WebGL Hardware Acceleration Required
          </h4>
          <p className="text-xs text-arch-600 max-w-sm leading-relaxed">
            Your browser or device does not currently support WebGL graphics rendering. Please ensure hardware acceleration is enabled in your browser settings.
          </p>
        </div>
      )}

      {/* Synchronized Zone 3D HUD Callout (Top Center) */}
      {!isLoading && !error && selectedZone && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[90%] sm:max-w-md bg-slate-900/95 text-white border border-cyan-500/50 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all"
          data-testid="3d-zone-hud"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold tracking-wider block">
                  3D Synchronized Focus
                </span>
                <span className="text-sm font-semibold text-white truncate block">
                  {selectedZone.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-cyan-300 block">
                  {formatDimensions(
                    selectedZone.dimensions.width,
                    selectedZone.dimensions.depth,
                    activeUnit
                  )}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  {formatArea(selectedZone.area, activeUnit)}
                </span>
              </div>

              {onClearZone && (
                <button
                  onClick={onClearZone}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition-colors"
                  aria-label="Reset 3D focus"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls Overlay Header (Top-Right) */}
      {!isLoading && !error && isWebGlSupported && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={handleResetCamera}
            aria-label="Reset camera view"
            title="Reset 3D camera to default architectural angle (Hotkey: R)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-arch-50/90 hover:bg-arch-50 text-arch-800 text-xs font-mono font-medium rounded-lg border border-arch-300 shadow-sm backdrop-blur transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-arch-accent" />
            <span className="hidden sm:inline">Reset View (R)</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'View in Fullscreen'}
            className="p-2 bg-arch-50/90 hover:bg-arch-50 text-arch-800 rounded-lg border border-arch-300 shadow-sm backdrop-blur transition-all active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Dimension Badge (Top-Left) */}
      {!isLoading && !error && modelSpecs && !selectedZone && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-arch-900/85 text-arch-50 text-[10px] sm:text-[11px] font-mono rounded-lg backdrop-blur shadow-sm">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-arch-accent flex-shrink-0" />
            <span className="hidden sm:inline">
              Frontage: {formatLength(modelSpecs.width, activeUnit)} × Depth:{' '}
              {formatLength(modelSpecs.depth, activeUnit)} · Height:{' '}
              {formatLength(modelSpecs.height, activeUnit)}
            </span>
            <span className="sm:hidden">
              {formatLength(modelSpecs.width, activeUnit)} ×{' '}
              {formatLength(modelSpecs.depth, activeUnit)}
            </span>
          </div>
        </div>
      )}

      {/* Floating Controls Guide Drawer / HUD Overlay */}
      {!isLoading && !error && isWebGlSupported && (
        <>
          {isControlsGuideOpen ? (
            <div
              className="absolute bottom-14 left-4 sm:bottom-14 sm:left-4 z-20 max-w-[92vw] sm:max-w-xs bg-slate-900/95 text-slate-200 border border-slate-700/80 rounded-xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-md transition-all text-xs"
              data-testid="controls-guide-hud"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <span>3D Navigation & Controls</span>
                </div>
                <button
                  onClick={() => setIsControlsGuideOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  aria-label="Close controls guide"
                  title="Minimize controls guide"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Key bindings list */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Walk / Strafe</span>
                  <span className="text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    W A S D / Arrows
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Turn View</span>
                  <span className="text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    Q / E
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reset View</span>
                  <span className="text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    R
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Orbit / Look</span>
                  <span className="text-cyan-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    Mouse Drag
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pan / Zoom</span>
                  <span className="text-cyan-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    Right Drag / Scroll
                  </span>
                </div>
              </div>

              {/* Movement Speed Controls */}
              <div className="pt-2 mt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    Speed
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {movementSpeed.toFixed(1)} m/s
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Slow', val: 1.0 },
                    { label: 'Normal', val: 1.8 },
                    { label: 'Fast', val: 3.0 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setMovementSpeed(preset.val)}
                      className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                        Math.abs(movementSpeed - preset.val) < 0.1
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Walkable Geometry Safety Notice */}
              <div className="pt-2 mt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Walkable bounds enforced (anti-clipping)</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsControlsGuideOpen(true)}
              className="absolute bottom-14 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono shadow-lg backdrop-blur transition-all active:scale-95"
              aria-label="Open 3D Controls Guide"
              title="Show keyboard & mouse navigation guide"
              data-testid="open-controls-guide-btn"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Controls Guide</span>
            </button>
          )}
        </>
      )}

      {/* Interaction Hint Footer (Bottom-Center) */}
      {!isLoading && !error && isWebGlSupported && (
        <div className="absolute bottom-2 left-4 right-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-arch-600 bg-arch-50/90 backdrop-blur-md px-4 py-1.5 rounded-lg border border-arch-200 pointer-events-none gap-2 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-arch-accent" />
            <span>OrbitControls Active · WASD / Drag to Navigate</span>
          </div>
          <div className="text-[10px] text-arch-500 flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            <span>WASD Walk · Q/E Turn · R Reset · Drag Orbit · Scroll Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};
