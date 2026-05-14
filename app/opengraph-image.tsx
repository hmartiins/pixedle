import sharp from "sharp";
import { pickDailyEmoji } from "@/lib/daily";
import { renderPixelatedEmoji } from "@/lib/emoji-image";

export const runtime = "nodejs";
// Always regenerate so the image flips at the daily seed boundary.
export const dynamic = "force-dynamic";

export const alt = "PIXEDLE — adivinhe o emoji do dia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Matches the app's --bg / themeColor so the OG composites onto the same
// dark backdrop the player sees.
const BG = { r: 15, g: 15, b: 26 };
const EMOJI_RENDER = 600;

export default async function Image() {
  const target = pickDailyEmoji();
  // Level 1 = blockiest — never expose the sharp emoji on a shareable URL.
  const pixelated = await renderPixelatedEmoji(target.emoji, 1);
  const upscaled = await sharp(pixelated)
    .resize(EMOJI_RENDER, EMOJI_RENDER, { kernel: "nearest" })
    .png()
    .toBuffer();
  const composed = await sharp({
    create: {
      width: size.width,
      height: size.height,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: upscaled, gravity: "center" }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(composed), {
    headers: { "content-type": contentType },
  });
}
