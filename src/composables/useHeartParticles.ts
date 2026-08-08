export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
}

const HEART_COLORS = [
  '#ff6b9d',
  '#ff8a80',
  '#ea80fc',
  '#ff4081',
  '#ff9ec4',
  '#e91e63',
  '#ffb3c6',
]

function buildHeartPath(size: number): Path2D {
  const s = size
  const path = new Path2D()
  // Scale the heart to fit the particle size
  const sx = s / 24
  const sy = s / 24
  path.moveTo(12 * sx, 21 * sy)
  path.bezierCurveTo(12 * sx, 21 * sy, 1 * sx, 14 * sy, 1 * sx, 7 * sy)
  path.bezierCurveTo(1 * sx, 3 * sy, 3.5 * sx, 1 * sy, 7 * sx, 1 * sy)
  path.bezierCurveTo(9.5 * sx, 1 * sy, 11.5 * sx, 2.5 * sy, 12 * sx, 4 * sy)
  path.bezierCurveTo(12.5 * sx, 2.5 * sy, 14.5 * sx, 1 * sy, 17 * sx, 1 * sy)
  path.bezierCurveTo(20.5 * sx, 1 * sy, 23 * sx, 3 * sy, 23 * sx, 7 * sy)
  path.bezierCurveTo(23 * sx, 14 * sy, 12 * sx, 21 * sy, 12 * sx, 21 * sy)
  path.closePath()
  return path
}

export function createParticles(
  x: number,
  y: number,
  count: number = 25
): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2)
    // Bias upward
    const speed = 1.5 + Math.random() * 3.5
    const life = 0.6 + Math.random() * 1.2
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * 1.2,
      vy: Math.sin(angle) * speed - 1.5, // upward bias
      size: 8 + Math.random() * 18,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      alpha: 1,
      life: 0,
      maxLife: life,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
    })
  }
  return particles
}

/** Create a dramatic heart-shatter burst — larger fragments, wider scatter, longer life */
export function createShatterBurst(
  x: number,
  y: number,
  count: number = 50
): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2)
    const speed = 2.5 + Math.random() * 6
    const life = 1.0 + Math.random() * 1.8
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * 1.5,
      vy: Math.sin(angle) * speed * 1.5 - 1.0,
      size: 14 + Math.random() * 32,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      alpha: 1,
      life: 0,
      maxLife: life,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    })
  }
  return particles
}

/** Create a reassemble burst — particles start scattered around and fly inward to (x, y) */
export function createReassembleBurst(
  x: number,
  y: number,
  count: number = 40
): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 180
    const startX = x + Math.cos(angle) * dist
    const startY = y + Math.sin(angle) * dist
    // Velocity points toward center
    const speed = 2.0 + Math.random() * 3.0
    const life = 0.5 + Math.random() * 0.7
    particles.push({
      x: startX,
      y: startY,
      vx: -Math.cos(angle) * speed * 1.3,
      vy: -Math.sin(angle) * speed * 1.3 - 0.5,
      size: 10 + Math.random() * 26,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      alpha: 0.9,
      life: 0,
      maxLife: life,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
    })
  }
  return particles
}

export function updateParticles(
  particles: Particle[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  deltaTime: number
): Particle[] {
  const dt = deltaTime / 16.67 // normalize to ~60fps

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const alive: Particle[] = []

  for (const p of particles) {
    p.life += dt / 60
    if (p.life >= p.maxLife) continue

    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy -= 0.02 * dt // slight gravity reversal (float up)
    p.alpha = 1 - p.life / p.maxLife
    p.size *= 0.998
    p.rotation += p.rotationSpeed * dt

    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color

    const heart = buildHeartPath(p.size)
    ctx.fill(heart)

    ctx.restore()

    alive.push(p)
  }

  return alive
}
