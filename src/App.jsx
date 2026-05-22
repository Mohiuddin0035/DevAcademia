import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import roadmapsData from '../roadmaps.json';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
const Lanyard = React.lazy(() => import('./Lanyard'));


// Theme maps matching each course's aesthetic signature
const themes = {
  'react-simple': {
    bgGrad: 'from-sky-500/10 via-slate-900 to-slate-950',
    accent: 'sky',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    bgPill: 'bg-sky-500/10',
    glow: 'theme-glow-sky',
    hoverCard: 'hover:border-sky-500/50 hover:bg-sky-500/[0.04] dark:hover:border-sky-500/50 dark:hover:bg-sky-500/[0.03] hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]',
    button: 'bg-sky-600 hover:bg-sky-500 text-sky-50 border-sky-500/30',
    checkbox: 'text-sky-500 focus:ring-sky-500/40 border-sky-500/30',
    badgeClass: 'badge-react',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-sky-500/5',
    bgGlowHover: 'group-hover:bg-sky-500/15',
    progressGrad: 'from-sky-500 to-sky-400',
    activeTabDark: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    activeTabLight: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    bannerGradDark: 'border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-sky-500/10 via-white to-sky-500/5',
    bannerGlow: 'bg-sky-500/10',
    textLight: 'text-sky-600'
  },
  'ml-3month': {
    bgGrad: 'from-emerald-500/10 via-slate-900 to-slate-950',
    accent: 'emerald',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bgPill: 'bg-emerald-500/10',
    glow: 'theme-glow-emerald',
    hoverCard: 'hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/[0.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-emerald-50 border-emerald-500/30',
    checkbox: 'text-emerald-500 focus:ring-emerald-500/40 border-emerald-500/30',
    badgeClass: 'badge-python',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-emerald-500/5',
    bgGlowHover: 'group-hover:bg-emerald-500/15',
    progressGrad: 'from-emerald-500 to-emerald-400',
    activeTabDark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    activeTabLight: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    bannerGradDark: 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5',
    bannerGlow: 'bg-emerald-500/10',
    textLight: 'text-emerald-600'
  },
  'web-dev': {
    bgGrad: 'from-indigo-500/10 via-slate-900 to-slate-950',
    accent: 'indigo',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bgPill: 'bg-indigo-500/10',
    glow: 'theme-glow-indigo',
    hoverCard: 'hover:border-indigo-500/50 hover:bg-indigo-500/[0.04] dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/[0.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-indigo-50 border-indigo-500/30',
    checkbox: 'text-indigo-500 focus:ring-indigo-500/40 border-indigo-500/30',
    badgeClass: 'badge-ml',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-indigo-500/5',
    bgGlowHover: 'group-hover:bg-indigo-500/15',
    progressGrad: 'from-indigo-500 to-indigo-400',
    activeTabDark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    activeTabLight: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    bannerGradDark: 'border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-indigo-500/10 via-white to-indigo-500/5',
    bannerGlow: 'bg-indigo-500/10',
    textLight: 'text-indigo-600'
  },
  'app-dev': {
    bgGrad: 'from-violet-500/10 via-slate-900 to-slate-950',
    accent: 'violet',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    bgPill: 'bg-violet-500/10',
    glow: 'theme-glow-violet',
    hoverCard: 'hover:border-violet-500/50 hover:bg-violet-500/[0.04] dark:hover:border-violet-500/50 dark:hover:bg-violet-500/[0.03] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    button: 'bg-violet-600 hover:bg-violet-500 text-violet-50 border-violet-500/30',
    checkbox: 'text-violet-500 focus:ring-violet-500/40 border-violet-500/30',
    badgeClass: 'badge-ml',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-violet-500/5',
    bgGlowHover: 'group-hover:bg-violet-500/15',
    progressGrad: 'from-violet-500 to-violet-400',
    activeTabDark: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    activeTabLight: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    bannerGradDark: 'border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-violet-500/10 via-white to-violet-500/5',
    bannerGlow: 'bg-violet-500/10',
    textLight: 'text-violet-600'
  },
  'ui-ux': {
    bgGrad: 'from-pink-500/10 via-slate-900 to-slate-950',
    accent: 'pink',
    text: 'text-pink-400',
    border: 'border-pink-500/20',
    bgPill: 'bg-pink-500/10',
    glow: 'theme-glow-pink',
    hoverCard: 'hover:border-pink-500/50 hover:bg-pink-500/[0.04] dark:hover:border-pink-500/50 dark:hover:bg-pink-500/[0.03] hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
    button: 'bg-pink-600 hover:bg-pink-500 text-pink-50 border-pink-500/30',
    checkbox: 'text-pink-500 focus:ring-pink-500/40 border-pink-500/30',
    badgeClass: 'badge-eval',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-pink-500/5',
    bgGlowHover: 'group-hover:bg-pink-500/15',
    progressGrad: 'from-pink-500 to-pink-400',
    activeTabDark: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    activeTabLight: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    bannerGradDark: 'border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-pink-500/10 via-white to-pink-500/5',
    bannerGlow: 'bg-pink-500/10',
    textLight: 'text-pink-600'
  },
  'ai-mastery': {
    bgGrad: 'from-rose-500/10 via-slate-900 to-slate-950',
    accent: 'rose',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    bgPill: 'bg-rose-500/10',
    glow: 'theme-glow-rose',
    hoverCard: 'hover:border-rose-500/50 hover:bg-rose-500/[0.04] dark:hover:border-rose-500/50 dark:hover:bg-rose-500/[0.03] hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    button: 'bg-rose-600 hover:bg-rose-500 text-rose-50 border-rose-500/30',
    checkbox: 'text-rose-500 focus:ring-rose-500/40 border-rose-500/30',
    badgeClass: 'badge-eval',
    // Statically declared literal styles to bypass dynamic Tailwind purging
    bgGlow: 'bg-rose-500/5',
    bgGlowHover: 'group-hover:bg-rose-500/15',
    progressGrad: 'from-rose-500 to-rose-400',
    activeTabDark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    activeTabLight: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    bannerGradDark: 'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-slate-900 to-slate-950',
    bannerGradLight: 'border-[#E4DFFF] bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5',
    bannerGlow: 'bg-rose-500/10',
    textLight: 'text-rose-600'
  }
};

// Unified Lucide Icon picker matching parser metadata
const RoadmapIcon = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'react':
      return <Lucide.Atom className={className} />;
    case 'brain':
      return <Lucide.Brain className={className} />;
    case 'globe':
      return <Lucide.Globe className={className} />;
    case 'smartphone':
      return <Lucide.Smartphone className={className} />;
    case 'palette':
      return <Lucide.Palette className={className} />;
    case 'sparkles':
      return <Lucide.Sparkles className={className} />;
    default:
      return <Lucide.BookOpen className={className} />;
  }
};

