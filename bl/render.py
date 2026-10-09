import bpy,json,math,os,time,sys
S=json.load(open('scene.json')); fps=S['fps']
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.preferences.addon_install(filepath=os.environ['ADDON'])
bpy.ops.preferences.addon_enable(module='io_scene_vrm')
sc=bpy.context.scene; sc.render.fps=fps
print('STAGE import vrm',flush=True)
bpy.ops.import_scene.vrm(filepath=os.path.abspath(S['model']))
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
bpy.context.view_layer.objects.active=arm; arm.select_set(True)
print('STAGE import vrma',flush=True)
bpy.ops.import_scene.vrma(filepath=os.path.abspath(S['anim']))
act=arm.animation_data.action
for fc in act.fcurves: fc.modifiers.new('CYCLES')
N=int(S['length']*fps); sc.frame_start=1; sc.frame_end=N
# camera, light, background
cd=bpy.data.cameras.new('cam'); cam=bpy.data.objects.new('cam',cd); sc.collection.objects.link(cam)
cam.location=tuple(S.get('cam',[0,-4.2,1.0])); cam.rotation_euler=(math.radians(90),0,0); sc.camera=cam
ld=bpy.data.lights.new('sun','SUN'); ld.energy=3.0; lo=bpy.data.objects.new('sun',ld); sc.collection.objects.link(lo)
lo.rotation_euler=(math.radians(60),0,math.radians(-20))
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True
b=w.node_tree.nodes['Background']; b.inputs[0].default_value=(*S['bg'],1); b.inputs[1].default_value=1.0
# lip sync from Rhubarb cues
cues=json.load(open('mouth.json'))['mouthCues']
MAP={'A':{},'B':{'ih':.3},'C':{'ee':.6},'D':{'aa':1.0},'E':{'oh':.7},'F':{'ou':.8},'G':{'ih':.2},'H':{'ee':.4},'X':{}}
pre=arm.data.vrm_addon_extension.vrm1.expressions.preset
def lip(scene,*a):
    t=(scene.frame_current-1)/fps
    v=next((c['value'] for c in cues if c['start']<=t<c['end']),'X'); m=MAP[v]
    for n in ('aa','ih','ou','ee','oh'): getattr(pre,n).preview=m.get(n,0.0)
bpy.app.handlers.frame_change_pre.append(lip)
r=sc.render; r.resolution_x,r.resolution_y=S['res']; r.resolution_percentage=100
r.image_settings.file_format='JPEG'; r.image_settings.quality=92; r.filepath='/tmp/frames/f_'
sc.view_settings.view_transform='Standard'
for eng in ('BLENDER_EEVEE_NEXT','BLENDER_EEVEE','BLENDER_WORKBENCH'):
    try: r.engine=eng; break
    except Exception: pass
print('ENGINE',r.engine,flush=True)
try: sc.eevee.taa_render_samples=16
except Exception: pass
t0=time.time(); sc.frame_set(12); bpy.ops.render.render(write_still=False); print('TEST FRAME s',round(time.time()-t0,1),flush=True)
t0=time.time(); bpy.ops.render.render(animation=True); print('ALL FRAMES s',round(time.time()-t0,1),flush=True)
