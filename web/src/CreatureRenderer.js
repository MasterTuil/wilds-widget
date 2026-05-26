import { CREATURES } from './data/creatures.js';

const FPS = 8;
const FRAME_MS = 1000 / FPS;
const SCALE = 2; // 92px sprites → 184px display

// ── Particle config per habitat ────────────────────────────────
const HABITAT_PARTICLES = {
  cave: {
    count: 22,
    colors: ['rgba(180,140,255,', 'rgba(120,200,255,', 'rgba(200,160,255,'],
    size: [1.5, 3],
    speed: [-0.015, -0.04],   // upward drift
    drift: [-0.008, 0.008],
    glow: 6,
  },
  meadow: {
    count: 18,
    colors: ['rgba(255,240,100,', 'rgba(200,255,150,', 'rgba(255,220,80,'],
    size: [1.5, 2.5],
    speed: [-0.008, -0.025],
    drift: [-0.006, 0.006],
    glow: 8,
  },
};

export class CreatureRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.frames = {};
    this.currentAnim = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.lastTime = 0;
    this.creatureId = null;
    this.rafId = null;
    this.habitatId = 'cave';

    // ── Bob ────────────────────────────────────────────────────
    this.bobOffset = 0;
    this.bobTimer = 0;

    // ── Procedural animation state ─────────────────────────────
    this.scaleX = 1;      // for squish/stretch
    this.scaleY = 1;
    this.droopAngle = 0;  // for sad tilt

    // ── Wander ─────────────────────────────────────────────────
    this.posX = 0.5;
    this.posY = 0.80;
    this.targetX = 0.5;
    this.targetY = 0.80;
    this.isMoving = false;
    this.facingLeft = false;
    this.moveSpeed = 0.00010;
    this.wanderTimer = 0;
    this.wanderDelay = 3000 + Math.random() * 4000;

    // ── Mood ───────────────────────────────────────────────────
    this.currentMood = 'ok';
    this.moodBurstTimer = 0;
    this.moodBurstInterval = 22000 + Math.random() * 13000;

    // ── Particles ──────────────────────────────────────────────
    this.particles = [];
  }

  // ── Load ───────────────────────────────────────────────────────

  async load(creatureId) {
    this.creatureId = creatureId;
    const creature = CREATURES[creatureId];
    this.habitatId = creature.habitat?.id || 'cave';
    const allPaths = Object.values(creature.animations).flat();
    await Promise.all(allPaths.map(p => this._loadImage(p)));
    this._initParticles();
    console.log(`[Renderer] Loaded ${creatureId} | habitat: ${this.habitatId}`);
  }

  _loadImage(path) {
    if (this.frames[path]) return Promise.resolve();
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => { this.frames[path] = img; resolve(); };
      img.onerror = () => { console.warn(`Frame missing: ${path}`); resolve(); };
      img.src = path;
    });
  }

  // ── Particles ──────────────────────────────────────────────────

  _initParticles() {
    const cfg = HABITAT_PARTICLES[this.habitatId] || HABITAT_PARTICLES.cave;
    this.particles = [];
    for (let i = 0; i < cfg.count; i++) {
      this.particles.push(this._spawnParticle(cfg, true));
    }
  }

  _spawnParticle(cfg, randomY = false) {
    return {
      x: Math.random(),
      y: randomY ? Math.random() : 1.05,
      alpha: Math.random() * 0.6 + 0.2,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      size: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
      speed: cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]),
      drift: cfg.drift[0] + Math.random() * (cfg.drift[1] - cfg.drift[0]),
      color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
      glow: cfg.glow,
    };
  }

  _updateParticles(delta) {
    const cfg = HABITAT_PARTICLES[this.habitatId] || HABITAT_PARTICLES.cave;
    const t = delta / 1000;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speed * t * 0.6;
      p.x += p.drift * t * 0.4;
      p.alpha += p.alphaDir * 0.008;
      if (p.alpha > 0.85) p.alphaDir = -1;
      if (p.alpha < 0.1)  p.alphaDir =  1;
      // Respawn when drifted off screen
      if (p.y < -0.05 || p.x < -0.05 || p.x > 1.05) {
        this.particles[i] = this._spawnParticle(cfg, false);
      }
    }
  }

  _drawParticles() {
    const { canvas, ctx } = this;
    for (const p of this.particles) {
      const px = p.x * canvas.width;
      const py = p.y * canvas.height;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur  = p.glow;
      ctx.shadowColor = p.color + '1)';
      ctx.fillStyle   = p.color + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Public API ─────────────────────────────────────────────────

  setAnimation(name) {
    if (this.currentAnim === name) return;
    this.currentAnim = name;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  _idleAnim() {
    const creature = CREATURES[this.creatureId];
    const dirIdle = this.facingLeft ? 'idle_west' : 'idle_east';
    return creature?.animations[dirIdle] ? dirIdle : 'idle';
  }

  _isIdleAnim(name) {
    return name === 'idle' || name === 'idle_east' || name === 'idle_west';
  }

  setMood(mood) {
    this.currentMood = mood;
  }

  start() {
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  // ── Loop ───────────────────────────────────────────────────────

  _loop(now) {
    const delta = now - this.lastTime;
    this.lastTime = now;
    this._update(delta);
    this._draw();
    this.rafId = requestAnimationFrame(t => this._loop(t));
  }

  _update(delta) {
    // Frame advance
    this.frameTimer += delta;
    if (this.frameTimer >= FRAME_MS) {
      this.frameTimer -= FRAME_MS;
      const creature = CREATURES[this.creatureId];
      const anim = creature?.animations[this.currentAnim] || creature?.animations.idle;
      if (anim) this.currentFrame = (this.currentFrame + 1) % anim.length;
    }

    // Bob — gentle sine
    this.bobTimer += delta;
    this.bobOffset = Math.sin((this.bobTimer / 1400) * Math.PI) * 3;

    // Procedural mood effects
    this._updateMoodEffects(delta);

    // Mood burst
    const inAction = ['eating', 'training', 'happy'].includes(this.currentAnim);
    if (!inAction && this.currentMood === 'happy') {
      this.moodBurstTimer += delta;
      if (this.moodBurstTimer >= this.moodBurstInterval) {
        this.moodBurstTimer = 0;
        this.moodBurstInterval = 22000 + Math.random() * 13000;
        this.setAnimation('happy');
        setTimeout(() => this.setAnimation(this._idleAnim()), 1600);
      }
    }

    // Wander
    if (!inAction) {
      this.wanderTimer += delta;
      if (!this.isMoving && this.wanderTimer >= this.wanderDelay) {
        this.wanderTimer = 0;
        this.wanderDelay = 3500 + Math.random() * 5000;
        const newX = 0.18 + Math.random() * 0.64;
        if (Math.abs(newX - this.posX) > 0.10) {
          this.targetX = newX;
          this.targetY = 0.78 + Math.random() * 0.04;
          this.facingLeft = newX < this.posX;
          this.isMoving = true;
        }
      }

      if (this.isMoving) {
        const creature = CREATURES[this.creatureId];
        if (creature?.animations.walk && this._isIdleAnim(this.currentAnim)) {
          this.setAnimation('walk');
        }
        const dx = this.targetX - this.posX;
        const dy = this.targetY - this.posY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.006) {
          this.posX = this.targetX;
          this.posY = this.targetY;
          this.isMoving = false;
          if (this.currentAnim === 'walk') this.setAnimation(this._idleAnim());
        } else {
          const step = this.moveSpeed * delta;
          this.posX += (dx / dist) * step;
          this.posY += (dy / dist) * step;
        }
      } else if (this.currentAnim === 'walk') {
        this.setAnimation(this._idleAnim());
      }
    }

    // Particles
    this._updateParticles(delta);
  }

  _updateMoodEffects(delta) {
    const t = delta / 1000;
    // Happy: slight squish bounce in sync with bob
    if (this.currentAnim === 'happy') {
      const bounce = Math.sin((this.bobTimer / 300) * Math.PI);
      this.scaleX = 1 + bounce * 0.08;
      this.scaleY = 1 - bounce * 0.06;
    } else if (this.currentMood === 'sad' || this.currentMood === 'critical') {
      // Sad: lean forward slightly
      this.droopAngle = Math.min(this.droopAngle + t * 0.15, 0.12);
      this.scaleX = 1;
      this.scaleY = 1;
    } else {
      // Recover
      this.droopAngle = Math.max(this.droopAngle - t * 0.1, 0);
      const overshootX = 1 + Math.sin((this.bobTimer / 1400) * Math.PI) * 0.012;
      this.scaleX = overshootX;
      this.scaleY = 2 - overshootX; // inverse squeeze
    }
  }

  // ── Draw ───────────────────────────────────────────────────────

  _draw() {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!this.creatureId) return;

    // Particles behind creature
    this._drawParticles();

    const creature = CREATURES[this.creatureId];
    const anim = creature.animations[this.currentAnim] || creature.animations.idle;
    const img  = this.frames[anim[this.currentFrame % anim.length]];
    if (!img) return;

    const w = img.naturalWidth  * SCALE;
    const h = img.naturalHeight * SCALE;
    const cx = this.posX * canvas.width;
    const cy = this.posY * canvas.height + this.bobOffset;

    ctx.save();
    ctx.translate(cx, cy);

    // Droop (sad tilt forward)
    if (this.droopAngle) ctx.rotate(this.droopAngle);

    // Squish/stretch
    ctx.scale(this.facingLeft ? -this.scaleX : this.scaleX, this.scaleY);

    // Draw centered, bottom-anchored
    ctx.drawImage(img, -w / 2, -h, w, h);

    ctx.restore();
  }

  resize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }
}
