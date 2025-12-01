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
  Bed,
  Plane,
  UtensilsCrossed,
  Lock,
  Bug,
  Check,
  Trash2
} from 'lucide-react';

// ==========================================
// 🔐 安全設定區域
// ==========================================

const getEnv = (key, defaultValue) => {
  try {
    return import.meta.env[key] || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const APP_PASSWORD = getEnv("VITE_AUTH_PIN", "2026"); 

// ==========================================
// 🔧 設定區域
// ==========================================

// 1. 匯率設定 (在此處修改即可全站套用)
const FIXED_EXCHANGE_RATE = 0.0236; 

// 2. Google 表單 Action URL
const GOOGLE_FORM_ACTION_URL = getEnv(
  "VITE_GOOGLE_FORM_ACTION_URL", 
  ""
);

// 3. Google 表單 Entry IDs
const FORM_ENTRY_IDS = {
  ITEM: "entry.535523921",     
  AMOUNT: "entry.304377441",   
  PAYER: "entry.1459657419",    
  CATEGORY: "entry.1495061883" 
};

// 4. Google 試算表 CSV (記帳讀取用)
const DEFAULT_SHEET_CSV_URL = getEnv(
  "VITE_GOOGLE_SHEET_CSV_URL",
  ""
);

// 5. 行程表 CSV (行程讀取用)
const ITINERARY_SHEET_CSV_URL = getEnv(
  "VITE_GOOGLE_SHEET_PLAN_CSV_URL", 
  ""
);

// 6. 成員名單
const MEMBERS = ['爸', '媽', '信', '屏', '樸'];

// 7. 圖示對照
const ICON_MAP = {
  'train': <Train size={18} />,
  'plane': <Plane size={18} />,
  'map': <MapPin size={18} />,
  'food': <Utensils size={18} />,
  'shop': <ShoppingBag size={18} />,
  'coffee': <Coffee size={18} />,
  'camera': <Camera size={18} />,
  'bed': <Bed size={18} />,
  'home': <Home size={18} />,
  'default': <MapPin size={18} />
};

// --- Helper: Robust CSV Parser ---
// 這個解析器可以處理欄位內有換行符號的情況
const smartParseCSV = (csvText) => {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; 
      
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) { 
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
};

// ==========================================

// --- Components ---

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
      <h1 className="text-2xl font-bold mb-2">首爾之旅 2026</h1>
      <p className="text-slate-400 text-sm mb-8">請輸入密碼以查看行程</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <input 
            type="tel"
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
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-900/50">
          解鎖進入
        </button>
      </form>
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1'
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

const ItineraryView = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itineraryData, setItineraryData] = useState({});
  const [loading, setLoading] = useState(false);

  const dates = {
    1: '1/15 (四)',
    2: '1/16 (五)',
    3: '1/17 (六)',
    4: '1/18 (日)',
    5: '1/19 (一)'
  };

  const FALLBACK_DATA = {
    1: [{ time: 'INFO', title: '請連結 Google Sheet', icon: 'map', desc: '目前無行程資料，請確認 CSV 連結。' }]
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!ITINERARY_SHEET_CSV_URL) {
        setItineraryData(FALLBACK_DATA);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${ITINERARY_SHEET_CSV_URL}&t=${Date.now()}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const text = await response.text();
        const rows = smartParseCSV(text);
        
        if (rows.length < 2) {
          setItineraryData(FALLBACK_DATA);
          return;
        }

        const headers = rows[0];
        const getIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase())));
        
        const idxDay = getIndex(['day', '天', '日期']);
        const idxTime = getIndex(['time', '時間']);
        const idxTitle = getIndex(['title', '標題', '名稱', '活動', '項目']);
        const idxDesc = getIndex(['desc', '描述', '說明', '備註']);
        const idxIcon = getIndex(['icon', '圖示']);

        const parsedData = {};
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 2) continue;
          
          const dayStr = idxDay > -1 ? row[idxDay] : row[0];
          const day = parseInt(dayStr);
          
          if (isNaN(day)) continue;
          
          if (!parsedData[day]) parsedData[day] = [];
          
          parsedData[day].push({
            time: idxTime > -1 ? row[idxTime] : row[1],
            title: idxTitle > -1 ? row[idxTitle] : row[2],
            desc: idxDesc > -1 ? row[idxDesc] : row[3],
            icon: idxIcon > -1 ? (row[idxIcon] || 'default').toLowerCase() : (row[4] || 'default').toLowerCase()
          });
        }
        
        if (Object.keys(parsedData).length === 0) {
          setItineraryData(FALLBACK_DATA);
        } else {
          setItineraryData(parsedData);
        }
      } catch (error) {
        console.error("Error loading itinerary:", error);
        setItineraryData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  const currentDayItems = itineraryData[activeDay] || [];

  return (
    <div className="pb-32">
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

      {loading ? (
         <div className="space-y-4 p-4">
           <div className="h-20 bg-white rounded-2xl animate-pulse"></div>
           <div className="h-20 bg-white rounded-2xl animate-pulse delay-75"></div>
           <div className="h-20 bg-white rounded-2xl animate-pulse delay-150"></div>
         </div>
      ) : currentDayItems.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>本日無行程資料</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDayItems.map((item, index) => (
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
                      {ICON_MAP[item.icon] || ICON_MAP['default']}
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
      )}

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
  const [formData, setFormData] = useState({ item: '', amount: '', category: '食物', payer: '爸', splitWith: MEMBERS }); 
  const [currencyMode, setCurrencyMode] = useState('TWD');
  const [submitting, setSubmitting] = useState(false);

  // 拆帳計算
  const splitData = useMemo(() => {
    const netBalance = {};
    MEMBERS.forEach(p => netBalance[p] = 0);
    const paidTotal = {};
    MEMBERS.forEach(p => paidTotal[p] = 0);

    expenses.forEach(item => {
      // 資料庫現在統一存台幣，所以這裡直接拿來用，不需要再換算
      const amount = item.amount;
      const payer = item.author ? item.author.trim() : '';
      
      // 1. 付款人 (+)
      if (MEMBERS.includes(payer)) {
        netBalance[payer] += amount;
        paidTotal[payer] += amount;
      }

      // 2. 分攤人 (-)
      const splitMembers = item.splitWith && item.splitWith.length > 0 ? item.splitWith : MEMBERS;
      const costPerPerson = amount / splitMembers.length;
      
      splitMembers.forEach(member => {
        if (netBalance[member] !== undefined) {
          netBalance[member] -= costPerPerson;
        }
      });
    });

    const debts = MEMBERS.map(p => ({
      name: p,
      paid: paidTotal[p],
      net: netBalance[p]
    })).sort((a, b) => a.net - b.net);

    return { debts };
  }, [expenses]);

  const toggleSplitMember = (member) => {
    setFormData(prev => {
      const current = prev.splitWith;
      if (current.includes(member)) {
        if (current.length === 1) return prev;
        return { ...prev, splitWith: current.filter(m => m !== member) };
      } else {
        return { ...prev, splitWith: [...current, member] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    let amountToSave = parseFloat(formData.amount);
    
    if (currencyMode === 'KRW') {
      // 輸入韓元 -> 轉成台幣儲存
      amountToSave = Math.round(amountToSave * FIXED_EXCHANGE_RATE);
    } 
    // 輸入台幣 -> 直接儲存

    let finalItemName = formData.item;
    if (formData.splitWith.length < MEMBERS.length) {
      finalItemName += ` #split:${formData.splitWith.join(',')}`;
    }

    const submissionData = {
      item: finalItemName,
      amount: amountToSave,
      category: formData.category,
      payer: formData.payer,
      splitWith: formData.splitWith
    };

    await onAddExpense(submissionData);
    setFormData({ item: '', amount: '', category: '食物', payer: '爸', splitWith: MEMBERS });
    setSubmitting(false);
    setShowFormModal(false);
  };

  // 總金額計算 (Expenses 都是台幣)
  const totalTWD = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalKRW = Math.round(totalTWD / FIXED_EXCHANGE_RATE);

  return (
    <div className="pb-32 pt-2">
      {/* Total Card */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-10 -mr-10"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">目前總開銷 (台幣)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light opacity-50">NT$</span>
            <h2 className="text-5xl font-bold tracking-tight">{totalTWD.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center justify-between">
             <span className="text-sm text-slate-400 bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
               <span className="text-[10px]">約</span> ₩{totalKRW.toLocaleString()}
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
                <div key={idx} className={`bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between transition-all ${item.isPending ? 'bg-indigo-50 border-indigo-100 shadow-inner' : ''}`}>
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
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{item.desc.split('#')[0]}</p> 
                        {item.splitWith && item.splitWith.length < MEMBERS.length && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100 whitespace-nowrap">
                            {item.splitWith.join(',')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                          {item.author || 'N/A'}
                        </span>
                        {item.isPending && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded flex items-center gap-1"><RefreshCw size={8} className="animate-spin"/> 寫入中 (本地暫存)</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">NT${item.amount.toLocaleString()}</p>
                    <span className="text-xs text-slate-400">≈ ₩{Math.round(item.amount / FIXED_EXCHANGE_RATE).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">結算狀況 (台幣)</h4>
            <div className="space-y-4">
              {splitData.debts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.name}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">已墊付 NT${p.paid.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${p.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {p.net >= 0 ? `收回 NT$${Math.round(p.net).toLocaleString()}` : `需付 NT$${Math.round(Math.abs(p.net)).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 px-4">
            <p>* 正數代表應收回的錢，負數代表應支付的錢。</p>
            <p>金額皆以台幣計算。</p>
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors focus-within:border-indigo-200 focus-within:bg-indigo-50/30">
                  <label className="text-xs font-bold text-slate-400 uppercase">金額 ({currencyMode})</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-slate-400 font-light">{currencyMode === 'KRW' ? '₩' : '$'}</span>
                    <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      className="w-full bg-transparent text-3xl font-bold text-slate-800 outline-none placeholder-slate-300" 
                      placeholder="0" 
                      // Removed autoFocus as per user request
                      required 
                    />
                  </div>
                  {currencyMode === 'KRW' && formData.amount && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs text-indigo-500 font-medium flex items-center gap-1">
                      <ArrowLeftRight size={10} /> 
                      自動換算約 NT${Math.round(formData.amount * FIXED_EXCHANGE_RATE).toLocaleString()} (將以此金額存入)
                    </div>
                  )}
                </div>
                
                {/* Currency Switcher (Moved Below Amount) */}
                <div className="bg-slate-50 p-1.5 rounded-xl flex mb-2 border border-slate-100">
                  <button type="button" onClick={() => setCurrencyMode('KRW')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currencyMode === 'KRW' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>₩ 韓元</button>
                  <button type="button" onClick={() => setCurrencyMode('TWD')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currencyMode === 'TWD' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>NT$ 台幣</button>
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

                {/* Split With */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">分攤對象</label>
                  <div className="flex gap-2 flex-wrap">
                    {MEMBERS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleSplitMember(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          formData.splitWith.includes(m)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        {m}
                        {formData.splitWith.includes(m) && <Check size={12} className="inline-block ml-1"/>}
                      </button>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, splitWith: MEMBERS}))}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-500 bg-indigo-50 ml-auto"
                    >
                      全選
                    </button>
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

// 4. Reminders View (Editable Checklist)
const RemindersView = () => {
  // Pre-trip checklist
  const [checklist, setChecklist] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  // Default items
  const DEFAULT_CHECKLIST = [
    { id: 1, text: '護照', checked: true },
    { id: 2, text: '漫遊/eSim', checked: true },
    { id: 3, text: '轉接頭 (圓孔)', checked: false },
    { id: 4, text: '牙刷牙膏', checked: false },
  ];

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trip_checklist');
    if (saved) {
      setChecklist(JSON.parse(saved));
    } else {
      setChecklist(DEFAULT_CHECKLIST);
    }
  }, []);

  // Save to localStorage whenever checklist changes
  useEffect(() => {
    localStorage.setItem('trip_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newItemText,
      checked: false
    };
    setChecklist([...checklist, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // Tips section (static)
  const tips = [
    { title: 'APP 必備', icon: <Map className="text-blue-500" />, desc: 'Naver Map (查路線)、Kakao T (叫車)、Wowpass。' },
    { title: '洋蔥式穿搭', icon: <Thermometer className="text-red-500" />, desc: '室內暖氣強，厚外套+薄內裡最適合。' },
  ];

  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <CheckSquare className="text-indigo-600" size={20} /> 行前檢查
        </h3>
        
        <form onSubmit={addItem} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="新增檢查項目..." 
            className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-400"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl">
            <Plus size={18} />
          </button>
        </form>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
              <label className="flex items-center space-x-3 cursor-pointer flex-1">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                  checked={item.checked} 
                  onChange={() => toggleItem(item.id)}
                />
                <span className={`text-slate-700 font-medium ${item.checked ? 'line-through text-slate-400' : ''}`}>{item.text}</span>
              </label>
              <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-400 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {checklist.length === 0 && <p className="text-center text-slate-400 text-xs py-2">清單是空的，新增一點東西吧！</p>}
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

// 5. Others View (Updated with Converter)
const OthersView = () => {
  const phrases = [
    { ko: '안녕하세요', pro: 'An-nyeong-ha-se-yo', zh: '你好' },
    { ko: '감사합니다', pro: 'Kam-sa-ham-ni-da', zh: '謝謝' },
    { ko: '얼마예요?', pro: 'Ol-ma-ye-yo?', zh: '多少錢？' },
    { ko: '화장실 어디예요?', pro: 'Hwa-jang-sil eo-di-ye-yo?', zh: '洗手間在哪？' },
    { ko: '이거 주세요', pro: 'I-geo ju-se-yo', zh: '請給我這個' },
  ];
  
  // Currency Converter State
  const [krwInput, setKrwInput] = useState('');
  
  const twdOutput = useMemo(() => {
    if (!krwInput) return 0;
    return parseFloat(krwInput) * FIXED_EXCHANGE_RATE;
  }, [krwInput]);

  return (
    <div className="pb-32 pt-2 space-y-6">
      {/* Currency Converter (New) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Calculator className="text-slate-400" size={20} /> 匯率計算機
        </h3>
        <div className="space-y-4">
          <div className="relative">
             <label className="text-xs font-bold text-slate-400 absolute left-4 top-3">韓元 (KRW)</label>
             <input 
               type="number" 
               value={krwInput}
               onChange={(e) => setKrwInput(e.target.value)}
               className="w-full pt-8 pb-3 px-4 bg-slate-50 rounded-2xl text-2xl font-bold text-slate-800 outline-none border border-slate-200 focus:border-indigo-500"
               placeholder="0"
             />
          </div>
          <div className="flex justify-center text-slate-300">
             <ArrowLeftRight className="rotate-90" />
          </div>
          <div className="relative">
             <label className="text-xs font-bold text-slate-400 absolute left-4 top-3">約合台幣 (TWD)</label>
             <div className="w-full pt-8 pb-3 px-4 bg-indigo-50 rounded-2xl text-2xl font-bold text-indigo-600 border border-indigo-100">
               {twdOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
          </div>
          <p className="text-xs text-slate-400 text-center pt-1">使用固定匯率: {FIXED_EXCHANGE_RATE}</p>
        </div>
      </div>
      
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
      
      <div className="text-center text-slate-300 text-xs py-4">
        v2.7 Seoul Trip App
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
  
  // Exchange Rate is now a constant, no state needed

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

  // Global Expense Fetching Logic (Refined CSV Parser with Local Cache & Split Extraction)
  const fetchExpenses = async () => {
    if (!DEFAULT_SHEET_CSV_URL) return;

    setLoadingExpenses(true);
    try {
      let fetchedData = [];
      // Try fetch Google Sheet
      if (DEFAULT_SHEET_CSV_URL && DEFAULT_SHEET_CSV_URL.startsWith('http')) {
        try {
          const response = await fetch(`${DEFAULT_SHEET_CSV_URL}&t=${Date.now()}`);
          if (response.ok) {
            const text = await response.text();
            const rows = smartParseCSV(text);
            
            if (rows.length >= 2) {
              const headers = rows[0];
              const getIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));
              
              const idxItem = getIndex(['項目', 'Item']);
              const idxAmount = getIndex(['金額', 'Amount']);
              const idxCategory = getIndex(['分類', 'Category', '類別']);
              const idxPayer = getIndex(['付款人', 'Payer', '誰付錢', '付款']);
              const idxTime = getIndex(['時間', 'Timestamp']);

              for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 2) continue;
                
                // Extract split info from Item string
                let rawItem = idxItem > -1 ? row[idxItem] : row[1];
                let splitWith = MEMBERS; // Default all
                
                const splitMatch = rawItem.match(/#split:(.*)/);
                if (splitMatch) {
                  splitWith = splitMatch[1].split(',').map(s => s.trim());
                }

                fetchedData.push({
                  id: `sheet-${i}`,
                  timestamp: idxTime > -1 ? row[idxTime] : row[0],
                  desc: rawItem,
                  amount: parseFloat((idxAmount > -1 ? row[idxAmount] : row[2]) || 0),
                  category: idxCategory > -1 ? row[idxCategory] : row[3],
                  author: idxPayer > -1 ? row[idxPayer] : (row[4] || ''),
                  splitWith: splitWith
                });
              }
            }
          }
        } catch (e) {
          console.warn("Remote fetch failed, using local cache only", e);
        }
      }
      
      const pendingItems = JSON.parse(localStorage.getItem('pendingExpenses') || '[]');
      const now = Date.now();
      
      const validPending = pendingItems.filter(pending => {
        const isSynced = fetchedData.some(sheetItem => {
           return sheetItem.desc === pending.desc && 
                  Math.abs(sheetItem.amount - pending.amount) < 1 && 
                  sheetItem.author === pending.author;
        });
        if (isSynced) return false;
        return (now - pending.createdAt) < 3600000;
      });

      localStorage.setItem('pendingExpenses', JSON.stringify(validPending));
      const combinedData = [...validPending, ...fetchedData.reverse()];
      setExpenses(combinedData);

    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleAddExpenseLocal = (newItemData) => {
    const newItem = {
      id: `local-${Date.now()}`, 
      timestamp: new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
      desc: newItemData.item, 
      amount: newItemData.amount,
      category: newItemData.category,
      author: newItemData.payer,
      splitWith: newItemData.splitWith,
      isPending: true,
      createdAt: Date.now()
    };
    
    const currentPending = JSON.parse(localStorage.getItem('pendingExpenses') || '[]');
    localStorage.setItem('pendingExpenses', JSON.stringify([newItem, ...currentPending]));
    setExpenses(prev => [newItem, ...prev]);
  };

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
                handleAddExpenseLocal(data);
                try {
                  const googleFormData = new FormData();
                  googleFormData.append(FORM_ENTRY_IDS.ITEM, data.item);
                  googleFormData.append(FORM_ENTRY_IDS.AMOUNT, data.amount);
                  googleFormData.append(FORM_ENTRY_IDS.CATEGORY, data.category);
                  googleFormData.append(FORM_ENTRY_IDS.PAYER, data.payer);
                  
                  if (GOOGLE_FORM_ACTION_URL) {
                    await fetch(GOOGLE_FORM_ACTION_URL, { method: 'POST', body: googleFormData, mode: 'no-cors' });
                  } else {
                    console.warn("Form URL missing, saved locally only");
                  }
                  
                } catch (error) {
                  console.error("Submission Error:", error);
                }
              }}
              exchangeRate={FIXED_EXCHANGE_RATE} // 使用固定匯率常數
            />
          )}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'others' && <OthersView />}
        </main>

        {/* 修改後的導航列：懸浮樣式 */}
        <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[20rem] bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-3xl py-1 px-2 flex justify-around items-center z-50">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative ${
                activeTab === tab.id 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              }`}
            >
              {/* 這裡加一個背景光暈讓選中狀態更明顯 */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10 scale-75 animate-fade-in"></div>
              )}
              
              {React.cloneElement(tab.icon, { 
                size: 22, //稍微縮小一點圖示讓比例更好看
                strokeWidth: activeTab === tab.id ? 2.5 : 2,
                className: activeTab === tab.id ? 'transform scale-110 transition-transform' : ''
              })}
              
              {/* 文字改小一點或不顯示，這裡保留顯示但縮小間距 */}
              {activeTab === tab.id && (
                <span className="text-[10px] font-bold mt-0.5 animate-fade-in">{tab.label}</span>
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