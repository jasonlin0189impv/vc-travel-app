# trip app icon 產生器

各 trip 的 `public/*.png`（favicon / apple-touch-icon）由這裡的 Python 腳本產生，
純標準函式庫寫 PNG（無 Pillow / ImageMagick 依賴），改參數即可重跑：

```bash
python3 scripts/icon/fuji_icon.py tokyo-trip-2026/public/tokyo-trip.png
```

## 視覺語言

沿用 [mono-color-skill](https://github.com/yanliudesign/mono-color-skill) 的
「單色／受控雙色編輯印刷」系統：一張紙 + 最多兩色油墨 + 網點 + 疊印。
每支腳本開頭的 docstring 就是它的 recipe manifest（substrate / inks / layout /
focal event / imperfections），要調風格先改那份 manifest 再改參數。

色票取捨：**主版一律換成該 trip 自己的配色**（見 `shared/components/palettes.js`），
副版才從 mono-color 的 `design-system/colors.json` 挑互補墨色 —— icon 要跟 app 同一個調子。

## 小尺寸驗收

favicon 實際會被縮到 16–32px。改完務必看一眼縮圖，山形與副版色塊要還認得出來：

```python
import pngtool                      # scripts/icon/pngtool.py
pngtool.sizes_strip('out.png', 'preview.png')   # 180 / 36 / 18px 並排
pngtool.crop_zoom('out.png', 'crop.png', 55, 38, 128, 108, 6)
```
