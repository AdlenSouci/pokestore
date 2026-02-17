import { useEffect, useRef } from "react";

interface TestEffectProps {
  type: "water" | "fire" | "electric" | "psy" | "flying" | "dragon";
}

export function TestEffect({ type }: TestEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    
    // --- VARIABLES GLOBALES ---
    let electricParticles: any[] = [];
    // Initialisation particules électriques
    for (let i = 0; i < 100; i++) {
      electricParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.05,
      });
    }

    let lightningOpacity = 0;
    let lightningPath: { x: number; y: number }[] = [];
    let psyParticles: any[] = [];
    let dragonScales: any[] = [];

    const animate = () => {
      frame++;
      // Ajuster la taille du canvas à la fenêtre dynamiquement
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (type === "water") {
        for (let layer = 0; layer < 5; layer++) {
          const waveSpeed = 0.03 + layer * 0.005;
          const amplitude = 80 + layer * 20;
          const yOffset = centerY + (layer - 2) * 60;
          ctx.save();
          ctx.strokeStyle = `rgba(50, 150, 255, ${0.4 - layer * 0.06})`;
          ctx.lineWidth = 30 - layer * 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let x = 0; x < canvas.width + 50; x += 10) {
            const y = yOffset + Math.sin((x + frame * waveSpeed * 100) * 0.01) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Jets d'eau
        for (let jet = 0; jet < 3; jet++) {
          const jetX = centerX + (jet - 1) * 250;
          const jetHeight = (frame * 8 + jet * 150) % 600;
          if (jetHeight < 500) {
            const jetWidth = 40 - (jetHeight / 500) * 30;
            const jetAlpha = 1 - jetHeight / 500;
            ctx.save();
            ctx.translate(jetX, canvas.height - jetHeight);
            const jetGrad = ctx.createLinearGradient(0, 0, 0, 100);
            jetGrad.addColorStop(0, `rgba(255, 255, 255, ${jetAlpha})`);
            jetGrad.addColorStop(0.5, `rgba(150, 230, 255, ${jetAlpha * 0.8})`);
            jetGrad.addColorStop(1, `rgba(100, 200, 255, ${jetAlpha * 0.4})`);
            ctx.fillStyle = jetGrad;
            ctx.fillRect(-jetWidth / 2, 0, jetWidth, 100);

            for (let splash = 0; splash < 15; splash++) {
              const splashAngle = (splash / 15) * Math.PI;
              const splashDist = Math.random() * 60 + 20;
              const splashX = Math.cos(splashAngle - Math.PI / 2) * splashDist;
              const splashY = Math.sin(splashAngle - Math.PI / 2) * splashDist - 80;
              ctx.beginPath();
              ctx.arc(splashX, splashY, 4 + Math.random() * 4, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(200, 240, 255, ${jetAlpha * 0.8})`;
              ctx.shadowBlur = 10;
              ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
              ctx.fill();
            }
            ctx.restore();
          }
        }

        // Bulles
        for (let i = 0; i < 100; i++) {
          const bubbleX = (i * 73 + frame * 0.5) % canvas.width;
          const bubbleY = canvas.height - ((frame * 1.5 + i * 20) % canvas.height);
          const bubbleSize = 5 + (i % 15);
          const wobble = Math.sin(frame * 0.05 + i) * 15;
          ctx.save();
          const bubbleGrad = ctx.createRadialGradient(bubbleX + wobble, bubbleY, 0, bubbleX + wobble, bubbleY, bubbleSize);
          bubbleGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
          bubbleGrad.addColorStop(0.5, "rgba(150, 230, 255, 0.6)");
          bubbleGrad.addColorStop(1, "rgba(100, 200, 255, 0.2)");
          ctx.fillStyle = bubbleGrad;
          ctx.beginPath();
          ctx.arc(bubbleX + wobble, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const oceanPulse = 250 + Math.sin(frame * 0.04) * 50;
        const oceanGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, oceanPulse);
        oceanGrad.addColorStop(0, "rgba(100, 200, 255, 0.2)");
        oceanGrad.addColorStop(0.5, "rgba(80, 180, 230, 0.1)");
        oceanGrad.addColorStop(1, "rgba(50, 150, 200, 0)");
        ctx.fillStyle = oceanGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, oceanPulse, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === "fire") {
        ctx.save();
        ctx.translate(centerX, centerY);
        for (let layer = 0; layer < 4; layer++) {
          ctx.save();
          ctx.rotate(frame * 0.01 + layer);
          for (let angle = 0; angle < Math.PI * 4; angle += 0.12) {
            const radius = 120 + angle * 30 + layer * 15;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6;
            const life = angle / (Math.PI * 4);
            let r, g, b, alpha;
            if (life < 0.3) { r = 255; g = 255; b = 220; alpha = 0.9; } 
            else if (life < 0.6) { r = 255; g = 180; b = 50; alpha = 0.7; } 
            else { r = 255; g = 100; b = 30; alpha = 0.5; }
            const size = 20 - life * 12 - layer * 2;
            if (size < 4) continue;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            grad.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.4}, ${b * 0.2}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();

        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 2 + frame * 0.003;
          const distance = 200 + Math.sin(frame * 0.008 + i) * 50;
          const baseX = centerX + Math.cos(angle) * distance;
          const baseY = centerY + Math.sin(angle) * distance * 0.6;
          const seed = i * 123.456 + frame * 0.05;
          const flameHeight = 80 + Math.sin(seed) * 40;
          const flameWidth = 25 + Math.sin(seed * 1.3) * 10;
          ctx.save();
          ctx.translate(baseX, baseY);
          ctx.rotate(angle + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let h = 0; h < flameHeight; h += 8) {
            const wobble = Math.sin(frame * 0.04 + h * 0.1 + i) * (flameWidth * 0.25);
            const width = flameWidth * (1 - h / flameHeight) * 0.5;
            ctx.lineTo(-width + wobble, -h);
          }
          const tipWobble = Math.sin(frame * 0.05 + i) * 8;
          ctx.lineTo(tipWobble, -flameHeight);
          for (let h = flameHeight; h > 0; h -= 8) {
             const wobble = Math.sin(frame * 0.04 + h * 0.1 + i + Math.PI) * (flameWidth * 0.25);
            const width = flameWidth * (1 - h / flameHeight) * 0.5;
            ctx.lineTo(width + wobble, -h);
          }
          ctx.closePath();
          const flameGrad = ctx.createLinearGradient(0, 0, 0, -flameHeight);
          flameGrad.addColorStop(0, "rgba(255, 255, 200, 0.85)");
          flameGrad.addColorStop(0.4, "rgba(255, 180, 50, 0.7)");
          flameGrad.addColorStop(1, "rgba(200, 50, 20, 0)");
          ctx.fillStyle = flameGrad;
          ctx.fill();
          ctx.restore();
        }

        for (let i = 0; i < 150; i++) {
          const seed = i * 234.567;
          const xBase = (i * 17 + seed * 10) % canvas.width;
          const rise = (frame * 0.6 + seed * 30) % (canvas.height + 200);
          const y = canvas.height - rise;
          const wobble = Math.sin(frame * 0.03 + i) * 20;
          const actualX = xBase + wobble;
          const life = rise / (canvas.height + 200);
          if (life > 1) continue;
          let r, g;
          if (life < 0.25) { r = 255; g = 240; } 
          else if (life < 0.5) { r = 255; g = 200; } 
          else { r = 255; g = 80; }
          const size = 3 + (1 - life) * 6;
          const grad = ctx.createRadialGradient(actualX, y, 0, actualX, y, size);
          grad.addColorStop(0, `rgba(${r}, ${g}, 50, ${0.9 - life})`);
          grad.addColorStop(1, `rgba(${r}, ${g * 0.5}, 20, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(actualX, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        const eruptionCycle = frame % 120;
        if (eruptionCycle < 30) {
          const progress = eruptionCycle / 30;
          const eruptionRadius = progress * 300;
          for (let burst = 0; burst < 20; burst++) {
            const burstAngle = (burst / 20) * Math.PI * 2;
            const burstX = centerX + Math.cos(burstAngle) * eruptionRadius;
            const burstY = centerY + Math.sin(burstAngle) * eruptionRadius * 0.6;
            const burstSize = 30 * (1 - progress);
            if (burstSize < 5) continue;
            const burstGrad = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, burstSize);
            burstGrad.addColorStop(0, `rgba(255, 255, 200, ${0.8 - progress})`);
            burstGrad.addColorStop(0.5, `rgba(255, 180, 50, ${0.6 - progress})`);
            burstGrad.addColorStop(1, "rgba(255, 100, 30, 0)");
            ctx.fillStyle = burstGrad;
            ctx.beginPath();
            ctx.arc(burstX, burstY, burstSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const heatPulse = 220 + Math.sin(frame * 0.04) * 40;
        const heatGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, heatPulse);
        heatGrad.addColorStop(0, "rgba(255, 200, 50, 0.2)");
        heatGrad.addColorStop(0.5, "rgba(255, 120, 30, 0.1)");
        heatGrad.addColorStop(1, "rgba(200, 50, 20, 0)");
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, heatPulse, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 15; i++) {
          const baseX = (i / 15) * canvas.width;
          const seed = i * 678.9 + frame * 0.1;
          const flameHeight = 120 + Math.sin(seed) * 50;
          const flameWidth = 30 + Math.sin(seed * 1.3) * 15;
          ctx.save();
          ctx.translate(baseX, canvas.height);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let h = 0; h < flameHeight; h += 10) {
             const wobble = Math.sin(frame * 0.05 + h * 0.1 + i) * (flameWidth * 0.3);
            const width = flameWidth * (1 - h / flameHeight) * 0.5;
            ctx.lineTo(-width + wobble, -h);
          }
          const tipWobble = Math.sin(frame * 0.08 + i) * 10;
          ctx.lineTo(tipWobble, -flameHeight);
          for (let h = flameHeight; h > 0; h -= 10) {
             const wobble = Math.sin(frame * 0.05 + h * 0.1 + i + Math.PI) * (flameWidth * 0.3);
            const width = flameWidth * (1 - h / flameHeight) * 0.5;
            ctx.lineTo(width + wobble, -h);
          }
          ctx.closePath();
          const flameGrad = ctx.createLinearGradient(0, 0, 0, -flameHeight);
          flameGrad.addColorStop(0, "rgba(255, 255, 200, 0.6)");
          flameGrad.addColorStop(1, "rgba(200, 50, 20, 0)");
          ctx.fillStyle = flameGrad;
          ctx.fill();
          ctx.restore();
        }

      } else if (type === "electric") {
        if (frame % 400 === 0) {
          lightningOpacity = 1;
          const startX = canvas.width / 2 + (Math.random() - 0.5) * 300;
          lightningPath = [{ x: startX, y: 0 }];
          let currX = startX;
          let currY = 0;
          for (let k = 0; k < 15; k++) {
            currY += canvas.height / 15;
            currX += (Math.random() - 0.5) * 100;
            lightningPath.push({ x: currX, y: currY });
          }
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (lightningOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = lightningOpacity;
          ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.shadowBlur = 50;
          ctx.shadowColor = "rgba(255, 200, 0, 1)";
          ctx.beginPath();
          if (lightningPath.length > 0) {
            ctx.moveTo(lightningPath[0].x, lightningPath[0].y);
            for (let i = 1; i < lightningPath.length; i++) {
              ctx.lineTo(lightningPath[i].x, lightningPath[i].y);
            }
          }
          ctx.stroke();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
          lightningOpacity -= 0.03;
        }

        for (let i = 0; i < electricParticles.length; i++) {
          let p = electricParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.opacity += Math.sin(frame * p.pulseSpeed) * 0.02;
          if (lightningOpacity > 0.5) {
            p.x += (Math.random() - 0.5) * 2;
            p.y += (Math.random() - 0.5) * 2;
          }
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          const safeOpacity = Math.max(0, Math.min(1, p.opacity));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 100, ${safeOpacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(255, 200, 0, 0.5)";
          ctx.fill();
        }

      } else if (type === "psy") {
        for (let i = 0; i < 3; i++) {
          const radius = 150 + ((frame * 0.5 + i * 100) % 400);
          const opacity = Math.max(0, 1 - radius / 400) * 0.3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(140, 80, 200, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([20, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (frame % 2 === 0) {
          const spawnX = centerX + (Math.random() - 0.5) * 280;
          const spawnY = centerY + (Math.random() - 0.5) * 380;
          psyParticles.push({
            x: spawnX,
            y: spawnY,
            vx: (spawnX - centerX) * 0.01 + (Math.random() - 0.5) * 0.5,
            vy: (spawnY - centerY) * 0.01 + (Math.random() - 0.5) * 0.5,
            size: Math.random() * 30 + 10,
            opacity: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
          });
        }

        for (let i = psyParticles.length - 1; i >= 0; i--) {
          let p = psyParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.x += Math.sin(frame * 0.05 + i) * 0.5;
          p.y += Math.cos(frame * 0.05 + i) * 0.5;
          p.size += 0.2;
          p.opacity -= 0.005;
          p.rotation += p.rotationSpeed;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          gradient.addColorStop(0, `rgba(160, 80, 220, ${p.opacity})`);
          gradient.addColorStop(0.6, `rgba(100, 40, 180, ${p.opacity * 0.5})`);
          gradient.addColorStop(1, "rgba(50, 20, 100, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.opacity <= 0) {
            psyParticles.splice(i, 1);
          }
        }

        const pulse = 200 + Math.sin(frame * 0.05) * 20;
        const auraGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse);
        auraGrad.addColorStop(0, "rgba(180, 100, 255, 0.2)");
        auraGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === "flying") {
         for (let layer = 0; layer < 4; layer++) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(frame * 0.015 + layer * 0.5);
          const layerOpacity = 0.3 - layer * 0.06;
          ctx.strokeStyle = `rgba(220, 240, 255, ${layerOpacity})`;
          ctx.lineWidth = 25 - layer * 4;
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(200, 230, 255, 0.4)";
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 5; angle += 0.08) {
            const radius = 80 + angle * 35 + layer * 20;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.7;
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        }

      } else if (type === "dragon") {
        for (let spiral = 0; spiral < 2; spiral++) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(frame * 0.02 * (spiral === 0 ? 1 : -1));
          if (spiral === 0) {
            ctx.strokeStyle = `rgba(255, 180, 50, ${0.4})`;
            ctx.shadowColor = "rgba(255, 200, 0, 0.8)";
          } else {
            ctx.strokeStyle = `rgba(80, 150, 255, ${0.4})`;
            ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
          }
          ctx.lineWidth = 18;
          ctx.shadowBlur = 40;
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 5; angle += 0.1) {
            const radius = 120 + angle * 30;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.8;
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        }

        if (frame % 3 === 0) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 100 + Math.random() * 150;
          dragonScales.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5,
            size: Math.random() * 15 + 8,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            opacity: Math.random() * 0.6 + 0.4,
            isGold: Math.random() > 0.5,
          });
        }

        for (let i = dragonScales.length - 1; i >= 0; i--) {
          let scale = dragonScales[i];
          scale.x += scale.vx;
          scale.y += scale.vy;
          scale.rotation += scale.rotationSpeed;
          scale.opacity -= 0.005;
          scale.x += Math.sin(frame * 0.03 + i) * 0.3;
          scale.y += Math.cos(frame * 0.03 + i) * 0.3;
          ctx.save();
          ctx.translate(scale.x, scale.y);
          ctx.rotate(scale.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -scale.size);
          ctx.lineTo(scale.size * 0.6, 0);
          ctx.lineTo(0, scale.size);
          ctx.lineTo(-scale.size * 0.6, 0);
          ctx.closePath();
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, scale.size);
          if (scale.isGold) {
            gradient.addColorStop(0, `rgba(255, 240, 150, ${scale.opacity})`);
            gradient.addColorStop(0.5, `rgba(255, 180, 50, ${scale.opacity * 0.7})`);
            gradient.addColorStop(1, `rgba(200, 100, 0, 0)`);
            ctx.shadowColor = "rgba(255, 200, 0, 0.6)";
          } else {
            gradient.addColorStop(0, `rgba(200, 230, 255, ${scale.opacity})`);
            gradient.addColorStop(0.5, `rgba(100, 180, 255, ${scale.opacity * 0.7})`);
            gradient.addColorStop(1, `rgba(50, 100, 200, 0)`);
            ctx.shadowColor = "rgba(100, 200, 255, 0.6)";
          }
          ctx.shadowBlur = 15;
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, ${scale.opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
          if (scale.opacity <= 0) {
            dragonScales.splice(i, 1);
          }
        }

        for (let i = 0; i < 15; i++) {
          const x = centerX + (Math.random() - 0.5) * 300;
          const y = canvas.height - ((frame * 2 + i * 50) % (canvas.height / 2));
          const size = Math.random() * 20 + 10;
          const life = 1 - (y / canvas.height) * 2;
          if (life < 0 || life > 1) continue;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, `rgba(255, 240, 150, ${1 - life})`);
          gradient.addColorStop(0.5, `rgba(255, 150, 50, ${(1 - life) * 0.7})`);
          gradient.addColorStop(1, "rgba(200, 80, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (frame % 60 === 0 && Math.random() > 0.5) {
          const startX = centerX + (Math.random() - 0.5) * 200;
          const startY = centerY + (Math.random() - 0.5) * 200;
          ctx.strokeStyle = "rgba(150, 200, 255, 0.6)";
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(100, 200, 255, 1)";
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          let currX = startX;
          let currY = startY;
          for (let seg = 0; seg < 5; seg++) {
            currX += (Math.random() - 0.5) * 40;
            currY += (Math.random() - 0.5) * 40;
            ctx.lineTo(currX, currY);
          }
          ctx.stroke();
        }

        const pulse1 = 180 + Math.sin(frame * 0.04) * 30;
        const pulse2 = 150 + Math.cos(frame * 0.05) * 25;
        const goldAura = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse1);
        goldAura.addColorStop(0, "rgba(255, 200, 80, 0.15)");
        goldAura.addColorStop(0.6, "rgba(255, 150, 50, 0.08)");
        goldAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = goldAura;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse1, 0, Math.PI * 2);
        ctx.fill();
        const blueAura = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse2);
        blueAura.addColorStop(0, "rgba(100, 180, 255, 0.15)");
        blueAura.addColorStop(0.6, "rgba(80, 150, 230, 0.08)");
        blueAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = blueAura;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse2, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 25; i++) {
          if (Math.random() > 0.85) {
            const sparkAngle = Math.random() * Math.PI * 2;
            const sparkRadius = Math.random() * 280 + 80;
            const sparkX = centerX + Math.cos(sparkAngle) * sparkRadius;
            const sparkY = centerY + Math.sin(sparkAngle) * sparkRadius;
            const sparkSize = Math.random() * 3 + 1;
            ctx.fillStyle = `rgba(255, 240, 200, ${Math.random() * 0.9 + 0.1})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(255, 220, 100, 1)";
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}