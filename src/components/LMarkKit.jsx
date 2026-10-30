import React, { useEffect, useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { Button, Modal, Seg, Thumb, Spinner, cx } from './ui.jsx';
import { useStore } from '../lib/store.jsx';
import { fmt } from '../lib/score.js';

const GOLD = '#B4975A';
const GOLD_TEXT = '#D2B77A';
const BLACK = '#000000';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Gold tile with a black L: the core of the mark.
function tile(ctx, x, y, s) {
  ctx.fillStyle = GOLD;
  roundRect(ctx, x, y, s, s, s * 0.14);
  ctx.fill();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = s * 0.17;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x + s * 0.34, y + s * 0.18);
  ctx.lineTo(x + s * 0.34, y + s * 0.76);
  ctx.lineTo(x + s * 0.8, y + s * 0.76);
  ctx.stroke();
}

function spaced(ctx, px) {
  try { ctx.letterSpacing = `${px}px`; } catch (e) { /* older browsers */ }
}

// Compact badge (tile + "L EARNED") anchored at top-right corner (rx, y).
function badge(ctx, rx, y, s) {
  const pad = s * 0.16;
  const w = s + pad * 2;
  const x = rx - w;
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  roundRect(ctx, x, y, w, w, s * 0.26);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.stroke();
  tile(ctx, x + pad, y + pad, s);
}

export function drawLMark(variant, p) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  if (variant === 'sticker') {
    // The L Mark alone: gold L tile in a black frame with a gold ring.
    c.width = 800; c.height = 800;
    ctx.fillStyle = BLACK;
    roundRect(ctx, 80, 80, 640, 640, 110);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 10;
    roundRect(ctx, 80, 80, 640, 640, 110);
    ctx.stroke();
    tile(ctx, 170, 170, 460);
  } else {
    // Transparent 9:16 frame: badge top-right, score chip lower-left. Drop it on top of the video in an editor.
    c.width = 1080; c.height = 1920;
    badge(ctx, 1080 - 64, 200, 120);
    const chip = `${fmt(p.score)} g CO₂e / 1k views · under the ${fmt(p.line)} L line`;
    ctx.font = '600 34px "JetBrains Mono", monospace';
    const w = ctx.measureText(chip).width + 64;
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    roundRect(ctx, 64, 1500, w, 76, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(chip, 96, 1539);
  }
  return c;
}

export function LMarkModal({ open, onClose, p }) {
  const { notify } = useStore();
  const [variant, setVariant] = useState('sticker');
  const [img, setImg] = useState(null);
  const [copied, setCopied] = useState(false);
  const caption = `Took the L on this one: ${fmt(p.score)} g CO₂e per 1,000 views, under the ${fmt(p.line)} L line. Same story, lighter post. #TakingTheL #LMark`;

  useEffect(() => {
    if (!open) return;
    let live = true;
    setImg(null);
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      if (live) setImg(drawLMark(variant, p).toDataURL('image/png'));
    });
    return () => { live = false; };
  }, [open, variant, p.score, p.line, p.verified]); // eslint-disable-line react-hooks/exhaustive-deps

  const filename = `L-Mark-${variant}-${p.id}.png`;
  const download = () => {
    try {
      const a = document.createElement('a');
      a.href = img;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      notify('L Mark saved as PNG');
    } catch (e) {
      notify('Press and hold the image to save it', 'bad');
    }
  };
  const share = async () => {
    try {
      const blob = await (await fetch(img)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
        return;
      }
      throw new Error('no share');
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(caption);
        setCopied(true);
        notify('Sharing is not available here. Caption copied instead.');
      } catch (e2) {
        notify('Save the image, then post it with your caption', 'bad');
      }
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(caption); setCopied(true); notify('Caption copied'); }
    catch (e) { document.getElementById('lmark-caption')?.select(); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Your L Mark" wide>
      <div className="flex flex-col gap-5">
        <Seg label="L Mark format" value={variant} onChange={setVariant} options={[{ value: 'sticker', label: 'Sticker' }, { value: 'overlay', label: 'Video overlay 9:16' }]} />
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_1fr]">
          <div className="flex items-center justify-center rounded-2xl p-4" style={{ background: 'repeating-conic-gradient(#EFEFEF 0% 25%, #FFFFFF 0% 50%) 50% / 20px 20px' }}>
            {variant === 'sticker' ? (
              img ? <img src={img} alt="L Mark sticker" className="w-full max-w-[260px]" /> : <Spinner size={22} />
            ) : (
              <div className="relative w-full max-w-[200px]">
                <Thumb index={p.thumb} secs={null} play={false} className="aspect-[9/16] w-full rounded-xl" label={p.title} />
                {img ? <img src={img} alt="L Mark video overlay" className="absolute inset-0 h-full w-full" /> : <span className="absolute inset-0 flex items-center justify-center"><Spinner size={22} /></span>}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 text-[14px]">
            <p className="text-ink-2">
              {variant === 'sticker'
                ? 'The L Mark as a transparent PNG sticker. Add it to a story, a carousel slide or your bio highlight.'
                : 'A transparent 1080×1920 PNG. Lay it over your video in CapCut or any editor before you post. The video underneath is only a preview.'}
            </p>
            <p className="text-mute">The L Mark is yours to share. It is not added to TikTok, Instagram or YouTube automatically.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="brand" onClick={download} disabled={!img}><Download size={17} /> Download L Mark</Button>
              <Button variant="outline" onClick={share} disabled={!img}><Share2 size={17} /> Share L Mark</Button>
            </div>
            <p className="text-[12px] text-mute">If the download does not start, press and hold (or right-click) the image to save it.</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="label" htmlFor="lmark-caption">Suggested caption</label>
          <div className="flex gap-2">
            <textarea id="lmark-caption" readOnly className="input h-20 flex-1 resize-none text-[13px]" value={caption} />
            <Button variant="ghost" onClick={copy} className="self-start" aria-label="Copy caption">{copied ? <Check size={17} /> : <Copy size={17} />}</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
