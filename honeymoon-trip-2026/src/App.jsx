import TripApp from '../../shared/components/TripApp';

const config = {
  theme: {
    base: "#faf3eb", large: "#d9a78b", small: "#eedbc5", text: "#5c4a45", white: "#ffffff"
  },
  ui: {
    bgMain: "bg-[#faf3eb]",
    cardSmall: "bg-[#eedbc5]/40 backdrop-blur-sm border border-[#eedbc5] shadow-sm",
    cardLarge: "bg-[#d9a78b] text-white shadow-lg shadow-[#d9a78b]/30",
    inputGlass: "bg-white/80 border-2 border-[#eedbc5] focus:border-[#d9a78b] text-[#5c4a45] placeholder-[#5c4a45]/50 outline-none transition-all",
    textMain: "text-[#5c4a45]",
    textSub: "text-[#5c4a45]/70",
    textWhite: "text-white",
    btnPrimary: "bg-[#d9a78b] text-white font-bold shadow-md shadow-[#d9a78b]/30 active:scale-95 transition-all hover:bg-[#e5b0b2]",
    btnSecondary: "bg-[#eedbc5] text-[#5c4a45] font-bold hover:bg-[#b8ccc0] transition-all",
    btnGhost: "bg-white/40 hover:bg-white/60 text-[#5c4a45]",
    btnIcon: "p-3 rounded-full bg-white/60 text-[#5c4a45] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
    divider: "divide-[#eedbc5]",
    border: "border-[#eedbc5]"
  },
  api: {
    // 單一 web app（行程 + 記帳）。網址非敏感：PIN 由伺服器端驗證，沒 PIN 打它也拿不到資料。
    // 直接寫在 config → 不需要 GitHub secret（沿用既有行程 web app 的 /exec）。
    url: "https://script.google.com/macros/s/AKfycbwZztRcoBJoDkMyaY3IM-D5fSI9E7Eyg9QNEM7BP9lEpAu9byTThGqjOjtAKb7QfRlN/exec",
  },
  members: ['信', '屏'],
  exchangeRates: { 'IDR': 0.002, 'VND': 0.0013, 'HKD': 4.1, 'USD': 32.04 },
  baseCurrency: 'TWD',
  dates: {
    1: '4/16', 2: '4/17', 3: '4/18', 4: '4/19', 5: '4/20', 6: '4/21',
    7: '4/22', 8: '4/23', 9: '4/24', 10: '4/25', 11: '4/26', 12: '4/27'
  },
  title: { main: "HONEYMOON", sub: "TRIP", duration: ["12 Days", "11 Nights"], year: "2026" },
  weatherLocations: [
    { name: "BALI", lat: -8.34, lon: 115.09 },
    { name: "VIETNAM", lat: 14.05, lon: 108.27 },
    { name: "HONG KONG", lat: 22.31, lon: 114.16 }
  ],
  phrases: [],
  checklist: [
    { id: 1, text: '護照', checked: true },
    { id: 2, text: '漫遊/eSim', checked: false },
    { id: 3, text: '轉接頭', checked: false }
  ],
  tips: [
    { title: "Bali Info", desc: "Grab / Gojek 推薦作為移動工具", icon: "car" },
    { title: "Vietnam Info", desc: "Grab 推薦作為移動工具", icon: "alert" },
    { title: "Hong Kong Info", desc: "八達通卡", icon: "card" }
  ]
};

export default function App() {
  return <TripApp config={config} />;
}