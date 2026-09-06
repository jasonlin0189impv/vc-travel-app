import TripApp from '../../shared/components/TripApp';
import { PALETTES } from '../../shared/components/palettes';

const config = {
  ...PALETTES.candy, // 配色從色庫挑選；換成 journal / blush / matcha / ocean… 即換色（見 shared/components/palettes.js）
  api: {
    // 單一 web app（行程 + 記帳）。網址非敏感：PIN 由伺服器端驗證，沒 PIN 打它也拿不到資料。
    // 直接寫在 config → 不需要 GitHub secret（沿用既有行程 web app 的 /exec）。
    url: "https://script.google.com/macros/s/AKfycbxGyRgjFfrCoYXnneWPU-5NH_Gl7YD2Jrx1go7s3QXX0GVH5krqb4IXJS-fAUo1V60a/exec",
  },
  members: ['爸', '媽', '信', '屏', '樸'],
  exchangeRates: { 'KRW': 0.0236 },
  baseCurrency: 'TWD',
  dates: { 1: '1/15', 2: '1/16', 3: '1/17', 4: '1/18', 5: '1/19' },
  title: { main: "SEOUL", sub: "TRIP", duration: ["5 Days", "4 Nights"], year: "2025" },
  weatherLocations: [
    { name: "SEOUL", lat: 37.5665, lon: 126.9780 }
  ],
  phraseTitle: "生存韓語",
  phrases: [
    { src: '안녕하세요', pro: 'An-nyeong-ha-se-yo', zh: '你好' },
    { src: '감사합니다', pro: 'Kam-sa-ham-ni-da', zh: '謝謝' },
    { src: '얼마예요?', pro: 'Ol-ma-ye-yo?', zh: '多少錢？' },
    { src: '화장실 어디예요?', pro: 'Hwa-jang-sil eo-di-ye-yo?', zh: '洗手間在哪？' },
    { src: '이거 주세요', pro: 'I-geo ju-se-yo', zh: '請給我這個' }
  ],
  checklist: [
    { id: 1, text: '護照', checked: true },
    { id: 2, text: '漫遊/eSim', checked: true },
    { id: 3, text: '轉接頭 (圓孔)', checked: false },
    { id: 4, text: '牙刷牙膏', checked: false }
  ],
  tips: [
    { title: "APP 必備", desc: "Naver Map (查路線)、Kakao T (叫車)、Wowpass。", icon: "map" },
    { title: "洋蔥式穿搭", desc: "室內暖氣強，厚外套+薄內裡最適合。", icon: "alert" }
  ]
};

export default function App() {
  return <TripApp config={config} />;
}