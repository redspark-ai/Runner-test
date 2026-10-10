import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Scene} from './Scene';
import {Stills} from './Stills';
import scene from '../../scene.json';
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Scene} width={scene.res[0]} height={scene.res[1]} fps={scene.fps} durationInFrames={Math.round(scene.length * scene.fps)} />
    <Composition id="Stills" component={Stills} width={1280} height={720} fps={30} durationInFrames={300}
      calculateMetadata={async () => { const j = await (await fetch(staticFile('timeline.json'))).json(); return {durationInFrames: j.frames}; }} />
  </>
);