// Holographic 3D Interactive Antigravity Swirling Particle System
const AntigravityParticles = () => {
  const canvasRef = React.useRef(null);
  const mouseRef = React.useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D rotation utility
    const rotate3D = (v, rx, ry, rz) => {
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      let y1 = v.y * cosX - v.z * sinX;
      let z1 = v.y * sinX + v.z * cosX;
      let x1 = v.x;

      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      let x2 = x1 * cosY + z1 * sinY;
      let z2 = -x1 * sinY + z1 * cosY;
      let y2 = y1;

      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    // Shaded/Wireframe 3D Floating Shape Engine
    class Floating3DShape {
      constructor(type, baseX, baseY, baseZ, size, color) {
        this.type = type;
        this.baseX = baseX;
        this.baseY = baseY;
        this.baseZ = baseZ;
        this.size = size;
        this.h = color.h;
        this.s = color.s;
        this.l = color.l;

        this.rx = Math.random() * Math.PI * 2;
        this.ry = Math.random() * Math.PI * 2;
        this.rz = Math.random() * Math.PI * 2;

        this.drx = (0.003 + Math.random() * 0.004) * (Math.random() < 0.5 ? 1 : -1);
        this.dry = (0.003 + Math.random() * 0.004) * (Math.random() < 0.5 ? 1 : -1);
        this.drz = (0.003 + Math.random() * 0.004) * (Math.random() < 0.5 ? 1 : -1);

        this.driftTime = Math.random() * 1000;
        this.driftSpeed = 0.0015 + Math.random() * 0.002;

        this.vertices = [];
        this.faces = [];
        this.initGeometry();
      }

      initGeometry() {
        const s = this.size;
        if (this.type === 'cube') {
          this.vertices = [
            { x: -s, y: -s, z: -s },
            { x: s, y: -s, z: -s },
            { x: s, y: s, z: -s },
            { x: -s, y: s, z: -s },
            { x: -s, y: -s, z: s },
            { x: s, y: -s, z: s },
            { x: s, y: s, z: s },
            { x: -s, y: s, z: s }
          ];
          this.faces = [
            [0, 1, 2, 3], // Back
            [4, 5, 6, 7], // Front
            [0, 1, 5, 4], // Top
            [2, 3, 7, 6], // Bottom
            [0, 3, 7, 4], // Left
            [1, 2, 6, 5]  // Right
          ];
        } else if (this.type === 'octahedron') {
          const hSize = s * 1.35;
          this.vertices = [
            { x: 0, y: -hSize, z: 0 },
            { x: 0, y: hSize, z: 0 },
            { x: -s, y: 0, z: -s },
            { x: s, y: 0, z: -s },
            { x: s, y: 0, z: s },
            { x: -s, y: 0, z: s }
          ];
          this.faces = [
            [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
            [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]
          ];
        } else if (this.type === 'tetrahedron') {
          const hSize = s * 1.35;
          this.vertices = [
            { x: 0, y: -hSize, z: 0 },
            { x: -s, y: hSize, z: -s },
            { x: s, y: hSize, z: -s },
            { x: 0, y: hSize, z: s * 1.2 }
          ];
          this.faces = [
            [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]
          ];
        } else if (this.type === 'ring') {
          const ringRadius = s * 1.2;
          const segments = 12;
          for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            this.vertices.push({
              x: Math.cos(a) * ringRadius,
              y: -8,
              z: Math.sin(a) * ringRadius
            });
          }
          for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            this.vertices.push({
              x: Math.cos(a) * ringRadius,
              y: 8,
              z: Math.sin(a) * ringRadius
            });
          }
          this.faces = [];
          for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            this.faces.push([i, next, next + segments, i + segments]);
          }
        }
      }

      update(angleX, angleY, mouseX, mouseY, width, height) {
        this.rx += this.drx;
        this.ry += this.dry;
        this.rz += this.drz;

        this.driftTime += this.driftSpeed;
        const dxDrift = Math.sin(this.driftTime) * 15;
        const dyDrift = Math.cos(this.driftTime * 0.7) * 15;
        const dzDrift = Math.sin(this.driftTime * 0.4) * 8;

        const scaleFactor = width < 768 ? 0.35 : (width < 1024 ? 0.7 : 1.0);
        const shiftX = mouseX * 80;
        const shiftY = mouseY * 80;

        const worldX = (this.baseX * scaleFactor) + dxDrift + shiftX;
        const worldY = (this.baseY * scaleFactor) + dyDrift + shiftY;
        const worldZ = this.baseZ + dzDrift;

        const projected = this.vertices.map(v => {
          const rot = rotate3D(v, this.rx, this.ry, this.rz);
          const wx = rot.x + worldX;
          const wy = rot.y + worldY;
          const wz = rot.z + worldZ;

          const cosY = Math.cos(angleY);
          const sinY = Math.sin(angleY);
          let rx = wx * cosY - wz * sinY;
          let rz1 = wz * cosY + wx * sinY;

          const cosX = Math.cos(angleX);
          const sinX = Math.sin(angleX);
          let ry = wy * cosX - rz1 * sinX;
          let rz2 = rz1 * cosX + wy * sinX;

          const focalLength = 400;
          const scale = focalLength / (focalLength + rz2);

          const centerX = width / 2;
          const centerY = height / 2 - 20;

          return {
            x: centerX + rx * scale,
            y: centerY + ry * scale,
            z: rz2,
            scale: scale
          };
        });

        return projected;
      }
    }


    // 3D Neural Node (representing a neuron in AI space)
    class NeuralNode {
      constructor(idx) {
        this.idx = idx;
        this.reset();
      }

      reset() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = Math.random() * 320 + 80; // Spherical neural shell

        this.baseX = Math.sin(phi) * Math.cos(theta) * radius;
        this.baseY = Math.sin(phi) * Math.sin(theta) * radius;
        this.baseZ = Math.cos(phi) * radius;

        // Dynamic futuristic AI thematic colors based on spatial distribution
        if (Math.abs(this.baseX) < 130) {
          // Electric Deep Violet (AI thematic Core)
          this.h = 263;
          this.s = 90;
          this.l = 58;
        } else if (this.baseX > 0) {
          // Electric Sky Cyan (Interface & Connective themed)
          this.h = 199;
          this.s = 89;
          this.l = 52;
        } else {
          // Cyber Emerald Green (Deep Learning themed)
          this.h = 142;
          this.s = 75;
          this.l = 53;
        }

        this.size = Math.random() * 2.0 + 1.2;
        this.driftSpeed = 0.0008 + Math.random() * 0.0012;
        this.driftTime = Math.random() * 1000;
        this.glowIntensity = 0.0;
      }

      update(angleX, angleY, mouseX, mouseY, width, height) {
        this.driftTime += this.driftSpeed;
        const dxDrift = Math.sin(this.driftTime) * 12;
        const dyDrift = Math.cos(this.driftTime * 0.8) * 12;
        const dzDrift = Math.sin(this.driftTime * 0.5) * 6;

        const scaleFactor = width < 768 ? 0.35 : (width < 1024 ? 0.7 : 1.0);
        const shiftX = mouseX * 60;
        const shiftY = mouseY * 60;

        const worldX = (this.baseX * scaleFactor) + dxDrift + shiftX;
        const worldY = (this.baseY * scaleFactor) + dyDrift + shiftY;
        const worldZ = this.baseZ + dzDrift;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        let rx = worldX * cosY - worldZ * sinY;
        let rz1 = worldZ * cosY + worldX * sinY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let ry = worldY * cosX - rz1 * sinX;
        let rz2 = rz1 * cosX + worldY * sinX;

        const focalLength = 360;
        const scale = focalLength / (focalLength + rz2);

        const centerX = width / 2;
        const centerY = height / 2 - 20;

        this.screenX = centerX + rx * scale;
        this.screenY = centerY + ry * scale;
        this.projectedZ = rz2;
        this.scale = scale;

        // Clean radial fade-out zone behind central title headline
        const distFromCenter = Math.hypot(rx, ry);
        this.radialFade = distFromCenter < 160 ? (distFromCenter / 160) : 1.0;

        // Mouse hover active stimulus activation
        const dxMouse = this.screenX - (width / 2 + mouseX * 200);
        const dyMouse = this.screenY - (height / 2 + mouseY * 200);
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < 180) {
          this.glowIntensity += (1.0 - (distMouse / 180) - this.glowIntensity) * 0.08;
        } else {
          this.glowIntensity += (0.0 - this.glowIntensity) * 0.05;
        }
      }
    }

    // 3D AI Synaptic signal packet pulse
    class NeuralSignal {
      constructor(startNode, endNode, speed, color) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.progress = 0.0;
        this.speed = speed;
        this.h = color.h;
        this.s = color.s;
        this.l = color.l;
      }

      update() {
        this.progress += this.speed;
        return this.progress >= 1.0;
      }

      draw(ctx) {
        if (!this.startNode.screenX || !this.endNode.screenX) return;

        const x = this.startNode.screenX + (this.endNode.screenX - this.startNode.screenX) * this.progress;
        const y = this.startNode.screenY + (this.endNode.screenY - this.startNode.screenY) * this.progress;

        const scale = this.startNode.scale + (this.endNode.scale - this.startNode.scale) * this.progress;
        const fade = this.startNode.radialFade + (this.endNode.radialFade - this.startNode.radialFade) * this.progress;

        if (this.startNode.projectedZ > -300) {
          const alpha = Math.max(0.1, Math.min(1.0, scale * 0.85 * fade));

          ctx.beginPath();
          ctx.arc(x, y, Math.max(1.5, scale * 2.8), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.h}, ${this.s}%, ${this.l + 15}%, ${alpha})`;
          ctx.shadowBlur = Math.max(2, scale * 12);
          ctx.shadowColor = `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
          ctx.fill();

          // Outer signal halo aura
          ctx.beginPath();
          ctx.arc(x, y, Math.max(4, scale * 6), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.h}, ${this.s}%, ${this.l}%, ${alpha * 0.35})`;
          ctx.fill();

          ctx.shadowBlur = 0; // Reset
        }
      }
    }

    // Instantiating 3D Floating Mainframe Shapes
    const shapes = [
      new Floating3DShape('octahedron', -320, -140, 0, 32, { h: 142, s: 72, l: 55 }), // Emerald Green
      new Floating3DShape('cube', 340, 110, 50, 26, { h: 239, s: 84, l: 64 }), // Indigo
      new Floating3DShape('ring', -280, 150, -20, 24, { h: 199, s: 89, l: 50 }), // Sky Blue
      new Floating3DShape('tetrahedron', 300, -150, -30, 26, { h: 349, s: 89, l: 58 }) // Rose Pink
    ];

    const nodesCount = 75;
    const nodes = [];
    for (let i = 0; i < nodesCount; i++) {
      nodes.push(new NeuralNode(i));
    }

    const signals = [];

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 0.15;
      mouseRef.current.targetY = ((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 0.15;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let rotX = 0.05;
    let rotY = 0.05;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0; 

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const angleX = rotX + mouseRef.current.x;
      const angleY = rotY + mouseRef.current.y;
      
      rotY += 0.0006; 

      // 1. Update and Project all 3D Neural Nodes first
      nodes.forEach(node => {
        node.update(angleX, angleY, mouseRef.current.y, mouseRef.current.x, width, height);
      });

      // 2. Render interconnected synaptic connection paths (Painter's Algorithm depth sorted)
      const connectionsCount = [];
      const threshold = 145; // Max 3D distance to draw link

      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];

          const dx = nodeA.baseX - nodeB.baseX;
          const dy = nodeA.baseY - nodeB.baseY;
          const dz = nodeA.baseZ - nodeB.baseZ;
          const dist3D = Math.hypot(dx, dy, dz);

          if (dist3D < threshold) {
            const avgScale = (nodeA.scale + nodeB.scale) / 2;
            const avgFade = (nodeA.radialFade + nodeB.radialFade) / 2;
            const avgGlow = (nodeA.glowIntensity + nodeB.glowIntensity) / 2;

            const alphaBase = (1.0 - (dist3D / threshold));
            const alpha = Math.max(0.01, Math.min(0.7, avgScale * 0.28 * alphaBase * avgFade + avgGlow * 0.35));

            if (alpha > 0.02) {
              ctx.beginPath();
              ctx.moveTo(nodeA.screenX, nodeA.screenY);
              ctx.lineTo(nodeB.screenX, nodeB.screenY);

              ctx.strokeStyle = `hsla(${nodeA.h}, ${nodeA.s}%, ${nodeA.l}%, ${alpha})`;
              ctx.lineWidth = Math.max(0.3, avgScale * 0.9 * (1.0 + avgGlow * 1.5));
              ctx.stroke();

              connectionsCount.push({ a: nodeA, b: nodeB });
            }
          }
        }
      }

      // 3. Electrical AI processing pulse spawner
      if (Math.random() < 0.05 && connectionsCount.length > 0 && signals.length < 28) {
        const conn = connectionsCount[Math.floor(Math.random() * connectionsCount.length)];
        const speed = 0.008 + Math.random() * 0.014;
        const sigColor = Math.random() < 0.5 ? { h: conn.a.h, s: conn.a.s, l: conn.a.l } : { h: conn.b.h, s: conn.b.s, l: conn.b.l };
        signals.push(new NeuralSignal(conn.a, conn.b, speed, sigColor));
      }

      // Update and draw active neural signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        const isDone = sig.update();
        if (isDone) {
          signals.splice(i, 1);
        } else {
          sig.draw(ctx);
        }
      }

      // 4. Draw Neural Node Core neurons
      nodes.forEach(node => {
        if (node.projectedZ > -300) {
          const alpha = Math.max(0.04, Math.min(0.9, node.scale * 0.65 * node.radialFade + node.glowIntensity * 0.35));

          ctx.beginPath();
          ctx.arc(node.screenX, node.screenY, Math.max(1, node.size * node.scale * (1.0 + node.glowIntensity * 0.8)), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${node.h}, ${node.s}%, ${node.l + (node.glowIntensity * 15)}%, ${alpha})`;
          ctx.fill();

          // Stimulated node aura ripple
          if (node.glowIntensity > 0.05) {
            ctx.beginPath();
            ctx.arc(node.screenX, node.screenY, Math.max(3, node.size * node.scale * (1.6 + node.glowIntensity * 1.5)), 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${node.h}, ${node.s}%, ${node.l}%, ${node.glowIntensity * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Reset shadow for main mainframe shapes
      ctx.shadowBlur = 0;

      // 5. Project, sort, and render 3D Shaded Glass mainframe shapes
      const renderables = [];

      shapes.forEach(shape => {
        const projected = shape.update(angleX, angleY, mouseRef.current.y, mouseRef.current.x, width, height);
        
        shape.faces.forEach(face => {
          let avgZ = 0;
          face.forEach(idx => {
            avgZ += projected[idx].z;
          });
          avgZ /= face.length;

          renderables.push({
            type: 'face',
            avgZ: avgZ,
            projectedPoints: face.map(idx => projected[idx]),
            h: shape.h,
            s: shape.s,
            l: shape.l
          });
        });
      });

      // Painter's algorithm: draw furthest faces first
      renderables.sort((a, b) => b.avgZ - a.avgZ);

      renderables.forEach(item => {
        ctx.beginPath();
        ctx.moveTo(item.projectedPoints[0].x, item.projectedPoints[0].y);
        for (let i = 1; i < item.projectedPoints.length; i++) {
          ctx.lineTo(item.projectedPoints[i].x, item.projectedPoints[i].y);
        }
        ctx.closePath();

        const scale = item.projectedPoints[0].scale;
        const fillAlpha = Math.max(0.02, Math.min(0.12, scale * 0.08));
        const strokeAlpha = Math.max(0.08, Math.min(0.35, scale * 0.28));

        // Specular Gradient Shading across face bounding box for premium holographic glass reflection shine!
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        item.projectedPoints.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });

        const grad = ctx.createLinearGradient(minX, minY, maxX, maxY);
        grad.addColorStop(0, `hsla(${item.h}, ${item.s}%, ${item.l}%, ${fillAlpha * 1.8})`);
        grad.addColorStop(0.45, `hsla(${item.h}, ${item.s}%, ${item.l}%, ${fillAlpha * 0.7})`);
        grad.addColorStop(0.5, `hsla(0, 0%, 100%, ${fillAlpha * 2.2})`); // specula glass reflection line
        grad.addColorStop(0.55, `hsla(${item.h}, ${item.s}%, ${item.l}%, ${fillAlpha * 0.7})`);
        grad.addColorStop(1, `hsla(${item.h}, ${item.s}%, ${item.l}%, ${fillAlpha * 0.4})`);

        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing facets outline with reduced shadowBlur overhead for absolute vector crispness
        ctx.strokeStyle = `hsla(${item.h}, ${item.s}%, ${item.l}%, ${strokeAlpha})`;
        ctx.lineWidth = Math.max(0.5, scale * 1.1);
        ctx.shadowBlur = Math.max(1, scale * 4);
        ctx.shadowColor = `hsl(${item.h}, ${item.s}%, ${item.l}%)`;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75"
    />
  );
};

const tabGlowClasses = {
  'ml-3month': 'tab-glow-ml',
  'web-dev': 'tab-glow-web',
  'app-dev': 'tab-glow-app',
  'react-simple': 'tab-glow-react',
  'ui-ux': 'tab-glow-ui',
  'ai-mastery': 'tab-glow-ai'
};

export default function App() {
  // --- 1. Strict Roadmap Sorting Configuration ---
  const roadmapOrder = [
    'ml-3month',
    'web-dev',
    'app-dev',
    'react-simple',
    'ui-ux',
    'ai-mastery'
  ];

  // Enforce sorted array of roadmaps dynamically
  const sortedRoadmaps = [...roadmapsData].sort((a, b) => {
    return roadmapOrder.indexOf(a.id) - roadmapOrder.indexOf(b.id);
  });

  // --- 2. Persistent React States & Firebase State ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => {
    // Instantly bypass full screen Initializing Hub loader for guest users
    return localStorage.getItem('devacademia_has_session') === 'true';
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Instantly start in dashboard if user has an active session to avoid landing page flash
    return localStorage.getItem('devacademia_has_session') === 'true' ? 'dashboard' : 'landing';
  });
  const [lanyardState, setLanyardState] = useState('hidden'); // 'hidden' | 'hanging' | 'falling'

  const toggleLanyard = () => {
    setLanyardState(prev => {
      if (prev === 'hidden') return 'hanging';
      if (prev === 'hanging') return 'falling';
      return 'hidden';
    });
  };

  // Auth Form Input States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  // Day/Night Theme Toggles
  const [isLightMode, setIsLightMode] = useState(false);

  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('unified_roadmaps_progress');
    return saved ? JSON.parse(saved) : {};
  });

  // Track completedTasks in a ref to bypass stale closures inside Firebase Auth Observer
  const completedTasksRef = React.useRef(completedTasks);
  useEffect(() => {
    completedTasksRef.current = completedTasks;
  }, [completedTasks]);

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [openWeeks, setOpenWeeks] = useState({}); // React Simple accordion states
  const [activeNotification, setActiveNotification] = useState(null);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto-sync completed tasks to Local Storage (Fixed sync protection loop)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('unified_roadmaps_progress', JSON.stringify(completedTasks));
    }
  }, [completedTasks, isHydrated]);

  // Clean trigger helper for custom premium alert indicators
  const triggerNotification = (text, type = 'success') => {
    setActiveNotification({ text, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Reset tab index on course transition
  useEffect(() => {
    setActiveTabIdx(0);
    setIsSidebarOpen(false); // Auto close sidebar on selection
  }, [activeRoadmapId]);

  // --- 3. FIXED: Bulletproof Auth State Observer & Firestore Sync ---
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isMounted) {
        setIsHydrated(false); // ALWAYS immediately lock out hydration during auth transitions
        setUser(currentUser);
      }

      if (currentUser) {
        if (isMounted) {
          localStorage.setItem('devacademia_has_session', 'true');
          setAuthLoading(true); // Always force full-screen loader during database lookup
        }
        try {
          const userDocRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
          
          // Fetch remote progress directly without any timeout or Promise.race
          const userDoc = await getDoc(userDocRef);
          
          let finalProgress = {};
          if (userDoc.exists() && userDoc.data().completedTasks) {
            const cloudProgress = userDoc.data().completedTasks;
            
            // Premium Merge Policy: Automatically merge live in-memory progress with cloud progress to preserve work
            const localProgress = completedTasksRef.current;
            finalProgress = { ...localProgress, ...cloudProgress };
            
            // Back up the merged dataset back to the cloud in the background if there was new local progress
            if (Object.keys(localProgress).length > 0) {
              setDoc(userDocRef, { completedTasks: finalProgress }, { merge: true }).catch(err => {
                console.error("Firestore background sync error:", err);
              });
            }
          } else {
            // New cloud account: Safe sync from live memory cache if data exists
            const localProgress = completedTasksRef.current;
            finalProgress = localProgress;
            if (Object.keys(finalProgress).length > 0) {
              setDoc(userDocRef, { completedTasks: finalProgress }, { merge: true }).catch(err => {
                console.error("Firestore background sync error:", err);
              });
            }
          }
          
          if (isMounted) {
            setCompletedTasks(finalProgress);
            localStorage.setItem('unified_roadmaps_progress', JSON.stringify(finalProgress));
          }
        } catch (err) {
          console.warn("Firestore initialization sync failed. Falling back to local progress.", err);
          const localProgress = completedTasksRef.current;
          if (isMounted) {
            setCompletedTasks(localProgress);
          }
        } finally {
          if (isMounted) {
            setIsHydrated(true);
            setViewMode('dashboard');
            setAuthLoading(false);
          }
        }
      } else {
        if (isMounted) {
          localStorage.setItem('devacademia_has_session', 'false');
          setCompletedTasks({});
          localStorage.removeItem('unified_roadmaps_progress');
          setViewMode('landing');
          setAuthLoading(false);
          setIsHydrated(true); // Guest is instantly hydrated since there is no remote database to load
        }
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- 4. Firebase Authentication Submit Handler ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccess('Sign in successful! Entering hub...');
        setTimeout(() => {
          setShowAuthModal(false);
          setEmail('');
          setPassword('');
          setAuthSuccess(null);
          setViewMode('dashboard');
        }, 1200);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setAuthSuccess('Account created successfully! Sync active.');
        setTimeout(() => {
          setShowAuthModal(false);
          setEmail('');
          setPassword('');
          setAuthSuccess(null);
          setViewMode('dashboard');
        }, 1200);
      }
    } catch (err) {
      let msg = err.message;
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        msg = 'Invalid credentials. Please verify your email and password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please Sign In.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters long.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
    }
  };

  // --- 5. FIXED: Safe Sign Out Handler ---
  const handleSignOut = async () => {
    try {
      setIsHydrated(false);
      setAuthLoading(true); // Trigger full-screen loader immediately for seamless guest transition
      // Clean memory parameters cleanly before actual signOut to prevent transient state updates
      setCompletedTasks({});
      localStorage.removeItem('unified_roadmaps_progress');
      localStorage.setItem('devacademia_has_session', 'false');
      await signOut(auth);
      
      setViewMode('landing');
      triggerNotification('Signed out successfully! Session cleared.', 'info');
    } catch (err) {
      triggerNotification('Failed to sign out. Please try again.', 'error');
    }
  };

  // --- 6. Helper Dynamic Theme Selector Helper ---
  const themeClass = (darkClass, lightClass) => {
    return isLightMode ? lightClass : darkClass;
  };

  // --- 7. Analytics & Math Statistics ---

  // Pre-calculate completion parameters for all courses in a stable memoized map
  const courseStatsMap = React.useMemo(() => {
    const map = {};
    sortedRoadmaps.forEach(r => {
      let total = 0;
      let completed = 0;
      r.tabs.forEach(tab => {
        tab.phases.forEach(phase => {
          phase.sections.forEach(section => {
            section.days.forEach(day => {
              total++;
              if (completedTasks[day.id]) {
                completed++;
              }
            });
          });
        });
      });
      map[r.id] = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
    return map;
  }, [completedTasks, sortedRoadmaps]);

  // Calculate completion parameters for a given course using the pre-calculated map
  const getCourseStats = (roadmap) => {
    if (!roadmap) return { total: 0, completed: 0, percentage: 0 };
    return courseStatsMap[roadmap.id] || { total: 0, completed: 0, percentage: 0 };
  };

  // Calculate user streak based on consecutive completion dates
  const calculateStreak = () => {
    const dates = Array.from(new Set(Object.values(completedTasks)))
      .filter(Boolean)
      .map(d => d.split('T')[0])
      .sort((a, b) => new Date(b) - new Date(a));

    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let streak = 0;
    let expectedDate = dates[0] === todayStr ? todayStr : (dates[0] === yesterdayStr ? yesterdayStr : null);

    if (!expectedDate) return 0;

    let testDate = new Date(expectedDate);

    while (true) {
      const testDateStr = testDate.toISOString().split('T')[0];
      if (dates.includes(testDateStr)) {
        streak++;
        testDate.setDate(testDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // --- 8. Heatmap Data Compilation (Sunday-to-Saturday columns, 53 weeks) ---
  const generateHeatmapData = () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364); // EXACTLY 365 Days ago

    // Fetch day index (0 = Sun, 1 = Mon) and align back to Sun to balance columns
    const dayOfWeek = startDate.getDay();
    const tempDate = new Date(startDate);
    tempDate.setDate(tempDate.getDate() - dayOfWeek);

    const totalCells = 53 * 7;
    const dateCounts = {};
    Object.values(completedTasks).forEach(dateTime => {
      if (dateTime) {
        const d = dateTime.split('T')[0];
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
    });

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const curDate = new Date(tempDate);
      curDate.setDate(tempDate.getDate() + i);
      const dateStr = curDate.toISOString().split('T')[0];

      const isOutRange = curDate < startDate || curDate > today;

      cells.push({
        date: dateStr,
        count: isOutRange ? 0 : (dateCounts[dateStr] || 0),
        isOutRange,
        dayName: curDate.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }

    // Slice into columns of 7 elements
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  const heatmapWeeks = generateHeatmapData();

  // Find which specific tasks were completed on a select date
  const getTasksOnDate = (dateStr) => {
    const list = [];
    sortedRoadmaps.forEach(r => {
      r.tabs.forEach(tab => {
        tab.phases.forEach(phase => {
          phase.sections.forEach(section => {
            section.days.forEach(day => {
              if (completedTasks[day.id] && completedTasks[day.id].split('T')[0] === dateStr) {
                list.push({
                  courseTitle: r.title.replace(/🚀/g, '').trim(),
                  taskTitle: day.taskTitle,
                  dayLabel: day.dayLabel,
                  roadmapId: r.id
                });
              }
            });
          });
        });
      });
    });
    return list;
  };

  // --- 9. Interactive State Actions ---

  // Toggle checkbox state (saves precise timestamp to capture calendar date)
  const toggleTask = async (taskId) => {
    const nextCompleted = { ...completedTasks };
    if (nextCompleted[taskId]) {
      delete nextCompleted[taskId];
      triggerNotification('Task marked as uncompleted', 'info');
    } else {
      nextCompleted[taskId] = new Date().toISOString();
      triggerNotification('Task completed! Heatmap updated.');
    }
    
    setCompletedTasks(nextCompleted);
    localStorage.setItem('unified_roadmaps_progress', JSON.stringify(nextCompleted));

    // Sync in background to Firestore if logged in and fully hydrated
    if (auth.currentUser && isHydrated) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid, 'progress', 'data');
        await setDoc(userDocRef, { completedTasks: nextCompleted }, { merge: true });
      } catch (err) {
        console.error("Firestore progress sync error:", err);
      }
    }
  };

  // Toggles React Simple weeks accordion cards
  const toggleWeek = (weekId) => {
    setOpenWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  // --- 10. Backup Synchronization (JSON Export/Import) ---

  // Export current roadmap completion JSON
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completedTasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `devacademia-progress-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerNotification('Progress backup file exported successfully!');
    } catch (e) {
      triggerNotification('Export failed. Please try again.', 'error');
    }
  };

  // Import completion JSON records
  const handleImportData = (event) => {
    const fileReader = new FileReader();
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    fileReader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Simple sanity check on JSON structure
        if (typeof imported !== 'object' || Array.isArray(imported)) {
          throw new Error("Invalid structure format");
        }

        // Validate values are date stamps
        Object.keys(imported).forEach(k => {
          if (typeof imported[k] !== 'string') {
            throw new Error("Invalid entry values");
          }
        });

        setCompletedTasks(imported);
        triggerNotification('Progress restored! Analytics recalculated.');

        // Sync to cloud if authenticated
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid, 'progress', 'data');
          await setDoc(userDocRef, { completedTasks: imported }, { merge: true });
        }
      } catch (err) {
        triggerNotification('Failed to import file. Make sure file format matches expected export.', 'error');
      }
    };
    fileReader.readAsText(uploadedFile);
  };

  // Wipes all user roadmap completions
  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to wipe ALL your progress? This action is permanent and cannot be undone unless you have an exported backup JSON file!")) {
      setCompletedTasks({});
      localStorage.removeItem('unified_roadmaps_progress');
      triggerNotification('All progress records wiped.', 'info');

      if (auth.currentUser && isHydrated) {
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid, 'progress', 'data');
          await setDoc(userDocRef, { completedTasks: {} }, { merge: true });
        } catch (err) {
          console.error("Firestore progress reset error:", err);
        }
      }
    }
  };

  // --- 11. Helper styling generators ---
  const activeRoadmap = sortedRoadmaps.find(r => r.id === activeRoadmapId);
  const theme = activeRoadmap ? themes[activeRoadmap.id] : null;

  // Filter roadmaps based on search queries
  const filteredRoadmaps = sortedRoadmaps.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Memoize global completion stats across all pathways
  const globalStats = React.useMemo(() => {
    let grandTotal = 0;
    let grandCompleted = 0;
    sortedRoadmaps.forEach(r => {
      const stats = getCourseStats(r);
      grandTotal += stats.total;
      grandCompleted += stats.completed;
    });
    return {
      total: grandTotal,
      completed: grandCompleted,
      percentage: grandTotal > 0 ? Math.round((grandCompleted / grandTotal) * 100) : 0
    };
  }, [courseStatsMap]);

  // Memoize user streak to avoid redundant calculations
  const streak = React.useMemo(() => {
    return calculateStreak();
  }, [completedTasks]);

  if (authLoading) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center ${themeClass('bg-[#070b13] text-slate-100', 'bg-[#f7f5ff] text-[#1A1033] light-theme')} transition-colors duration-300 font-sans`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-spin">
            <Lucide.Sparkles className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h3 className="font-extrabold text-xs tracking-widest uppercase text-slate-500 animate-pulse">Initializing Hub...</h3>
        </div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <div className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden ${themeClass('bg-[#070b13] text-slate-100', 'bg-[#f7f5ff] text-[#1A1033] light-theme')} transition-colors duration-300 font-sans`}>
        {/* Neon Grid Layer */}
        <div className="neon-grid"></div>

        {/* 3D Cosmic Swirling Antigravity Swarm */}
        <AntigravityParticles />

        {/* Zero-Gravity Floating Cosmic Shapes & Neon Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Ambient wide glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0"></div>

          {/* Floating Neon Torus Rings rotating in 3D */}
          <div className="absolute top-[15%] left-[8%] w-16 h-16 rounded-full border border-indigo-500/25 border-dashed animate-tumble-3d" style={{ transformStyle: 'preserve-3d' }}></div>
          <div className="absolute bottom-[25%] left-[45%] w-24 h-24 rounded-full border-2 border-emerald-500/10 border-double animate-tumble-3d" style={{ animationDelay: '-5s', transformStyle: 'preserve-3d' }}></div>
          <div className="absolute top-[35%] right-[12%] w-14 h-14 rounded-full border border-rose-500/20 animate-tumble-3d" style={{ animationDelay: '-10s', transformStyle: 'preserve-3d' }}></div>

          {/* Floating Stellar Glowing Orbs */}
          <div className="absolute top-[25%] left-[25%] w-4 h-4 rounded-full bg-emerald-500/20 blur-[2px] animate-drift-cosmic"></div>
          <div className="absolute bottom-[35%] left-[15%] w-3 h-3 rounded-full bg-indigo-500/30 blur-[1px] animate-drift-cosmic" style={{ animationDelay: '-3s' }}></div>
          <div className="absolute top-[50%] left-[38%] w-5 h-5 rounded-full bg-violet-500/20 blur-[3px] animate-drift-cosmic" style={{ animationDelay: '-7s' }}></div>
          <div className="absolute top-[12%] right-[32%] w-3 h-3 rounded-full bg-sky-500/20 blur-[1px] animate-drift-cosmic" style={{ animationDelay: '-12s' }}></div>
          <div className="absolute bottom-[18%] right-[22%] w-6 h-6 rounded-full bg-pink-500/25 blur-[4px] animate-drift-cosmic" style={{ animationDelay: '-16s' }}></div>
          <div className="absolute top-[58%] right-[48%] w-4 h-4 rounded-full bg-rose-500/25 blur-[2px] animate-drift-cosmic" style={{ animationDelay: '-20s' }}></div>
        </div>

        {/* Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Lucide.Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className={`font-extrabold text-xl tracking-tight ${themeClass('bg-gradient-to-r from-white via-slate-200 to-slate-400', 'bg-gradient-to-r from-[#1A1033] to-[#7C5CFC]')} bg-clip-text text-transparent`}>DevAcademia</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Unified Tech Paths</p>
            </div>
          </div>

          {/* Theme Mode Toggle Button */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${themeClass('bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033] shadow-sm')}`}
            title="Toggle Theme"
          >
            {isLightMode ? <Lucide.Moon className="w-4 h-4" /> : <Lucide.Sun className="w-4 h-4" />}
          </button>
        </header>

        {/* Main Cover Landing Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 z-10 py-12">
          {/* Left side: Copy */}
          <div className="flex-1 space-y-6 text-left max-w-xl">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${themeClass('bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 'bg-emerald-100 text-emerald-700 border-emerald-300')}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              COURSES ROADMAP TRACKER ACTIVE
            </span>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Master Your Structured <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Tech Skill Pathways
              </span>
            </h2>

            <p className={`text-sm leading-relaxed ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>
              DevAcademia unifies 6 distinct premium technical roadmap trees—from Machine Learning to Full-Stack Web Development—into a cohesive, interactive learning hub. Track your daily progress with custom checks and watch your activity heatmap thrive.
            </p>

            {/* Futuristic Rounded Hexagonal Course Capsules */}
            <div className="flex flex-wrap gap-x-4 gap-y-3 pt-2">
              {[
                { name: 'Machine Learning', icon: <Lucide.Brain className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />, accent: 'emerald', textClass: 'text-emerald-400', borderStyle: 'bg-emerald-500/20 group-hover:bg-emerald-500/50', innerStyle: 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 hex-glow-emerald', lightBorder: 'bg-emerald-200 group-hover:bg-emerald-400', lightInner: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-300' },
                { name: 'Full-Stack Web', icon: <Lucide.Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-500" />, accent: 'indigo', textClass: 'text-indigo-400', borderStyle: 'bg-indigo-500/20 group-hover:bg-indigo-500/50', innerStyle: 'bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 hex-glow-indigo', lightBorder: 'bg-indigo-200 group-hover:bg-indigo-400', lightInner: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border-indigo-300' },
                { name: 'App Development', icon: <Lucide.Smartphone className="w-4 h-4 text-violet-400 group-hover:-translate-y-0.5 transition-transform" />, accent: 'violet', textClass: 'text-violet-400', borderStyle: 'bg-violet-500/20 group-hover:bg-violet-500/50', innerStyle: 'bg-violet-950/20 hover:bg-violet-950/40 text-violet-300 hex-glow-violet', lightBorder: 'bg-violet-200 group-hover:bg-violet-400', lightInner: 'bg-violet-50 text-violet-700 hover:bg-violet-100/80 border-violet-300' },
                { name: 'React.js', icon: <Lucide.Atom className="w-4 h-4 text-sky-400 group-hover:animate-spin-slow" />, accent: 'sky', textClass: 'text-sky-400', borderStyle: 'bg-sky-500/20 group-hover:bg-sky-500/50', innerStyle: 'bg-sky-950/20 hover:bg-sky-950/40 text-sky-300 hex-glow-sky', lightBorder: 'bg-sky-200 group-hover:bg-sky-400', lightInner: 'bg-sky-50 text-sky-700 hover:bg-sky-100/80 border-sky-300' },
                { name: 'UI/UX Design', icon: <Lucide.Palette className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />, accent: 'pink', textClass: 'text-pink-400', borderStyle: 'bg-pink-500/20 group-hover:bg-pink-500/50', innerStyle: 'bg-pink-950/20 hover:bg-pink-950/40 text-pink-300 hex-glow-pink', lightBorder: 'bg-pink-200 group-hover:bg-pink-400', lightInner: 'bg-pink-50 text-pink-700 hover:bg-pink-100/80 border-pink-300' },
                { name: 'AI & Prompts', icon: <Lucide.Sparkles className="w-4 h-4 text-rose-400 group-hover:animate-bounce-subtle" />, accent: 'rose', textClass: 'text-rose-400', borderStyle: 'bg-rose-500/20 group-hover:bg-rose-500/50', innerStyle: 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hex-glow-rose', lightBorder: 'bg-rose-200 group-hover:bg-rose-400', lightInner: 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border-rose-300' }
              ].map((pill, idx) => (
                <div
                  key={idx}
                  className={`group relative p-[1px] hex-capsule transition-all duration-300 cursor-pointer transform hover:scale-[1.06] ${themeClass(pill.borderStyle, pill.lightBorder)}`}
                >
                  <div
                    className={`hex-capsule px-4 py-2 text-xs font-bold flex items-center gap-2 ${themeClass(pill.innerStyle, pill.lightInner)}`}
                  >
                    {pill.icon}
                    <span className={themeClass('text-slate-300 group-hover:text-white', 'text-slate-700 group-hover:text-[#1A1033]')}>{pill.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Enter Hub CTA */}
            <div className="pt-4 flex flex-wrap gap-4">
              {user ? (
                <button
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-slate-950 font-bold bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-[1.02]"
                >
                  <span>Enter Workspace Hub</span>
                  <Lucide.ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-slate-950 font-bold bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-[1.02]"
                  >
                    <span>Enter Hub & Sync</span>
                    <Lucide.LogIn className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold border transition-all hover:scale-[1.02] ${themeClass('bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033] hover:bg-[#F4F0FF]/50 shadow-sm')}`}
                  >
                    <span>Continue as Guest</span>
                    <Lucide.UserCheck className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Mockup / Feature Showcase with 3D Tilt and float */}
          <div className="flex-1 w-full max-w-md relative card-perspective animate-float-subtle">
            <div className={`rounded-2xl border p-6 space-y-4 shadow-2xl card-tilt-hover transition-all duration-300 ${themeClass('bg-slate-900/80 border-slate-800/80', 'bg-white border-[#E4DFFF] light-card-shadow')}`}>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">DEVACADEMIA HUB PREVIEW</span>
              </div>

              {/* Feature previews */}
              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${themeClass('bg-slate-950/60 border-slate-800/60', 'bg-[#F4F0FF]/40 border-[#E4DFFF]')}`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Lucide.Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Account-Based Cloud Sync</h5>
                    <p className="text-[10px] text-slate-500">Sync all your checked lessons securely with Firestore DB.</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${themeClass('bg-slate-950/60 border-slate-800/60', 'bg-[#F4F0FF]/40 border-[#E4DFFF]')}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <Lucide.Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Activity Contribution Tracker</h5>
                    <p className="text-[10px] text-slate-500">Log learning habits in real-time on a GitHub-style grid.</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${themeClass('bg-slate-950/60 border-slate-800/60', 'bg-[#F4F0FF]/40 border-[#E4DFFF]')}`}>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Lucide.Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Strict Sorted Curriculums</h5>
                    <p className="text-[10px] text-slate-500">6 industry-aligned pathways sorted in precise learning logic.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/20 flex flex-col sm:flex-row justify-between items-center gap-4 z-[10000]">
          <p className="text-xs text-slate-500">© 2026 DevAcademia. Built for high-end developers.</p>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 select-none">
            <span>Crafted by</span>
            <span className="cursor-pointer hover:scale-105 transition-transform inline-flex items-center gap-2 relative group" onClick={toggleLanyard}>
              <span className="font-bold dev-glow-text text-sm">Moheuddin Sikder Saikat</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold tracking-wide whitespace-nowrap animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.15)] select-none">
                <Lucide.MousePointerClick className="w-3 h-3" />
                Click to connect
              </span>
            </span>
          </div>
        </footer>

        {/* SIGN IN / SIGN UP GLASSMORPHIC POPUP MODAL OVERLAY */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl border p-8 space-y-6 relative shadow-2xl border-slate-800/80 transition-all duration-300 ${themeClass('bg-[#0c1220] bg-gradient-to-tr from-[#070b13] to-[#0c1220]', 'bg-white border-[#E4DFFF]')}`}>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`absolute top-4 right-4 p-1 rounded-lg border transition-all ${themeClass('bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
              >
                <Lucide.X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-extrabold tracking-tight">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className={`text-xs ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>
                  {authMode === 'signin'
                    ? 'Sign in to restore your progress and sync with Firestore.'
                    : 'Create an account to keep your roadmaps progress preserved.'
                  }
                </p>
              </div>

              {/* Error / Success Notifications */}
              {authError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex gap-2 items-center">
                  <Lucide.AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex gap-2 items-center">
                  <Lucide.CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Auth Input Fields */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Lucide.Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs font-semibold placeholder-slate-500 focus:outline-none transition-all ${themeClass('bg-slate-950/80 border-slate-800 text-slate-200 focus:border-emerald-500/50', 'bg-slate-50 border-[#E4DFFF] text-[#1A1033] focus:border-[#7C5CFC]')}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lucide.Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs font-semibold placeholder-slate-500 focus:outline-none transition-all ${themeClass('bg-slate-950/80 border-slate-800 text-slate-200 focus:border-emerald-500/50', 'bg-slate-50 border-[#E4DFFF] text-[#1A1033] focus:border-[#7C5CFC]')}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-slate-950 font-bold bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <span>{authMode === 'signin' ? 'Sign In Now' : 'Sign Up & Create'}</span>
                  <Lucide.ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Modal Switcher Footer */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setAuthError(null);
                  }}
                  className={`text-xs font-semibold hover:underline ${themeClass('text-slate-400 hover:text-white', 'text-[#5B5180] hover:text-[#1A1033]')}`}
                >
                  {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>
        )}
        {lanyardState !== 'hidden' && (
          <React.Suspense fallback={null}>
            <Lanyard
              isFalling={lanyardState === 'falling'}
              onClose={() => setLanyardState('hidden')}
            />
          </React.Suspense>
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${themeClass('bg-[#070b13] text-slate-100', 'bg-[#f7f5ff] text-[#1A1033] light-theme')} font-sans transition-colors duration-300`}>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-25 md:hidden animate-fade-in"
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside className={`fixed md:relative inset-y-0 left-0 ${isSidebarCollapsed ? 'md:w-20 w-72' : 'w-72'} border-r flex flex-col justify-between z-30 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${themeClass('bg-[#0c1220] border-slate-800/60', 'bg-[#ffffff] border-[#E4DFFF]')}`}>

        {/* Branding & Logo */}
        <div>
          <div className={`p-5 flex items-center justify-between border-b ${themeClass('border-slate-800/40', 'border-[#E4DFFF]')}`}>
            <div className="flex items-center gap-3">
              <div 
                onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0 ${isSidebarCollapsed ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
              >
                <Lucide.Sparkles className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className={`font-extrabold text-lg tracking-tight ${themeClass('bg-gradient-to-r from-white via-slate-200 to-slate-400', 'bg-gradient-to-r from-[#1A1033] to-[#7C5CFC]')} bg-clip-text text-transparent`}>DevAcademia</h1>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unified Paths</p>
                </div>
              )}
            </div>
            
            {/* Desktop Collapse Trigger (Only visible on desktop) */}
            {!isSidebarCollapsed ? (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className={`hidden md:block p-1.5 rounded-lg border transition-all ${themeClass('bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white', 'bg-slate-50 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
                title="Collapse Sidebar"
              >
                <Lucide.ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className={`hidden md:block p-1.5 rounded-lg border transition-all mx-auto ${themeClass('bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white', 'bg-slate-50 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
                title="Expand Sidebar"
              >
                <Lucide.ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`md:hidden p-1.5 rounded-lg border transition-all ${themeClass('bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white', 'bg-white border-[#E4DFFF] text-[#5B5180]')}`}
            >
              <Lucide.X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-360px)]">
            <button
              onClick={() => setActiveRoadmapId(null)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} rounded-xl transition-all duration-200 group border ${activeRoadmapId === null
                  ? themeClass('bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border border-emerald-500/20', 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600')
                  : themeClass('text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent', 'text-[#5B5180] hover:text-[#1A1033] hover:bg-[#F4F0FF]/50 border-transparent')
                }`}
              title={isSidebarCollapsed ? "Central Hub" : undefined}
            >
              <div className="flex items-center gap-3">
                <Lucide.LayoutDashboard className="w-5 h-5" />
                {!isSidebarCollapsed && <span className="font-semibold text-sm">Central Hub</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${themeClass('bg-slate-800/80 text-slate-400 group-hover:bg-slate-800', 'bg-slate-100 text-[#5B5180] group-hover:bg-slate-200')}`}>
                  {globalStats.completed}/{globalStats.total}
                </span>
              )}
            </button>

            {!isSidebarCollapsed ? (
              <div className="pt-4 pb-2 px-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AVAILABLE ROADMAPS</p>
              </div>
            ) : (
              <div className="my-3 border-t border-slate-800/20 mx-3"></div>
            )}

            {sortedRoadmaps.map(r => {
              const rTheme = themes[r.id];
              const isActive = activeRoadmapId === r.id;
              const stats = getCourseStats(r);
              const hoverGlowClass = tabGlowClasses[r.id] || '';
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRoadmapId(r.id)}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-4 py-3'} rounded-xl transition-all duration-200 group border ${isActive
                      ? themeClass(rTheme.activeTabDark, rTheme.activeTabLight)
                      : themeClass(`text-slate-400 hover:text-slate-200 ${hoverGlowClass} border-transparent`, `text-[#5B5180] hover:text-[#1A1033] ${hoverGlowClass} border-transparent`)
                    }`}
                  title={isSidebarCollapsed ? r.title.replace(/🚀/g, '').trim() : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <RoadmapIcon name={r.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? rTheme.text : themeClass('text-slate-500', 'text-slate-400')}`} />
                    {!isSidebarCollapsed && <span className="font-medium text-sm truncate">{r.title.replace(/🚀/g, '').trim()}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isActive ? `${rTheme.bgPill} ${rTheme.text}` : themeClass('bg-slate-800 text-slate-500', 'bg-slate-100 text-slate-400')
                      }`}>
                      {stats.percentage}%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer containing Developer Card & Sync Controls */}
        <div className={`p-3 border-t space-y-3 transition-colors duration-300 ${themeClass('border-slate-800/60 bg-[#090e1a]/80', 'border-[#E4DFFF] bg-[#fdfcff]')}`}>

          {/* Developer Credit Card */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center space-y-2.5 transition-all duration-300 ${themeClass('bg-slate-900/60 border-slate-800/50', 'bg-[#F4F0FF]/80 border-[#E4DFFF] light-card-shadow')}`}>
            {!isSidebarCollapsed ? (
              <>
                <span className={`text-[9px] font-extrabold tracking-wider uppercase ${themeClass('text-slate-500', 'text-[#9B91C4]')}`}>
                  Connect with the developer
                </span>
                <div className="group relative">
                  <h4 className={`font-extrabold text-xs tracking-wide ${themeClass('text-slate-300', 'text-[#1A1033]')}`}>
                    Moheuddin Sikder Saikat
                  </h4>
                </div>
              </>
            ) : (
              <Lucide.User className={`w-4 h-4 ${themeClass('text-slate-500', 'text-slate-400')}`} />
            )}

            {/* Social Links */}
            <div className={`flex ${isSidebarCollapsed ? 'flex-col gap-2' : 'gap-3 items-center'}`}>
              <a
                href="https://github.com/Mohiuddin0035"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-lg border transition-all duration-300 ${themeClass('bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-white/30 hover:scale-110', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#24292e] hover:border-[#24292e]/30 hover:scale-110')}`}
                title="GitHub"
              >
                <Lucide.Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/moheuddin-saikat"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-lg border transition-all duration-300 ${themeClass('bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:scale-110', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:scale-110')}`}
                title="LinkedIn"
              >
                <Lucide.Linkedin className="w-3.5 h-3.5" />
              </a>
              {!isSidebarCollapsed && (
                <a
                  href="https://www.facebook.com/mohiuddin.s.saikat2.o"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg border transition-all duration-300 ${themeClass('bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-[#1877f2] hover:border-[#1877f2]/30 hover:scale-110', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#1877f2] hover:border-[#1877f2]/30 hover:scale-110')}`}
                  title="Facebook"
                >
                  <Lucide.Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              <a
                href="mailto:msaikat2420035@bscse.uiu.ac.bd"
                className={`p-1.5 rounded-lg border transition-all duration-300 ${themeClass('bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-[#ea4335] hover:border-[#ea4335]/30 hover:scale-110', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:text-[#ea4335] hover:border-[#ea4335]/30 hover:scale-110')}`}
                title="Email"
              >
                <Lucide.Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Backup sync triggers */}
          <div className={isSidebarCollapsed ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
            <button
              onClick={handleExportData}
              className={`flex items-center justify-center gap-1.5 py-2 ${isSidebarCollapsed ? 'px-0' : 'px-3'} text-xs font-semibold border rounded-lg transition-all ${themeClass('text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700/50', 'text-[#5B5180] hover:text-[#1A1033] bg-white border-[#E4DFFF] hover:bg-[#F4F0FF]/50')}`}
              title="Backup progress to JSON"
            >
              <Lucide.Download className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Export</span>}
            </button>

            <label className={`flex items-center justify-center gap-1.5 py-2 ${isSidebarCollapsed ? 'px-0' : 'px-3'} text-xs font-semibold border rounded-lg cursor-pointer transition-all ${themeClass('text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700/50', 'text-[#5B5180] hover:text-[#1A1033] bg-white border-[#E4DFFF] hover:bg-[#F4F0FF]/50')}`} title="Restore progress from JSON">
              <Lucide.Upload className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Import</span>}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleResetData}
            className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/15 rounded-lg transition-all`}
            title="Reset All Progress"
          >
            <Lucide.Trash2 className="w-3.5 h-3.5" />
            {!isSidebarCollapsed && <span>Reset Progress</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MAIN PANEL ==================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">

        {/* Decorative ambient gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0"></div>
        {activeRoadmap && (
          <div className={`absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full ${theme.bgGlow} blur-[120px] pointer-events-none z-0`}></div>
        )}

        {/* Global Floating Custom Notification Alerts */}
        {activeNotification && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border glass-panel shadow-2xl animate-fade-in bg-slate-900/90">
            {activeNotification.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Lucide.Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            ) : activeNotification.type === 'info' ? (
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                <Lucide.Info className="w-3.5 h-3.5 text-sky-400" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <Lucide.AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-200">{activeNotification.text}</span>
          </div>
        )}

        {/* Header Bar */}
        <header className={`h-16 border-b px-6 md:px-8 flex items-center justify-between z-10 shrink-0 backdrop-blur-md transition-colors duration-300 ${themeClass('bg-[#070b13]/80 border-slate-800/40', 'bg-[#ffffff]/80 border-[#E4DFFF]')}`}>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu 3-Dots Trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg border transition-all ${themeClass('bg-slate-800/40 hover:bg-slate-800 border-slate-700/40 text-slate-400 hover:text-white', 'bg-slate-50 hover:bg-slate-100 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
              title="Toggle Navigation Menu"
            >
              <Lucide.MoreVertical className="w-4 h-4" />
            </button>

            {/* Desktop Menu Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden md:flex p-2 rounded-lg border transition-all ${themeClass('bg-slate-800/40 hover:bg-slate-800 border-slate-700/40 text-slate-400 hover:text-white', 'bg-slate-50 hover:bg-slate-100 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
              title="Toggle Sidebar Collapse"
            >
              <Lucide.Menu className="w-4 h-4" />
            </button>

            {activeRoadmapId ? (
              <button
                onClick={() => setActiveRoadmapId(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${themeClass('bg-slate-800/40 hover:bg-slate-800 border-slate-700/40 text-slate-300 hover:text-white', 'bg-slate-50 hover:bg-slate-100 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
              >
                <Lucide.ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Lucide.LayoutDashboard className={`w-4 h-4 ${themeClass('text-emerald-400', 'text-emerald-600')}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>Hub Overview</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            {/* Quick Metrics */}
            <div className={`flex items-center gap-5 text-xs border-r pr-5 ${themeClass('text-slate-400 border-slate-800/60', 'text-[#5B5180] border-[#E4DFFF]')}`}>
              <div className="flex items-center gap-2">
                <Lucide.Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-500 animate-pulse-subtle' : themeClass('text-slate-600', 'text-slate-300')}`} />
                <span>Streak: <strong className={themeClass('text-slate-200', 'text-[#1A1033]')}>{streak} Days</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Lucide.CheckSquare className={`w-4 h-4 ${themeClass('text-emerald-400', 'text-emerald-600')}`} />
                <span>Total Checked: <strong className={themeClass('text-slate-200', 'text-[#1A1033]')}>{globalStats.completed}</strong></span>
              </div>
            </div>

            {/* Minimalist Day/Night toggle switch */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`p-2 rounded-lg border transition-all ${themeClass('bg-slate-800/40 hover:bg-slate-800 border-slate-700/40 text-slate-400 hover:text-white', 'bg-slate-50 hover:bg-slate-100 border-[#E4DFFF] text-[#5B5180] hover:text-[#1A1033]')}`}
              title="Toggle theme mode"
            >
              {isLightMode ? <Lucide.Moon className="w-4 h-4" /> : <Lucide.Sun className="w-4 h-4" />}
            </button>

            {/* User profile / Auth representations */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                    {user?.email ? user.email.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-bold truncate max-w-[120px]">{user?.email}</span>
                    <span className="block text-[8px] font-extrabold text-slate-500 tracking-wider uppercase">
                      {auth.currentUser?.displayName || auth.currentUser?.email || 'ACTIVE DEVELOPER'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className={`p-2 rounded-lg border transition-all ${themeClass('bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/40 text-rose-400 hover:text-rose-300', 'bg-slate-50 hover:bg-slate-100 border-[#E4DFFF] text-rose-600 hover:text-rose-500')}`}
                  title="Sign Out"
                >
                  <Lucide.LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                  setViewMode('landing');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg text-xs font-bold transition-all ${themeClass('bg-emerald-600/10 hover:bg-emerald-600 border-emerald-500/20 text-emerald-400 hover:text-slate-950', 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700')}`}
              >
                <Lucide.UserCheck className="w-3.5 h-3.5" />
                <span>Sync Account</span>
              </button>
            )}
          </div>
        </header>

        {/* Viewport Core Workspace */}
        <div className="flex-1 overflow-y-auto z-10 px-8 py-6">

          {/* ======================================================== */}
          {/* ==================== CENTRAL HUB VIEW ================== */}
          {/* ======================================================== */}
          {activeRoadmapId === null ? (
            <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">

              {/* Dynamic Welcome Banner */}
              <div className={`relative rounded-2xl border overflow-hidden shadow-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 ${themeClass('border-slate-800/60 bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900', 'border-[#E4DFFF] bg-gradient-to-r from-[#EDE8FF] via-[#F4F0FF] to-[#EDE8FF]')}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${themeClass('bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 'bg-emerald-100 text-emerald-700 border-emerald-300')}`}>
                    LEARNING EXPEDITION ACTIVE
                  </span>
                  <h2 className={`text-3xl font-extrabold tracking-tight ${themeClass('bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent', 'text-[#1A1033]')}`}>
                    {globalStats.completed > 0 ? "Continue Your Mastery Journey" : "Forge Your Tech Skill Tree"}
                  </h2>
                  <p className={`text-sm max-w-lg leading-relaxed ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>
                    {globalStats.completed > 0
                      ? `You've checked off ${globalStats.completed} skills. Keep the momentum going and build daily streaks!`
                      : "Access six detailed curated guides from industry experts. Toggle daily checkboxes and watch your contribution heatmap grow."
                    }
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-end relative z-10">
                  {/* Radial progress representation */}
                  <div className={`relative w-24 h-24 flex items-center justify-center rounded-full border shadow-inner ${themeClass('bg-slate-950/40 border-slate-800/40', 'bg-white border-slate-200')}`}>
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className={themeClass('stroke-slate-800', 'stroke-slate-100')}
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className={`stroke-emerald-400 transition-all duration-500`}
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - globalStats.percentage / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-lg font-extrabold leading-none ${themeClass('text-slate-100', 'text-[#1A1033]')}`}>{globalStats.percentage}%</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Overall</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Contribution Heatmap Widget */}
              <div className={`border rounded-2xl shadow-xl p-6 relative overflow-hidden transition-all duration-300 ${themeClass('bg-[#0b111e]/80 border-slate-800/60', 'bg-white border-[#E4DFFF] light-card-shadow')}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className={`font-bold text-base flex items-center gap-2 ${themeClass('text-slate-200', 'text-[#1A1033]')}`}>
                      <Lucide.Calendar className={`w-5 h-5 ${themeClass('text-emerald-400', 'text-emerald-600')}`} />
                      <span>Activity Grid Tracker</span>
                    </h3>
                    <p className={`text-xs ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>Watch your learning habits build an engine of continuous progress.</p>
                  </div>

                  {/* Legend indicator */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase">
                    <span>Less</span>
                    <div className={`w-2.5 h-2.5 rounded-[2px] ${themeClass('bg-slate-800/40', 'bg-slate-200/60')}`}></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-900/60"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400"></div>
                    <span>More</span>
                  </div>
                </div>

                {/* Heatmap Grid viewport */}
                <div className="overflow-x-auto pb-4 pt-1">
                  <div className="flex gap-[3px] min-w-[700px] justify-between">
                    {/* Days row label */}
                    <div className="flex flex-col justify-between text-[9px] font-bold text-slate-500 pr-2 pt-[14px]">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

                    {heatmapWeeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px]">
                        {week.map((day, dIdx) => {
                          let colorClass = themeClass(
                            'bg-slate-800/40 border border-slate-700/10 hover:border-slate-500/30',
                            'bg-slate-200/60 border border-slate-300/30 hover:border-slate-400/40'
                          );
                          if (day.count === 1) {
                            colorClass = 'bg-emerald-900/60 border border-emerald-800/20 hover:border-emerald-600/40';
                          } else if (day.count >= 2 && day.count <= 4) {
                            colorClass = 'bg-emerald-700 border border-emerald-600/30 hover:border-emerald-400/40';
                          } else if (day.count >= 5 && day.count <= 9) {
                            colorClass = 'bg-emerald-500 border border-emerald-400/30 hover:border-emerald-300/40';
                          } else if (day.count >= 10) {
                            colorClass = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] border border-emerald-300/40 hover:bg-emerald-300';
                          }

                          return (
                            <div
                              key={dIdx}
                              onClick={() => {
                                if (day.count > 0) {
                                  setSelectedHeatmapDate(day.date === selectedHeatmapDate ? null : day.date);
                                }
                              }}
                              className={`w-[11px] h-[11px] rounded-[2px] transition-all duration-150 cursor-pointer ${colorClass} ${selectedHeatmapDate === day.date ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 scale-125' : ''
                                }`}
                              title={`${day.formattedDate}: ${day.count} tasks completed`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap selection list panel */}
                {selectedHeatmapDate && (
                  <div className={`mt-4 p-4 rounded-xl border animate-slide-in ${themeClass('bg-slate-900/50 border-slate-800/60', 'bg-indigo-50/50 border-[#E4DFFF]')}`}>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 mb-2">
                      <p className={`text-xs font-bold ${themeClass('text-slate-300', 'text-[#1A1033]')}`}>
                        Completions on {new Date(selectedHeatmapDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <button onClick={() => setSelectedHeatmapDate(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300">
                        Close
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {getTasksOnDate(selectedHeatmapDate).map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-slate-400 font-semibold">[{t.dayLabel}]</span>
                            <span className={`font-medium ${themeClass('text-slate-200', 'text-[#1A1033]')}`}>{t.taskTitle}</span>
                          </div>
                          <span className={`text-[10px] italic px-2 py-0.5 rounded-full border ${themeClass('text-slate-500 bg-slate-950 border-slate-800/40', 'text-[#5B5180] bg-white border-slate-200')}`}>
                            {t.courseTitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Courses Roadmaps Catalog Cards Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className={`font-extrabold text-lg tracking-tight ${themeClass('text-slate-200', 'text-[#1A1033]')}`}>Your Skill Learning Pathways</h3>
                  {/* Search box */}
                  <div className="relative w-full sm:w-72">
                    <Lucide.Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search learning roadmaps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs font-semibold placeholder-slate-500 focus:outline-none transition-all duration-200 ${themeClass('bg-[#090e1a] hover:bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500/50', 'bg-white hover:bg-slate-50 border-[#E4DFFF] text-[#1A1033] focus:border-[#7C5CFC]')}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-perspective">
                  {filteredRoadmaps.map((r, rIdx) => {
                    const rTheme = themes[r.id];
                    const stats = getCourseStats(r);
                    return (
                      <div
                        key={r.id}
                        onClick={() => setActiveRoadmapId(r.id)}
                        style={{ animationDelay: `${rIdx * 75}ms` }}
                        className={`group relative rounded-2xl border p-6 flex flex-col justify-between h-64 cursor-pointer overflow-hidden transition-all duration-300 animate-fade-in opacity-0 card-tilt-hover ${rTheme.glow}-hover ${rTheme.hoverCard} ${themeClass('bg-[#0a0f1d]/90 border-slate-800/60 shadow-inner', 'bg-white border-[#E4DFFF] light-card-shadow')}`}
                      >
                        {/* Background glowing token decoration */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${rTheme.bgGlow} rounded-full blur-2xl ${rTheme.bgGlowHover} transition-all duration-500`}></div>

                        <div className="space-y-3 relative z-10">
                          <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${themeClass('bg-slate-900/50 border-slate-800', 'bg-slate-50 border-slate-200')} ${rTheme.text}`}>
                              <RoadmapIcon name={r.icon} className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${rTheme.bgPill} ${rTheme.text} ${rTheme.border}`}>
                              {stats.percentage}% DONE
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className={`font-extrabold text-base tracking-tight transition-colors duration-200 ${themeClass('text-slate-100 group-hover:text-white', 'text-[#1A1033] group-hover:text-[#7C5CFC]')}`}>
                              {r.title.replace(/🚀/g, '').trim()}
                            </h4>
                            <p className={`text-xs line-clamp-2 leading-relaxed ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>{r.subtitle}</p>
                          </div>
                        </div>

                        {/* Progress visual tracker */}
                        <div className={`space-y-3 pt-4 border-t relative z-10 ${themeClass('border-slate-800/40', 'border-slate-100')}`}>
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Completed</span>
                            <span className={themeClass('text-slate-300', 'text-[#5B5180]')}>{stats.completed} / {stats.total} Topics</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-full rounded-full overflow-hidden border ${themeClass('bg-slate-950/80 border-slate-800/30', 'bg-slate-100 border-slate-200')}`}>
                              <div
                                className={`h-full bg-gradient-to-r ${rTheme.progressGrad} rounded-full transition-all duration-500`}
                                style={{ width: `${stats.percentage}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold shrink-0 ${rTheme.text}`}>{stats.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (

            // =============================================================
            // ==================== SPECIFIC ROADMAP VIEW ==================
            // =============================================================
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

              {/* Header course navigation block */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveRoadmapId(null)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Lucide.ArrowLeft className="w-4 h-4" />
                  <span>Return to Hub</span>
                </button>
              </div>

              {/* Course Title Banner */}
              <div className={`relative rounded-2xl border p-8 overflow-hidden shadow-2xl transition-all duration-300 ${themeClass(theme.bannerGradDark, theme.bannerGradLight)}`}>
                <div className={`absolute top-[-20%] right-[-10%] w-72 h-72 ${theme.bannerGlow} rounded-full blur-[80px] pointer-events-none`}></div>

                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${themeClass('bg-slate-950/50 border border-slate-800', 'bg-white border-[#E4DFFF] shadow-sm')} ${theme.text} ${theme.glow}`}>
                        <RoadmapIcon name={activeRoadmap.icon} className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${themeClass('bg-slate-950/50 border-slate-800/80', 'bg-white border-[#E4DFFF] shadow-sm')} ${theme.text}`}>
                        Learning Path
                      </span>
                    </div>

                    <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-tight ${themeClass('text-white', 'text-[#1A1033]')}`}>
                      {activeRoadmap.title}
                    </h2>
                    <p className={`text-sm max-w-xl leading-relaxed ${themeClass('text-slate-300', 'text-[#5B5180]')}`}>
                      {activeRoadmap.subtitle}
                    </p>
                  </div>

                  {/* Course stats metric block */}
                  <div className="flex flex-col md:items-end justify-between gap-4 shrink-0">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROADMAP PROGRESS</p>
                      <p className={`text-3xl font-extrabold mt-1 ${theme.text}`}>
                        {getCourseStats(activeRoadmap).percentage}%
                      </p>
                    </div>

                    <div className={`flex items-center gap-3 py-2 px-4 rounded-xl border ${themeClass('bg-slate-950/40 border-slate-800/80', 'bg-white border-[#E4DFFF] shadow-sm')} ${theme.text}`}>
                      <Lucide.CheckSquare className="w-4 h-4" />
                      <span className={`text-xs font-semibold ${themeClass('text-slate-300', 'text-[#5B5180]')}`}>
                        {getCourseStats(activeRoadmap).completed} / {getCourseStats(activeRoadmap).total} Checked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wide progress slider indicator */}
                <div className="mt-8 pt-6 border-t border-slate-800/40 flex items-center gap-4">
                  <div className={`h-2.5 w-full rounded-full overflow-hidden border ${themeClass('bg-slate-950/80 border-slate-800/20', 'bg-slate-100 border-slate-200')}`}>
                    <div
                      className={`h-full bg-gradient-to-r ${theme.progressGrad} rounded-full transition-all duration-500`}
                      style={{ width: `${getCourseStats(activeRoadmap).percentage}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-extrabold ${theme.text}`}>{getCourseStats(activeRoadmap).percentage}%</span>
                </div>
              </div>

              {/* ROADMAP MULTI-TABS SELECTOR */}
              {activeRoadmap.tabs.length > 1 && (
                <div className={`flex gap-1.5 p-1 border rounded-xl overflow-x-auto ${themeClass('bg-slate-950/60 border-slate-800/60', 'bg-[#F4F0FF] border-[#E4DFFF]')}`}>
                  {activeRoadmap.tabs.map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTabIdx(idx)}
                      className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 shrink-0 ${activeTabIdx === idx
                          ? themeClass(`${theme.bgPill} border ${theme.border} ${theme.text}`, `bg-white border border-[#E4DFFF] ${theme.textLight} shadow-sm`)
                          : themeClass('text-slate-400 hover:text-slate-200 border border-transparent', 'text-[#5B5180] hover:text-[#1A1033] border border-transparent')
                        }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              )}

              {/* CURRENT ACTIVE TAB BODY PORT */}
              {activeRoadmap.tabs[activeTabIdx] && (
                <div className="space-y-6">

                  {/* Summary Metric cards matching original look */}
                  {activeRoadmap.tabs[activeTabIdx].summary && activeRoadmap.tabs[activeTabIdx].summary.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {activeRoadmap.tabs[activeTabIdx].summary.map((sum, sIdx) => (
                        <div key={sIdx} className={`border rounded-xl p-4 text-center glass-panel shadow-sm ${themeClass('bg-[#0b111e]/80 border-slate-800/50', 'bg-white border-[#E4DFFF]')}`}>
                          <p className={`text-xl font-extrabold ${theme.text}`}>{sum.val}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{sum.lbl}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* =============================================================== */}
                  {/* ==================== RENDERING COMPONENT ===================== */}
                  {/* =============================================================== */}

                  {/* CONDITIONAL REACT-SIMPLE WEEK CARD (ACCORDIONS) */}
                  {activeRoadmap.id === 'react-simple' ? (
                    <div className="space-y-4">
                      {activeRoadmap.tabs[activeTabIdx].phases.map((phase, pIdx) => {
                        const isExpanded = openWeeks[phase.id] !== false; // Default expanded
                        const phaseStats = (() => {
                          let total = 0;
                          let comp = 0;
                          phase.sections.forEach(s => {
                            s.days.forEach(d => {
                              total++;
                              if (completedTasks[d.id]) comp++;
                            });
                          });
                          return { total, comp, percentage: total > 0 ? Math.round((comp / total) * 100) : 0 };
                        })();

                        return (
                          <div
                            key={phase.id}
                            style={{ animationDelay: `${pIdx * 75}ms` }}
                            className={`border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 animate-fade-in opacity-0 ${themeClass('bg-[#0b111e]/80 border-slate-800/60', 'bg-white border-[#E4DFFF] light-card-shadow')}`}
                          >

                            {/* Week Accordion header */}
                            <div
                              onClick={() => toggleWeek(phase.id)}
                              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 select-none border-b border-slate-800/20"
                            >
                              <div className="flex items-center gap-3 truncate">
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${theme.badgeClass}`}>
                                  {phase.badge}
                                </span>
                                <span className={`font-extrabold text-sm truncate ${themeClass('text-slate-200', 'text-[#1A1033]')}`}>{phase.title}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${themeClass('text-slate-500 bg-slate-950 border-slate-800/40', 'text-[#5B5180] bg-slate-50 border-slate-200')}`}>
                                  {phaseStats.comp}/{phaseStats.total} Done
                                </span>
                                <Lucide.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            {/* Accordion body list */}
                            {isExpanded && (
                              <div className={`p-6 space-y-4 animate-scale-in ${themeClass('bg-slate-950/20', 'bg-[#FDFBFF]/50')}`}>
                                {phase.sections.map((section, secIdx) => (
                                  <div key={secIdx} className="space-y-3">
                                    {section.days.map((day) => {
                                      const isChecked = !!completedTasks[day.id];
                                      return (
                                        <div
                                          key={day.id}
                                          className={`relative border rounded-xl p-4 transition-all duration-200 flex gap-4 items-start ${isChecked
                                              ? 'bg-emerald-950/5 border-emerald-950/30 text-slate-300'
                                              : themeClass('bg-[#0a0f1a] border-slate-800/60 text-slate-300 hover:border-slate-700/60', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:border-[#7C5CFC]/40 shadow-sm')
                                            }`}
                                        >
                                          {/* Topic Checkbox */}
                                          <button
                                            onClick={() => toggleTask(day.id)}
                                            className={`checkbox-pop mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${isChecked
                                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                                : themeClass('border border-slate-700 hover:border-slate-500 bg-slate-900/50', 'border border-[#E4DFFF] hover:border-[#7C5CFC] bg-white')
                                              }`}
                                          >
                                            {isChecked && <Lucide.Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>

                                          <div className="space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded ${themeClass('bg-slate-900 border-slate-800 text-slate-400', 'bg-slate-100 border-slate-200 text-slate-500')}`}>
                                                {day.dayLabel}
                                              </span>
                                              <h5 className={`font-extrabold text-sm tracking-tight ${isChecked ? 'text-slate-400 line-through' : themeClass('text-slate-100', 'text-[#1A1033]')}`}>
                                                {day.taskTitle}
                                              </h5>
                                              {day.tag && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${day.tag.toLowerCase() === 'project'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                                  }`}>
                                                  {day.tag}
                                                </span>
                                              )}
                                            </div>

                                            <p className={`text-xs leading-relaxed ${isChecked ? 'text-slate-500' : themeClass('text-slate-400', 'text-[#5B5180]')}`}
                                              dangerouslySetInnerHTML={{
                                                __html: day.taskSub.replace(/<code>(.*?)<\/code>/g, '<code class="font-mono text-sky-400 bg-sky-950/50 px-1 py-0.5 rounded">$1</code>')
                                              }}
                                            />

                                            {/* Original project box container */}
                                            {day.projectBox && (
                                              <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex gap-2 items-start">
                                                <Lucide.Trophy className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div>
                                                  <strong className="font-bold text-emerald-300">Target Objective:</strong> {day.projectBox.replace(/^Choto Target:|^★ Shoptah \d Final State:/, '').trim()}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (

                    // ==================== CONDITIONAL STANDARD TABBED MODULES ====================
                    <div className="space-y-6">
                      {activeRoadmap.tabs[activeTabIdx].phases.map((phase, pIdx) => (
                        <div
                          key={phase.id}
                          style={{ animationDelay: `${pIdx * 75}ms` }}
                          className={`border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 animate-fade-in opacity-0 ${themeClass('bg-[#0b111e]/80 border-slate-800/60', 'bg-white border-[#E4DFFF] light-card-shadow')}`}
                        >

                          {/* Module Header Title */}
                          <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${themeClass('bg-slate-900/25 border-slate-800/30', 'bg-slate-50/50 border-[#E4DFFF]')}`}>
                            <div className="flex items-center gap-3">
                              {phase.badge && (
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${phase.badgeClass || theme.badgeClass}`}>
                                  {phase.badge}
                                </span>
                              )}
                              <h4 className={`font-extrabold text-sm ${themeClass('text-slate-100', 'text-[#1A1033]')}`}>{phase.title}</h4>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{phase.meta}</span>
                          </div>
                          {/* Phase card Body */}
                          <div className="p-6 space-y-6">
                            {phase.sections.map((section, secIdx) => (
                              <div key={secIdx} className="space-y-4">

                                {section.label && section.label !== "Section Content" && (
                                  <h5 className={`text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-2 border-b pb-1 ${themeClass('text-slate-400 border-slate-800/30', 'text-[#9B91C4] border-slate-100')}`}>
                                    {!(
                                      phase.id?.trim() === 'ui-ux-t3-p1' ||
                                      phase.id?.trim() === 'ui-ux-t3-p2' ||
                                      phase.title?.toLowerCase().includes('essential tools') ||
                                      phase.title?.toLowerCase().includes('industry readiness')
                                    ) && <Lucide.ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                                    <span>{section.label}</span>
                                  </h5>
                                )}

                                <div className="space-y-2">
                                  {(phase.id?.trim() === 'ui-ux-t3-p1' || phase.title?.toLowerCase().includes('essential tools')) ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                      {[
                                        { name: 'Figma — UI + Prototype', color: '#5B35E8' },
                                        { name: 'FigJam — Affinity Maps', color: '#22C97B' },
                                        { name: 'Whimsical — Flows', color: '#F5A524' },
                                        { name: 'Coolors — Palettes', color: '#FF6B6B' },
                                        { name: 'Google Fonts', color: '#1A47B8' },
                                        { name: 'Fontpair.co', color: '#3D7000' },
                                        { name: 'Unsplash — Photos', color: '#444444' },
                                        { name: 'Heroicons — Icons', color: '#0B6E40' },
                                        { name: 'Phosphor Icons', color: '#7C5CFC' },
                                        { name: 'contrast.ratio.fyi', color: '#C00000' },
                                        { name: 'Maze — Testing', color: '#855000' },
                                        { name: 'Zeroheight — Docs', color: '#5000B3' }
                                      ].map((tool, idx) => (
                                        <div
                                          key={idx}
                                          className={`flex items-center gap-3 px-4 py-3 border rounded-xl shadow-sm hover:scale-[1.01] transition-all duration-200 ${themeClass('bg-[#0a0f1a] border-slate-800/60 text-slate-200 hover:border-slate-700/60', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:border-[#7C5CFC]/40')}`}
                                        >
                                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tool.color }} />
                                          <span className="text-xs font-bold">{tool.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (phase.id?.trim() === 'ui-ux-t3-p2' || phase.title?.toLowerCase().includes('industry readiness')) ? (
                                    <div className="space-y-1 pt-1">
                                      {(section.label && section.label.includes('Skills') ? [
                                        'Conduct and synthesize user research interviews',
                                        'Create user personas from research data',
                                        'Build sitemaps and user flow diagrams',
                                        'Wireframe in Figma from scratch',
                                        'Apply the 8pt grid system consistently',
                                        'Build a component library with proper variants & states',
                                        'Create interactive prototypes with Smart Animate',
                                        'Run and report on a usability test',
                                        'Build and document a design system',
                                        'Design responsively across 3 breakpoints',
                                        'Audit and fix WCAG AA accessibility violations',
                                        'Write a compelling UX case study',
                                        'Articulate design decisions in business language',
                                        'Give and receive design critique professionally'
                                      ] : [
                                        '3 complete case studies published',
                                        'Each case study shows process, not just final screens',
                                        'At least 1 case study includes usability testing results',
                                        'Figma prototype link included in at least 1 case study',
                                        'Portfolio website live (not just a PDF)',
                                        'LinkedIn updated with portfolio link and keyword-rich headline'
                                      ]).map((item, idx) => {
                                        const taskId = `ui-ux-checklist-${(section.label && section.label.includes('Skills')) ? "skills" : "portfolio"}-${idx}`;
                                        const isChecked = !!completedTasks[taskId];
                                        return (
                                          <div
                                            key={idx}
                                            className={`flex items-start gap-3 py-2 border-b last:border-0 transition-all ${themeClass('border-slate-800/30 text-slate-300', 'border-[#EDE9FF]/80 text-[#5B5180]')}`}
                                          >
                                            <button
                                              onClick={() => toggleTask(taskId)}
                                              className={`checkbox-pop mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all ${isChecked
                                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                                  : themeClass('border border-slate-700 hover:border-slate-500 bg-slate-900/50', 'border border-[#E4DFFF] hover:border-[#7C5CFC] bg-white')
                                                }`}
                                            >
                                              {isChecked && <Lucide.Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                            </button>
                                            <span className={`text-[13px] font-medium leading-relaxed select-none ${isChecked ? 'text-slate-500 line-through' : themeClass('text-slate-200', 'text-[#1A1033]')}`}>
                                              {item}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    section.days.map((day) => {
                                      const isChecked = !!completedTasks[day.id];
                                      return (
                                        <div
                                          key={day.id}
                                          className={`relative border rounded-xl p-4 transition-all duration-200 flex gap-4 items-start ${isChecked
                                              ? 'bg-emerald-950/5 border-emerald-950/30 text-slate-300'
                                              : themeClass('bg-[#0a0f1a] border-slate-800/60 text-slate-300 hover:border-slate-700/60', 'bg-white border-[#E4DFFF] text-[#5B5180] hover:border-[#7C5CFC]/40 shadow-sm')
                                            }`}
                                        >
                                          {/* Topic Checkbox */}
                                          <button
                                            onClick={() => toggleTask(day.id)}
                                            className={`checkbox-pop mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${isChecked
                                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                                : themeClass('border border-slate-700 hover:border-slate-500 bg-slate-900/50', 'border border-[#E4DFFF] hover:border-[#7C5CFC] bg-white')
                                              }`}
                                          >
                                            {isChecked && <Lucide.Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>

                                          <div className="space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              {day.dayLabel && (
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded ${themeClass('bg-slate-900 border-slate-800 text-slate-400', 'bg-slate-100 border-slate-200 text-slate-500')}`}>
                                                  {day.dayLabel}
                                                </span>
                                              )}
                                              <h6 className={`font-extrabold text-sm tracking-tight ${isChecked ? 'text-slate-400 line-through' : themeClass('text-slate-100', 'text-[#1A1033]')}`}>
                                                {day.taskTitle}
                                              </h6>
                                              {day.tag && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${themeClass('bg-slate-900 border-slate-800 text-slate-400', 'bg-slate-50 border-slate-200 text-slate-500')}`}>
                                                  {day.tag}
                                                </span>
                                              )}
                                            </div>

                                            {day.taskSub && (
                                              <p className={`text-xs leading-relaxed ${isChecked ? 'text-slate-500' : themeClass('text-slate-400', 'text-[#5B5180]')}`}>
                                                {day.taskSub}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Section Resources and tip note triggers */}
                                {section.note && (
                                  <div className={`p-4 rounded-xl border text-xs flex gap-2 items-start ${themeClass('bg-slate-900/40 border-slate-800/60 text-slate-400', 'bg-slate-50 border-[#E4DFFF] text-[#5B5180]')}`}>
                                    <Lucide.Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse-subtle" />
                                    <p className="leading-relaxed">{section.note}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Tab graduation Milestone bottom panel */}
                      {activeRoadmap.tabs[activeTabIdx].milestone && (
                        <div className={`p-6 rounded-2xl border shadow-lg text-center flex flex-col items-center space-y-2 relative overflow-hidden ${themeClass('from-emerald-500/5 to-teal-500/5 border-emerald-500/10', 'from-emerald-500/5 to-teal-500/5 border-emerald-500/20 bg-white')}`}>
                          <div className="absolute top-0 left-0 w-full h-full bg-emerald-400/5 blur-3xl pointer-events-none"></div>
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                            <Lucide.Trophy className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h4 className={`font-extrabold text-sm ${themeClass('text-slate-100', 'text-[#1A1033]')}`}>Milestone unlocked on completion</h4>
                          <p className={`text-xs leading-relaxed max-w-lg ${themeClass('text-slate-400', 'text-[#5B5180]')}`}>
                            {activeRoadmap.tabs[activeTabIdx].milestone.replace(/^Month \d milestone:|^Milestone at bottom of tab:/, '').trim()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
