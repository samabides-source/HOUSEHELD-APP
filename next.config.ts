import type { NextConfig } from "next";

/**
 * Rein statische, clientseitige App (kein Server-State, keine Cookies/Sessions) – die CSP kann
 * deshalb ohne Nonce auskommen. `script-src 'unsafe-inline'` bleibt nötig für Next.js' eigenes
 * Hydration-Bootstrap-Script (`self.__next_f.push(...)`), das auf statisch prerendertem HTML ohne
 * Nonce ausgeliefert wird. `connect-src` erlaubt zusätzlich `api.openverse.org`, weil die
 * Demo-Daten-Funktion (lib/demo-data.ts) Fotos ausschliesslich von dort lädt.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self'",
  "img-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self' https://api.openverse.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Die App nutzt keine dieser Browser-APIs (Fotos laufen über <input type="file">, nicht getUserMedia). */
const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
].join(", ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
        ],
      },
    ];
  },
};

export default nextConfig;
