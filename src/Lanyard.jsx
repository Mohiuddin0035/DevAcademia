/* eslint-disable react/no-unknown-property */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as Lucide from 'lucide-react';
import saikatAvatar from './saikat_avatar.jpg';
import './Lanyard.css';

export default function Lanyard({ isFalling, onClose }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glow: 0 });

  // Physics engine reference
  const physicsRef = useRef({
    nodes: [],
    anchorY: -300,
    targetAnchorY: -60, // Changed from 20 to -60 to hide the gap off-screen
    dragOffset: { x: 0, y: 0 }
  });

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize sizes
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize the physics nodes once the component mounts
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobileLayout = width < 768;
    const centerX = isMobileLayout ? width / 2 : (width < 1280 ? width - 140 : width / 2 + 510);
    const numSegmentNodes = 6; // Nodes per side of the rope loop
    const nodes = [];

    // 1. Left Anchor (Node 0) - Locked position at top
    nodes.push({
      x: centerX - 120, // Wider ribbon base (120 instead of 35)
      y: -300,
      oldX: centerX - 120,
      oldY: -300,
      fixed: true,
      label: 'left-anchor'
    });

    // 2. Left Rope segments (Nodes 1 to numSegmentNodes-1)
    for (let i = 1; i < numSegmentNodes; i++) {
      const pct = i / numSegmentNodes;
      const x = centerX - 120 * (1 - pct);
      const y = -300 + 280 * pct; // Longer drop initial coordinates
      nodes.push({ x, y, oldX: x, oldY: y, fixed: false });
    }

    // 3. Shared Hook Node (Node numSegmentNodes) - Meeting point
    const hookIndex = numSegmentNodes;
    nodes.push({
      x: centerX,
      y: -20,
      oldX: centerX,
      oldY: -20,
      fixed: false,
      label: 'hook'
    });

    // 4. Right Rope segments (Nodes hookIndex + 1 to hookIndex + numSegmentNodes - 1)
    for (let i = numSegmentNodes - 1; i >= 1; i--) {
      const pct = i / numSegmentNodes;
      const x = centerX + 120 * (1 - pct);
      const y = -300 + 280 * pct;
      nodes.push({ x, y, oldX: x, oldY: y, fixed: false });
    }

    // 5. Right Anchor (Node hookIndex + numSegmentNodes) - Locked position at top
    const rightAnchorIndex = hookIndex + numSegmentNodes;
    nodes.push({
      x: centerX + 120,
      y: -300,
      oldX: centerX + 120,
      oldY: -300,
      fixed: true,
      label: 'right-anchor'
    });

    // 6. Card Center Node (Node rightAnchorIndex + 1)
    const cardIndex = rightAnchorIndex + 1;
    nodes.push({
      x: centerX,
      y: 170, // Settles lower for larger drop
      oldX: centerX,
      oldY: 170,
      fixed: false,
      label: 'card'
    });

    physicsRef.current.nodes = nodes;
    physicsRef.current.anchorY = -300;
  }, []);

  // Primary requestAnimationFrame animation loop
  useEffect(() => {
    let animationFrameId;

    const runLoop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const cardEl = cardRef.current;
      const { nodes, anchorY, targetAnchorY, dragOffset } = physicsRef.current;

      if (!canvas || !ctx || !nodes || nodes.length === 0) {
        animationFrameId = requestAnimationFrame(runLoop);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileLayout = width < 768;
      const centerX = isMobileLayout ? width / 2 : (width < 1280 ? width - 140 : width / 2 + 510);

      const hookIndex = 6;
      const rightAnchorIndex = 12;
      const cardIndex = 13;

      // --- A. Drop-in transition & state tracking ---
      if (!isFalling) {
        // Slide anchors down organically
        physicsRef.current.anchorY += (targetAnchorY - anchorY) * 0.05;
      } else {
        // Falling mode: release locks on anchors
        nodes[0].fixed = false;
        nodes[rightAnchorIndex].fixed = false;
      }

      // Lock anchors if hanging
      if (!isFalling) {
        nodes[0].x = centerX - 120; // Wider ribbon
        nodes[0].y = physicsRef.current.anchorY;
        nodes[0].oldX = nodes[0].x;
        nodes[0].oldY = nodes[0].y;
        nodes[0].fixed = true;

        nodes[rightAnchorIndex].x = centerX + 120; // Wider ribbon
        nodes[rightAnchorIndex].y = physicsRef.current.anchorY;
        nodes[rightAnchorIndex].oldX = nodes[rightAnchorIndex].x;
        nodes[rightAnchorIndex].oldY = nodes[rightAnchorIndex].y;
        nodes[rightAnchorIndex].fixed = true;
      }

      // --- B. Handle active dragging ---
      if (isDragging && !isFalling) {
        // Card node is pulled directly to calculated target
        nodes[cardIndex].fixed = true;
      } else {
        nodes[cardIndex].fixed = false;
      }

      // --- C. Apply Physics (Verlet Integration) ---
      const gravity = 0.22; // Lower gravity for slower, floaty sway
      const friction = 0.96; // Higher friction (less than 1) for smoother damping
      const time = Date.now() * 0.0008; // Slower time evolution
      // Ambient breeze effect on rope segments - gentle slow sways
      const windForceX = isFalling ? 0 : Math.sin(time * 0.8) * 0.15;
      const windForceY = isFalling ? 0 : Math.cos(time * 0.4) * 0.05;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.fixed) continue;

        // Verlet velocity
        let vx = (node.x - node.oldX) * friction;
        let vy = (node.y - node.oldY) * friction;

        if (i === cardIndex) {
          // Extra damping on the heavy card node to prevent rapid swinging
          vx *= 0.92;
          vy *= 0.92;
        }

        node.oldX = node.x;
        node.oldY = node.y;

        node.x += vx + windForceX;
        node.y += vy + gravity + windForceY;
      }

      // --- D. Resolve Constraints (Elastic Spring Links) ---
      const segmentLen = 48; // Rope segment target length (increased from 35 for longer drop)
      const cardHookLen = 190; // Neck strap hook to card center length (increased from 180)

      const resolveConstraint = (n1, n2, targetLen) => {
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const diff = targetLen - dist;
        const percent = diff / dist / 2;
        const ox = dx * percent;
        const oy = dy * percent;

        if (!n1.fixed) {
          n1.x -= ox;
          n1.y -= oy;
        }
        if (!n2.fixed) {
          n2.x += ox;
          n2.y += oy;
        }
      };

      // Run multiple solver iterations for stiff rope behavior (fewer iterations make the ribbon sway gently)
      for (let iter = 0; iter < 6; iter++) {
        // Left rope segments
        for (let i = 0; i < hookIndex; i++) {
          resolveConstraint(nodes[i], nodes[i + 1], segmentLen);
        }
        // Right rope segments
        for (let i = hookIndex; i < rightAnchorIndex; i++) {
          resolveConstraint(nodes[i], nodes[i + 1], segmentLen);
        }
        // Hook meeting point to Card center
        resolveConstraint(nodes[hookIndex], nodes[cardIndex], cardHookLen);
      }

      // --- E. Render Lanyard Ribbon Canvas ---
      ctx.clearRect(0, 0, width, height);

      // Draw Ribbon Drop Shadow
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = isMobile ? 11 : 16; // Thicker premium flat-ribbon shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowColor = 'transparent';

      const drawPath = (offsetY) => {
        ctx.beginPath();
        // Start at left anchor
        ctx.moveTo(nodes[0].x, nodes[0].y + offsetY);
        // Go down left rope to hook
        for (let i = 1; i <= hookIndex; i++) {
          ctx.lineTo(nodes[i].x, nodes[i].y + offsetY);
        }
        // Go up right rope to right anchor
        for (let i = hookIndex + 1; i <= rightAnchorIndex; i++) {
          ctx.lineTo(nodes[i].x, nodes[i].y + offsetY);
        }
        // Connect the top of the ribbon with a smooth curve instead of a straight line
        const cpX1 = nodes[rightAnchorIndex].x - 40;
        const cpY1 = nodes[rightAnchorIndex].y - 30 + offsetY;
        const cpX2 = nodes[0].x + 40;
        const cpY2 = nodes[0].y - 30 + offsetY;
        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, nodes[0].x, nodes[0].y + offsetY);
        ctx.stroke();
      };

      // Draw shadow path
      drawPath(4);

      // Base flat ribbon - solid premium black
      ctx.lineWidth = isMobile ? 11 : 16;
      ctx.strokeStyle = '#101216'; // Dark charcoal black
      drawPath(0);

      // Stitched border texture - slate grey
      ctx.lineWidth = isMobile ? 9 : 13;
      ctx.strokeStyle = '#1e293b'; // Textured border
      drawPath(0);

      // Deep solid black ribbon core
      ctx.lineWidth = isMobile ? 7 : 10;
      ctx.strokeStyle = '#090a0f'; // Darkest black core
      drawPath(0);

      // Draw printed white brand sparkles at regular node intervals matching the demo image
      const symbolIndices = [2, 4, 8, 10];
      symbolIndices.forEach(idx => {
        const node = nodes[idx];
        const prev = nodes[idx - 1];
        const next = nodes[idx + 1];
        if (!node || !prev || !next) return;

        // Vector math to align the printed sparkles with rope angle
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const angle = Math.atan2(dx, dy);

        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(-angle); // Align with physical ribbon segment rotation

        // Elegant 4-point printed Sparkle Star
        const size = isMobile ? 3.5 : 5;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        ctx.restore();
      });

      // --- Draw Highly-Detailed Metallic Clasp & Grommet Connection (matching demo image) ---
      const hookNode = nodes[hookIndex];
      const cardNode = nodes[cardIndex];
      
      // Calculate card swing angle
      const dx = cardNode.x - hookNode.x;
      const dy = cardNode.y - hookNode.y;
      const angle = Math.atan2(dx, dy);

      // Math-perfect location of the card's top grommet hole center (147px above card center)
      const grommetX = cardNode.x - Math.sin(angle) * 147;
      const grommetY = cardNode.y - Math.cos(angle) * 147;

      // Draw Ribbon Key Ring (Sleek Matte-Black Swivel Connection matching the second image)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 5;
      
      // Normal vector from hookNode to grommet
      const tdx = grommetX - hookNode.x;
      const tdy = grommetY - hookNode.y;
      const tdist = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
      const tnx = tdx / tdist;
      const tny = tdy / tdist;

      // 1. Sleek Flat Matte-Black Strap Buckle/Clamp at hookNode capping the ribbon band
      ctx.save();
      ctx.translate(hookNode.x, hookNode.y);
      const perpAngle = Math.atan2(tnx, -tny);
      ctx.rotate(perpAngle);
      
      // Outer dark band
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1e293b'; // Dark slate grey base
      ctx.stroke();

      // Inner deep matte black core
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#090a0f'; // Solid dark matte black
      ctx.stroke();

      // Highlight line
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.lineWidth = 0.8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();
      ctx.restore();

      // 2. Sleek Dark Steel D-Ring hanging from hookNode
      const dRingRadius = 7.5;
      ctx.beginPath();
      const startX = hookNode.x - tny * dRingRadius;
      const startY = hookNode.y + tnx * dRingRadius;
      const endX = hookNode.x + tny * dRingRadius;
      const endY = hookNode.y - tnx * dRingRadius;
      
      ctx.moveTo(startX, startY);
      const cpX = hookNode.x + tnx * dRingRadius * 1.4;
      const cpY = hookNode.y + tny * dRingRadius * 1.4;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#334155'; // Textured dark steel ring
      ctx.stroke();

      // 3. Matte-Black Swivel Clasp Neck extending downwards
      const claspStartX = hookNode.x + tnx * 10;
      const claspStartY = hookNode.y + tny * 10;
      const neckEndX = hookNode.x + tnx * 19;
      const neckEndY = hookNode.y + tny * 19;
      
      ctx.beginPath();
      ctx.moveTo(claspStartX, claspStartY);
      ctx.lineTo(neckEndX, neckEndY);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1e293b'; // Dark steel swivel body
      ctx.stroke();

      // Highlight on swivel neck
      ctx.beginPath();
      ctx.moveTo(claspStartX + tny * 1, claspStartY - tnx * 1);
      ctx.lineTo(neckEndX + tny * 1, neckEndY - tnx * 1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();

      // 4. Sleek vertical clasp hook going straight into the grommet
      ctx.beginPath();
      ctx.moveTo(neckEndX, neckEndY);
      
      const hookControlX1 = grommetX - tny * 9 - tnx * 4;
      const hookControlY1 = grommetY + tnx * 9 - tny * 4;
      const hookControlX2 = grommetX - tny * 7 + tnx * 10;
      const hookControlY2 = grommetY + tnx * 7 + tny * 10;
      const hookEndX = grommetX + tny * 4 - tnx * 6;
      const hookEndY = grommetY - tnx * 4 - tny * 6;
      
      ctx.bezierCurveTo(hookControlX1, hookControlY1, hookControlX2, hookControlY2, hookEndX, hookEndY);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0f172a'; // Pure matte black clasp hook
      ctx.stroke();
      
      // Slate metallic reflection on the outer curve of the hook
      ctx.beginPath();
      ctx.moveTo(neckEndX - tny * 0.8, neckEndY + tnx * 0.8);
      ctx.bezierCurveTo(hookControlX1 - tny * 0.8, hookControlY1 + tnx * 0.8, hookControlX2 - tny * 0.8, hookControlY2 + tnx * 0.8, hookEndX - tny * 0.8, hookEndY + tnx * 0.8);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // 5. Redraw the front half of the grommet ring over the clasp to create a perfect looped visual
      ctx.beginPath();
      ctx.arc(grommetX, grommetY, 9, 0, Math.PI * 2);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#334155'; // Slate steel grommet rim
      ctx.stroke();

      // Shiny highlight on the grommet rim
      ctx.beginPath();
      ctx.arc(grommetX, grommetY, 9, -Math.PI / 3, Math.PI / 6);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#64748b'; // Sleek slate highlight
      ctx.stroke();
      
      ctx.restore();

      // --- F. Translate DOM Card Element ---
      if (cardEl) {
        // Swing angle derived mathematically from vector
        const angle = Math.atan2(dx, dy);

        // Update card position and rotation with GPU-accelerated translate3d
        cardEl.style.transform = `translate3d(${cardNode.x}px, ${cardNode.y}px, 0) translate(-50%, -42%) rotateZ(${-angle}rad) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isDragging ? 1.03 : 1.0})`;
      }

      // --- G. Off-Screen Auto-Unmount check ---
      if (isFalling && nodes[cardIndex].y > height + 250) {
        onClose();
        return; // Break animation loop
      }

      animationFrameId = requestAnimationFrame(runLoop);
    };

    animationFrameId = requestAnimationFrame(runLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isFalling, isDragging, tilt, onClose, isMobile]);

  // Handle Drag Events (Desktop Mouse)
  const handleMouseDown = (e) => {
    if (isFalling) return;
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Only initiate drag if left clicking and not clicking on social links
    if (e.button !== 0 || e.target.closest('.html-card-social-icon')) return;

    e.preventDefault();
    setIsDragging(true);

    const { nodes } = physicsRef.current;
    const cardIndex = 13;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    physicsRef.current.dragOffset = {
      x: mouseX - nodes[cardIndex].x,
      y: mouseY - nodes[cardIndex].y
    };

    const handleMouseMoveGlobal = (moveEvent) => {
      const { nodes, dragOffset } = physicsRef.current;
      nodes[cardIndex].x = moveEvent.clientX - dragOffset.x;
      nodes[cardIndex].y = moveEvent.clientY - dragOffset.y;
      nodes[cardIndex].oldX = nodes[cardIndex].x;
      nodes[cardIndex].oldY = nodes[cardIndex].y;
    };

    const handleMouseUpGlobal = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
  };

  // Handle Drag Events (Mobile Touch)
  const handleTouchStart = (e) => {
    if (isFalling) return;
    if (e.target.closest('.html-card-social-icon')) return;

    setIsDragging(true);
    const { nodes } = physicsRef.current;
    const cardIndex = 13;
    const touch = e.touches[0];
    const mouseX = touch.clientX;
    const mouseY = touch.clientY;

    physicsRef.current.dragOffset = {
      x: mouseX - nodes[cardIndex].x,
      y: mouseY - nodes[cardIndex].y
    };

    const handleTouchMoveGlobal = (moveEvent) => {
      const { nodes, dragOffset } = physicsRef.current;
      const moveTouch = moveEvent.touches[0];
      nodes[cardIndex].x = moveTouch.clientX - dragOffset.x;
      nodes[cardIndex].y = moveTouch.clientY - dragOffset.y;
      nodes[cardIndex].oldX = nodes[cardIndex].x;
      nodes[cardIndex].oldY = nodes[cardIndex].y;
    };

    const handleTouchEndGlobal = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
      window.removeEventListener('touchend', handleTouchEndGlobal);
    };

    window.addEventListener('touchmove', handleTouchMoveGlobal);
    window.addEventListener('touchend', handleTouchEndGlobal);
  };

  // Calculate high-end 3D tilt on mouse hover
  const handleMouseMove = (e) => {
    if (isDragging || isFalling || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Angles of tilt (max 15 degrees)
    const rotateX = -(y / (rect.height / 2)) * 15;
    const rotateY = (x / (rect.width / 2)) * 15;

    // Ambient glow factor based on pointer closeness to center
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = Math.sqrt((rect.width / 2) ** 2 + (rect.height / 2) ** 2) || 1;
    const glow = Math.max(0, 1 - dist / maxDist);

    setTilt({ x: rotateX, y: rotateY, glow });
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    setTilt({ x: 0, y: 0, glow: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`lanyard-overlay-container ${isFalling ? 'lanyard-falling-mode' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* 2D Canvas for physics string drawing */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Sleek Glass Close Button */}
      <button
        className="lanyard-close-btn animate-fade-in"
        onClick={onClose}
        title="Close View"
        style={{ pointerEvents: 'auto' }}
      >
        <Lucide.X className="w-5 h-5" />
      </button>


      {/* Glassmorphic connectors sidebar */}
      {!isMobile && (
        <div className="lanyard-social-sidebar animate-fade-in" style={{ pointerEvents: 'auto' }}>
          <a
            href="https://github.com/Mohiuddin0035"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon github-glow"
            title="GitHub"
          >
            <Lucide.Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/moheuddin-saikat"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon linkedin-glow"
            title="LinkedIn"
          >
            <Lucide.Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/mohiuddin.s.saikat2.o"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon facebook-glow"
            title="Facebook"
          >
            <Lucide.Facebook className="w-5 h-5" />
          </a>
          <a
            href="mailto:msaikat2420035@bscse.uiu.ac.bd"
            className="html-card-social-icon mail-glow"
            title="Email"
          >
            <Lucide.Mail className="w-5 h-5" />
          </a>
        </div>
      )}

      <div
        ref={cardRef}
        className="html-card-wrapper"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '50% 42%',
          transformStyle: 'preserve-3d',
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: `0 35px 70px rgba(0, 0, 0, 0.65), 0 0 35px rgba(52, 211, 153, ${0.1 + tilt.glow * 0.15})`
        }}
      >
        {/* Front face glow reflection */}
        <div 
          className="glass-reflection"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            background: `radial-gradient(circle at ${tilt.x * 5 + 50}% ${tilt.y * 5 + 50}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 5
          }}
        />

        {/* Metal Eyelet Grommet Ring at Top Center */}
        <div className="html-card-grommet">
          <div className="html-card-grommet-hole"></div>
        </div>

        {/* Card Header */}
        <div className="html-card-header" style={{ transform: 'translateZ(15px)' }}>
          <span className="html-card-logo">DEVACADEMIA</span>
          <div className="html-card-chip"></div>
        </div>

        {/* Local Avatar Photo Container */}
        <div className="html-card-avatar-container" style={{ transform: 'translateZ(25px)' }}>
          <img
            src={saikatAvatar}
            alt="Moheuddin Sikder Saikat"
            className="html-card-avatar"
            draggable="false"
          />
        </div>

        {/* Card Details */}
        <div className="html-card-details" style={{ transform: 'translateZ(20px)' }}>
          <h4 className="html-card-name">Moheuddin Saikat</h4>
        </div>

        {/* Integrated Brand-Glow Social Buttons */}
        <div className="html-card-socials" style={{ transform: 'translateZ(30px)' }}>
          <a
            href="https://github.com/Mohiuddin0035"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon github-glow"
          >
            <Lucide.Github className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/moheuddin-saikat"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon linkedin-glow"
          >
            <Lucide.Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://www.facebook.com/mohiuddin.s.saikat2.o"
            target="_blank"
            rel="noopener noreferrer"
            className="html-card-social-icon facebook-glow"
          >
            <Lucide.Facebook className="w-4 h-4" />
          </a>
          <a
            href="mailto:msaikat2420035@bscse.uiu.ac.bd"
            className="html-card-social-icon mail-glow"
          >
            <Lucide.Mail className="w-4 h-4" />
          </a>
        </div>

        {/* Card Footer credit */}
        <div className="html-card-footer" style={{ transform: 'translateZ(10px)' }}>
          <span>MEMBER ID: #2026-0522</span>
        </div>
      </div>
    </div>
  );
}
