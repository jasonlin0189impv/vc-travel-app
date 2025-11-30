import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  CloudSun, 
  CheckSquare, 
  Languages, 
  Plus, 
  ShoppingBag, 
  Utensils, 
  Train,
  Settings,
  Clock,
  X,
  RefreshCw,
  Table2,
  List,
  CreditCard,
  User,
  Bell,
  Grid,
  ChevronRight,
  ArrowLeftRight,
  Calculator,
  PieChart,
  Coffee,
  Camera,
  DollarSign,
  Map,
  Thermometer,
  Lightbulb,
  Home,
  Lock,
  Plane
} from 'lucide-react';

// ==========================================
// 🔐 安全設定區域
// ==========================================

// 設定您的登入密碼 (建議用簡單好記的，例如出發日期或年份)
const APP_PASSWORD = import.meta.env.VITE_AUTH_PIN || ""; 

// ==========================================
// 🔧 設定區域
// ==========================================

// 1. Google 表單提交網址 (Action URL)
const GOOGLE_FORM_ACTION_URL = import.meta.env.VITE_GOOGLE_FORM_ACTION_URL || "";

// 2. Google 表單欄位 ID (Entry IDs)
const FORM_ENTRY_IDS = {
  ITEM: "entry.535523921",     // 項目
  AMOUNT: "entry.304377441",   // 金額
  PAYER: "entry.1459657419",    // 付款人
  CATEGORY: "entry.1495061883" // 分類
};

// 3. Google 試算表 CSV 連結 (讀取用)
const DEFAULT_SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || "";

// ==========================================

const appId = typeof __app_id !== 'undefined' ? __app_id : 'seoul-trip-prod';

// --- Components ---

// 0. Login View (新增的登入畫面)
const LoginView = ({ onLogin }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === APP_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
        <Plane size={40} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold mb-2">首爾之旅 2025</h1>
      <p className="text-slate-400 text-sm mb-8">請輸入密碼以查看行程</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <input 
            type="tel" // 使用 tel 鍵盤方便手機輸入數字
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="輸入 PIN 碼"
            className={`w-full bg-slate-800 border-2 ${error ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'} rounded-2xl py-4 px-6 text-center text-xl font-bold tracking-widest outline-none transition-all`}
            maxLength={6}
          />
          {error && <p className="text-red-500 text-xs text-center mt-2 animate-bounce">密碼錯誤，請再試一次</p>}
        </div>
        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-900/50"
        >
          解鎖進入
        </button>
      </form>
      <p className="fixed bottom-8 text-slate-600 text-xs">Family Trip App v2.5</p>
    </div>
  );
};

// 1. Weather Widget
const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=1'
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <CloudSun className="text-yellow-400" />;
    if (code <= 3) return <CloudSun className="text-slate-400" />;
    if (code <= 67) return <CloudSun className="text-blue-400" />; 
    return <CloudSun className="text-slate-500" />;
  };

  if (loading) return (
    <div className="w-full h-24 bg-white rounded-3xl animate-pulse mb-4"></div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6 flex items-center justify-between relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 z-0"></div>
      <div className="z-10">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
          <MapPin size={12} />
          Seoul, Korea
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-4xl font-bold text-slate-800 tracking-tighter">
             {Math.round(weather?.current?.temperature_2m)}°
           </span>
           <span className="text-sm text-slate-400 font-medium">
             H:{Math.round(weather?.daily?.temperature_2m_max[0])}° L:{Math.round(weather?.daily?.temperature_2m_min[0])}°
           </span>
        </div>
      </div>
      <div className="z-10 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
         {React.cloneElement(getWeatherIcon(weather?.current?.weather_code), { size: 32 })}
      </div>
    </div>
  );
};

