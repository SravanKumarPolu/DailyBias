import { useLocation } from "react-router-dom";

interface StructuredDataProps {
  type: "website" | "organization" | "article" | "breadcrumb";
  data?: Record<string, unknown>;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

const SITE_URL = "https://debiasdaily.com";

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const location = useLocation();

  const getSchema = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "DebiasDaily",
          url: SITE_URL,
        };

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "DebiasDaily",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/app-icon.png`,
          },
        };

      case "article": {
        const title = data?.title as string | undefined;
        const description = data?.description as string | undefined;
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: description,
          url: `${SITE_URL}${location.pathname}`,
          author: {
            "@type": "Organization",
            name: "DebiasDaily",
          },
          publisher: {
            "@type": "Organization",
            name: "DebiasDaily",
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/app-icon.png`,
            },
          },
        };
      }

      case "breadcrumb": {
        const items = data?.items as BreadcrumbItem[] | undefined;
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items?.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
          })),
        };
      }

      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData;
