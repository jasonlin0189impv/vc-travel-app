import TripApp from '../../shared/components/TripApp';
import { PALETTES } from '../../shared/components/palettes';

const config = {
  ...PALETTES.matcha, // 配色從色庫挑選；換成 candy / journal / blush / ocean… 即換色（見 shared/components/palettes.js）
  api: {
    // 單一 web app（行程 + 記帳）。網址非敏感：PIN 由伺服器端驗證，沒 PIN 打它也拿不到資料。
    // Stage 2 部署後才會產生 /exec，佔位待人工填入（見 CLAUDE.md「Adding a new trip」）。
    url: "TODO: paste /exec at deploy",
  },
  members: ['信', '屏'],
  exchangeRates: { 'JPY': 0.2 },
  baseCurrency: 'TWD',
  dates: {
    1: '10/13', 2: '10/14', 3: '10/15', 4: '10/16', 5: '10/17', 6: '10/18'
  },
  title: { main: "TOKYO", sub: "TRIP", duration: ["6 Days", "5 Nights"], year: "2026" },
  weatherLocations: [
    { name: "TOKYO", lat: 35.68, lon: 139.77 }
  ],
  phrases: [],
  checklist: [
    { id: 1, text: '護照', checked: false },
    { id: 2, text: '漫遊/eSim', checked: false },
    { id: 3, text: '轉接頭', checked: false }
  ],
  tips: []
};

export default function App() {
  return <TripApp config={config} />;
}