// 2. Itinerary View
const ItineraryView = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const dates = {
    1: '1/15 (四)',
    2: '1/16 (五)',
    3: '1/17 (六)',
    4: '1/18 (日)',
    5: '1/19 (一)'
  };

  const itineraryData = {
    1: [
      { time: '12:45', title: '抵達金浦機場', icon: <Train size={18} />, desc: '準備入境，搭乘地鐵前往飯店。' },
      { time: '14:30', title: '飯店 Check-in', icon: <MapPin size={18} />, desc: '入住 Voco Seoul Myeongdong (會賢站)。' },
      { time: '15:30', title: '新世界百貨總店', icon: <ShoppingBag size={18} />, desc: '📍 就在飯店對面，室內溫暖舒適，長輩逛得開心。\n\n🛍️ 主攻品牌：\n- National Geographic\n- The North Face (White Label)' },
      { time: '17:00', title: '明洞商圈購物', icon: <ShoppingBag size={18} />, desc: '💄 Olive Young 旗艦店：一次買齊保養品。\n\n👢 Rockfish Weatherwear (明洞店)：位於明洞8街34-1。不用去聖水洞排隊！\n\n🧸 Wacky Willy (明洞旗艦店)：位於明洞8Na街6。' },
      { time: '19:00', title: '晚餐：風川鰻魚', icon: <Utensils size={18} />, desc: '烤鰻魚補充體力，享受第一餐美食。' },
      { time: '21:00', title: '回飯店休息', icon: <Coffee size={18} />, desc: '第一天早點休息，儲備體力。' }
    ],
    2: [
      { time: '09:00', title: '早餐：Artist Bakery', icon: <Coffee size={18} />, desc: '📍 安國站人氣麵包店。\n\n⚠️ 建議早起前往排隊，若人太多可直接外帶或換備案。' },
      { time: '10:30', title: '景福宮', icon: <MapPin size={18} />, desc: '觀看守門將換崗儀式 (通常10:00或14:00)。\n\n❄️ 冬天戶外冷，重點參觀「勤政殿」與「慶會樓」即可，不用走完全程。' },
      { time: '12:00', title: '午餐：土俗村蔘雞湯', icon: <Utensils size={18} />, desc: '暖身首選！\n\n💡 備案：如果排隊太長，可改去附近的「無垢屋蔘雞」。' },
      { time: '14:00', title: '北村韓屋村', icon: <Camera size={18} />, desc: '漫步傳統韓屋街道，尋找最佳拍照點。\n\n⚠️ 請注意保持安靜，因有居民居住。' },
      { time: '16:00', title: '咖啡廳巡禮', icon: <Coffee size={18} />, desc: '☕ Cafe Onion Anguk (韓屋咖啡)。\n\n若還有多餘時間，可安排仁寺洞周邊逛逛傳統工藝店。' },
      { time: '18:30', title: '晚餐：山清烤肉', icon: <Utensils size={18} />, desc: '📍 乙支路站熱門烤肉。\n\n💡 備案：香港飯店 0410 (韓式炸醬麵/糖醋肉)。' }
    ],
    3: [
      { time: '10:00', title: '前往江南', icon: <Train size={18} />, desc: '搭乘地鐵前往三成站，準備參觀星空圖書館。' },
      { time: '11:00', title: '星空圖書館', icon: <Camera size={18} />, desc: '📍 位於 COEX Mall 內。\n\n📸 室內溫暖，必拍巨型書牆打卡。' },
      { time: '13:00', title: '午餐：COEX 商場', icon: <Utensils size={18} />, desc: '商場內選擇很多，若想吃大餐可安排附近的韓定食。' },
      { time: '15:00', title: '聖水洞 (選購)', icon: <ShoppingBag size={18} />, desc: '🚕 建議搭計程車前往 (約15分鐘)。\n\n雖然 Rockfish 第一天買了，但可感受聖水洞氛圍並打卡「巨型臘腸狗裝置藝術」。' },
      { time: '17:30', title: '晚餐：馬鈴薯排骨', icon: <Utensils size={18} />, desc: '祖傳三代馬鈴薯排骨，聖水洞必吃美食，湯頭濃郁。' }
    ],
    4: [
      { time: '10:30', title: '望遠市場', icon: <Utensils size={18} />, desc: '早午餐體驗在地市場！\n\n🥢 必吃推薦：\n- Uyrak (炸辣椒)\n- 刀削麵\n- 糖餅' },
      { time: '13:30', title: '下午茶：延南洞', icon: <Coffee size={18} />, desc: '📍 Central Site 或 Millo Coffee Roasters。\n\n☕ 這是您指定的咖啡廳，位於延南洞（靠近弘大）。' },
      { time: '16:00', title: '京義線林蔭道', icon: <MapPin size={18} />, desc: '若天氣好可以散步。\n\n⚠️ 若太冷則建議找室內或回飯店稍作休息。' },
      { time: '18:30', title: '晚餐：一片里脊', icon: <Utensils size={18} />, desc: '🥩 享受頂級韓牛，為旅程畫下完美句點 (明洞店)。' }
    ],
    5: [
      { time: '09:00', title: '早餐', icon: <Coffee size={18} />, desc: '飯店附近簡單吃，或再吃一次喜歡的韓式吐司。' },
      { time: '10:15', title: '前往仁川機場', icon: <Train size={18} />, desc: '⚠️ 13:45 飛機，務必準時出發！\n\n🚌 方法一：機場巴士 6015。\n🚕 方法二：請飯店叫 Jumbo Taxi 直達機場。' },
      { time: '11:30', title: '機場報到 & 退稅', icon: <ShoppingBag size={18} />, desc: '辦理登機手續，最後免稅店補貨。' },
      { time: '13:45', title: '起飛', icon: <Train size={18} />, desc: '平安返家。' }
    ]
  };

  return (
    <div className="pb-24">
      <WeatherWidget />
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-2 -mx-4 px-4 overflow-x-auto scrollbar-hide flex gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              activeDay === day
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <div className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Day {day}</div>
            <div className="text-sm">{dates[day].split(' ')[0]}</div>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {itineraryData[activeDay].map((item, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedItem(item)}
            className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="flex gap-4">
               <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                 <span className="text-sm font-bold text-slate-800">{item.time}</span>
                 <div className="h-full w-0.5 bg-slate-100 mt-2 mb-[-1rem] group-last:bg-transparent"></div>
               </div>
               <div className="flex-grow pb-2">
                 <div className="flex items-center gap-2 mb-1.5">
                   <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                     {item.icon}
                   </div>
                   <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                 </div>
                 <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{item.desc}</p>
               </div>
               <div className="flex items-center text-slate-300"><ChevronRight size={20} /></div>
             </div>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}></div>
          <div className="bg-white w-full max-w-md rounded-t-[2rem] shadow-2xl relative z-10 overflow-hidden h-[75vh] flex flex-col animate-slide-up">
            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setSelectedItem(null)}><div className="w-12 h-1.5 bg-slate-200 rounded-full"></div></div>
            <div className="px-8 pt-6 pb-6">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold mb-4"><Clock size={12} />{selectedItem.time}</div>
              <h3 className="text-3xl font-bold text-slate-800 leading-tight mb-2">{selectedItem.title}</h3>
            </div>
            <div className="flex-grow overflow-y-auto px-8 pb-8"><div className="prose prose-slate prose-p:text-slate-600 leading-relaxed whitespace-pre-line">{selectedItem.desc}</div></div>
            <div className="p-6 border-t border-slate-100 pb-safe"><button onClick={() => setSelectedItem(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors">關閉</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Expense View
const ExpenseView = ({ expenses, loading, onRefresh, onAddExpense, exchangeRate }) => {
  const [viewMode, setViewMode] = useState('list');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ item: '', amount: '', category: '食物', payer: '爸' }); 
  const [currencyMode, setCurrencyMode] = useState('KRW');
  const [submitting, setSubmitting] = useState(false);

  // 拆帳計算
  const splitData = useMemo(() => {
    const people = ['爸', '媽', '信', '屏', '樸'];
    const balance = { '爸': 0, '媽': 0, '信': 0, '屏': 0, '樸': 0 };
    let totalExpense = 0;

    expenses.forEach(item => {
      const author = item.author ? item.author.trim() : '';
      if (people.includes(author)) {
        totalExpense += item.amount;
        balance[author] += item.amount;
      }
    });

    const average = totalExpense / people.length;
    
    const debts = people.map(p => ({
      name: p,
      paid: balance[p],
      diff: balance[p] - average
    })).sort((a, b) => a.diff - b.diff);

    return { totalExpense, average, debts };
  }, [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let amountToSave = parseFloat(formData.amount);
    if (currencyMode === 'TWD') {
      amountToSave = Math.round(amountToSave / exchangeRate);
    }
    await onAddExpense({ ...formData, amount: amountToSave });
    setFormData({ item: '', amount: '', category: '食物', payer: '爸' });
    setSubmitting(false);
    setShowFormModal(false);
  };

  const totalKRW = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalTWD = Math.round(totalKRW * exchangeRate);

  return (
    <div className="pb-24 pt-2">
      {/* Total Card */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-10 -mr-10"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">目前總開銷 (估算)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light opacity-50">NT$</span>
            <h2 className="text-5xl font-bold tracking-tight">{totalTWD.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center justify-between">
             <span className="text-sm text-slate-400 bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
               <span className="text-[10px]">KRW</span> {totalKRW.toLocaleString()}
             </span>
             <button onClick={onRefresh} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </div>

      {/* Toggle View Mode */}
      <div className="bg-white p-1 rounded-2xl border border-slate-100 flex mb-6 shadow-sm">
        <button 
          onClick={() => setViewMode('list')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <List size={16} /> 消費明細
        </button>
        <button 
          onClick={() => setViewMode('split')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'split' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <PieChart size={16} /> 拆帳計算
        </button>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <>
          <button 
            onClick={() => setShowFormModal(true)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={24} /> 記一筆
          </button>

          {/* List Header with Count */}
          <div className="flex items-center gap-2 mb-3 px-1 text-slate-500 text-xs font-bold">
            <span>共 {expenses.length} 筆資料</span>
            <span className="text-slate-300">|</span>
            <span>Google Sheet 更新延遲約 5 分鐘</span>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100">
                <div className="inline-block p-4 bg-slate-50 rounded-full mb-3"><Table2 size={24} /></div>
                <p>暫無資料</p>
              </div>
            ) : (
              expenses.map((item, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between transition-all ${item.isPending ? 'bg-indigo-50 border-indigo-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                      item.category?.includes('食') ? 'bg-orange-50 text-orange-500' : 
                      item.category?.includes('購') ? 'bg-pink-50 text-pink-500' :
                      item.category?.includes('交') ? 'bg-blue-50 text-blue-500' :
                      item.category?.includes('住') ? 'bg-purple-50 text-purple-500' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                       {item.category?.includes('食') ? <Utensils size={20} /> : 
                        item.category?.includes('購') ? <ShoppingBag size={20} /> :
                        item.category?.includes('交') ? <Train size={20} /> :
                        item.category?.includes('住') ? <Home size={20} /> :
                        <CreditCard size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                          {item.author || 'N/A'}
                        </span>
                        {item.isPending && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded">儲存中...</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₩{item.amount.toLocaleString()}</p>
                    <span className="text-xs text-slate-400">≈ NT${Math.round(item.amount * exchangeRate).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">每人平均分攤</h4>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-800">₩ {Math.round(splitData.average).toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">≈ NT$ {Math.round(splitData.average * exchangeRate).toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">結算狀況 (台幣)</h4>
            <div className="space-y-4">
              {splitData.debts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.diff >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.name}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">已付 ₩{p.paid.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${p.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {p.diff >= 0 ? `收回 NT$${Math.round(p.diff * exchangeRate).toLocaleString()}` : `需付 NT$${Math.round(Math.abs(p.diff) * exchangeRate).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 px-4">
            <p>* 此為簡單均分計算，不包含「公費」支出的項目。</p>
            <p>已付顯示韓元，結算建議使用台幣轉帳。</p>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowFormModal(false)}></div>
           <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] relative z-10 p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">新增支出</h3>
                <button onClick={() => setShowFormModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-1.5 rounded-xl flex mb-2 border border-slate-100">
                  <button type="button" onClick={() => setCurrencyMode('KRW')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currencyMode === 'KRW' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>₩ 韓元</button>
                  <button type="button" onClick={() => setCurrencyMode('TWD')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currencyMode === 'TWD' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>NT$ 台幣</button>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors focus-within:border-indigo-200 focus-within:bg-indigo-50/30">
                  <label className="text-xs font-bold text-slate-400 uppercase">金額 ({currencyMode})</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-slate-400 font-light">{currencyMode === 'KRW' ? '₩' : '$'}</span>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-transparent text-3xl font-bold text-slate-800 outline-none placeholder-slate-300" placeholder="0" autoFocus required />
                  </div>
                  {currencyMode === 'TWD' && formData.amount && <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs text-indigo-500 font-medium flex items-center gap-1"><ArrowLeftRight size={10} /> 自動換算約 ₩{Math.round(formData.amount / exchangeRate).toLocaleString()}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">項目</label>
                  <input type="text" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none mt-1" placeholder="例如：烤肉" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">分類</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none mt-1 appearance-none">
                      <option value="食物">🍔 食物</option>
                      <option value="住宿">🏠 住宿</option>
                      <option value="交通">🚕 交通</option>
                      <option value="購物">🛍️ 購物</option>
                      <option value="其他">📦 其他</option>
                    </select>
                   </div>
                   <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">付款人</label>
                    <select value={formData.payer} onChange={(e) => setFormData({...formData, payer: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none mt-1 appearance-none">
                      <option value="爸">爸</option>
                      <option value="媽">媽</option>
                      <option value="信">信</option>
                      <option value="屏">屏</option>
                      <option value="樸">樸</option>
                    </select>
                   </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-indigo-200">{submitting ? '傳送中...' : '確認記帳'}</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// 4. Reminders View (保持不變)
const RemindersView = () => {
  const tips = [
    { title: 'APP 必備', icon: <Map className="text-blue-500" />, desc: 'Naver Map (查路線)、Kakao T (叫車)、Wowpass。' },
    { title: '洋蔥式穿搭', icon: <Thermometer className="text-red-500" />, desc: '室內暖氣強，厚外套+薄內裡最適合。' },
  ];

  const checklist = [
    { item: '護照', checked: true },
    { item: 'K-ETA / 網卡', checked: true },
    { item: '轉接頭 (圓孔)', checked: false },
    { item: '牙刷牙膏', checked: false },
  ];

  return (
    <div className="pb-24 pt-2 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <CheckSquare className="text-indigo-600" size={20} /> 行前檢查
        </h3>
        <div className="space-y-3">
          {checklist.map((item, i) => (
            <label key={i} className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked={item.checked} />
              <span className="text-slate-700 font-medium">{item.item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={20} /> 長輩旅遊小貼士
        </h3>
        <div className="grid gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-white p-3 rounded-xl shadow-sm h-fit">
                {React.cloneElement(tip.icon, { size: 20 })}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">{tip.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Others View (保持不變)
const OthersView = ({ exchangeRate, setExchangeRate }) => {
  const phrases = [
    { ko: '안녕하세요', pro: 'An-nyeong-ha-se-yo', zh: '你好' },
    { ko: '감사합니다', pro: 'Kam-sa-ham-ni-da', zh: '謝謝' },
    { ko: '얼마예요?', pro: 'Ol-ma-ye-yo?', zh: '多少錢？' },
    { ko: '화장실 어디예요?', pro: 'Hwa-jang-sil eo-di-ye-yo?', zh: '洗手間在哪？' },
    { ko: '이거 주세요', pro: 'I-geo ju-se-yo', zh: '請給我這個' },
  ];

  return (
    <div className="pb-24 pt-2 space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Languages size={24} /> 生存韓語
        </h3>
        <div className="space-y-3">
          {phrases.map((p, i) => (
            <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
              <div>
                <p className="font-bold text-lg">{p.ko}</p>
                <p className="text-xs text-indigo-200">{p.pro}</p>
              </div>
              <span className="text-sm font-bold bg-white text-indigo-600 px-3 py-1 rounded-full">
                {p.zh}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Rate Setting */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Calculator className="text-slate-400" size={20} /> 匯率設定
        </h3>
        <div className="space-y-2">
           <label className="text-xs font-bold text-slate-400">目前匯率 (1 韓元 = ? 台幣)</label>
           <div className="flex items-center gap-3">
             <input 
                type="number" 
                step="0.001"
                value={exchangeRate} 
                onChange={(e) => setExchangeRate(parseFloat(e.target.value))} 
                className="w-full p-4 bg-slate-50 rounded-2xl text-lg font-bold text-slate-800 outline-none border border-slate-200 focus:border-indigo-500" 
             />
             <span className="text-sm font-medium text-slate-500 whitespace-nowrap">TWD/KRW</span>
           </div>
           <p className="text-xs text-slate-400 pt-1">此匯率將用於記帳時的台幣換算，以及總金額顯示。</p>
        </div>
      </div>
      
      <div className="text-center text-slate-300 text-xs py-4">
        v2.5 Seoul Trip App
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Lifted States
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.023); // Default rate

  const tabs = [
    { id: 'itinerary', label: '行程', icon: <MapPin size={24} /> },
    { id: 'expense', label: '記帳', icon: <Wallet size={24} /> },
    { id: 'reminders', label: '提醒', icon: <Bell size={24} /> },
    { id: 'others', label: '其他', icon: <Grid size={24} /> },
  ];

  // Auth check
  useEffect(() => {
    const savedAuth = localStorage.getItem('tripAppAuth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('tripAppAuth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  // Global Expense Fetching Logic (Refined CSV Parser)
  const fetchExpenses = async () => {
    // 檢查是否設定了 CSV URL
    if (!DEFAULT_SHEET_CSV_URL) return;

    setLoadingExpenses(true);
    try {
      // Add timestamp to prevent browser caching
      const response = await fetch(`${DEFAULT_SHEET_CSV_URL}&t=${Date.now()}`);
      const text = await response.text();
      const lines = text.split('\n');
      if (lines.length < 2) {
        setExpenses([]);
        return;
      }

      // Dynamic Header Mapping
      // Handle typical CSV header row which might be quoted
      const headerLine = lines[0];
      // Helper to split CSV line safely
      const splitLine = (line) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
      
      const headers = splitLine(headerLine);
      
      // Find indices based on keywords (robustness)
      const getIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));
      
      const idxItem = getIndex(['項目', 'Item']);
      const idxAmount = getIndex(['金額', 'Amount']);
      const idxCategory = getIndex(['分類', 'Category', '類別']);
      const idxPayer = getIndex(['付款人', 'Payer', '誰付錢', '付款']);
      const idxTime = getIndex(['時間', 'Timestamp']);

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const row = splitLine(lines[i]);
        if (row.length < 2) continue; // Skip empty rows

        data.push({
          id: i,
          timestamp: idxTime > -1 ? row[idxTime] : row[0],
          desc: idxItem > -1 ? row[idxItem] : row[1],
          amount: parseFloat((idxAmount > -1 ? row[idxAmount] : row[2]) || 0),
          category: idxCategory > -1 ? row[idxCategory] : row[3],
          // Important: Fallback to empty string if not found, to avoid 'undefined'
          author: idxPayer > -1 ? row[idxPayer] : (row[4] || '')
        });
      }
      setExpenses(data.reverse());
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleAddExpenseLocal = (newItemData) => {
    const newItem = {
      id: Date.now(), 
      timestamp: new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
      desc: newItemData.item,
      amount: newItemData.amount,
      category: newItemData.category,
      author: newItemData.payer,
      isPending: true 
    };
    setExpenses(prev => [newItem, ...prev]);
  };

  // Initial Fetch if authenticated
  useEffect(() => { 
    if (isAuthenticated) fetchExpenses(); 
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginView onLogin={() => {
      setIsAuthenticated(true);
      localStorage.setItem('tripAppAuth', 'true');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
      <div className="w-full max-w-md min-h-screen relative shadow-2xl bg-slate-50">
        
        <header className="px-6 pt-12 pb-2 bg-slate-50">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            SEOUL <span className="text-indigo-600">TRIP</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">5 Days / 4 Nights</p>
        </header>

        <main className="px-4">
          {activeTab === 'itinerary' && <ItineraryView />}
          {activeTab === 'expense' && (
            <ExpenseView 
              expenses={expenses} 
              loading={loadingExpenses} 
              onRefresh={fetchExpenses} 
              onAddExpense={async (data) => {
                try {
                  const googleFormData = new FormData();
                  googleFormData.append(FORM_ENTRY_IDS.ITEM, data.item);
                  googleFormData.append(FORM_ENTRY_IDS.AMOUNT, data.amount);
                  googleFormData.append(FORM_ENTRY_IDS.CATEGORY, data.category);
                  googleFormData.append(FORM_ENTRY_IDS.PAYER, data.payer);
                  
                  // Submit to Google Form
                  await fetch(GOOGLE_FORM_ACTION_URL, { method: 'POST', body: googleFormData, mode: 'no-cors' });
                  
                  // Update local state immediately
                  handleAddExpenseLocal(data);
                } catch (error) {
                  console.error("Submission Error:", error);
                  alert("記帳失敗，請檢查網路連線");
                }
              }}
              exchangeRate={exchangeRate}
            />
          )}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'others' && (
            <OthersView 
              exchangeRate={exchangeRate} 
              setExchangeRate={setExchangeRate} 
            />
          )}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {React.cloneElement(tab.icon, { 
                size: 24, 
                strokeWidth: activeTab === tab.id ? 2.5 : 2,
                className: activeTab === tab.id ? 'transform scale-110 transition-transform' : ''
              })}
              {activeTab === tab.id && (
                <span className="text-[10px] font-bold mt-1 animate-fade-in">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>
    </div>
  );
}