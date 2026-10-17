"""Sample the two reaching arms of the Creation of Adam into a particle cloud.

Writes assets/hands.bin: Int16 quadruples (x, y, z, tone) for each point,
x/y in [-1,1]*32767 over the crop's width (y scaled by the aspect),
tone = luminance 0..32767. Run: python3 -I tools/hands.py
"""
import sys, random, struct
from PIL import Image, ImageFilter, ImageOps

SRC = 'assets/creation-of-adam.jpg'
BOX = (700, 470, 2260, 960)        # arms, hands and the gap, in source pixels
N = int(sys.argv[1]) if len(sys.argv) > 1 else 16000
random.seed(1512)                   # the year the ceiling was finished

im = Image.open(SRC).convert('RGB').crop(BOX)
W = 780; H = round(W * im.height / im.width)
im = im.resize((W, H), Image.LANCZOS)
hsv = im.convert('HSV')
lum = ImageOps.grayscale(im)
edges = lum.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(0.6))
S = hsv.getchannel('S').load(); V = hsv.getchannel('V').load()
E = edges.load(); L = lum.load(); P = im.load()

# Flesh and drapery are warmer and more saturated than the plaster sky.
weights = []
mask = Image.new('L', (W, H)); M = mask.load()
for y in range(H):
    for x in range(W):
        r, g, b = P[x, y]
        warm = (r - b) > 38 and S[x, y] > 58
        dark = V[x, y] < 95
        w = 0.0
        if warm or dark:
            w = 0.35 + min(E[x, y], 90) / 90 * 1.6
        M[x, y] = int(min(w, 1) * 255)
        weights.append(w)
mask.save(sys.argv[2]) if len(sys.argv) > 2 else None

total = sum(weights)
cum = []; acc = 0
for w in weights:
    acc += w; cum.append(acc)
import bisect
out = bytearray()
aspect = H / W
for _ in range(N):
    i = bisect.bisect_left(cum, random.random() * total)
    x, y = i % W, i // W
    jx, jy = random.random() - .5, random.random() - .5
    nx = ((x + jx) / W) * 2 - 1
    ny = -(((y + jy) / H) * 2 - 1) * aspect
    t = L[x, y] / 255
    nz = (t - .5) * .18 + (random.random() - .5) * .06
    c = lambda v: int(max(-1, min(1, v)) * 32767)
    out += struct.pack('<hhhh', c(nx), c(ny), c(nz), c(t))
open('assets/hands.bin', 'wb').write(out)
print(W, H, N, len(out), 'bytes')
