import * as React from 'react';
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
  Home,
  Bed,
  Plane,
  Trash2,
  Lightbulb,
  Check,
  Edit2,
  Save,
  Loader2,
  AlertTriangle // 新增警告圖示
} from 'lucide-react';

const { useState, useEffect, useMemo } = React;

// ==========================================
// 🎨 THEME SYSTEM (主題系統)
// ==========================================

// 1. 基礎色票 (Updated to User's Pastel Palette)
const THEME = {
  base: "#f7eaed",    // 基底色 (淡粉雪)
  large: "#efc0c2",   // 大區塊 (乾燥玫瑰)
  small: "#c7dbcf",   // 小區塊 (薄荷灰綠)
  text: "#5f768f",    // 文字色 (深霧藍)
  white: "#ffffff",
};

// 2. 語意化樣式
const UI = {
  // 容器與背景
  bgMain: "bg-[#f7eaed]",

  // 卡片風格 (小區塊應用)
  cardSmall: "bg-[#c7dbcf]/40 backdrop-blur-sm border border-[#c7dbcf] shadow-sm",

  // 大區塊風格 (強調區塊)
  cardLarge: "bg-[#efc0c2] text-white shadow-lg shadow-[#efc0c2]/30",

  // 輸入框
  inputGlass: "bg-white/80 border-2 border-[#c7dbcf] focus:border-[#efc0c2] text-[#5f768f] placeholder-[#5f768f]/50 outline-none transition-all",

  // 文字顏色
  textMain: "text-[#5f768f]",
  textSub: "text-[#5f768f]/70", 
  textWhite: "text-white",

  // 按鈕
  btnPrimary: "bg-[#efc0c2] text-white font-bold shadow-md shadow-[#efc0c2]/30 active:scale-95 transition-all hover:bg-[#e5b0b2]",
  btnSecondary: "bg-[#c7dbcf] text-[#5f768f] font-bold hover:bg-[#b8ccc0] transition-all",
  btnGhost: "bg-white/40 hover:bg-white/60 text-[#5f768f]",
  btnIcon: "p-3 rounded-full bg-white/60 text-[#5f768f] shadow-sm hover:bg-white/90 active:scale-95 transition-all",

  // 分隔線與邊框
  divider: "divide-[#c7dbcf]",
  border: "border-[#c7dbcf]",

  // 圖示配色
  icon: {
    primary: "#efc0c2", 
    secondary: "#c7dbcf",
    text: "#5f768f",
    white: "#ffffff"
  }
};

// ==========================================
// 🔐 APP SETTINGS
// ==========================================

const getEnv = (key, defaultValue) => {
  try {
    return import.meta.env[key] || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const APP_PASSWORD = getEnv("VITE_AUTH_PIN", "2026"); 
const FIXED_EXCHANGE_RATE = 0.0236; 
const MEMBERS = ['爸', '媽', '信', '屏', '樸'];

// ⚠️ 行程專用 API (綁定 Itinerary Sheet)
const GOOGLE_APPS_SCRIPT_URL =  getEnv("VITE_GOOGLE_SHEET_PLAN_CSV_URL", "");

// 記帳專用 (Sheet 2)
const DEFAULT_SHEET_CSV_URL = getEnv("VITE_GOOGLE_SHEET_CSV_URL", "");
const GOOGLE_FORM_ACTION_URL = getEnv("VITE_GOOGLE_FORM_ACTION_URL", ""); // 用於寫入記帳

const FORM_ENTRY_IDS = {
  ITEM: "entry.535523921",     
  AMOUNT: "entry.304377441",   
  PAYER: "entry.1459657419",    
  CATEGORY: "entry.1495061883" 
};

// ==========================================
// 🧩 ICONS & HELPERS
// ==========================================

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

// 行程 API 請求函式
const apiRequest = async (action, payload = {}) => {
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("在此處填入")) {
    console.warn("API URL not set");
    return { status: 'error', message: 'API URL missing' };
  }

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }) // 不再傳 sheetName，後端已鎖定
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { status: 'error', message: error.toString() };
  }
};

const smartParseCSV = (csvText) => {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { currentCell += '"'; i++; } else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim()); currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; 
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) { rows.push(currentRow); }
      currentRow = []; currentCell = '';
    } else { currentCell += char; }
  }
  if (currentCell || currentRow.length > 0) { currentRow.push(currentCell.trim()); rows.push(currentRow); }
  return rows;
};

// ==========================================
// 📱 COMPONENTS
// ==========================================

