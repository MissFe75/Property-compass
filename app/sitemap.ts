import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://propertycompass.sextantdigital.com.au",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/app",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/app/mortgage",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/app/yield",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/app/cgt",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/app/compare",
      lastModified: new Date("2026-04-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/lab",
      lastModified: new Date("2026-04-19"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://propertycompass.sextantdigital.com.au/work-with-me",
      lastModified: new Date("2026-04-19"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
