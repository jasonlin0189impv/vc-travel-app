import TripApp from '../../shared/components/TripApp';
import { PALETTES } from '../../shared/components/palettes';

const config = {
  ...PALETTES.blush, // 配色從色庫挑選；換成 candy / journal / matcha / ocean 即換色（見 shared/components/palettes.js）
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