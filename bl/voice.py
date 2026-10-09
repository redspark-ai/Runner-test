import json,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
S=json.load(open('scene.json')); k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin'); out=[]; sr=24000
for L in S['lines']:
    s,sr=k.create(L['text'],voice=L.get('voice','af_heart'),speed=L.get('speed',1.0),lang='en-us')
    out+=[s,np.zeros(int(sr*0.3),dtype=s.dtype)]
a=np.concatenate(out); sf.write('voice.wav',a,sr)
open('dialog.txt','w').write(' '.join(L['text'] for L in S['lines'])); print('voice sec',len(a)/sr)
