import type { MetadataRoute } from "next";

const siteUrl = "https://changeverify.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/result`,
      lastModified: new Date(),
    },
  ];
}