const LoginView = ({ onLogin }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === APP_PASSWORD) onLogin(); else { setError(true); setInput(''); }
  };
  return (
    <div className={`min-h-screen ${UI.bgMain} flex flex-col items-center justify-center p-6 ${UI.textMain}`}>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#c7dbcf]/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#efc0c2]/30 rounded-full blur-3xl"></div>
      <div className={`relative z-10 w-full max-w-xs ${UI.cardLarge} p-8 rounded-[2rem] flex flex-col items-center`}>
        <div className={`w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-6`}><Plane size={40} className="text-white" /></div>
        <h1 className="text-2xl font-black mb-2 tracking-wide text-white">SEOUL 2026</h1>
        <p className={`text-white/80 text-xs mb-8 font-bold`}>請輸入 PIN 碼以解鎖行程</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div><input type="tel" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }} placeholder="••••" className={`w-full bg-white/90 border-2 border-transparent focus:border-[#c7dbcf] rounded-2xl py-4 px-6 text-center text-xl font-bold tracking-[0.5em] outline-none transition-all text-[#5f768f] placeholder-[#c7dbcf]`} maxLength={6} />{error && <p className={`text-white text-xs text-center mt-2 font-bold animate-bounce`}>密碼錯誤</p>}</div>
          <button type="submit" className={`w-full bg-[#c7dbcf] text-[#5f768f] font-bold py-4 rounded-2xl text-lg shadow-md`}>進入旅程</button>
        </form>
      </div>
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1');
        setWeather(await response.json());
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchWeather();
  }, []);
  const getWeatherIcon = () => <CloudSun className="text-white" />;
  if (loading) return <div className={`w-full h-32 bg-[#c7dbcf]/40 rounded-[2rem] animate-pulse mb-6`}></div>;
  return (
    <div className={`${UI.cardLarge} rounded-[2.5rem] p-7 mb-6 flex items-center justify-between relative overflow-hidden`}>
      <div className={`absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full -mr-12 -mt-12 z-0`}></div>
      <div className="z-10 flex flex-col justify-center">
        <div className={`flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-widest mb-1`}><MapPin size={12} /> SEOUL</div>
        <span className={`text-7xl font-black text-white tracking-tighter leading-[0.9]`}>{Math.round(weather?.current?.temperature_2m)}°</span>
        <div className={`flex gap-3 text-sm font-bold text-white/90 mt-2`}><span>H:{Math.round(weather?.daily?.temperature_2m_max[0])}°</span><span className="opacity-60">|</span><span>L:{Math.round(weather?.daily?.temperature_2m_min[0])}°</span></div>
      </div>
      <div className={`z-10`}><div className="p-4 bg-white/20 rounded-[1.5rem] border border-white/10 shadow-sm backdrop-blur-sm">{React.cloneElement(getWeatherIcon(), { size: 56 })}</div></div>
    </div>
  );
};

