import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PharmaDist ERP - Wholesale Medicine Distribution",
    short_name: "PharmaDist ERP",
    description: "Enterprise Web-Based Wholesale Medicine Distribution Management System",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0071E3",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
