import json,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
S=json.load(open('scene2.json')); FPS=30
k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin'); vs=k.get_voices(); sr=24000; out=[]; tl=[]; pos=0
for sg in S['segments']:
    v=sg['voice'] if sg['voice'] in vs else 'am_michael'
    s,sr=k.create(sg['text'],voice=v,speed=sg.get('speed',1.0),lang='en-us'); f=sg.get('pitch',1.0)
    if f!=1.0: s=np.interp(np.arange(0,len(s),f),np.arange(len(s)),s)
    seg=np.concatenate([s,np.zeros(int(sr*sg.get('gap',0.15)))]).astype(np.float32); out.append(seg); tl.append((pos,pos+len(seg))); pos+=len(seg)
a=np.concatenate(out); sf.write('remotion/public/voice.wav',a,sr); n=int(len(a)/sr*FPS)+1
env=[float(np.sqrt(np.mean(a[int(i/FPS*sr):int((i+1)/FPS*sr)]**2))) if len(a[int(i/FPS*sr):int((i+1)/FPS*sr)]) else 0.0 for i in range(n)]
thr=0.25*max(env)
json.dump({'frames':n+8,'fps':FPS,'segs':[{'start':round(s/sr*FPS),'end':round(e/sr*FPS)} for s,e in tl],'open':[1 if e>thr else 0 for e in env]},open('remotion/public/timeline.json','w'))
print('voice sec',round(len(a)/sr,1),'voice used',[sg['voice'] in vs for sg in S['segments']])
