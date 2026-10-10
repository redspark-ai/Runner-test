import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import cfg from '../../scene2.json';
export const Stills: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [tl, setTl] = useState<any>(null);
  const [h] = useState(() => delayRender('tl'));
  useEffect(() => { fetch(staticFile('timeline.json')).then(r => r.json()).then(j => { setTl(j); continueRender(h); }); }, []);
  if (!tl) return null;
  let i = tl.segs.findIndex((s: any) => frame >= s.start && frame < s.end);
  if (i < 0) i = tl.segs.length - 1;
  const sg = cfg.segments[i];
  const t = (frame - tl.segs[i].start) / fps, len = (tl.segs[i].end - tl.segs[i].start) / fps;
  const open = tl.open[frame] === 1;
  let sx = 1, sy = 1, tx = 0, ty = 0, rot = 0;
  if (sg.effect === 'slowzoom') { sx = sy = 1 + 0.18 * (t / len); }
  if (sg.effect === 'shake') { sx = sy = 1.15 + 0.3 * Math.max(0, 1 - t * 4); tx = Math.sin(frame * 2.9) * 18; ty = Math.cos(frame * 3.7) * 14; rot = Math.sin(frame * 2.1) * 3; }
  if (sg.effect === 'bounce') { const b = Math.abs(Math.sin(t * 9)); ty = -b * 70; sy = 1 + 0.08 * (1 - b); sx = 1 - 0.05 * (1 - b); rot = Math.sin(t * 9) * 4; }
  return (
    <AbsoluteFill style={{background: sg.bg}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile(`faces/f${i}_${open ? 'o' : 'c'}.svg`)} style={{width: 460, height: 460, transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sx},${sy})`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 56, fontFamily: 'sans-serif', textShadow: '0 4px 0 #000, 0 0 12px #000'}}>{sg.text}</div>
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
