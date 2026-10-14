"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SOUSSE, world } from "@/lib/world";

/**
 * The persistent WebGL world behind the whole page.
 *
 * One scene, one camera, one render loop. The DOM never touches three.js: it
 * only writes `world.stage` / `world.mouseX` / `world.intro`, and this loop
 * turns those into a camera pose, a globe orientation and material uniforms.
 *
 * Stage 0 is orbit (the whole planet, off to one side); stage 6 is the final
 * approach, a few hundred kilometres above Sousse.
 */

const R = 2;
const DEG = Math.PI / 180;

/** lat/lon → point on a sphere. East is screen-right when viewed from outside. */
function ll(lat: number, lon: number, r = R): THREE.Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type KeyDef = {
  /** camera distance */
  d: number;
  /** globe screen offset as a fraction of viewport (x right, y down) */
  sx: number;
  sy: number;
  /** surface point that faces the camera */
  lat: number;
  lon: number;
  roll: number;
  /** 0 = full brightness, 1 = almost off (behind dense copy) */
  dim: number;
  /** arc visibility */
  arcs: number;
};
type Key = KeyDef & { q: THREE.Quaternion };

// One keyframe per stage in lib/world.ts STAGES.
const DESKTOP: KeyDef[] = [
  { d: 8.0, sx: 0.22, sy: 0.0, lat: 28, lon: 16, roll: -0.42, dim: 0.0, arcs: 0.5 },
  { d: 6.4, sx: -0.26, sy: 0.04, lat: 37, lon: 9, roll: -0.18, dim: 0.28, arcs: 0.7 },
  { d: 5.4, sx: 0.0, sy: 0.66, lat: 36, lon: 10, roll: 0.0, dim: 0.45, arcs: 0.6 },
  { d: 4.1, sx: 0.22, sy: 0.0, lat: 35.5, lon: 10.6, roll: 0.12, dim: 0.7, arcs: 0.4 },
  { d: 3.7, sx: -0.22, sy: 0.0, lat: 35.8, lon: 10.6, roll: -0.12, dim: 0.76, arcs: 0.5 },
  { d: 4.3, sx: 0.0, sy: 0.0, lat: 33, lon: 12, roll: 0.0, dim: 0.5, arcs: 1.0 },
  { d: 3.35, sx: 0.2, sy: 0.0, lat: 35.8, lon: 10.6, roll: 0.0, dim: 0.3, arcs: 0.7 },
];

// On a phone the copy owns the screen: the planet sits lower and calmer.
const MOBILE: KeyDef[] = [
  { d: 9.6, sx: 0.0, sy: 0.3, lat: 28, lon: 16, roll: -0.3, dim: 0.0, arcs: 0.5 },
  { d: 7.4, sx: 0.0, sy: 0.38, lat: 37, lon: 9, roll: -0.18, dim: 0.55, arcs: 0.6 },
  { d: 6.4, sx: 0.0, sy: 0.7, lat: 36, lon: 10, roll: 0.0, dim: 0.62, arcs: 0.5 },
  { d: 4.6, sx: 0.0, sy: 0.2, lat: 35.5, lon: 10.6, roll: 0.1, dim: 0.72, arcs: 0.4 },
  { d: 4.0, sx: 0.0, sy: 0.2, lat: 35.8, lon: 10.6, roll: -0.1, dim: 0.74, arcs: 0.4 },
  { d: 5.0, sx: 0.0, sy: 0.1, lat: 33, lon: 12, roll: 0.0, dim: 0.66, arcs: 0.9 },
  { d: 4.1, sx: 0.0, sy: 0.22, lat: 35.8, lon: 10.6, roll: 0.0, dim: 0.5, arcs: 0.6 },
];

function buildKeys(defs: KeyDef[]): Key[] {
  return defs.map((k) => {
    const dir = ll(k.lat, k.lon, 1);
    const face = new THREE.Quaternion().setFromUnitVectors(
      dir,
      new THREE.Vector3(0, 0, 1),
    );
    const roll = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      k.roll,
    );
    return { ...k, q: roll.multiply(face) };
  });
}

