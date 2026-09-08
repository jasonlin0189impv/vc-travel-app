"""
東京 trip app icon —— 依 mono-color-skill 的 design-system 手繪（無圖生成能力，改用程式化網版）。

Recipe manifest:
  subject        : Mount Fuji, seen as a printed plate
  intent         : travel field note
  representation : abstract symbol extraction
  carrier        : app icon (1:1)
  substrate      : 沿用 app matcha base #eef0e2（角色同 substrate_pale_beige — travel/tactile）
  mode           : complementary duotone (palette_botanical_oxblood，綠版換成 app 的 matcha #5f7a4a)
  inks           : #5f7a4a 主版 (dominant) + #8F3434 Oxblood 副版 (accent)
  plate_roles    : 綠 = 山體與網點地平；Oxblood = 日輪
  layout         : composition_archival_plate（置中／下錨）
  visual_tension : tension_relaxed（travel）
  focal_event    : 日輪與山脊的疊印碰撞 (concentrated overprint collision)
  release_zone   : 上方留白天空（empty paper 66%）
  image_treatment: 半調網點 (halftone) 地平帶
  imperfections  : imperfection_registration_drift（副版位移）+ imperfection_halftone_drift（網點密度漂移）

輸出 180x180（apple-touch-icon 標準 @3x 尺寸，同時當 favicon）。
用法：python3 scripts/icon/fuji_icon.py <輸出路徑.png>
"""
import math, zlib, struct

SIZE = 180
SS   = 4                      # 4x supersample

SUBSTRATE = (0xee, 0xf0, 0xe2)   # app matcha base
GREEN     = (0x5f, 0x7a, 0x4a)   # app matcha large  → dominant plate
OXBLOOD   = (0x8f, 0x34, 0x34)   # design-system ink_oxblood → accent plate

# ---- 幾何（normalized 0..1，y 由上往下）--------------------------------------
CX        = 0.500
SUMMIT_Y  = 0.252
BASE_Y    = 0.858
HALF_W    = 0.560   # 裙襬跑出畫框 → 版面裁切 (unresolved edge)
CREST_W   = 0.037   # 火口平頂半寬
FLARE     = 0.70    # <1 → 裙襬外擴（富士山特徵）

SUN_C     = (0.756, 0.492)
SUN_R     = 0.152
REG_DRIFT = (0.006, -0.004)   # imperfection_registration_drift：副版整體位移

def ridge_y(x):
    """山脊線：給 x 回傳山體上緣 y；不在山體範圍回傳 None。"""
    dx = abs(x - CX)
    if dx > HALF_W:
        return None
    if dx <= CREST_W:
        return SUMMIT_Y
    t = (dx - CREST_W) / (HALF_W - CREST_W)
    return SUMMIT_Y + (BASE_Y - SUMMIT_Y) * (t ** FLARE)

def snow_y(x):
    """殘雪下緣：帶指狀起伏。"""
    dx = x - CX
    # 對稱三道舌狀殘雪（cos 為偶函數 → 左右對稱，不會歪成一邊的土丘）
    return 0.436 + 0.041 * (0.5 + 0.5 * math.cos(dx * 58.0))

def in_mountain(x, y):
    r = ridge_y(x)
    return r is not None and r <= y <= BASE_Y

RIM = 0.018   # 殘雪四周留一圈綠版輪廓，雪冠才不會直接漏進天空

def _interior(x, y):
    """山體向內侵蝕 RIM 後仍在山體內 → 可以挖白。"""
    for dx, dy in ((0, 0), (RIM, 0), (-RIM, 0), (0, RIM), (0, -RIM),
                   (RIM * .7, RIM * .7), (-RIM * .7, RIM * .7),
                   (RIM * .7, -RIM * .7), (-RIM * .7, -RIM * .7)):
        if not in_mountain(x + dx, y + dy):
            return False
    return True

def in_snow(x, y):
    return _interior(x, y) and y <= snow_y(x)

# ---- 半調網點地平帶（image_treatment + halftone drift）------------------------
DOT_TOP, DOT_BOT = 0.886, 0.956
PITCH = 0.0355

def in_halftone(x, y):
    if not (DOT_TOP <= y <= DOT_BOT):
        return False
    if not (0.055 <= x <= 0.945):
        return False
    row = round((y - DOT_TOP) / PITCH)
    cy  = DOT_TOP + row * PITCH
    off = (row % 2) * PITCH * 0.5           # 交錯排列
    col = round((x - off) / PITCH)
    cx  = col * PITCH + off
    depth = (cy - DOT_TOP) / max(DOT_BOT - DOT_TOP, 1e-6)
    # 密度往下遞減 + 沿 x 的漂移 (imperfection_halftone_drift, ±8%)
    drift = 1.0 + 0.08 * math.sin(cx * 27.0 + cy * 40.0)
    r = PITCH * 0.32 * (1.0 - 0.68 * depth) * drift
    if r <= 0:
        return False
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def in_sun(x, y):
    sx = x - REG_DRIFT[0]
    sy = y - REG_DRIFT[1]
    return (sx - SUN_C[0]) ** 2 + (sy - SUN_C[1]) ** 2 <= SUN_R * SUN_R

# ---- 疊印（riso multiply）----------------------------------------------------
def mul(c, ink):
    return tuple(c[i] * ink[i] / 255.0 for i in range(3))

def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))

# ---- 掃描 -------------------------------------------------------------------
gcov = [[0.0] * SIZE for _ in range(SIZE)]   # 綠版覆蓋率
ocov = [[0.0] * SIZE for _ in range(SIZE)]   # 副版覆蓋率
green_px = 0

for py in range(SIZE):
    for px in range(SIZE):
        g = o = 0
        for sy in range(SS):
            y = (py + (sy + 0.5) / SS) / SIZE
            for sx in range(SS):
                x = (px + (sx + 0.5) / SS) / SIZE
                if (in_mountain(x, y) and not in_snow(x, y)) or in_halftone(x, y):
                    g += 1
                if in_sun(x, y):
                    o += 1
        gcov[py][px] = g / (SS * SS)
        ocov[py][px] = o / (SS * SS)

rows = bytearray()
ink_area = 0.0
for py in range(SIZE):
    rows.append(0)
    for px in range(SIZE):
        c = tuple(float(v) for v in SUBSTRATE)
        g, o = gcov[py][px], ocov[py][px]
        if g > 0:
            c = lerp(c, mul(c, GREEN), g)
        if o > 0:
            c = lerp(c, mul(c, OXBLOOD), o)
        ink_area += max(g, o)
        rows.extend(int(round(min(255, max(0, v)))) for v in c)

def chunk(tag, data):
    return (struct.pack('>I', len(data)) + tag + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

png = (b'\x89PNG\r\n\x1a\n'
       + chunk(b'IHDR', struct.pack('>IIBBBBB', SIZE, SIZE, 8, 2, 0, 0, 0))
       + chunk(b'IDAT', zlib.compress(bytes(rows), 9))
       + chunk(b'IEND', b''))

import sys
out = sys.argv[1]
open(out, 'wb').write(png)
print('%s  %d bytes  ink %.0f%% / empty paper %.0f%%'
      % (out, len(png), 100 * ink_area / (SIZE * SIZE), 100 - 100 * ink_area / (SIZE * SIZE)))
