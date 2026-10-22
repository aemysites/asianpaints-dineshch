// crop.mjs <in.png> <x> <y> <w> <h> <out.png> [scale=0.5] — box-filter downscaled crop (pngjs only).
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [inp, x0, y0, w0, h0, out, sc = '0.5'] = process.argv.slice(2);
if (!out) { console.log('usage: crop.mjs <in.png> <x> <y> <w> <h> <out.png> [scale=0.5]'); process.exit(2); }
const src = PNG.sync.read(readFileSync(inp));
const x = +x0, y = +y0, w = Math.min(+w0, src.width - x), h = Math.min(+h0, src.height - y), s = +sc;
const ow = Math.max(1, Math.round(w * s)), oh = Math.max(1, Math.round(h * s));
const dst = new PNG({ width: ow, height: oh });
for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
  const sx0 = Math.floor(i / s), sy0 = Math.floor(j / s), sx1 = Math.max(sx0 + 1, Math.floor((i + 1) / s)), sy1 = Math.max(sy0 + 1, Math.floor((j + 1) / s));
  const acc = [0, 0, 0, 0]; let n = 0;
  for (let yy = sy0; yy < sy1; yy++) for (let xx = sx0; xx < sx1; xx++) { const k = ((y + yy) * src.width + (x + xx)) * 4; for (let c = 0; c < 4; c++) acc[c] += src.data[k + c]; n++; }
  const o = (j * ow + i) * 4; for (let c = 0; c < 4; c++) dst.data[o + c] = Math.round(acc[c] / n);
}
writeFileSync(out, PNG.sync.write(dst));
console.log(`crop ${inp} [${x},${y} ${w}x${h}] x${s} -> ${out} (${ow}x${oh})`);
