const omggif = require('omggif');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SRC      = path.join(__dirname, 'Vex V.3 with rotations and animations/animations');
const SRC_ROOT = path.join(__dirname, 'Vex V.3 with rotations and animations');
const DST      = path.join(__dirname, 'web/assets/vex3/animations');

const GIFS = [
  { file: 'Vex idle East.gif',                    dir: 'idle_east',  base: SRC      },
  { file: 'Ves idle West.gif',                    dir: 'idle_west',  base: SRC      },
  { file: 'Vex v.3 happy_south (1).gif',          dir: 'happy',      base: SRC      },
  { file: 'Vex Frustrated. gif.gif',              dir: 'frustrated', base: SRC      },
  { file: 'Wave animation/Vex wave south.gif',    dir: 'wave',       base: SRC      },
  { file: 'Vex v.3 eating_south.gif',             dir: 'eating',     base: SRC      },
];

function extractGif({ file, dir, base }) {
  const src = path.join(base || SRC, file);
  const dst = path.join(DST, dir);

  if (!fs.existsSync(src)) { console.warn('MISSING:', src); return; }
  fs.mkdirSync(dst, { recursive: true });

  const buf   = fs.readFileSync(src);
  const bytes = new Uint8Array(buf);
  const gr    = new omggif.GifReader(bytes);

  const W = gr.width;
  const H = gr.height;

  // composite canvas (accumulates previous frames for disposal=1)
  const composite = createCanvas(W, H);
  const compCtx   = composite.getContext('2d');

  for (let i = 0; i < gr.numFrames(); i++) {
    const info     = gr.frameInfo(i);
    const pixels   = new Uint8Array(W * H * 4);
    gr.decodeAndBlitFrameRGBA(i, pixels);

    // build this frame's imagedata on a temp canvas
    const frame    = createCanvas(W, H);
    const fCtx     = frame.getContext('2d');
    const id       = fCtx.createImageData(W, H);
    id.data.set(pixels);
    fCtx.putImageData(id, 0, 0);

    // composite over previous if disposal !== 2
    if (info.disposal !== 2) {
      compCtx.drawImage(frame, 0, 0);
    } else {
      compCtx.clearRect(0, 0, W, H);
      compCtx.drawImage(frame, 0, 0);
    }

    const outPath = path.join(dst, `frame_${String(i).padStart(3, '0')}.png`);
    fs.writeFileSync(outPath, composite.toBuffer('image/png'));
  }

  console.log(`${dir}: ${gr.numFrames()} frames  (${W}x${H})`);
}

for (const g of GIFS) extractGif(g);
console.log('Done.');
