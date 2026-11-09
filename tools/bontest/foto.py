# Macht aus einem sauberen Bon ein handyfotoartiges Bild: Tischmuster, Perspektive, Drehung, Unschärfe, Schatten, JPEG
import cv2, numpy as np, sys, random
src, out, staerke, seed = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4])
rng = np.random.default_rng(seed); random.seed(seed)
bon = cv2.imread(src); h, w = bon.shape[:2]
if float(sys.argv[3]) > 1.2:
    # blasser Thermodruck: Schrift aufgehellt, ungleichmäßig verblasst, leicht ausgefranst
    k = cv2.resize(rng.uniform(0.35, 0.75, (8, 8)), (w, h))[..., None]
    bon = (255 - (255 - bon.astype(np.float32)) * k)
    bon = cv2.erode(bon.clip(0,255).astype(np.uint8), np.ones((2,1),np.uint8)) if seed % 3 == 0 else bon.clip(0,255).astype(np.uint8)
W, H = int(w*2.0), int(h*1.5)
# Hintergrund: kariertes Tuch oder Holz
y, x = np.mgrid[0:H, 0:W]
if seed % 2:
    k = ((x//60 + y//60) % 2).astype(np.float32); bg = np.stack([60+90*k, 50+40*k, 150+60*k], -1)
else:
    bg = np.stack([40+30*np.sin(x/9.0+np.sin(y/40.0)*3)]*3, -1) + np.array([50, 80, 120])
bg = (bg + rng.normal(0, 8, bg.shape)).clip(0, 255).astype(np.uint8)
# Perspektive + Drehung
s = staerke
pts1 = np.float32([[0,0],[w,0],[w,h],[0,h]])
cx, cy = W/2, H/2
ang = np.deg2rad(rng.uniform(-8, 8)*s)
def rot(p): return [cx + (p[0]-w/2)*np.cos(ang) - (p[1]-h/2)*np.sin(ang), cy + (p[0]-w/2)*np.sin(ang) + (p[1]-h/2)*np.cos(ang)]
pts2 = np.float32([rot(p) for p in pts1]) + rng.uniform(-0.06, 0.06, (4,2)).astype(np.float32)*np.float32([w, h])*s
M = cv2.getPerspectiveTransform(pts1, pts2)
warp = cv2.warpPerspective(bon, M, (W, H)); mask = cv2.warpPerspective(np.full((h,w),255,np.uint8), M, (W,H))
img = np.where(mask[...,None] > 0, warp, bg).astype(np.float32)
# Schatten (Verlauf) und warmes Licht
g = np.linspace(1.0, 1.0-0.45*s, W)[None,:,None] * np.linspace(1.0-0.2*s, 1.0, H)[:,None,None]
img = img * g * np.array([0.92, 1.0, 1.06])
img = cv2.GaussianBlur(img.clip(0,255).astype(np.uint8), (0,0), 0.6 + 1.1*s)
img = (img + rng.normal(0, 3+5*s, img.shape)).clip(0,255).astype(np.uint8)
cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, int(85 - 20*s)])
