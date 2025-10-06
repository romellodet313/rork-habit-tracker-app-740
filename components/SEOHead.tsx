import { useEffect } from 'react';
import { Platform } from 'react-native';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEOHead({
  title = 'MomentPro - Beautiful Habit Tracker & Progress Visualizer',
  description = 'Transform your habits into art with MomentPro. Track daily habits, build streaks, visualize progress with beautiful charts and 3D gardens. Gamification, achievements, and routines to help you stay motivated.',
  image = 'https://momentpro.cloud/og-image.png',
  url = 'https://momentpro.cloud',
  type = 'website',
}: SEOHeadProps) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    document.title = title;

    updateMetaTag('description', description, true);
    updateMetaTag('keywords', 'habit tracker, habit tracking app, daily habits, streak tracker, progress visualization, productivity app, goal tracker, routine builder, gamification, achievement system', true);

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'MomentPro');

    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:site', '@momentpro', true);
    updateMetaTag('twitter:creator', '@momentpro', true);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = url;

    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'MomentPro',
      description: description,
      url: url,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
      },
      author: {
        '@type': 'Organization',
        name: 'MomentPro',
        url: url,
      },
    };

    structuredData.textContent = JSON.stringify(schema);
  }, [title, description, image, url, type]);

  return null;
}