const ItineraryView = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itineraryData, setItineraryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', time: '', desc: '', icon: 'default' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null); // Stores item to delete

  const dates = { 1: '1/15', 2: '1/16', 3: '1/17', 4: '1/18', 5: '1/19' };

  // 使用 GAS API 讀取行程
  const fetchItinerary = async () => {
    if (!GOOGLE_APPS_SCRIPT_URL) return;
    setLoading(true);
    const res = await apiRequest('read');
    if (res.status === 'success') {
      const parsedData = {};
      res.data.forEach(item => {
        item.id = String(item.id);
        
        if (item.time && String(item.time).includes('T')) {
            try {
                const date = new Date(item.time);
                const h = String(date.getHours()).padStart(2, '0');
                const m = String(date.getMinutes()).padStart(2, '0');
                item.time = `${h}:${m}`;
            } catch (e) {
                console.warn("Time parse error", e);
            }
        }

        const day = parseInt(item.day);
        if (!isNaN(day)) {
          if (!parsedData[day]) parsedData[day] = [];
          parsedData[day].push(item);
        }
      });
      Object.keys(parsedData).forEach(d => parsedData[d].sort((a, b) => a.time.localeCompare(b.time)));
      setItineraryData(parsedData);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItinerary(); }, []);

  const handleSaveItem = async () => {
    setIsSaving(true);
    const currentId = selectedItem.id ? String(selectedItem.id) : null;
    const action = currentId && !currentId.startsWith('new-') ? 'update' : 'create';
    const payload = { ...editForm, id: action === 'update' ? currentId : undefined, day: activeDay };
    const res = await apiRequest(action, payload);
    if (res.status === 'success') { await fetchItinerary(); setSelectedItem(null); setIsEditing(false); } else { alert("儲存失敗: " + res.message); }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSaving(true);
    const currentId = deletingItem.id ? String(deletingItem.id) : null;
    
    // Check if it's a real synced item
    if (currentId && !currentId.startsWith('new-')) {
       const res = await apiRequest('delete', { id: currentId });
       if (res.status === 'success') { 
           await fetchItinerary(); 
       } else { 
           alert("刪除失敗: " + (res.message || "未知錯誤")); 
       }
    } else { 
        // Local temporary item, just refresh (or could manually remove from state)
        await fetchItinerary();
    }
    setDeletingItem(null);
    setIsSaving(false);
  };

  const handleCreateNew = () => {
    const newItem = { id: `new-${Date.now()}`, time: '12:00', title: '', desc: '', icon: 'default', day: activeDay };
    setSelectedItem(newItem); setEditForm(newItem); setIsEditing(true);
  };

  const currentDayItems = itineraryData[activeDay] || [];

  return (
    <div className="pb-32">
      <WeatherWidget />
      <div className={`sticky top-0 ${UI.bgMain}/95 backdrop-blur-sm z-10 py-3 -mx-4 px-4 overflow-x-auto scrollbar-hide flex gap-3 mb-6`}>
        {[1, 2, 3, 4, 5].map((day) => (
          <button key={day} onClick={() => setActiveDay(day)} className={`flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 ${activeDay === day ? `${UI.btnPrimary} scale-105 border-transparent` : `bg-white/50 border-transparent ${UI.textMain} hover:border-[#c7dbcf]`}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Day {day}</div>
            <div className="text-lg font-black">{dates[day]}</div>
          </button>
        ))}
      </div>

      {loading ? (
         <div className="space-y-4">{[1,2,3].map(i => <div key={i} className={`h-24 ${UI.cardSmall} rounded-[2rem] animate-pulse`}></div>)}</div>
      ) : (
        <div className="space-y-4">
          {currentDayItems.length === 0 && <div className={`text-center py-16 ${UI.textMain}`}>本日尚無行程</div>}
          {currentDayItems.map((item, index) => (
            <div 
              key={index} 
              onClick={() => { setSelectedItem(item); setEditForm(item); setIsEditing(false); }} 
              className={`group ${UI.cardSmall} rounded-[2rem] p-5 relative active:scale-[0.98] transition-all cursor-pointer overflow-hidden`}
            >
              {/* External Delete Button (Visible on card) */}
              <button 
                onClick={(e) => {
                    e.stopPropagation(); // 防止觸發卡片開啟
                    setDeletingItem(item);
                }}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 text-[#5f768f]/50 hover:text-[#efc0c2] hover:bg-white shadow-sm transition-all`}
              >
                <Trash2 size={16} />
              </button>

              <div className="flex gap-5">
                <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                  <span className={`text-sm font-black ${UI.textMain}`}>{item.time}</span>
                  <div className={`h-full w-0.5 bg-[#5f768f]/20 mt-3 mb-[-2rem] group-last:bg-transparent`}></div>
                </div>
                <div className="flex-grow pb-1 pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 bg-white/50 text-[#5f768f] rounded-xl`}>{ICON_MAP[item.icon] || ICON_MAP['default']}</div>
                  </div>
                  <h4 className={`font-black ${UI.textMain} text-xl mb-1`}>{item.title}</h4>
                  <p className={`${UI.textSub} text-sm line-clamp-2 leading-relaxed font-medium`}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleCreateNew} className={`w-full py-4 rounded-[2rem] border-2 border-dashed border-[#c7dbcf] text-[#93a9c0] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#c7dbcf]/20 transition-all mt-4`}>
            <Plus size={16} /> 新增行程
          </button>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deletingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className={`absolute inset-0 bg-[#5f768f]/40 backdrop-blur-sm animate-fade-in`} onClick={() => setDeletingItem(null)}></div>
            <div className={`relative bg-[#f7eaed] w-full max-w-xs rounded-[2rem] shadow-2xl p-6 animate-slide-up flex flex-col items-center text-center`}>
                <div className={`w-16 h-16 bg-[#efc0c2]/20 rounded-full flex items-center justify-center mb-4 text-[#efc0c2]`}>
                    <AlertTriangle size={32} />
                </div>
                <h3 className={`text-xl font-black ${UI.textMain} mb-2`}>確認刪除？</h3>
                <p className={`${UI.textSub} text-sm mb-6`}>您確定要刪除行程「{deletingItem.title}」嗎？此動作無法復原。</p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setDeletingItem(null)} 
                        className={`flex-1 bg-white/50 text-[#5f768f] py-3 rounded-xl font-bold`}
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmDelete} 
                        disabled={isSaving}
                        className={`flex-1 ${UI.btnPrimary} py-3 rounded-xl font-bold flex items-center justify-center gap-2`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : "刪除"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Detail & Edit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className={`absolute inset-0 bg-[#5f768f]/30 backdrop-blur-sm animate-fade-in`} onClick={() => setSelectedItem(null)}></div>
          <div className={`bg-[#f7eaed] w-full max-w-md rounded-t-[2.5rem] shadow-2xl shadow-[#5f768f]/20 relative z-10 overflow-hidden h-[85vh] flex flex-col animate-slide-up`}>
            
            {/* Header: Edit and Close Buttons */}
            <div className="w-full flex justify-between items-center p-6 pb-2">
                {!isEditing ? (
                    <button 
                        onClick={() => { setIsEditing(true); setEditForm(selectedItem); }} 
                        className={`${UI.btnIcon}`}
                    >
                        <Edit2 size={20} />
                    </button>
                ) : <div className="w-10"></div>}

                <button 
                    onClick={() => setSelectedItem(null)} 
                    className={`${UI.btnIcon}`}
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto px-8 pb-8 pt-2">
                {isEditing ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className={`text-2xl font-black ${UI.textMain}`}>{selectedItem.id && String(selectedItem.id).startsWith('new-') ? '新增行程' : '編輯行程'}</h3>
                        </div>
                        <div><label className={`text-xs font-bold ${UI.textMain} ml-1 mb-1 block`}>時間</label><input type="time" value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} className={`w-full ${UI.inputGlass} p-4 rounded-2xl font-bold`}/></div>
                        <div><label className={`text-xs font-bold ${UI.textMain} ml-1 mb-1 block`}>標題</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className={`w-full ${UI.inputGlass} p-4 rounded-2xl font-bold text-lg`} placeholder="輸入標題..."/></div>
                        <div><label className={`text-xs font-bold ${UI.textMain} ml-1 mb-2 block`}>圖示</label><div className="flex flex-wrap gap-2">{Object.keys(ICON_MAP).map(key => (<button key={key} onClick={() => setEditForm({...editForm, icon: key})} className={`p-3 rounded-xl transition-all ${editForm.icon === key ? `bg-[#efc0c2] text-white shadow-md` : `bg-white/50 text-[#5f768f]`}`}>{ICON_MAP[key]}</button>))}</div></div>
                        <div><label className={`text-xs font-bold ${UI.textMain} ml-1 mb-1 block`}>詳細內容</label><textarea value={editForm.desc} onChange={(e) => setEditForm({...editForm, desc: e.target.value})} className={`w-full ${UI.inputGlass} p-4 rounded-2xl h-40 leading-relaxed`} placeholder="輸入詳細內容..."/></div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 pt-2">
                            <div className={`inline-flex items-center gap-2 bg-[#c7dbcf] text-[#5f768f] px-4 py-2 rounded-full text-xs font-bold`}>
                                <Clock size={14} />
                                {selectedItem.time}
                            </div>
                        </div>
                        <h3 className={`text-4xl font-black ${UI.textMain} leading-tight mb-6`}>{selectedItem.title}</h3>
                        <div className={`prose ${UI.textMain} leading-loose whitespace-pre-line text-lg`}>{selectedItem.desc}</div>
                    </>
                )}
            </div>
            
            {/* 編輯模式底部按鈕 */}
            {isEditing && (
                <div className={`p-6 border-t border-[#c7dbcf] pb-safe bg-[#f7eaed]/90 backdrop-blur-sm`}>
                  <div className="flex gap-3">
                      <button onClick={() => setIsEditing(false)} disabled={isSaving} className={`flex-1 bg-white/50 text-[#5f768f] py-4 rounded-2xl font-bold disabled:opacity-50`}>取消</button>
                      <button onClick={handleSaveItem} disabled={isSaving} className={`flex-1 ${UI.btnPrimary} py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-70`}>{isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> 儲存</>}</button>
                  </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ExpenseView = ({ expenses, loading, onRefresh, onAddExpense, exchangeRate, onDeleteExpense }) => {
  const [viewMode, setViewMode] = useState('list');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ item: '', amount: '', category: '食物', payer: '爸', splitWith: MEMBERS }); 
  const [currencyMode, setCurrencyMode] = useState('TWD');
  const [submitting, setSubmitting] = useState(false);

  const splitData = useMemo(() => {
    const netBalance = {}; const paidTotal = {}; MEMBERS.forEach(p => { netBalance[p] = 0; paidTotal[p] = 0; });
    expenses.forEach(item => {
      const amount = item.amount; const payer = item.author ? item.author.trim() : '';
      if (MEMBERS.includes(payer)) { netBalance[payer] += amount; paidTotal[payer] += amount; }
      const splitMembers = item.splitWith && item.splitWith.length > 0 ? item.splitWith : MEMBERS;
      const costPerPerson = amount / splitMembers.length;
      splitMembers.forEach(member => { if (netBalance[member] !== undefined) netBalance[member] -= costPerPerson; });
    });
    return { debts: MEMBERS.map(p => ({ name: p, paid: paidTotal[p], net: netBalance[p] })).sort((a, b) => a.net - b.net) };
  }, [expenses]);

  const toggleSplitMember = (member) => {
    setFormData(prev => {
      const current = prev.splitWith;
      return current.includes(member) 
        ? (current.length === 1 ? prev : { ...prev, splitWith: current.filter(m => m !== member) })
        : { ...prev, splitWith: [...current, member] };
    });
  };

  const handleSelectAll = () => { setFormData(prev => ({ ...prev, splitWith: prev.splitWith.length === MEMBERS.length ? [] : MEMBERS })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (formData.splitWith.length === 0) { alert("請至少選擇一位分攤對象"); return; }
    setSubmitting(true);
    let amountToSave = parseFloat(formData.amount); if (currencyMode === 'KRW') amountToSave = Math.round(amountToSave * FIXED_EXCHANGE_RATE);
    let finalItemName = formData.item; if (formData.splitWith.length < MEMBERS.length) finalItemName += ` #split:${formData.splitWith.join(',')}`;
    await onAddExpense({ item: finalItemName, amount: amountToSave, category: formData.category, payer: formData.payer, splitWith: formData.splitWith });
    setFormData({ item: '', amount: '', category: '食物', payer: '爸', splitWith: MEMBERS }); setSubmitting(false); setShowFormModal(false);
  };

  // ⚠️ 修正：這裡的刪除只處理本地暫存 (isPending)，不呼叫 API (因為記帳 Sheet 不支援 API)
  const handleDeleteClick = (expense) => {
    if (expense.isPending) {
      if (window.confirm(`確定要刪除這筆暫存記帳嗎？\n"${expense.desc.split('#')[0]}"`)) {
        onDeleteExpense(expense.id);
      }
    } else {
      alert("⚠️ 這筆資料已同步至 Google Sheet，無法從此處刪除。\n請直接前往 Google Sheet (CSV) 進行修改。");
    }
  };

  const totalTWD = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalKRW = Math.round(totalTWD / FIXED_EXCHANGE_RATE);

  return (
    <div className="pb-32 pt-2">
      <div className={`${UI.cardLarge} rounded-[2.5rem] p-8 mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mt-10 -mr-10"></div>
        <div className="relative z-10">
          <p className={`text-white/80 text-sm font-bold uppercase tracking-widest mb-2`}>Total Expenses</p>
          <div className="flex items-baseline gap-2 mb-4"><span className="text-2xl font-light opacity-80">NT$</span><h2 className="text-5xl font-black tracking-tight">{totalTWD.toLocaleString()}</h2></div>
          <div className="flex items-center justify-between"><span className={`text-sm font-bold bg-white/20 text-white px-4 py-1.5 rounded-full flex items-center gap-2`}>≈ ₩{totalKRW.toLocaleString()}</span><button onClick={onRefresh} className={`bg-white/20 text-white p-2.5 rounded-full hover:bg-white/30 transition-colors`}><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button></div>
        </div>
      </div>
      <div className={`bg-white/50 p-1.5 rounded-2xl flex mb-8 border border-[#c7dbcf]`}>
        {['list', 'split'].map(mode => (<button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${viewMode === mode ? `${UI.btnPrimary} shadow-sm` : `${UI.textMain} hover:bg-[#c7dbcf]/30`}`}>{mode === 'list' ? <><List size={16} /> 消費明細</> : <><PieChart size={16} /> 拆帳計算</>}</button>))}
      </div>
      {viewMode === 'list' ? (
        <>
          <button onClick={() => setShowFormModal(true)} className={`w-full ${UI.btnPrimary} py-5 rounded-[2rem] flex items-center justify-center gap-2 mb-8`}><Plus size={24} /> 記一筆</button>
          <div className={`flex items-center gap-3 mb-4 px-2 ${UI.textMain} text-xs font-bold uppercase tracking-wider`}><span>{expenses.length} Records</span><span className="opacity-30">|</span><span>Synced</span></div>
          <div className="space-y-4">
            {expenses.length === 0 ? (<div className={`text-center py-16 ${UI.textMain} ${UI.cardSmall} rounded-[2.5rem]`}><div className={`inline-block p-4 bg-white/50 rounded-full mb-4`}><Table2 size={24} /></div><p>暫無資料</p></div>) : (
              expenses.map((item, idx) => (
                <div key={idx} className={`${UI.cardSmall} p-5 rounded-[2rem] flex items-center justify-between transition-all ${item.isPending ? 'opacity-70' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-white/60 text-[#5f768f]`}>{item.category?.includes('食') ? <Utensils size={20} /> : item.category?.includes('購') ? <ShoppingBag size={20} /> : item.category?.includes('交') ? <Train size={20} /> : item.category?.includes('住') ? <Home size={20} /> : <CreditCard size={20} />}</div>
                    <div>
                      <div className="flex items-center gap-2"><p className={`font-black ${UI.textMain} text-lg`}>{item.desc.split('#')[0]}</p>{item.splitWith && item.splitWith.length < MEMBERS.length && (<span className={`text-[10px] bg-white/50 ${UI.textMain} px-2 py-0.5 rounded-md font-bold`}>{item.splitWith.join(',')}</span>)}</div>
                      <div className="flex items-center gap-2 mt-1"><span className={`text-xs font-bold ${UI.textSub} bg-white/40 px-2 py-0.5 rounded-md`}>{item.author || 'N/A'}</span>{item.isPending && <span className={`text-[10px] text-[#efc0c2] flex items-center gap-1`}><RefreshCw size={10} className="animate-spin"/></span>}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2"><div><p className={`font-black ${UI.textMain} text-right`}>${item.amount.toLocaleString()}</p><span className={`text-xs font-bold ${UI.textSub} block text-right`}>₩{Math.round(item.amount / FIXED_EXCHANGE_RATE).toLocaleString()}</span></div><button onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }} className={`p-1.5 rounded-lg hover:bg-white/50 transition-colors ${item.isPending ? 'text-[#efc0c2]' : 'text-[#5f768f]/30'}`}><Trash2 size={16} /></button></div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className={`${UI.cardSmall} p-8 rounded-[2.5rem]`}>
            <h4 className={`${UI.textSub} text-xs font-bold uppercase tracking-widest mb-6`}>結算狀況 (台幣)</h4>
            <div className="space-y-6">{splitData.debts.map((p, i) => (<div key={i} className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${p.net >= 0 ? `bg-[#efc0c2]` : `bg-[#c7dbcf]`} text-white`}>{p.name}</div><div><p className={`text-base font-bold ${UI.textMain}`}>{p.name}</p><p className={`text-xs ${UI.textSub} font-medium`}>已墊付 ${p.paid.toLocaleString()}</p></div></div><div className={`text-base font-black ${p.net >= 0 ? "text-[#efc0c2]" : "text-[#5f768f]"}`}>{p.net >= 0 ? `+${Math.round(p.net).toLocaleString()}` : `-${Math.round(Math.abs(p.net)).toLocaleString()}`}</div></div>))}</div>
          </div>
          <p className={`text-center text-xs ${UI.textMain} font-bold opacity-60`}>* 正數代表應收回，負數代表應支付。</p>
        </div>
      )}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
           <div className={`absolute inset-0 bg-[#5f768f]/40 backdrop-blur-sm animate-fade-in`} onClick={() => setShowFormModal(false)}></div>
           <div className={`bg-[#f7eaed] w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] relative z-10 p-8 animate-slide-up`}>
              <div className="flex justify-between items-center mb-8"><h3 className={`font-black text-2xl ${UI.textMain}`}>新增支出</h3><button onClick={() => setShowFormModal(false)} className={`bg-[#c7dbcf] p-3 rounded-full text-white`}><X size={20} /></button></div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className={`${UI.cardSmall} p-5 rounded-[2rem] border-2 border-transparent focus:border-[#efc0c2] transition-colors`}><label className={`text-xs font-bold ${UI.textSub} uppercase tracking-wider block mb-1`}>金額 ({currencyMode})</label><div className="flex items-center gap-2"><span className={`text-3xl ${UI.textSub} font-light`}>{currencyMode === 'KRW' ? '₩' : '$'}</span><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={`w-full bg-transparent text-4xl font-black ${UI.textMain} outline-none placeholder-[#c7dbcf]`} placeholder="0" required /></div>{currencyMode === 'KRW' && formData.amount && (<div className={`mt-3 pt-3 border-t border-[#5f768f]/10 text-xs text-[#efc0c2] font-bold flex items-center gap-1`}><ArrowLeftRight size={12} /> 約 NT${Math.round(formData.amount * FIXED_EXCHANGE_RATE).toLocaleString()}</div>)}</div>
                <div className={`flex bg-[#c7dbcf]/30 p-1.5 rounded-xl`}><button type="button" onClick={() => setCurrencyMode('KRW')} className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${currencyMode === 'KRW' ? `bg-[#efc0c2] text-white shadow-sm` : `${UI.textMain}`}`}>₩ KRW</button><button type="button" onClick={() => setCurrencyMode('TWD')} className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${currencyMode === 'TWD' ? `bg-[#efc0c2] text-white shadow-sm` : `${UI.textMain}`}`}>$ TWD</button></div>
                <div><label className={`text-xs font-bold ${UI.textMain} ml-2 mb-2 block`}>項目名稱</label><input type="text" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} className={`w-full p-5 ${UI.cardSmall} rounded-2xl outline-none font-bold ${UI.textMain} placeholder-[#5f768f]/50`} placeholder="例如：烤肉" required /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className={`text-xs font-bold ${UI.textMain} ml-2 mb-2 block`}>分類</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full p-5 ${UI.cardSmall} rounded-2xl outline-none font-bold ${UI.textMain} appearance-none`}><option value="食物">🍔 食物</option><option value="住宿">🏠 住宿</option><option value="交通">🚕 交通</option><option value="購物">🛍️ 購物</option><option value="其他">📦 其他</option></select></div><div><label className={`text-xs font-bold ${UI.textMain} ml-2 mb-2 block`}>付款人</label><select value={formData.payer} onChange={(e) => setFormData({...formData, payer: e.target.value})} className={`w-full p-5 ${UI.cardSmall} rounded-2xl outline-none font-bold ${UI.textMain} appearance-none`}>{MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}</select></div></div>
                <div><div className="flex justify-between items-center mb-3"><label className={`text-xs font-bold ${UI.textMain} ml-2 block`}>分攤對象</label><button type="button" onClick={handleSelectAll} className={`text-xs font-bold text-[#efc0c2] px-2 py-1 rounded hover:bg-[#efc0c2]/10 transition-colors`}>{formData.splitWith.length === MEMBERS.length ? '取消全選' : '全選'}</button></div><div className="grid grid-cols-5 gap-2">{MEMBERS.map(m => {const isSelected = formData.splitWith.includes(m); return (<button key={m} type="button" onClick={() => toggleSplitMember(m)} className={`relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${isSelected ? `bg-[#efc0c2] text-white shadow-md transform scale-105 font-bold` : `bg-white/50 text-[#5f768f]/60 border-2 border-transparent hover:border-[#c7dbcf]`}`}><span className="text-sm">{m}</span>{isSelected && (<div className="absolute -top-1 -right-1 bg-white text-[#efc0c2] rounded-full p-0.5 shadow-sm"><Check size={8} strokeWidth={4} /></div>)}</button>);})}</div></div>
                <button type="submit" disabled={submitting} className={`w-full ${UI.btnPrimary} py-5 rounded-2xl text-lg mt-6`}>{submitting ? 'Saving...' : '確認記帳'}</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// RemindersView & OthersView are unchanged in logic, just re-rendered for completeness in the file
const RemindersView = () => {
  const [checklist, setChecklist] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const DEFAULT_CHECKLIST = [{ id: 1, text: '護照', checked: true }, { id: 2, text: '漫遊/eSim', checked: true }, { id: 3, text: '轉接頭 (圓孔)', checked: false }, { id: 4, text: '牙刷牙膏', checked: false }];
  useEffect(() => { const saved = localStorage.getItem('trip_checklist'); setChecklist(saved ? JSON.parse(saved) : DEFAULT_CHECKLIST); }, []);
  useEffect(() => { localStorage.setItem('trip_checklist', JSON.stringify(checklist)); }, [checklist]);
  const toggleItem = (id) => setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  const addItem = (e) => { e.preventDefault(); if (!newItemText.trim()) return; setChecklist([...checklist, { id: Date.now(), text: newItemText, checked: false }]); setNewItemText(''); };
  const deleteItem = (id) => setChecklist(prev => prev.filter(item => item.id !== id));
  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className={`${UI.cardSmall} p-6 rounded-[2.5rem]`}>
        <h3 className={`font-black ${UI.textMain} text-xl mb-6 flex items-center gap-3`}><CheckSquare className="text-[#efc0c2]" size={24} /> 行前檢查</h3>
        <form onSubmit={addItem} className="flex gap-3 mb-6"><input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Add item..." className={`flex-1 bg-white/60 p-4 rounded-2xl outline-none text-sm font-bold ${UI.textMain} placeholder-[#5f768f]/50`} /><button type="submit" className={`${UI.btnPrimary} p-4 rounded-2xl`}><Plus size={20} /></button></form>
        <div className="space-y-3">{checklist.map((item) => (<div key={item.id} className={`flex items-center justify-between p-4 bg-white/50 rounded-2xl group`}><label className="flex items-center space-x-4 cursor-pointer flex-1"><input type="checkbox" className={`w-6 h-6 rounded-md border-[#c7dbcf] text-[#efc0c2] focus:ring-[#efc0c2] accent-[#efc0c2]`} checked={item.checked} onChange={() => toggleItem(item.id)} /><span className={`font-bold text-base ${item.checked ? `line-through ${UI.textSub} opacity-50` : UI.textMain}`}>{item.text}</span></label><button onClick={() => deleteItem(item.id)} className={`${UI.textSub} hover:text-[#efc0c2] p-2`}><Trash2 size={18} /></button></div>))}</div>
      </div>
      <div className={`${UI.cardSmall} p-6 rounded-[2.5rem]`}><h3 className={`font-black ${UI.textMain} text-xl mb-6 flex items-center gap-3`}><Lightbulb className="text-[#5f768f]" size={24} /> 小貼士</h3><div className="grid gap-4"><div className={`flex gap-4 p-5 bg-white/50 rounded-3xl`}><div className={`p-3 bg-white/50 rounded-2xl h-fit`}><MapPin className="text-[#efc0c2]" size={24} /></div><div><h4 className={`font-black ${UI.textMain} mb-1 text-lg`}>APP 必備</h4><p className={`text-sm ${UI.textSub} leading-relaxed font-medium`}>Naver Map (查路線)、Kakao T (叫車)、Wowpass。</p></div></div><div className={`flex gap-4 p-5 bg-white/50 rounded-3xl`}><div className={`p-3 bg-white/50 rounded-2xl h-fit`}><Lightbulb className="text-[#5f768f]" size={24} /></div><div><h4 className={`font-black ${UI.textMain} mb-1 text-lg`}>洋蔥式穿搭</h4><p className={`text-sm ${UI.textSub} leading-relaxed font-medium`}>室內暖氣強，厚外套+薄內裡最適合。</p></div></div></div></div>
    </div>
  );
};

const OthersView = () => {
  const [krwInput, setKrwInput] = useState('');
  const twdOutput = useMemo(() => { if (!krwInput) return 0; return parseFloat(krwInput) * FIXED_EXCHANGE_RATE; }, [krwInput]);
  const phrases = [{ ko: '안녕하세요', pro: 'An-nyeong-ha-se-yo', zh: '你好' }, { ko: '감사합니다', pro: 'Kam-sa-ham-ni-da', zh: '謝謝' }, { ko: '얼마예요?', pro: 'Ol-ma-ye-yo?', zh: '多少錢？' }, { ko: '화장실 어디예요?', pro: 'Hwa-jang-sil eo-di-ye-yo?', zh: '洗手間在哪？' }, { ko: '이거 주세요', pro: 'I-geo ju-se-yo', zh: '請給我這個' }];
  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className={`${UI.cardLarge} p-8 rounded-[2.5rem]`}>
        <h3 className={`font-black text-white text-xl mb-6 flex items-center gap-3`}><Calculator size={24} /> 匯率計算機</h3>
        <div className="space-y-4"><div className="relative"><label className={`text-xs font-bold text-white/80 absolute left-5 top-4`}>KRW</label><input type="number" value={krwInput} onChange={(e) => setKrwInput(e.target.value)} className={`w-full pt-10 pb-4 px-5 bg-white/20 rounded-3xl text-3xl font-black text-white outline-none border-2 border-transparent focus:border-white/50`} placeholder="0" /></div><div className={`flex justify-center text-white/60`}><ArrowLeftRight className="rotate-90" size={20} /></div><div className="relative"><label className={`text-xs font-bold text-white/80 absolute left-5 top-4`}>TWD (Approx)</label><div className={`w-full pt-10 pb-4 px-5 bg-white/40 rounded-3xl text-3xl font-black text-white border-2 border-white/20 shadow-sm`}>{twdOutput.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div><p className={`text-xs text-white/70 text-center font-bold mt-2`}>Rate: {FIXED_EXCHANGE_RATE}</p></div>
      </div>
      <div className={`${UI.cardSmall} rounded-[2.5rem] p-8`}><h3 className="font-black text-xl mb-6 flex items-center gap-3"><Languages size={24} /> 生存韓語</h3><div className="space-y-4">{phrases.map((p, i) => (<div key={i} className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white/20"><div><p className="font-bold text-lg mb-1">{p.ko}</p><p className="text-xs text-[#5f768f]/80 font-medium">{p.pro}</p></div><span className={`text-sm font-bold bg-[#efc0c2] text-white px-4 py-1.5 rounded-full`}>{p.zh}</span></div>))}</div></div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const tabs = [{ id: 'itinerary', icon: <MapPin /> }, { id: 'expense', icon: <Wallet /> }, { id: 'reminders', icon: <Bell /> }, { id: 'others', icon: <Grid /> }];
  useEffect(() => { if (localStorage.getItem('tripAppAuth') === 'true') setIsAuthenticated(true); }, []);
  const fetchExpenses = async () => {
    if (!DEFAULT_SHEET_CSV_URL) return;
    setLoadingExpenses(true);
    try {
      let fetchedData = [];
      if (DEFAULT_SHEET_CSV_URL.startsWith('http')) {
        try {
          const response = await fetch(`${DEFAULT_SHEET_CSV_URL}&t=${Date.now()}`);
          if (response.ok) {
            const rows = smartParseCSV(await response.text());
            if (rows.length >= 2) {
              const headers = rows[0];
              const getIndex = (k) => headers.findIndex(h => k.some(key => h.includes(key)));
              const idxItem = getIndex(['項目', 'Item']); const idxAmount = getIndex(['金額']); const idxCategory = getIndex(['分類']); const idxPayer = getIndex(['付款人']); const idxTime = getIndex(['時間']);
              for (let i = 1; i < rows.length; i++) {
                const row = rows[i]; if (row.length < 2) continue;
                let rawItem = idxItem > -1 ? row[idxItem] : row[1]; let splitWith = MEMBERS; const splitMatch = rawItem.match(/#split:(.*)/); if (splitMatch) splitWith = splitMatch[1].split(',').map(s => s.trim());
                fetchedData.push({ id: `sheet-${i}`, timestamp: idxTime > -1 ? row[idxTime] : row[0], desc: rawItem, amount: parseFloat((idxAmount > -1 ? row[idxAmount] : row[2]) || 0), category: idxCategory > -1 ? row[idxCategory] : row[3], author: idxPayer > -1 ? row[idxPayer] : (row[4] || ''), splitWith: splitWith });
              }
            }
          }
        } catch (e) { console.warn("Remote fetch failed", e); }
      }
      const pendingItems = JSON.parse(localStorage.getItem('pendingExpenses') || '[]');
      const validPending = pendingItems.filter(pending => { const isSynced = fetchedData.some(sheetItem => sheetItem.desc === pending.desc && Math.abs(sheetItem.amount - pending.amount) < 1 && sheetItem.author === pending.author); return !isSynced && (Date.now() - pending.createdAt) < 3600000; });
      localStorage.setItem('pendingExpenses', JSON.stringify(validPending));
      setExpenses([...validPending, ...fetchedData.reverse()]);
    } catch (error) { console.error(error); } finally { setLoadingExpenses(false); }
  };
  const handleAddExpenseLocal = (data) => {
    const newItem = { id: `local-${Date.now()}`, timestamp: new Date().toLocaleDateString(), desc: data.item, amount: data.amount, category: data.category, author: data.payer, splitWith: data.splitWith, isPending: true, createdAt: Date.now() };
    const current = JSON.parse(localStorage.getItem('pendingExpenses') || '[]');
    localStorage.setItem('pendingExpenses', JSON.stringify([newItem, ...current]));
    setExpenses(prev => [newItem, ...prev]);
  };
  const handleDeleteExpense = (id) => { const currentPending = JSON.parse(localStorage.getItem('pendingExpenses') || '[]'); const newPending = currentPending.filter(item => item.id !== id); localStorage.setItem('pendingExpenses', JSON.stringify(newPending)); setExpenses(prev => prev.filter(item => item.id !== id)); };
  useEffect(() => { if (isAuthenticated) fetchExpenses(); }, [isAuthenticated]);
  if (!isAuthenticated) return <LoginView onLogin={() => { setIsAuthenticated(true); localStorage.setItem('tripAppAuth', 'true'); }} />;
  return (
    <div className={`min-h-screen ${UI.bgMain} font-sans ${UI.textMain} flex justify-center`}>
      <div className={`w-full max-w-md min-h-screen relative shadow-2xl ${UI.bgMain}`}>
        <header className="px-6 pt-12 pb-4">
          <h1 className="text-3xl font-black tracking-tight text-[#5f768f]">SEOUL <span className="text-[#efc0c2]">TRIP</span></h1>
          <div className="flex items-center gap-2 mt-2"><span className={`text-[10px] font-bold ${UI.textSub} uppercase tracking-widest bg-[#c7dbcf]/50 px-2 py-1 rounded-md`}>5 Days</span><span className={`text-[10px] font-bold ${UI.textSub} uppercase tracking-widest bg-[#c7dbcf]/50 px-2 py-1 rounded-md`}>4 Nights</span></div>
        </header>
        <main className="px-5">
          {activeTab === 'itinerary' && <ItineraryView />}
          {activeTab === 'expense' && <ExpenseView expenses={expenses} loading={loadingExpenses} onRefresh={fetchExpenses} onDeleteExpense={handleDeleteExpense} onAddExpense={async (data) => { handleAddExpenseLocal(data); if (GOOGLE_FORM_ACTION_URL) { const fd = new FormData(); fd.append(FORM_ENTRY_IDS.ITEM, data.item); fd.append(FORM_ENTRY_IDS.AMOUNT, data.amount); fd.append(FORM_ENTRY_IDS.CATEGORY, data.category); fd.append(FORM_ENTRY_IDS.PAYER, data.payer); try { await fetch(GOOGLE_FORM_ACTION_URL, { method: 'POST', body: fd, mode: 'no-cors' }); } catch(e){} } }} exchangeRate={FIXED_EXCHANGE_RATE} />}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'others' && <OthersView />}
        </main>
        <nav className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[20rem] bg-[#f7eaed]/95 backdrop-blur-xl border border-[#c7dbcf] shadow-2xl shadow-[#5f768f]/10 rounded-[2rem] py-2 px-3 flex justify-around items-center z-50`}>
          {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${activeTab === tab.id ? "text-[#efc0c2]" : `${UI.textSub} hover:text-[#efc0c2]`}`}>{activeTab === tab.id && <div className={`absolute inset-0 bg-[#efc0c2]/20 rounded-2xl -z-10 scale-90 animate-fade-in`}></div>}{React.cloneElement(tab.icon, { size: 26, strokeWidth: 2.5, className: activeTab === tab.id ? 'transform scale-105 transition-transform' : '' })}</button>))}
        </nav>
      </div>
      <style>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; } .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); } body { background-color: ${THEME.base}; } `}</style>
    </div>
  );
}