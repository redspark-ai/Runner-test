import {createAvatar} from '@dicebear/core'; import {funEmoji} from '@dicebear/collection'; import fs from 'fs';
const cfg=JSON.parse(fs.readFileSync('../scene2.json','utf8')); fs.mkdirSync('public/faces',{recursive:true});
cfg.segments.forEach((s,i)=>{for(const [k,m] of [['c',s.mouthClosed],['o',s.mouthOpen]]) fs.writeFileSync(`public/faces/f${i}_${k}.svg`,createAvatar(funEmoji,{eyes:[s.eyes],mouth:[m],backgroundColor:[cfg.skin],radius:50,size:600}).toString());});
