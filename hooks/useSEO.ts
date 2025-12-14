
import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schema?: object; // JSON-LD Structured Data
}

export const useSEO = ({
  title,
  description,
  keywords = [],
  canonicalUrl = window.location.href,
  ogImage = '/logo.svg',
  schema
}: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Meta Keywords
    if (keywords.length > 0) {
      let metaKeywords = document.querySelector("meta[name='keywords']");
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    }

    // 4. Update Canonical URL
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 5. Update Open Graph Data
    const updateMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property='${property}']`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', ogImage);
    updateMeta('og:url', canonicalUrl);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);

    // 6. Inject JSON-LD Structure Data (Dynamic Schema)
    if (schema) {
      let scriptJsonLd = document.querySelector("script[type='application/ld+json'][id='dynamic-schema']");
      if (!scriptJsonLd) {
        scriptJsonLd = document.createElement('script');
        scriptJsonLd.setAttribute('type', 'application/ld+json');
        scriptJsonLd.setAttribute('id', 'dynamic-schema');
        document.head.appendChild(scriptJsonLd);
      }
      scriptJsonLd.textContent = JSON.stringify(schema);
    }

  }, [title, description, keywords, canonicalUrl, schema, ogImage]);
};
