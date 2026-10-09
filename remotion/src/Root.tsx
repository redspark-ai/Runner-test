import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Scene';
import scene from '../../scene.json';
export const Root: React.FC = () => (
  <Composition id="Video" component={Scene} width={scene.res[0]} height={scene.res[1]}
    fps={scene.fps} durationInFrames={Math.round(scene.length * scene.fps)} />
);