/** Cities the arcs fly to. Purely visual: where the work reaches. */
const CITIES: Array<[number, number]> = [
  [48.86, 2.35], // Paris
  [45.76, 4.84], // Lyon
  [50.11, 8.68], // Frankfurt
  [51.5, -0.12], // London
  [25.2, 55.27], // Dubai
  [24.71, 46.67], // Riyadh
  [25.29, 51.53], // Doha
  [33.57, -7.59], // Casablanca
  [30.04, 31.24], // Cairo
  [6.52, 3.38], // Lagos
  [5.36, -4.0], // Abidjan
  [45.5, -73.57], // Montréal
];

/* ------------------------------------------------------------------ shaders */

const DOT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPR;
  uniform float uSize;
  attribute float aSeed;
  varying float vSeed;
  varying float vFacing;
  varying float vScan;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * position);
    vFacing = dot(n, normalize(-mv.xyz));
    vSeed = aSeed;
    // A bright band that sweeps up and down the planet.
    float band = abs(position.y / ${R.toFixed(1)} - sin(uTime * 0.28) * 0.92);
    vScan = smoothstep(0.07, 0.0, band);
    float s = uSize * uPR * (1.0 / -mv.z) * mix(0.75, 1.3, aSeed) * mix(0.45, 1.0, clamp(vFacing, 0.0, 1.0)) * (1.0 + vScan * 0.3);
    gl_PointSize = min(s, 11.0 * uPR);
    gl_Position = projectionMatrix * mv;
  }
`;

const DOT_FRAG = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uSignal;
  uniform float uAlpha;
  varying float vSeed;
  varying float vFacing;
  varying float vScan;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.12, d);
    float facing = smoothstep(0.08, 0.7, vFacing);
    vec3 col = mix(uColA, uColB, vSeed);
    col = mix(col, uSignal, vScan * 0.28);
    float a = disc * facing * uAlpha * (0.34 + 0.4 * vSeed + vScan * 0.22);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

const PLANET_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform float uRimPower;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), uRimPower);
    float lit = max(dot(vN, normalize(vec3(-0.45, 0.55, 0.7))), 0.0);
    vec3 col = uBase + uRim * f * 0.42 + uRim * lit * 0.05;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  void main() {
    float i = pow(max(0.62 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 4.6);
    gl_FragColor = vec4(uColor, clamp(i * uIntensity, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

const ARC_VERT = /* glsl */ `
  attribute float aT;
  attribute float aPhase;
  varying float vT;
  varying float vPhase;
  void main() {
    vT = aT;
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vT;
  varying float vPhase;
  void main() {
    float head = fract(uTime * 0.16 + vPhase);
    float behind = mod(head - vT + 1.0, 1.0);
    float pulse = smoothstep(0.3, 0.0, behind);
    float a = (0.3 + pulse * 1.0) * uOpacity;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

const SOFT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aTw;
  uniform float uPR;
  uniform float uTime;
  uniform float uScale;
  uniform float uMin;
  uniform float uMax;
  uniform float uNear;
  varying float vA;
  varying float vTw;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    gl_PointSize = clamp(aSize * uPR * uScale / max(dist, 0.001), uMin * uPR, uMax * uPR);
    gl_Position = projectionMatrix * mv;
    float tw = 0.72 + 0.28 * sin(uTime * (0.5 + aTw * 1.6) + aTw * 60.0);
    vA = tw * smoothstep(0.0, uNear, dist);
    vTw = aTw;
  }
`;

const SOFT_FRAG = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform float uOpacity;
  varying float vA;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColA, uColB, vTw), disc * disc * vA * uOpacity);
    #include <colorspace_fragment>
  }
`;

/* ----------------------------------------------------------------- builders */

function softPoints(
  count: number,
  place: (i: number, out: THREE.Vector3) => void,
  opts: {
    pr: number;
    scale: number;
    min: number;
    max: number;
    near: number;
    size: [number, number];
    colA: string;
    colB: string;
    opacity: number;
  },
) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const tw = new Float32Array(count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    place(i, v);
    pos.set([v.x, v.y, v.z], i * 3);
    size[i] = lerp(opts.size[0], opts.size[1], Math.random());
    tw[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aTw", new THREE.BufferAttribute(tw, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: SOFT_VERT,
    fragmentShader: SOFT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uPR: { value: opts.pr },
      uTime: { value: 0 },
      uScale: { value: opts.scale },
      uMin: { value: opts.min },
      uMax: { value: opts.max },
      uNear: { value: opts.near },
      uColA: { value: new THREE.Color(opts.colA) },
      uColB: { value: new THREE.Color(opts.colB) },
      uOpacity: { value: opts.opacity },
    },
  });
  return new THREE.Points(geo, mat);
}

