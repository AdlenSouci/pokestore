import type { EffectType } from '../../lib/cardTypeToEffect';

/**
 * Canvas procédural (même esprit que `frontend/src/components/TestEffect.tsx`) —
 * version condensée pour WebView mobile (pas de React / window full screen).
 */
export function buildCanvasEffectHtml(type: EffectType, width: number, height: number): string {
  const W = Math.max(1, Math.floor(width));
  const H = Math.max(1, Math.floor(height));
  const t = type;

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}#c{display:block;}</style>
</head><body>
<canvas id="c"></canvas>
<script>
(function(){
  var TYPE = ${JSON.stringify(t)};
  var W = ${W}, H = ${H};
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = W; canvas.height = H;
  var frame = 0;
  var cx = W / 2, cy = H / 2;

  var electricParticles = [];
  for (var i = 0; i < 80; i++) {
    electricParticles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 3 + 1, opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.05
    });
  }
  var lightningOpacity = 0;
  var lightningPath = [];
  var psyParticles = [];
  var dragonScales = [];

  function animate() {
    frame++;
    ctx.clearRect(0, 0, W, H);
    var centerX = cx, centerY = cy;

    if (TYPE === 'water') {
      for (var layer = 0; layer < 5; layer++) {
        var waveSpeed = 0.03 + layer * 0.005;
        var amplitude = 60 + layer * 18;
        var yOffset = centerY + (layer - 2) * 50;
        ctx.save();
        ctx.strokeStyle = 'rgba(50, 150, 255, ' + (0.4 - layer * 0.06) + ')';
        ctx.lineWidth = 26 - layer * 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (var x = 0; x < W + 50; x += 10) {
          var y = yOffset + Math.sin((x + frame * waveSpeed * 100) * 0.01) * amplitude;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      for (var b = 0; b < 60; b++) {
        var bx = (b * 73 + frame * 0.5) % W;
        var by = H - ((frame * 1.2 + b * 20) % H);
        var bs = 4 + (b % 12);
        var wob = Math.sin(frame * 0.05 + b) * 12;
        var g = ctx.createRadialGradient(bx + wob, by, 0, bx + wob, by, bs);
        g.addColorStop(0, 'rgba(255,255,255,0.75)');
        g.addColorStop(0.5, 'rgba(150, 230, 255, 0.5)');
        g.addColorStop(1, 'rgba(100, 200, 255, 0.15)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx + wob, by, bs, 0, Math.PI * 2);
        ctx.fill();
      }
      var op = 200 + Math.sin(frame * 0.04) * 40;
      var og = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, op);
      og.addColorStop(0, 'rgba(100, 200, 255, 0.22)');
      og.addColorStop(1, 'rgba(50, 150, 200, 0)');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(centerX, centerY, op, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (TYPE === 'fire') {
      ctx.save();
      ctx.translate(centerX, centerY);
      for (var layer = 0; layer < 3; layer++) {
        ctx.save();
        ctx.rotate(frame * 0.012 + layer);
        for (var angle = 0; angle < Math.PI * 4; angle += 0.15) {
          var radius = 100 + angle * 28 + layer * 12;
          var x = Math.cos(angle) * radius;
          var y = Math.sin(angle) * radius * 0.55;
          var life = angle / (Math.PI * 4);
          var r = 255, g = life < 0.4 ? 240 : (life < 0.7 ? 160 : 100);
          var b = life < 0.4 ? 200 : 50;
          var alpha = 0.85 - life * 0.5;
          var sz = 18 - life * 10;
          if (sz < 3) continue;
          var gr = ctx.createRadialGradient(x, y, 0, x, y, sz);
          gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')');
          gr.addColorStop(1, 'rgba(200, 40, 20, 0)');
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(x, y, sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
      for (var i = 0; i < 80; i++) {
        var seed = i * 234.5;
        var xBase = (i * 19 + seed * 3) % W;
        var rise = (frame * 0.55 + seed * 25) % (H + 150);
        var y = H - rise;
        var life = rise / (H + 150);
        if (life > 1) continue;
        var fr = 255, fg = life < 0.5 ? 220 : 90;
        var sz = 2 + (1 - life) * 5;
        var gr2 = ctx.createRadialGradient(xBase, y, 0, xBase, y, sz);
        gr2.addColorStop(0, 'rgba(' + fr + ',' + fg + ',50,' + (0.85 - life) + ')');
        gr2.addColorStop(1, 'rgba(200,40,20,0)');
        ctx.fillStyle = gr2;
        ctx.beginPath();
        ctx.arc(xBase, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      var hp = 200 + Math.sin(frame * 0.04) * 35;
      var hg = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, hp);
      hg.addColorStop(0, 'rgba(255, 200, 50, 0.18)');
      hg.addColorStop(1, 'rgba(200, 50, 20, 0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(centerX, centerY, hp, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (TYPE === 'electric') {
      function buildBolt(startX) {
        var path = [{ x: startX, y: 0 }];
        var cx2 = startX, cy2 = 0;
        for (var k = 0; k < 14; k++) {
          cy2 += H / 14;
          cx2 += (Math.random() - 0.5) * 95;
          path.push({ x: cx2, y: cy2 });
        }
        return path;
      }
      /* Éclairs plus fréquents que la version courte (site : ~toutes les 6–7 s) */
      if (frame % 55 === 0) {
        lightningOpacity = 1;
        var sx = W / 2 + (Math.random() - 0.5) * (W * 0.45);
        lightningPath = buildBolt(sx);
      }
      /* Aura électrique permanente (visible même entre deux éclairs) */
      var elPulse = 140 + Math.sin(frame * 0.08) * 35;
      var elG = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, elPulse);
      elG.addColorStop(0, 'rgba(255, 240, 120, 0.22)');
      elG.addColorStop(0.5, 'rgba(255, 200, 50, 0.08)');
      elG.addColorStop(1, 'rgba(80, 60, 0, 0)');
      ctx.fillStyle = elG;
      ctx.beginPath();
      ctx.arc(centerX, centerY, elPulse, 0, Math.PI * 2);
      ctx.fill();

      if (lightningOpacity > 0) {
        /* Flash écran (comme le site qui blanchit légèrement au coup de foudre) */
        ctx.save();
        ctx.globalAlpha = lightningOpacity * 0.22;
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = Math.min(1, lightningOpacity);
        ctx.strokeStyle = 'rgba(255, 220, 60, 0.95)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 45;
        ctx.shadowColor = 'rgba(255, 230, 100, 1)';
        ctx.beginPath();
        if (lightningPath.length > 0) {
          ctx.moveTo(lightningPath[0].x, lightningPath[0].y);
          for (var li = 1; li < lightningPath.length; li++) {
            ctx.lineTo(lightningPath[li].x, lightningPath[li].y);
          }
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        if (lightningPath.length > 0) {
          ctx.moveTo(lightningPath[0].x, lightningPath[0].y);
          for (var lj = 1; lj < lightningPath.length; lj++) {
            ctx.lineTo(lightningPath[lj].x, lightningPath[lj].y);
          }
        }
        ctx.stroke();
        /* Fourche secondaire décalée */
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.75)';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(180, 220, 255, 0.9)';
        ctx.beginPath();
        if (lightningPath.length > 3) {
          var off = 18;
          ctx.moveTo(lightningPath[0].x + off, lightningPath[0].y);
          for (var lk = 1; lk < lightningPath.length; lk++) {
            ctx.lineTo(lightningPath[lk].x + off * (1 - lk / lightningPath.length), lightningPath[lk].y);
          }
        }
        ctx.stroke();
        ctx.restore();
        lightningOpacity -= 0.035;
      }
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      for (var ei = 0; ei < electricParticles.length; ei++) {
        var p = electricParticles[ei];
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += Math.sin(frame * p.pulseSpeed) * 0.02;
        if (lightningOpacity > 0.4) {
          p.x += (Math.random() - 0.5) * 3;
          p.y += (Math.random() - 0.5) * 3;
        }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        var o = Math.max(0.15, Math.min(0.95, p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 245, 150, ' + o + ')';
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 220, 80, 0.7)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    else if (TYPE === 'psy') {
      for (var ri = 0; ri < 4; ri++) {
        var rad = 120 + ((frame * 0.6 + ri * 90) % 320);
        var op = Math.max(0, 1 - rad / 400) * 0.35;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(140, 80, 200, ' + op + ')';
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (frame % 3 === 0) {
        psyParticles.push({
          x: centerX + (Math.random() - 0.5) * 240,
          y: centerY + (Math.random() - 0.5) * 320,
          vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 25 + 8, opacity: Math.random() * 0.25 + 0.12,
          rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.04
        });
      }
      for (var pi = psyParticles.length - 1; pi >= 0; pi--) {
        var q = psyParticles[pi];
        q.x += q.vx; q.y += q.vy;
        q.size += 0.15; q.opacity -= 0.006; q.rot += q.rs;
        ctx.save();
        ctx.translate(q.x, q.y);
        ctx.rotate(q.rot);
        var pg = ctx.createRadialGradient(0, 0, 0, 0, 0, q.size);
        pg.addColorStop(0, 'rgba(160, 80, 220, ' + q.opacity + ')');
        pg.addColorStop(1, 'rgba(50, 20, 100, 0)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(0, 0, q.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (q.opacity <= 0) psyParticles.splice(pi, 1);
      }
      var pulse = 180 + Math.sin(frame * 0.05) * 25;
      var ag = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse);
      ag.addColorStop(0, 'rgba(180, 100, 255, 0.2)');
      ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (TYPE === 'flying') {
      for (var fl = 0; fl < 4; fl++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(frame * 0.014 + fl * 0.5);
        ctx.strokeStyle = 'rgba(220, 240, 255, ' + (0.28 - fl * 0.05) + ')';
        ctx.lineWidth = 22 - fl * 4;
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(200, 230, 255, 0.35)';
        ctx.beginPath();
        for (var ang = 0; ang < Math.PI * 5; ang += 0.1) {
          var rr = 70 + ang * 32 + fl * 18;
          var fx = Math.cos(ang) * rr;
          var fy = Math.sin(ang) * rr * 0.65;
          if (ang === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
    else if (TYPE === 'dragon') {
      for (var sp = 0; sp < 2; sp++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(frame * 0.018 * (sp === 0 ? 1 : -1));
        ctx.strokeStyle = sp === 0 ? 'rgba(255, 180, 50, 0.45)' : 'rgba(80, 150, 255, 0.45)';
        ctx.lineWidth = 16;
        ctx.shadowBlur = 30;
        ctx.shadowColor = sp === 0 ? 'rgba(255, 200, 0, 0.7)' : 'rgba(100, 200, 255, 0.7)';
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (var a = 0; a < Math.PI * 5; a += 0.12) {
          var rr2 = 100 + a * 28;
          var dx = Math.cos(a) * rr2;
          var dy = Math.sin(a) * rr2 * 0.75;
          if (a === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
        }
        ctx.stroke();
        ctx.restore();
      }
      if (frame % 4 === 0) {
        var ang2 = Math.random() * Math.PI * 2;
        var dist = 90 + Math.random() * 120;
        dragonScales.push({
          x: centerX + Math.cos(ang2) * dist,
          y: centerY + Math.sin(ang2) * dist,
          vx: Math.cos(ang2) * 0.4, vy: Math.sin(ang2) * 0.4,
          size: Math.random() * 12 + 6, rot: Math.random() * Math.PI * 2,
          rs: (Math.random() - 0.5) * 0.05, op: Math.random() * 0.5 + 0.4, gold: Math.random() > 0.5
        });
      }
      for (var di = dragonScales.length - 1; di >= 0; di--) {
        var d = dragonScales[di];
        d.x += d.vx; d.y += d.vy; d.rot += d.rs; d.op -= 0.006;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.beginPath();
        ctx.moveTo(0, -d.size);
        ctx.lineTo(d.size * 0.6, 0);
        ctx.lineTo(0, d.size);
        ctx.lineTo(-d.size * 0.6, 0);
        ctx.closePath();
        var dg = ctx.createRadialGradient(0, 0, 0, 0, 0, d.size);
        if (d.gold) {
          dg.addColorStop(0, 'rgba(255, 240, 150, ' + d.op + ')');
          dg.addColorStop(1, 'rgba(200, 100, 0, 0)');
        } else {
          dg.addColorStop(0, 'rgba(200, 230, 255, ' + d.op + ')');
          dg.addColorStop(1, 'rgba(50, 100, 200, 0)');
        }
        ctx.fillStyle = dg;
        ctx.fill();
        ctx.restore();
        if (d.op <= 0) dragonScales.splice(di, 1);
      }
      var p1 = 170 + Math.sin(frame * 0.04) * 28;
      var g1 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, p1);
      g1.addColorStop(0, 'rgba(255, 200, 80, 0.12)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, p1, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
</script>
</body></html>`;
}
