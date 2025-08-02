import { MetadataRoute } from 'next'
 
export const dynamic = 'force-static'

export function GET(): Response {
  const manifest: MetadataRoute.Manifest = {
    name: 'Drillzy',
    short_name: 'Drillzy',
    description: 'Drillzy by Asto Eterna',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'https://placehold.co/192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: 'https://placehold.co/512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
