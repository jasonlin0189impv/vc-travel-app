import TripApp from '../../shared/components/TripApp';

const getEnv = (key, defaultValue) => {
  try { return import.meta.env[key] || defaultValue; } catch (e) { return defaultValue; }
};

const config = {
  theme: {
    base: "#f7eaed", large: "#efc0c2", small: "#c7dbcf", text: "#5f768f", white: "#ffffff"
  },
  ui: {
    bgMain: "bg-[#f7eaed]",
    cardSmall: "bg-[#c7dbcf]/40 backdrop-blur-sm border border-[#c7dbcf] shadow-sm",
    cardLarge: "bg-[#efc0c2] text-white shadow-lg shadow-[#efc0c2]/30",
    inputGlass: "bg-white/80 border-2 border-[#c7dbcf] focus:border-[#efc0c2] text-[#5f768f] placeholder-[#5f768f]/50 outline-none transition-all",
    textMain: "text-[#5f768f]",
    textSub: "text-[#5f768f]/70",
    textWhite: "text-white",
    btnPrimary: "bg-[#efc0c2] text-white font-bold shadow-md shadow-[#efc0c2]/30 active:scale-95 transition-all hover:bg-[#e5b0b2]",
    btnSecondary: "bg-[#c7dbcf] text-[#5f768f] font-bold hover:bg-[#b8ccc0] transition-all",
    btnGhost: "bg-white/40 hover:bg-white/60 text-[#5f768f]",
    btnIcon: "p-3 rounded-full bg-white/60 text-[#5f768f] shadow-sm hover:bg-white/90 active:scale-95 transition-all",
    divider: "divide-[#c7dbcf]",
    border: "border-[#c7dbcf]"
  },
  authPin: getEnv("VITE_AUTH_PIN", "2025"),
  api: {
    planCsvUrl: getEnv("VITE_GOOGLE_SHEET_PLAN_CSV_URL", ""),
    sheetCsvUrl: getEnv("VITE_GOOGLE_SHEET_CSV_URL", ""),
    formActionUrl: getEnv("VITE_GOOGLE_FORM_ACTION_URL", ""),
    formEntryIds: { ITEM: "entry.535523921", AMOUNT: "entry.304377441", PAYER: "entry.1459657419", CATEGORY: "entry.1495061883" }
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