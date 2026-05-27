// ============================================
// CYBER DIARY - 赛博朋克灵魂脚本
// ============================================

(function () {
  "use strict";

  // --- 终端启动动画 ---
  function bootSequence() {
    if (sessionStorage.getItem("cyber-booted")) return Promise.resolve();

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.id = "cyber-boot";
      overlay.innerHTML = `
        <div class="boot-content">
          <div class="boot-line" style="animation-delay:0s">&gt; INITIALIZING CYBER DIARY v4.5.2...</div>
          <div class="boot-line" style="animation-delay:0.2s">&gt; Loading neural interface <span class="highlight">[OK]</span></div>
          <div class="boot-line" style="animation-delay:0.4s">&gt; Connecting to knowledge graph <span class="highlight">[OK]</span></div>
          <div class="boot-line" style="animation-delay:0.6s">&gt; Mounting digital garden <span class="highlight">[OK]</span></div>
          <div class="boot-line" style="animation-delay:0.8s">&gt; Syncing memory banks <span class="accent">21.8B tokens processed</span></div>
          <div class="boot-line" style="animation-delay:1.0s">&gt; Welcome, <span class="accent">operator</span>.<span class="boot-cursor"></span></div>
        </div>
      `;
      document.body.appendChild(overlay);

      setTimeout(() => {
        overlay.classList.add("fade-out");
        setTimeout(() => {
          overlay.remove();
          sessionStorage.setItem("cyber-booted", "1");
          resolve();
        }, 800);
      }, 2200);
    });
  }

  // --- 粒子场 ---
  function initParticles() {
    const canvas = document.createElement("canvas");
    canvas.id = "cyber-particles";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    const PARTICLE_COUNT = 60;
    const MAX_DIST = 120;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 239, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(10, 239, 255, ${0.15 * (1 - dist / MAX_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // --- 文章标题打字机效果 ---
  function typewriterTitles() {
    const h1 = document.querySelector("article h1");
    if (!h1 || h1.dataset.typed) return;

    const text = h1.textContent.trim();
    if (!text) return;

    h1.dataset.typed = "1";
    h1.textContent = "";
    h1.style.borderRight = "2px solid #0aefff";
    h1.style.whiteSpace = "nowrap";
    h1.style.overflow = "hidden";
    h1.style.display = "inline-block";

    let i = 0;
    function type() {
      if (i < text.length) {
        h1.textContent += text[i];
        i++;
        setTimeout(type, 50 + Math.random() * 40);
      } else {
        // Keep cursor blinking for a moment then remove
        setTimeout(() => {
          h1.style.borderRight = "none";
        }, 2000);
      }
    }
    type();
  }

  // --- Glitch 标题 data-text 属性 ---
  function setupGlitchTitle() {
    const titleEl = document.querySelector(".page-title a");
    if (titleEl && !titleEl.dataset.text) {
      titleEl.dataset.text = titleEl.textContent;
    }
  }

  // --- 初始化 ---
  function init() {
    setupGlitchTitle();
    initParticles();
    typewriterTitles();
  }

  // Quartz SPA nav event
  document.addEventListener("nav", () => {
    setupGlitchTitle();
    typewriterTitles();
  });

  // Boot then init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootSequence().then(init);
    });
  } else {
    bootSequence().then(init);
  }
})();
