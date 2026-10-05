import type { MetadataRoute } from "next";

const siteUrl = "https://changeverify.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/ai-code-change-verification`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/cursor-code-review`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/ai-generated-code-review`,
      lastModified: new Date(),
    },
  ];
}
