// 色號搭配庫 —— 每個 preset 是一組 { theme, ui }，可在各 trip 的 App.jsx 直接挑選：
//   import { PALETTES } from '../../shared/components/palettes';
//   const config = { ...PALETTES.candy, title: {...}, api: {...}, members: [...] };
//
// 角色：base=底紙 / large=主強調(填色卡‧按鈕) / small=副強調(卡片色調‧邊框) / text=墨(內文) / white=純白。
// 卡片刻意用「配色的色調半透明」而非白色（cardSmall=small/40、cardLarge=large 填色），
// 讓整頁色調一致、柔和不突兀。
// 注意：Tailwind 只認字面 class 字串，不能用變數組 `bg-[${x}]`，故每個 preset 的 ui 都寫死展開。
// 此檔在各 trip 的 tailwind content glob（../shared/components/**）內，會被掃描產生對應 classes。

export const PALETTES = {
  // 糖果 —— 首爾原始配色（粉 + 淡綠），柔軟可愛
  candy: {
    theme: { base: "#f7eaed", large: "#efc0c2", small: "#c7dbcf", text: "#5f768f", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#f7eaed]",
      cardSmall: "bg-[#c7dbcf]/40 backdrop-blur-sm border border-[#c7dbcf]/60 shadow-sm",
      cardLarge: "bg-[#efc0c2] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#c7dbcf] focus:border-[#efc0c2] text-[#5f768f] placeholder-[#5f768f]/40 outline-none transition-all",
      textMain: "text-[#5f768f]",
      textSub: "text-[#5f768f]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#efc0c2] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#c7dbcf] text-[#5f768f] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#5f768f]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#5f768f] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#c7dbcf]",
      border: "border-[#c7dbcf]",
    },
  },

  // 手帳 —— 暖紙 + 陶土，溫暖編輯感
  journal: {
    theme: { base: "#f0e8d8", large: "#b1502a", small: "#c9b89a", text: "#2a2621", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#f0e8d8]",
      cardSmall: "bg-[#c9b89a]/30 backdrop-blur-sm border border-[#c9b89a]/60 shadow-sm",
      cardLarge: "bg-[#b1502a] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#c9b89a] focus:border-[#b1502a] text-[#2a2621] placeholder-[#2a2621]/40 outline-none transition-all",
      textMain: "text-[#2a2621]",
      textSub: "text-[#2a2621]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#b1502a] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#c9b89a] text-[#2a2621] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#2a2621]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#2a2621] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#c9b89a]",
      border: "border-[#c9b89a]",
    },
  },

  // 蜜桃 —— 奶油 + 暖褐玫瑰，柔和
  blush: {
    theme: { base: "#faf3eb", large: "#d9a78b", small: "#eedbc5", text: "#5c4a45", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#faf3eb]",
      cardSmall: "bg-[#eedbc5]/50 backdrop-blur-sm border border-[#eedbc5] shadow-sm",
      cardLarge: "bg-[#d9a78b] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#eedbc5] focus:border-[#d9a78b] text-[#5c4a45] placeholder-[#5c4a45]/40 outline-none transition-all",
      textMain: "text-[#5c4a45]",
      textSub: "text-[#5c4a45]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#d9a78b] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#eedbc5] text-[#5c4a45] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#5c4a45]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#5c4a45] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#eedbc5]",
      border: "border-[#eedbc5]",
    },
  },

  // 抹茶 —— 淡綠 + 深林綠 + 麥色，清爽自然
  matcha: {
    theme: { base: "#eef0e2", large: "#5f7a4a", small: "#cdd3b4", text: "#33402c", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#eef0e2]",
      cardSmall: "bg-[#cdd3b4]/40 backdrop-blur-sm border border-[#cdd3b4] shadow-sm",
      cardLarge: "bg-[#5f7a4a] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#cdd3b4] focus:border-[#5f7a4a] text-[#33402c] placeholder-[#33402c]/40 outline-none transition-all",
      textMain: "text-[#33402c]",
      textSub: "text-[#33402c]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#5f7a4a] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#cdd3b4] text-[#33402c] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#33402c]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#33402c] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#cdd3b4]",
      border: "border-[#cdd3b4]",
    },
  },

  // 海港 —— 霧藍紙 + 深青 + 沙金，沉靜清冷
  ocean: {
    theme: { base: "#eaf1f2", large: "#2f6b7a", small: "#bcd2d3", text: "#22333b", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#eaf1f2]",
      cardSmall: "bg-[#bcd2d3]/40 backdrop-blur-sm border border-[#bcd2d3] shadow-sm",
      cardLarge: "bg-[#2f6b7a] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#bcd2d3] focus:border-[#2f6b7a] text-[#22333b] placeholder-[#22333b]/40 outline-none transition-all",
      textMain: "text-[#22333b]",
      textSub: "text-[#22333b]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#2f6b7a] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#bcd2d3] text-[#22333b] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#22333b]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#22333b] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#bcd2d3]",
      border: "border-[#bcd2d3]",
    },
  },

  // 紫藤 —— 薰衣草紙 + 深紫 + 灰玫瑰，優雅內斂
  plum: {
    theme: { base: "#f1ecf2", large: "#7b4b8a", small: "#d9b8c4", text: "#34283a", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#f1ecf2]",
      cardSmall: "bg-[#d9b8c4]/35 backdrop-blur-sm border border-[#d9b8c4] shadow-sm",
      cardLarge: "bg-[#7b4b8a] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#d9b8c4] focus:border-[#7b4b8a] text-[#34283a] placeholder-[#34283a]/40 outline-none transition-all",
      textMain: "text-[#34283a]",
      textSub: "text-[#34283a]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#7b4b8a] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#d9b8c4] text-[#34283a] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#34283a]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#34283a] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#d9b8c4]",
      border: "border-[#d9b8c4]",
    },
  },

  // 夕陽 —— 蜜桃紙 + 焦橘 + 金黃，溫暖明亮
  sunset: {
    theme: { base: "#fdeee0", large: "#d5622b", small: "#f0cf9e", text: "#3a2418", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#fdeee0]",
      cardSmall: "bg-[#f0cf9e]/40 backdrop-blur-sm border border-[#f0cf9e] shadow-sm",
      cardLarge: "bg-[#d5622b] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#f0cf9e] focus:border-[#d5622b] text-[#3a2418] placeholder-[#3a2418]/40 outline-none transition-all",
      textMain: "text-[#3a2418]",
      textSub: "text-[#3a2418]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#d5622b] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#f0cf9e] text-[#3a2418] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#3a2418]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#3a2418] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#f0cf9e]",
      border: "border-[#f0cf9e]",
    },
  },

  // 午夜 —— 深板岩底 + 琥珀 + 鋼藍，暗色系（護眼、夜間）
  midnight: {
    theme: { base: "#171a21", large: "#e0a53f", small: "#4c5a6b", text: "#e9e3d5", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#171a21]",
      cardSmall: "bg-[#4c5a6b]/25 backdrop-blur-sm border border-[#4c5a6b]/60 shadow-sm",
      cardLarge: "bg-[#e0a53f] text-[#171a21] shadow-md shadow-black/20",
      inputGlass: "bg-white/10 border border-[#4c5a6b] focus:border-[#e0a53f] text-[#e9e3d5] placeholder-[#e9e3d5]/40 outline-none transition-all",
      textMain: "text-[#e9e3d5]",
      textSub: "text-[#e9e3d5]/60",
      textWhite: "text-[#171a21]",
      btnPrimary: "bg-[#e0a53f] text-[#171a21] font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#4c5a6b] text-[#e9e3d5] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/10 hover:bg-white/20 text-[#e9e3d5]",
      btnIcon: "p-3 rounded-full bg-white/10 text-[#e9e3d5] shadow-sm hover:bg-white/20 active:scale-95 transition-all",
      divider: "divide-[#4c5a6b]",
      border: "border-[#4c5a6b]",
    },
  },

  // 鈷藍 —— 冷白紙 + 鈷藍 + 珊瑚，俐落現代
  cobalt: {
    theme: { base: "#eef1f6", large: "#2f4bb3", small: "#c6cfe4", text: "#1c2333", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#eef1f6]",
      cardSmall: "bg-[#c6cfe4]/40 backdrop-blur-sm border border-[#c6cfe4] shadow-sm",
      cardLarge: "bg-[#2f4bb3] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#c6cfe4] focus:border-[#2f4bb3] text-[#1c2333] placeholder-[#1c2333]/40 outline-none transition-all",
      textMain: "text-[#1c2333]",
      textSub: "text-[#1c2333]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#2f4bb3] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#e79a7c] text-white font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#1c2333]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#1c2333] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#c6cfe4]",
      border: "border-[#c6cfe4]",
    },
  },

  // 酒紅 —— 米紙 + 勃根地 + 橄欖，沉穩復古
  wine: {
    theme: { base: "#f4efe6", large: "#7a2e39", small: "#d8cbb0", text: "#2b211f", white: "#ffffff" },
    ui: {
      bgMain: "bg-[#f4efe6]",
      cardSmall: "bg-[#d8cbb0]/40 backdrop-blur-sm border border-[#d8cbb0] shadow-sm",
      cardLarge: "bg-[#7a2e39] text-white shadow-md shadow-black/5",
      inputGlass: "bg-white/70 border border-[#d8cbb0] focus:border-[#7a2e39] text-[#2b211f] placeholder-[#2b211f]/40 outline-none transition-all",
      textMain: "text-[#2b211f]",
      textSub: "text-[#2b211f]/60",
      textWhite: "text-white",
      btnPrimary: "bg-[#7a2e39] text-white font-bold shadow-md active:scale-95 transition-all hover:opacity-90",
      btnSecondary: "bg-[#d8cbb0] text-[#2b211f] font-bold hover:opacity-90 transition-all",
      btnGhost: "bg-white/40 hover:bg-white/60 text-[#2b211f]",
      btnIcon: "p-3 rounded-full bg-white/60 text-[#2b211f] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
      divider: "divide-[#d8cbb0]",
      border: "border-[#d8cbb0]",
    },
  },
};
