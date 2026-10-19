"use client";

import { useReducedMotion } from "./motion-preferences";

import { addAfterEffect, Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Mesh, ShaderMaterial } from "three";
import * as THREE from "three";

function SphereProjection({ sliceToDocument, onFrameReady }: {
    sliceToDocument: boolean;
    onFrameReady?: (sliced: boolean) => void;
}) {
    const { size, invalidate } = useThree();
    const documentHeight = useRef(0);
    const prepared = useRef(false);

    useLayoutEffect(() => {
        prepared.current = false;
        const measure = () => {
            documentHeight.current = document.body.getBoundingClientRect().height;
            invalidate();
        };
        measure();
        const observer = new ResizeObserver(measure);
        if (sliceToDocument) observer.observe(document.body);
        const onScroll = () => invalidate();
        if (sliceToDocument) window.addEventListener("scroll", onScroll, { passive: true });
        const unsubscribe = addAfterEffect(() => {
            if (!prepared.current) return;
            // Reveal only after the renderer has submitted a frame with this projection.
            onFrameReady?.(sliceToDocument);
            unsubscribe();
        });
        return () => {
            unsubscribe();
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, [size.width, size.height, sliceToDocument, invalidate, onFrameReady]);

    useFrame(({ camera }) => {
        if (!(camera instanceof THREE.PerspectiveCamera)) return;
        if (sliceToDocument) {
            // Preserve the full-document projection while allocating only a viewport-sized canvas.
            camera.setViewOffset(
                size.width,
                Math.max(size.height, documentHeight.current),
                0,
                window.scrollY,
                size.width,
                size.height,
            );
        } else if (camera.view?.enabled || camera.aspect !== size.width / size.height) {
            camera.clearViewOffset();
            camera.aspect = size.width / size.height;
            camera.updateProjectionMatrix();
        }
        prepared.current = true;
    }, -1);

    return null;
}

function Sphere({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<ShaderMaterial>(null);
    const invalidate = useThree(state => state.invalidate);

    useLayoutEffect(() => {
        if (active) invalidate();
    }, [active, invalidate]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
        }),
        [],
    );

    const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vDisplacement;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vUv = uv;
      
      float noise = snoise(position * 1.5 + uTime * 0.15);
      float displacement = noise * 0.15;
      vDisplacement = displacement;
      
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    
    void main() {
      float intensity = 0.3 + vDisplacement * 2.0;
      vec3 color = vec3(intensity);
      
      float line = smoothstep(0.0, 0.02, abs(fract(vUv.x * 20.0) - 0.5));
      line *= smoothstep(0.0, 0.02, abs(fract(vUv.y * 20.0) - 0.5));
      
      gl_FragColor = vec4(color * (1.0 - line * 0.5), 0.6);
    }
  `;

    useFrame((_, delta) => {
        if (reducedMotion || !active) return;
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
        }

        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.8, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                wireframe
            />
        </mesh>
    );
}

export function SentientSphere({
    active = true,
    sliceToDocument = false,
    onFrameReady,
}: {
    active?: boolean;
    sliceToDocument?: boolean;
    onFrameReady?: (sliced: boolean) => void;
}) {
    const [mounted, setMounted] = useState(false);
    const reducedMotion = !!useReducedMotion();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-white/10 animate-pulse" />
            </div>
        );
    }

    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            className="sphere-enter w-full h-full"
            dpr={[1, 2]}
            frameloop={reducedMotion || !active ? "demand" : "always"}
            gl={{
                antialias: true,
                alpha: true,
            }}
        >
            <SphereProjection sliceToDocument={sliceToDocument} onFrameReady={onFrameReady} />
            <Sphere active={active} reducedMotion={reducedMotion} />
        </Canvas>
    );
}
