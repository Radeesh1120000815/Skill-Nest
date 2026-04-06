import { T } from './theme.jsx';

export default function ResourceBanner({
  title    = 'Page Title',
  subtitle = '',
}) {
  return (
    <div style={{ position: 'relative', marginBottom: '0' }}>

      {/* Hero gradient box  */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${T.heroFrom} 0%, ${T.heroTo} 100%)`,
        overflow: 'hidden',
        paddingBottom: '70px',
      }}>

        {/* Dot grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px', pointerEvents: 'none',
        }}/>

        {/* Purple glow top-right */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-40px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)',
          filter: 'blur(32px)', pointerEvents: 'none',
        }}/>

        {/* Blue glow bottom-left */}
        <div style={{
          position: 'absolute', bottom: '0', left: '8%',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)',
          filter: 'blur(24px)', pointerEvents: 'none',
        }}/>

        {/* Wave background watermark */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/upload-bg.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.10, pointerEvents: 'none',
        }}/>

        {/* Text content only — no image, no back link  */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1100px', margin: '0 auto',
          padding: '40px 28px 20px',
        }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(24px, 4vw, 42px)',
            color: '#FFFFFF', lineHeight: 1.08,
            marginBottom: '12px', letterSpacing: '-0.025em',
          }}>
            {title}
          </h1>

          {subtitle && (
            <p style={{
              color: 'rgba(255,255,255,0.58)', fontSize: '14.5px',
              fontFamily: 'Inter, sans-serif', lineHeight: 1.65,
              maxWidth: '480px', margin: 0,
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* SVG wave curve */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          lineHeight: 0, zIndex: 1,
        }}>
          <svg
            viewBox="0 0 1440 70"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '70px' }}
          >
            <path
              d="M0,0 C240,70 480,70 720,35 C960,0 1200,0 1440,50 L1440,70 L0,70 Z"
              fill={T.appBg}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
