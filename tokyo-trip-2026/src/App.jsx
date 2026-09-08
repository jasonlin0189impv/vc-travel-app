import TripApp from '../../shared/components/TripApp';
import { PALETTES } from '../../shared/components/palettes';

const config = {
  ...PALETTES.matcha, // 配色從色庫挑選；換成 candy / journal / blush / ocean 即換色（見 shared/components/palettes.js）
  api: {
    // 單一 web app（行程 + 記帳）。網址非敏感：PIN 由伺服器端驗證，沒 PIN 打它也拿不到資料。
    // 直接寫在 config → 不需要 GitHub secret。
    url: "https://script.google.com/macros/s/AKfycbwUB4HXFKBelAyAX9rwJhngvFnA1d2IKEMHssAP9lqhJqR0klnF-FymSSRwiRja89BV-Q/exec",
  },
  members: ['信', '屏'],
  exchangeRates: { 'JPY': 0.2 },
  baseCurrency: 'TWD',
  dates: { 1: '10/13', 2: '10/14', 3: '10/15', 4: '10/16', 5: '10/17', 6: '10/18' },
  title: { main: "TOKYO", sub: "TRIP", duration: ["6 Days", "5 Nights"], year: "2026" },
  weatherLocations: [
    { name: "TOKYO", lat: 35.6762, lon: 139.6503 }
  ],
  phraseTitle: "生存日語",
  phrases: [
    { src: 'こんにちは', pro: 'Kon-ni-chi-wa', zh: '你好' },
    { src: 'ありがとうございます', pro: 'A-ri-ga-to-go-za-i-ma-su', zh: '謝謝' },
    { src: 'いくらですか？', pro: 'I-ku-ra-de-su-ka?', zh: '多少錢？' },
    { src: 'トイレはどこですか？', pro: 'To-i-re-wa-do-ko-de-su-ka?', zh: '洗手間在哪？' },
    { src: 'これをください', pro: 'Ko-re-o-ku-da-sa-i', zh: '請給我這個' }
  ],
  checklist: [
    { id: 1, text: '護照', checked: true },
    { id: 2, text: '漫遊/eSim', checked: false },
    { id: 3, text: 'Visit Japan Web 入境登錄', checked: false },
    { id: 4, text: '常備藥', checked: false }
  ],
  tips: [
    { title: "APP 必備", desc: "Google Maps (查路線)、乗換案内 (轉乘)、GO (叫車)。", icon: "map" },
    { title: "交通儲值卡", desc: "Suica / PASMO 可加進 iPhone 錢包，地鐵便利商店都能刷。", icon: "card" },
    { title: "十月天氣", desc: "白天約 20°C 夜晚轉涼，薄外套必帶。", icon: "alert" }
  ]
};

export default function App() {
  return <TripApp config={config} />;
}