/** Great-circle arc, lifted off the surface in proportion to its length. */
function arcPoints(a: THREE.Vector3, b: THREE.Vector3, steps = 72) {
  const na = a.clone().normalize();
  const nb = b.clone().normalize();
  const angle = na.angleTo(nb);
  const lift = 0.1 + angle * 0.55;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dir = new THREE.Vector3()
      .copy(na)
      .multiplyScalar(Math.sin((1 - t) * angle))
      .addScaledVector(nb, Math.sin(t * angle))
      .divideScalar(Math.sin(angle) || 1)
      .normalize();
    pts.push(dir.multiplyScalar(R + 0.005 + Math.sin(Math.PI * t) * lift));
  }
  return pts;
}

async function sampleLand(count: number): Promise<Float32Array> {
  const img = new Image();
  img.src = "/textures/earth-water.png";
  await img.decode();
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, cv.width, cv.height);

  const out: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * rad;
    const z = Math.sin(th) * rad;

    // Invert ll(): (x, y, z) → equirectangular uv.
    const lat = Math.asin(y) / DEG;
    let theta = Math.atan2(z, -x);
    if (theta < 0) theta += Math.PI * 2;
    const u = theta / (Math.PI * 2);
    const v = (90 - lat) / 180;
    const px = Math.min(width - 1, Math.floor(u * width));
    const py = Math.min(height - 1, Math.floor(v * height));
    const lum = data[(py * width + px) * 4] / 255;
    if (lum < 0.4) out.push(x * R, y * R, z * R);
  }
  return new Float32Array(out);
}

/* -------------------------------------------------------------------- scene */

