import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Tayhlor | Bespoke Tailoring Atelier';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#101B2D',
          padding: '60px',
        }}
      >
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '24px',
            border: '2px solid rgba(179, 197, 232, 0.3)',
            backgroundColor: '#1D2A44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '68px',
            fontWeight: 'bold',
            marginBottom: '28px',
          }}
        >
          T
        </div>
        <div
          style={{
            fontSize: '76px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          Tayhlor
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#B3C5E8',
            letterSpacing: '0.01em',
            display: 'flex',
          }}
        >
          Bespoke tailoring management platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

