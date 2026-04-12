import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown>;
}

export default function SEOHead({ title, description, ogImage, ogType = "website", canonicalUrl, jsonLd }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Content Catalyst`;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
      setMeta("twitter:description", description, "name");
    }
    setMeta("og:title", title, "property");
    setMeta("og:type", ogType, "property");
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", title, "name");

    if (ogImage) {
      setMeta("og:image", ogImage, "property");
      setMeta("twitter:image", ogImage, "name");
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalUrl);
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const jsonLdEl = document.querySelector('script[data-seo-jsonld]');
      if (jsonLdEl) jsonLdEl.remove();
    };
  }, [title, description, ogImage, ogType, canonicalUrl, jsonLd]);

  return null;
}
