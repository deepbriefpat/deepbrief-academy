import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
}

export function MetaTags({ title, description, ogImage, ogUrl }: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Create or update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const updateNameTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    if (title) {
      updateMetaTag("og:title", title);
      updateNameTag("twitter:title", title);
    }

    if (description) {
      updateMetaTag("og:description", description);
      updateNameTag("description", description);
      updateNameTag("twitter:description", description);
    }

    if (ogImage) {
      updateMetaTag("og:image", ogImage);
      updateNameTag("twitter:image", ogImage);
      updateNameTag("twitter:card", "summary_large_image");
    }

    if (ogUrl) {
      updateMetaTag("og:url", ogUrl);
    }

    updateMetaTag("og:type", "website");
  }, [title, description, ogImage, ogUrl]);

  return null;
}
