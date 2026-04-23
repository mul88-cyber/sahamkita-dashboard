import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/watchlist/', '/profile/'],
    },
    sitemap: 'https://sahamkita-dashboard.vercel.app/sitemap.xml',
  };
}
