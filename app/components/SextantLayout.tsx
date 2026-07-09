import SextantNav from './SextantNav'
import SextantFooter from './SextantFooter'

const STARS = [
  { x: 3,  y: 8,  r: 1.5, o: 0.9 }, { x: 7,  y: 22, r: 1,   o: 0.7 },
  { x: 12, y: 4,  r: 1,   o: 0.8 }, { x: 18, y: 35, r: 1.5, o: 0.6 },
  { x: 24, y: 12, r: 1,   o: 0.9 }, { x: 31, y: 28, r: 1,   o: 0.5 },
  { x: 38, y: 8,  r: 1.5, o: 0.8 }, { x: 45, y: 18, r: 1,   o: 0.7 },
  { x: 52, y: 5,  r: 1,   o: 0.9 }, { x: 58, y: 32, r: 1.5, o: 0.6 },
  { x: 64, y: 15, r: 1,   o: 0.8 }, { x: 71, y: 28, r: 1,   o: 0.5 },
  { x: 78, y: 7,  r: 1.5, o: 0.9 }, { x: 84, y: 22, r: 1,   o: 0.7 },
  { x: 91, y: 14, r: 1,   o: 0.6 }, { x: 96, y: 35, r: 1.5, o: 0.8 },
  { x: 5,  y: 48, r: 1,   o: 0.6 }, { x: 11, y: 58, r: 1.5, o: 0.8 },
  { x: 17, y: 42, r: 1,   o: 0.5 }, { x: 23, y: 52, r: 1,   o: 0.9 },
  { x: 29, y: 65, r: 1.5, o: 0.7 }, { x: 35, y: 48, r: 1,   o: 0.6 },
  { x: 42, y: 62, r: 1,   o: 0.8 }, { x: 48, y: 42, r: 1.5, o: 0.5 },
  { x: 54, y: 55, r: 1,   o: 0.9 }, { x: 61, y: 72, r: 1,   o: 0.6 },
  { x: 67, y: 52, r: 1.5, o: 0.7 }, { x: 73, y: 65, r: 1,   o: 0.8 },
  { x: 80, y: 78, r: 1,   o: 0.5 }, { x: 86, y: 58, r: 1.5, o: 0.9 },
  { x: 92, y: 72, r: 1,   o: 0.6 }, { x: 8,  y: 75, r: 1,   o: 0.7 },
  { x: 15, y: 85, r: 1.5, o: 0.8 }, { x: 22, y: 72, r: 1,   o: 0.5 },
  { x: 28, y: 88, r: 1,   o: 0.9 }, { x: 34, y: 82, r: 1.5, o: 0.6 },
  { x: 41, y: 92, r: 1,   o: 0.7 }, { x: 47, y: 75, r: 1,   o: 0.8 },
  { x: 53, y: 88, r: 1.5, o: 0.5 }, { x: 60, y: 85, r: 1,   o: 0.9 },
  { x: 66, y: 95, r: 1,   o: 0.6 }, { x: 72, y: 82, r: 1.5, o: 0.7 },
  { x: 79, y: 92, r: 1,   o: 0.8 }, { x: 85, y: 95, r: 1,   o: 0.5 },
  { x: 90, y: 85, r: 1.5, o: 0.9 }, { x: 15, y: 18, r: 1,   o: 0.7 },
  { x: 55, y: 38, r: 1.5, o: 0.6 }, { x: 88, y: 45, r: 1,   o: 0.8 },
  { x: 2,  y: 62, r: 1,   o: 0.5 }, { x: 97, y: 58, r: 1.5, o: 0.7 },
]

export default function SextantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#060d1f', minHeight: '100vh', color: 'white', position: 'relative' }}>
      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`} cy={`${s.y}%`}
              r={s.r}
              fill={`rgba(255,255,255,${s.o})`}
            />
          ))}
        </svg>
        {/* Subtle nebula glow for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 25% 30%, rgba(20,55,110,0.35) 0%, transparent 60%)',
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SextantNav />
        {children}
        <SextantFooter />
      </div>
    </div>
  )
}
