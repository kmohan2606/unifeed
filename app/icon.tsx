import { ImageResponse } from "next/og"
import logo from "@/logo.svg"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const logoUrl = new URL(logo.src, baseUrl).toString()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <img src={logoUrl} alt="UniFeed logo" width="64" height="64" />
      </div>
    ),
    {
      ...size,
    }
  )
}
