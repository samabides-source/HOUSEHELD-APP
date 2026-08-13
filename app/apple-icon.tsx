import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SOURCE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#4f46e5" /><path d="M16 7 6 15h3v10h5v-6h4v6h5V15h3L16 7z" fill="#fff" /></svg>';
const DATA_URI = `data:image/svg+xml;base64,${Buffer.from(SOURCE_SVG).toString("base64")}`;

/** Generiert den apple-touch-icon (180×180 PNG) aus derselben Bildmarke wie app/icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DATA_URI} width={size.width} height={size.height} alt="" />
      </div>
    ),
    { ...size },
  );
}
