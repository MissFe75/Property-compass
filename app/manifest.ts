import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Property Compass',
    short_name: 'Prop Compass',
    description: 'Free Australian property investment calculators. No signup, no paywall.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#3D5A80',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