export default function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      world.webgl = false;
      world.ready = true; // nothing to wait for
      document.documentElement.classList.add("no-webgl");
      return;
    }

    const compact = () => window.innerWidth < 820;
    const pr = () => Math.min(window.devicePixelRatio || 1, compact() ? 1.5 : 2);

    renderer.setPixelRatio(pr());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
    camera.position.set(0, 0, 8);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(o: T): T => {
      disposables.push(o);
      return o;
    };

    const colBlue = new THREE.Color("#3D8BFF");
    const colIce = new THREE.Color("#9CCBFF");
    const colSignal = new THREE.Color("#D4FF3A");

    /* rig: everything that is not the globe's own spin */
    const rig = new THREE.Group();
    scene.add(rig);

    /* globe group rotates with the keyframes */
    const globe = new THREE.Group();
    rig.add(globe);

    // Solid body: occludes the far side and carries the limb light.
    const body = new THREE.Mesh(
      track(new THREE.SphereGeometry(R * 0.995, 96, 96)),
      track(
        new THREE.ShaderMaterial({
          vertexShader: PLANET_VERT,
          fragmentShader: PLANET_FRAG,
          uniforms: {
            uBase: { value: new THREE.Color("#050A17") },
            uRim: { value: new THREE.Color("#2B7FFF") },
            uRimPower: { value: 5.0 },
          },
        }),
      ),
    );
    globe.add(body);

    // Atmosphere halo.
    const atmoMat = track(
      new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color("#2B7FFF") },
          uIntensity: { value: 1.0 },
        },
      }),
    );
    const atmo = new THREE.Mesh(track(new THREE.SphereGeometry(R * 1.14, 96, 96)), atmoMat);
    rig.add(atmo);

    // Graticule.
    {
      const verts: number[] = [];
      const seg = 96;
      for (let lat = -75; lat <= 75; lat += 15) {
        for (let i = 0; i < seg; i++) {
          const a = ll(lat, (i / seg) * 360 - 180, R * 1.002);
          const b = ll(lat, ((i + 1) / seg) * 360 - 180, R * 1.002);
          verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
      for (let lon = -180; lon < 180; lon += 15) {
        for (let i = 0; i < seg / 2; i++) {
          const a = ll(-90 + (i / (seg / 2)) * 180, lon, R * 1.002);
          const b = ll(-90 + ((i + 1) / (seg / 2)) * 180, lon, R * 1.002);
          verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      const m = track(
        new THREE.LineBasicMaterial({
          color: 0x4a86ff,
          transparent: true,
          opacity: 0.09,
          depthWrite: false,
        }),
      );
      globe.add(new THREE.LineSegments(g, m));
    }

    // Land dots — filled in once the mask has loaded.
    const dotMat = track(
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uPR: { value: pr() },
          uSize: { value: 22 },
          uColA: { value: colBlue },
          uColB: { value: colIce },
          uSignal: { value: colSignal },
          uAlpha: { value: 0 },
        },
      }),
    );
    let dots: THREE.Points | null = null;
    let disposed = false;
    sampleLand(120000)
      .then((positions) => {
        if (disposed) return;
        const seeds = new Float32Array(positions.length / 3);
        for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
        const g = track(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
        dots = new THREE.Points(g, dotMat);
        globe.add(dots);
        // Let one frame render with the dots in before declaring ready.
        requestAnimationFrame(() => requestAnimationFrame(() => (world.ready = true)));
      })
      .catch(() => {
        /* the globe still reads as a dark sphere with a rim */
        world.ready = true;
      });

    // Sousse beacon + arcs.
    const sousseDir = ll(SOUSSE.lat, SOUSSE.lon, 1);
    const sousseP = sousseDir.clone().multiplyScalar(R * 1.004);

    const marker = new THREE.Group();
    marker.position.copy(sousseP);
    marker.lookAt(sousseDir.clone().multiplyScalar(10));
    globe.add(marker);

    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(
        track(new THREE.RingGeometry(0.097, 0.1, 96)),
        track(
          new THREE.MeshBasicMaterial({
            color: colSignal,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      );
      rings.push(m);
      marker.add(m);
    }
    const core = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.028, 24)),
      track(new THREE.MeshBasicMaterial({ color: colSignal })),
    );
    marker.add(core);

    // Beacon mast.
    {
      const g = track(new THREE.BufferGeometry());
      g.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0.62], 3),
      );
      const m = track(
        new THREE.LineBasicMaterial({
          color: colSignal,
          transparent: true,
          opacity: 0.7,
        }),
      );
      marker.add(new THREE.Line(g, m));
    }

    let nodePoints: THREE.Points | null = null;
    const arcMat = track(
      new THREE.ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.5 },
          uColor: { value: colSignal },
        },
      }),
    );
    {
      const pos: number[] = [];
      const ts: number[] = [];
      const phases: number[] = [];
      CITIES.forEach(([lat, lon], idx) => {
        const pts = arcPoints(sousseP, ll(lat, lon, R * 1.004));
        const phase = (idx * 0.137 + 0.05) % 1;
        for (let i = 0; i < pts.length - 1; i++) {
          pos.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
          ts.push(i / (pts.length - 1), (i + 1) / (pts.length - 1));
          phases.push(phase, phase);
        }
      });
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
      g.setAttribute("aPhase", new THREE.Float32BufferAttribute(phases, 1));
      globe.add(new THREE.LineSegments(g, arcMat));

      // City nodes — soft round points, not GL_POINTS squares.
      const nodes = softPoints(
        CITIES.length,
        (i, out) => out.copy(ll(CITIES[i][0], CITIES[i][1], R * 1.006)),
        {
          pr: pr(),
          scale: 150,
          min: 3,
          max: 9,
          near: 0.1,
          size: [1.3, 1.3],
          colA: "#D4FF3A",
          colB: "#FFFFFF",
          opacity: 1,
        },
      );
      track(nodes.geometry);
      track(nodes.material as THREE.Material);
      nodePoints = nodes;
      globe.add(nodes);
    }

    // Orbit rings + satellites (fixed tilt, they do not spin with the globe).
    const orbits = new THREE.Group();
    rig.add(orbits);
    const orbitMats: THREE.LineBasicMaterial[] = [];
    const sats: Array<{ r: number; tilt: THREE.Euler; speed: number; phase: number }> = [
      { r: 2.75, tilt: new THREE.Euler(1.15, 0.2, 0.3), speed: 0.32, phase: 0 },
      { r: 3.25, tilt: new THREE.Euler(0.55, 0.0, -0.7), speed: -0.2, phase: 2 },
      { r: 3.7, tilt: new THREE.Euler(1.45, 0.6, 1.1), speed: 0.14, phase: 4 },
    ];
    const satGroups: THREE.Group[] = [];
    sats.forEach((s) => {
      const grp = new THREE.Group();
      grp.rotation.copy(s.tilt);
      const ptsArr: number[] = [];
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        ptsArr.push(Math.cos(a) * s.r, 0, Math.sin(a) * s.r);
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(ptsArr, 3));
      const m = track(
        new THREE.LineBasicMaterial({
          color: 0x5a96ff,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        }),
      );
      orbitMats.push(m);
      grp.add(new THREE.LineLoop(g, m));
      orbits.add(grp);
      satGroups.push(grp);
    });
    // Each satellite lives in its own tilted group so it follows its ring.
    const satMeshes: THREE.Points[] = sats.map((s, i) => {
      const p = softPoints(1, (_, out) => out.set(s.r, 0, 0), {
        pr: pr(),
        scale: 90,
        min: 3,
        max: 9,
        near: 0.1,
        size: [1.3, 1.3],
        colA: "#D4FF3A",
        colB: "#FFFFFF",
        opacity: 1,
      });
      satGroups[i].add(p);
      track(p.geometry);
      track(p.material as THREE.Material);
      return p;
    });

    /* far field: three parallax star layers */
    const starLayers: THREE.Points[] = [];
    const makeStars = (n: number, rMin: number, rMax: number, scale: number, op: number) => {
      const p = softPoints(
        n,
        (_, out) => {
          const u = Math.random() * 2 - 1;
          const t = Math.random() * Math.PI * 2;
          const rr = lerp(rMin, rMax, Math.random());
          const s = Math.sqrt(1 - u * u);
          out.set(rr * s * Math.cos(t), rr * u, rr * s * Math.sin(t));
        },
        {
          pr: pr(),
          scale,
          min: 1.3,
          max: 4.5,
          near: 1,
          size: [0.6, 2.2],
          colA: "#9CC4FF",
          colB: "#FFFFFF",
          opacity: op,
        },
      );
      scene.add(p);
      starLayers.push(p);
      track(p.geometry);
      track(p.material as THREE.Material);
    };
    makeStars(2200, 70, 110, 90, 1.0);
    makeStars(900, 40, 70, 120, 0.95);
    makeStars(260, 22, 40, 170, 0.9);

    /* near field: dust the camera flies through during the dive */
    const dust = softPoints(
      1400,
      (_, out) => {
        for (;;) {
          out.set(
            (Math.random() * 2 - 1) * 9,
            (Math.random() * 2 - 1) * 6,
            lerp(-3, 13, Math.random()),
          );
          if (out.length() > R * 1.5) break;
        }
      },
      {
        pr: pr(),
        scale: 26,
        min: 1,
        max: 7,
        near: 1.4,
        size: [0.5, 1.6],
        colA: "#6FA8FF",
        colB: "#D4FF3A",
        opacity: 0.55,
      },
    );
    scene.add(dust);
    track(dust.geometry);
    track(dust.material as THREE.Material);

    /* ---------------------------------------------------------- animation */

    let keys = buildKeys(compact() ? MOBILE : DESKTOP);
    let wasCompact = compact();

    const qTmp = new THREE.Quaternion();
    const qSpin = new THREE.Quaternion();
    const axisY = new THREE.Vector3(0, 1, 0);
    let spin = 0;
    let curD = 8;
    let curSX = 0;
    let curSY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setPixelRatio(pr());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const now = compact();
      if (now !== wasCompact) {
        wasCompact = now;
        keys = buildKeys(now ? MOBILE : DESKTOP);
      }
      const p = pr();
      for (const o of [dust, ...starLayers, ...satMeshes, ...(nodePoints ? [nodePoints] : [])]) {
        (o.material as THREE.ShaderMaterial).uniforms.uPR.value = p;
      }
      dotMat.uniforms.uPR.value = p;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // THREE.Clock is deprecated; a plain timestamp does the same job.
    let raf = 0;
    let prev = performance.now();
    let t = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      t += dt;

      const still = world.reduced;
      const intro = still ? 1 : world.intro;
      const stage = still ? 0 : clamp(world.stage, 0, keys.length - 1);

      const i = Math.min(Math.floor(stage), keys.length - 2);
      const f = smooth(stage - i);
      const a = keys[i];
      const b = keys[i + 1];

      const targetD = lerp(a.d, b.d, f) * (1 + (1 - intro) * 0.55);
      const targetSX = lerp(a.sx, b.sx, f);
      const targetSY = lerp(a.sy, b.sy, f);
      const dim = lerp(a.dim, b.dim, f);
      const arcs = lerp(a.arcs, b.arcs, f);

      // Critically-damped follow, so scroll jumps never snap the camera.
      const k = 1 - Math.exp(-dt * 5.5);
      curD += (targetD - curD) * k;
      curSX += (targetSX - curSX) * k;
      curSY += (targetSY - curSY) * k;

      camera.position.set(0, 0, curD);
      const w = renderer.domElement.width / renderer.getPixelRatio();
      const h = renderer.domElement.height / renderer.getPixelRatio();
      camera.setViewOffset(w, h, -curSX * w, -curSY * h, w, h);

      // Orientation: slerp between faces, plus a slow idle spin in orbit.
      if (!still) spin += dt * 0.045 * (1 - Math.min(stage, 1));
      qSpin.setFromAxisAngle(axisY, spin);
      qTmp.slerpQuaternions(a.q, b.q, f);
      globe.quaternion.copy(qSpin).multiply(qTmp);

      // Pointer parallax on the whole rig; stars move more than the planet.
      tiltX += ((still ? 0 : world.mouseY) * 0.07 - tiltX) * 0.04;
      tiltY += ((still ? 0 : world.mouseX) * 0.12 - tiltY) * 0.04;
      rig.rotation.set(tiltX, tiltY, 0);
      starLayers.forEach((s, n) => {
        s.rotation.y = t * 0.004 * (n + 1) + tiltY * (0.4 + n * 0.5) + world.progress * (0.35 + n * 0.3);
        s.rotation.x = tiltX * (0.4 + n * 0.5);
      });

      // Uniforms.
      dotMat.uniforms.uTime.value = t;
      dotMat.uniforms.uAlpha.value = (1 - dim * 0.8) * intro;
      atmoMat.uniforms.uIntensity.value = (1.5 - dim * 0.8) * intro;
      arcMat.uniforms.uTime.value = t;
      arcMat.uniforms.uOpacity.value = arcs * (1 - dim * 0.4) * intro;
      for (const o of [dust, ...starLayers, ...satMeshes, ...(nodePoints ? [nodePoints] : [])]) {
        (o.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      }
      const orbitFade = smooth(clamp((curD - 3.6) / 1.6, 0, 1)) * intro;
      orbitMats.forEach((m, n) => (m.opacity = 0.34 * orbitFade * (1 - n * 0.15)));
      satMeshes.forEach((s) => ((s.material as THREE.ShaderMaterial).uniforms.uOpacity.value = orbitFade));

      // Satellites ride their rings.
      satMeshes.forEach((s, n) => {
        const ang = t * sats[n].speed + sats[n].phase;
        const attr = s.geometry.getAttribute("position") as THREE.BufferAttribute;
        attr.setXYZ(0, Math.cos(ang) * sats[n].r, 0, Math.sin(ang) * sats[n].r);
        attr.needsUpdate = true;
      });

      // Keep the beacon proportionate as the camera closes in.
      marker.scale.setScalar(0.4 + (curD / 8) * 0.6);

      // Sousse pulse.
      rings.forEach((r, n) => {
        const p = (t * 0.55 + n / 3) % 1;
        r.scale.setScalar(0.5 + p * 1.7);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (1 - p) * 0.9 * intro;
      });

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
