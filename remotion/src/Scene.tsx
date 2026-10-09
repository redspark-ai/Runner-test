import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import scene from '../../scene.json';
import {canvas} from './viewer.js';
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('setup', {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    (async () => {
      const w = window as any;
      w.ASSET = (f: string) => staticFile(f);
      const c = await (await fetch(staticFile('mouth.json'))).json();
      w.cues = c.mouthCues;
      host.current!.appendChild(canvas);
      await w.setup((scene as any).anims);
      setReady(true);
      continueRender(h);
    })();
  }, []);
  useEffect(() => {
    if (ready) (window as any).renderAt(frame / fps, true);
  }, [frame, ready]);
  return (
    <AbsoluteFill>
      <div ref={host} />
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
