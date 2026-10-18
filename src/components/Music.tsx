import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface GlobeHandle {
  element: HTMLDivElement | null;
}

interface GlobeProps {
  /** Ref berisi progress scene (0..1). Dibaca tiap frame, tidak memicu re-render. */
  progressRef: React.MutableRefObject<number>;
  prefersReducedMotion: boolean;
  /** Skala relatif bola untuk responsif. */
  scale?: number;
}

const BASE_RADIUS = 1.2;

/**
 * Ikon not musik (♪) wireframe 3D. Scene dibuat sekali saat mount dan di-dispose saat unmount.
 * Progress morph dibaca dari progressRef sehingga tidak ada re-init per frame.
 */
export const Globe = ({ progressRef, prefersReducedMotion, scale = 1 }: GlobeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    sphere: THREE.LineSegments;
    points: THREE.Points;
    group: THREE.Group;
    rafId: number;
    time: number;
    visible: boolean;
    currentSegments: number;
    currentRings: number;
    rebuildAccumulator: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    // ---- Scene ----
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ---- Helpers ----
    const distToRadius = (segments: number, rings: number) => {
      // Jumlah segmen tinggi → not sedikit lebih kecil agar tetap rapi.
      const base = BASE_RADIUS * scale;
      const density = segments * rings;
      const factor = THREE.MathUtils.clamp(1 - Math.log10(Math.max(density, 1)) * 0.05, 0.72, 1);
      return base * factor;
    };

    const buildNote = (segments: number, rings: number, radius: number) => {
      const r = radius;

      // Kepala not
      const headGeo = new THREE.SphereGeometry(r * 0.42, segments, rings);
      headGeo.scale(1.3, 0.9, 0.9);
      headGeo.rotateZ(-0.4);
      headGeo.translate(-r * 0.3, -r * 0.8, 0);
      const headEdges = new THREE.EdgesGeometry(headGeo, 1);
      headGeo.dispose();

      // Tangkai
      const stemGeo = new THREE.CylinderGeometry(
        r * 0.045,
        r * 0.045,
        r * 1.9,
        8,
        Math.max(4, Math.round(rings / 2))
      );
      stemGeo.translate(r * 0.25, r * 0.15, 0);
      const stemEdges = new THREE.EdgesGeometry(stemGeo, 1);
      stemGeo.dispose();

      // Bendera
      const flagCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(r * 0.25, r * 1.1, 0),
        new THREE.Vector3(r * 0.55, r * 0.85, 0),
        new THREE.Vector3(r * 0.8, r * 0.5, 0),
        new THREE.Vector3(r * 0.6, r * 0.15, 0),
      ]);
      const flagGeo = new THREE.TubeGeometry(flagCurve, 24, r * 0.04, 6, false);
      const flagEdges = new THREE.EdgesGeometry(flagGeo, 1);
      flagGeo.dispose();

      // Gabung ketiga bagian
      const merged = mergeGeometries([headEdges, stemEdges, flagEdges], false);

      let geometry: THREE.BufferGeometry;
      if (merged) {
        geometry = merged;
        headEdges.dispose();
        stemEdges.dispose();
        flagEdges.dispose();
      } else {
        // Fallback jarang terjadi: pakai kepala saja.
        geometry = headEdges;
        stemEdges.dispose();
        flagEdges.dispose();
      }

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });

      return new THREE.LineSegments(geometry, material);
    };

    const buildPoints = (noteGeometry: THREE.BufferGeometry) => {
      const source = noteGeometry.attributes.position as THREE.BufferAttribute | undefined;
      const positions: number[] = [];
      const highlights: number[] = []; // 1 = titik terang, 0 = titik biasa

      if (source) {
        let kept = 0;
        // Ambil setiap vertex ke-3 agar titik tersebar merata di seluruh not.
        for (let v = 0; v < source.count; v += 3) {
          positions.push(source.getX(v), source.getY(v), source.getZ(v));
          highlights.push(kept % 30 === 0 ? 1 : 0);
          kept++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('aHighlight', new THREE.Float32BufferAttribute(highlights, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.7 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uScale: { value: scale },
        },
        vertexShader: `
          attribute float aHighlight;
          varying float vHighlight;
          uniform float uPixelRatio;
          uniform float uScale;
          void main() {
            vHighlight = aHighlight;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float size = mix(1.1, 2.4, aHighlight) * uScale * uPixelRatio;
            gl_PointSize = size * (120.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vHighlight;
          uniform float uOpacity;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.1, d);
            float base = mix(0.28, 0.85, vHighlight);
            gl_FragColor = vec4(1.0, 1.0, 1.0, a * base * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    };

    // ---- Objects ----
    const initialSegments = 22;
    const initialRings = 14;
    const initialRadius = distToRadius(initialSegments, initialRings);

    const sphere = buildNote(initialSegments, initialRings, initialRadius);
    const points = buildPoints(sphere.geometry);

    group.add(sphere, points);

    // ---- State ----
    stateRef.current = {
      renderer,
      scene,
      camera,
      sphere,
      points,
      group,
      rafId: 0,
      time: 0,
      visible: true,
      currentSegments: initialSegments,
      currentRings: initialRings,
      rebuildAccumulator: 0,
    };

    // ---- Resize ----
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ---- Visibility ----
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (stateRef.current) stateRef.current.visible = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    observer.observe(container);

    // ---- Loop ----
    const clock = new THREE.Clock();
    // Posisi asli not sebelum distorsi gelombang; di-reset setiap rebuild geometri.
    let originalPositions: Float32Array | null = null;

    const animate = () => {
      const state = stateRef.current;
      if (!state) return;
      state.rafId = requestAnimationFrame(animate);

      if (!state.visible) {
        // Tetap jadwalkan frame berikutnya, tetapi lewati render berat.
        clock.getDelta();
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.05);
      state.time += delta;

      const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

      // Morph parameter
      const spiralAmount = 1 - p;
      const targetSegments = Math.round(THREE.MathUtils.lerp(14, 64, p));
      const targetRings = Math.round(THREE.MathUtils.lerp(9, 40, p));
      const targetRadius = distToRadius(targetSegments, targetRings);

      // Rebuild geometri bertahap (maks ~3x/detik) untuk menghindari lonjakan.
      state.rebuildAccumulator += delta;
      const segmentsChanged = Math.abs(targetSegments - state.currentSegments) >= 2;
      const ringsChanged = Math.abs(targetRings - state.currentRings) >= 2;
      if ((segmentsChanged || ringsChanged) && state.rebuildAccumulator > 0.08) {
        state.rebuildAccumulator = 0;
        state.currentSegments = targetSegments;
        state.currentRings = targetRings;

        const newSphere = buildNote(targetSegments, targetRings, targetRadius);
        const newPoints = buildPoints(newSphere.geometry);

        // Transfer opacity dari objek lama
        (newSphere.material as THREE.LineBasicMaterial).opacity = (state.sphere.material as THREE.LineBasicMaterial).opacity;

        group.remove(state.sphere, state.points);
        state.sphere.geometry.dispose();
        (state.sphere.material as THREE.Material).dispose();
        state.points.geometry.dispose();
        (state.points.material as THREE.Material).dispose();

        group.add(newSphere, newPoints);
        state.sphere = newSphere;
        state.points = newPoints;
        originalPositions = null;
      }

      // Distorsi gelombang yang hilang saat progress mendekati 1.
      const notePos = state.sphere.geometry.attributes.position as THREE.BufferAttribute;
      if (notePos && spiralAmount > 0.001) {
        if (!originalPositions || originalPositions.length !== (notePos.array as Float32Array).length) {
          originalPositions = Float32Array.from(notePos.array as Float32Array);
        }
        const original = originalPositions;
        const arr = notePos.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          const x = original[i];
          const y = original[i + 1];
          const z = original[i + 2];
          const w = Math.sin(y * 5 + x * 3 + state.time * 2) * 0.18 * spiralAmount;
          arr[i] = x * (1 + w);
          arr[i + 1] = y * (1 + w);
          arr[i + 2] = z * (1 + w);
        }
        notePos.needsUpdate = true;
      }

      // Gerak idle
      group.rotation.y = Math.sin(state.time * 0.6) * 0.7;
      group.rotation.x = Math.sin(state.time * 0.4) * 0.08;
      group.position.y = Math.sin(state.time * 1.6) * 0.08;

      // Denyut beat
      const beat = Math.pow(Math.max(0, Math.sin(state.time * Math.PI * 4)), 6);

      // Update uniform titik
      const pointMat = state.points.material as THREE.ShaderMaterial;
      if (pointMat.uniforms?.uTime) pointMat.uniforms.uTime.value = state.time;

      // Fade-out di akhir scene
      const fade = p > 0.82 ? 1 - (p - 0.82) / 0.18 : 1;
      const eased = THREE.MathUtils.clamp(fade, 0, 1);
      (state.sphere.material as THREE.LineBasicMaterial).opacity = 0.35 * eased;
      if (pointMat.uniforms?.uOpacity) pointMat.uniforms.uOpacity.value = 0.8 * eased;

      // Mengecil di akhir + denyut beat
      const shrink = THREE.MathUtils.lerp(1, 0.72, eased === 0 ? 0 : 1 - eased);
      group.scale.setScalar(shrink * (1 + beat * 0.04));

      renderer.render(scene, camera);
    };

    animate();

    // ---- Cleanup ----
    return () => {
      const state = stateRef.current;
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (state) {
        cancelAnimationFrame(state.rafId);

        state.sphere.geometry.dispose();
        (state.sphere.material as THREE.Material).dispose();
        state.points.geometry.dispose();
        (state.points.material as THREE.Material).dispose();

        state.scene.clear();
        state.renderer.dispose();
        state.renderer.forceContextLoss();
        if (container.contains(state.renderer.domElement)) {
          container.removeChild(state.renderer.domElement);
        }
      }

      stateRef.current = null;
    };
  }, [prefersReducedMotion, progressRef, scale]);

  if (prefersReducedMotion) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-52 w-52 sm:h-72 sm:w-72"
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <ellipse
            cx="34"
            cy="74"
            rx="15"
            ry="11"
            transform="rotate(-20 34 74)"
            vectorEffect="non-scaling-stroke"
          />
          <line x1="48" y1="72" x2="48" y2="18" vectorEffect="non-scaling-stroke" />
          <path d="M48 18 C 66 24, 74 38, 66 58" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" aria-hidden="true" />;
};

// Scene Three.js dibuat sekali di useEffect dengan deps yang tidak berubah,
// sehingga React Fast Refresh tidak membangun ulang WebGL saat file diubah.
// Paksa reload penuh agar perubahan scene selalu terlihat.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate('Globe: membangun ulang scene WebGL');
  });
}