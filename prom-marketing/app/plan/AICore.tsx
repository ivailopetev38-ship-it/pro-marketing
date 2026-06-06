"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const NODE_COLORS = ["#34e7e4", "#a78bfa", "#e7c984", "#7af5f0", "#8b6cf0", "#5eead4"];
const R = [3.0, 3.3, 3.1, 3.45, 3.05, 3.25];
const INC = [0.32, -0.55, 0.95, -0.22, 0.62, -0.95];
const SPD = [0.26, -0.3, 0.2, 0.28, -0.22, 0.25];
const PH = [0, 1.1, 2.2, 3.3, 4.4, 5.5];

const ADD = THREE.AdditiveBlending;

function CoreScene() {
  const parallax = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const points = useRef<THREE.Points>(null);
  const orbits = useRef<(THREE.Group | null)[]>([]);

  // Static geometries — built once, never mutated (keeps render pure).
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1.55, 1), []);
  const coreWire = useMemo(() => new THREE.WireframeGeometry(coreGeo), [coreGeo]);
  const shellWire = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.45, 1)),
    [],
  );

  // Deterministic particle cloud (Weyl/Fibonacci distribution — no Math.random,
  // so it is pure and SSR-stable).
  const particleGeo = useMemo(() => {
    const N = 700;
    const arr = new Float32Array(N * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const r = 2.6 + ((i * 1.6180339887) % 1) * 3.2;
      arr[i * 3] = Math.cos(theta) * ring * r;
      arr[i * 3 + 1] = y * r;
      arr[i * 3 + 2] = Math.sin(theta) * ring * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  // One static line per node (core centre → node), built once.
  const lineGeos = useMemo(
    () =>
      R.map((rad) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, rad, 0, 0], 3));
        return g;
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (spin.current) {
      spin.current.rotation.y = t * 0.1;
      spin.current.rotation.x = 0.26 + Math.sin(t * 0.3) * 0.05;
      const bs = 1 + Math.sin(t * 1.3) * 0.04;
      spin.current.scale.setScalar(bs);
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.06;
      shell.current.rotation.x = t * 0.035;
    }
    if (points.current) points.current.rotation.y = t * 0.02;

    // Orbit each node by rotating its group — line follows automatically.
    for (let k = 0; k < orbits.current.length; k++) {
      const o = orbits.current[k];
      if (o) o.rotation.y = t * SPD[k] + PH[k];
    }

    if (parallax.current) {
      parallax.current.rotation.y += (state.pointer.x * 0.5 - parallax.current.rotation.y) * 0.05;
      parallax.current.rotation.x += (-state.pointer.y * 0.3 - parallax.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={parallax}>
      {/* core */}
      <group ref={spin}>
        <lineSegments geometry={coreWire}>
          <lineBasicMaterial color="#7af5f0" transparent opacity={0.6} blending={ADD} />
        </lineSegments>
        <mesh geometry={coreGeo}>
          <meshBasicMaterial color="#34e7e4" transparent opacity={0.1} blending={ADD} />
        </mesh>
      </group>

      {/* outer shell */}
      <lineSegments ref={shell} geometry={shellWire}>
        <lineBasicMaterial color="#a78bfa" transparent opacity={0.22} blending={ADD} />
      </lineSegments>

      {/* particle field */}
      <points ref={points} geometry={particleGeo}>
        <pointsMaterial
          size={0.035}
          color="#9fe9ff"
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={ADD}
        />
      </points>

      {/* orbiting agent nodes + connection lines */}
      {NODE_COLORS.map((c, k) => (
        <group key={k} rotation={[INC[k], 0, 0]}>
          <group
            ref={(el) => {
              orbits.current[k] = el;
            }}
          >
            <lineSegments geometry={lineGeos[k]}>
              <lineBasicMaterial color="#34e7e4" transparent opacity={0.22} blending={ADD} />
            </lineSegments>
            <group position={[R[k], 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.11, 16, 16]} />
                <meshBasicMaterial color={c} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.26, 16, 16]} />
                <meshBasicMaterial color={c} transparent opacity={0.22} blending={ADD} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * 3D "AI core" hero centerpiece — a cursor-reactive WebGL scene built with
 * react-three-fiber. Falls back to a static CSS orb when the visitor prefers
 * reduced motion.
 */
export function AICore() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="pl-fallback" aria-hidden>
        <span className="pl-orb" />
      </div>
    );
  }

  return (
    <Canvas
      className="pl-canvas"
      camera={{ position: [0, 0, 9], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <CoreScene />
    </Canvas>
  );
}
