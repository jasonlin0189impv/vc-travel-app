import * as React from 'react';
import {
  MapPin, Calendar, Wallet, CloudSun, CheckSquare, Languages, Plus, ShoppingBag, Utensils, Train, Clock, X, RefreshCw, Table2, List, CreditCard, User, Bell, Grid, ChevronRight, ArrowLeftRight, Calculator, PieChart, Coffee, Camera, Home, Bed, Plane, Trash2, Lightbulb, Check, Edit2, Save, Loader2, AlertTriangle, Car, AlertCircle
} from 'lucide-react';

const { useState, useEffect, useMemo, createContext, useContext } = React;

export const ConfigContext = createContext(null);

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
  'car': <Car size={18} />,
  'card': <CreditCard size={18} />,
  'alert': <AlertCircle size={18} />,
  'default': <MapPin size={18} />
};

export const smartParseCSV = (csvText) => {
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

// 單一 Web App 請求：POST { pin, type, action, ...payload }
// 不設 Content-Type → 瀏覽器送 text/plain → 免 CORS preflight（Apps Script 才收得到）
export const apiCall = async (url, pin, type, action, payload = {}, onUnauthorized, timeout = 10000) => {
  if (!url) return { status: 'error', message: 'API URL missing' };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify({ pin, type, action, ...payload }), signal: controller.signal });
    clearTimeout(t);
    const text = await r.text();
    let res;
    try { res = JSON.parse(text); } catch (e) { return { status: 'error', message: '回應格式錯誤' }; }
    if (res && res.status === 'error' && res.message === 'unauthorized' && onUnauthorized) onUnauthorized();
    return res;
  } catch (e) {
    clearTimeout(t);
    return { status: 'error', message: e.name === 'AbortError' ? '連線超時，請稍後再試' : String(e) };
  }
};

export const LoginView = ({ onLogin }) => {
  const config = useContext(ConfigContext);
  const { ui, api, title } = config;
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    // PIN 送去 web app 由伺服器比對（真正的 PIN 存在 Script Properties，不在前端）
    const res = await apiCall(api && api.url, input, 'auth', 'login');
    setChecking(false);
    if (res.status === 'success') onLogin(input);
    else { setError(true); setInput(''); }
  };
  // 封面式登入：mono-color 構圖（半調網點 + 直排書脊 + 襯線大標）+ 開場動畫。
  // 顏色全走 config.theme 角色（base=紙 / text=墨 / large=主墨點 / small=副點），
  // 各 trip 帶自己的配色進來即成立（honeymoon 保留原色）。
  return (
    <div className="login-root" aria-label="登入"
      style={{ '--ink': theme.text, '--paper': theme.base, '--clay': theme.large, '--gold': config.theme.small,
        backgroundColor: theme.base, color: theme.text }}>
      <div className="ht ht-lg" aria-hidden="true"></div>
      <div className="ht ht-sm" aria-hidden="true"></div>
      <div className="spine" aria-hidden="true">{(title.sub || 'Field Notes')} · {title.year || ''}</div>

      <div className="col">
        <div className="mast">
          {title.year && <div className="eyebrow">— {title.year} —</div>}
          <div className="hr"></div>
          <h1 className="display">
            {Array.from(title.main).map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.55 + i * 0.07}s` }}>{ch === ' ' ? ' ' : ch}</span>
            ))}
          </h1>
          {Array.isArray(title.duration) && <div className="tagline">{title.duration.join(' · ')}</div>}
          <div className="hr hr2"></div>
        </div>

        <form onSubmit={handleSubmit} className="foot">
          <div className="plabel">Enter Passcode</div>
          <input type="password" value={input} autoFocus autoComplete="off"
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="輸入通關密語" className="pfield" />
          {error && <p className="perr">密碼錯誤</p>}
          <button type="submit" disabled={checking} className="pbtn">{checking ? '···' : '進入旅程'}</button>
        </form>
      </div>

      <style>{`
        .login-root{ min-height:100vh; display:flex; padding:7vh 28px; position:relative; overflow:hidden;
          font-family:"Noto Sans TC",system-ui,-apple-system,sans-serif; }
        .login-root .col{ width:100%; max-width:360px; margin:0 auto; flex:1; z-index:2;
          display:flex; flex-direction:column; justify-content:space-between; }
        .login-root .ht{ position:absolute; border-radius:50%; pointer-events:none;
          -webkit-mask:radial-gradient(circle at 2px 2px,#000 1.4px,transparent 1.7px) 0 0/9px 9px;
                  mask:radial-gradient(circle at 2px 2px,#000 1.4px,transparent 1.7px) 0 0/9px 9px; }
        .login-root .ht-lg{ top:-90px; right:-90px; width:280px; height:280px; background:var(--clay);
          opacity:0; transform:scale(.4) rotate(-12deg); animation:ht-pop 1s .1s cubic-bezier(.2,.8,.2,1) forwards; }
        .login-root .ht-sm{ bottom:-70px; left:-70px; width:180px; height:180px; background:var(--gold);
          opacity:0; transform:scale(.4); animation:ht-pop 1s .55s cubic-bezier(.2,.8,.2,1) forwards; }
        .login-root .spine{ position:absolute; left:14px; top:32%; writing-mode:vertical-rl; transform:rotate(180deg);
          font-size:10px; letter-spacing:.4em; text-transform:uppercase; color:var(--ink);
          opacity:0; animation:lg-dim .7s .9s forwards; }
        .login-root .eyebrow{ font-size:11px; letter-spacing:.3em; text-transform:uppercase; text-align:center;
          opacity:0; animation:lg-dim .6s .15s forwards; }
        .login-root .hr{ height:1.5px; background:var(--ink); margin:14px 0 20px; transform-origin:left;
          transform:scaleX(0); animation:lg-draw .7s .35s cubic-bezier(.6,0,.2,1) forwards; }
        .login-root .hr2{ animation-delay:1s; }
        .login-root .display{ font-family:Georgia,"Times New Roman",serif; font-weight:600; margin:0;
          font-size:clamp(44px,17vw,68px); line-height:.9; letter-spacing:.02em; text-align:center; text-wrap:balance; }
        .login-root .display span{ display:inline-block; opacity:0; transform:translateY(26px);
          animation:lg-rise .6s cubic-bezier(.2,.8,.2,1) forwards; }
        .login-root .tagline{ font-family:Georgia,"Times New Roman",serif; font-style:italic; font-size:19px;
          text-align:center; color:var(--clay); margin-top:10px; opacity:0; animation:lg-up .6s .95s forwards; }
        .login-root .foot{ opacity:0; transform:translateY(16px); animation:lg-up .7s 1.15s forwards; }
        .login-root .plabel{ font-size:11px; letter-spacing:.24em; text-transform:uppercase; text-align:center;
          color:var(--ink); opacity:.6; margin-bottom:14px; }
        .login-root .pfield{ width:100%; background:transparent; border:0; border-bottom:1.5px solid var(--ink);
          text-align:center; font-size:20px; letter-spacing:.15em; padding:8px 4px 12px; color:var(--ink);
          outline:none; border-radius:0; font-family:inherit; transition:border-color .2s; }
        .login-root .pfield::placeholder{ color:var(--ink); opacity:.32; letter-spacing:.04em; font-size:15px; }
        .login-root .pfield:focus{ border-color:var(--clay); border-bottom-width:2px; }
        .login-root .perr{ color:var(--clay); font-size:12px; text-align:center; margin-top:10px; font-weight:700; }
        .login-root .pbtn{ width:100%; margin-top:24px; background:var(--ink); color:var(--paper); border:0;
          padding:15px; font-size:13px; letter-spacing:.18em; font-weight:700; cursor:pointer; }
        .login-root .pbtn:disabled{ opacity:.6; cursor:default; }
        @keyframes ht-pop{ to{ opacity:.85; transform:scale(1) rotate(0); } }
        @keyframes lg-dim{ to{ opacity:.6; } }
        @keyframes lg-draw{ to{ transform:scaleX(1); } }
        @keyframes lg-rise{ to{ opacity:1; transform:translateY(0); } }
        @keyframes lg-up{ to{ opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion:reduce){
          .login-root *{ animation-duration:.001s !important; animation-delay:0s !important; }
        }
      `}</style>
    </div>
  );
};

const WeatherWidget = ({ onRefresh, isRefreshing }) => {
  const config = useContext(ConfigContext);
  const { ui, weatherLocations } = config;
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocationIdx, setActiveLocationIdx] = useState(0);
  const scrollRef = React.useRef(null);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const newIdx = Math.round(scrollLeft / width);
      if (newIdx !== activeLocationIdx && newIdx >= 0 && newIdx < weatherLocations.length) {
        setActiveLocationIdx(newIdx);
      }
    }
  };

  const scrollToIdx = (idx) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      if (typeof scrollRef.current.scrollTo === 'function') {
        scrollRef.current.scrollTo({ left: idx * width, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollLeft = idx * width;
      }
    }
    setActiveLocationIdx(idx);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!weatherLocations || weatherLocations.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const promises = weatherLocations.map(loc =>
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        setWeatherData(results);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [weatherLocations]);

  if (loading) return <div className={`w-full h-32 ${ui.cardSmall} animate-pulse mb-6`}></div>;
  if (!weatherLocations || weatherLocations.length === 0) return null;

  return (
    <div className="relative mb-6">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {weatherLocations.map((loc, idx) => {
          const currentLocWeather = weatherData[idx];
          return (
            <div key={idx} className="flex-shrink-0 w-full snap-center">
              <div className={`${ui.cardLarge} rounded-[1.75rem] p-6 flex flex-col relative overflow-hidden transition-all duration-300`}>
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full -mr-14 -mt-14 z-0"></div>
                <div className="flex items-center justify-between z-10 w-full mb-2">
                  <div className={`flex items-center gap-1.5 ${ui.textWhite} opacity-80 text-xs uppercase tracking-widest`}>
                    <MapPin size={12} />
                    {loc.name}
                  </div>
                </div>

                <div className="flex justify-between items-end z-10 w-full">
                  <div className="flex flex-col">
                    <span className={`text-6xl font-serif ${ui.textWhite} tracking-tight leading-[0.9]`}>
                      {currentLocWeather ? Math.round(currentLocWeather.current?.temperature_2m) : "--"}°
                    </span>
                    <div className={`flex gap-3 text-sm font-mono tabular-nums ${ui.textWhite} opacity-80 mt-3`}>
                      <span>H:{currentLocWeather ? Math.round(currentLocWeather.daily?.temperature_2m_max[0]) : "-"}°</span>
                      <span className="opacity-60">|</span>
                      <span>L:{currentLocWeather ? Math.round(currentLocWeather.daily?.temperature_2m_min[0]) : "-"}°</span>
                    </div>
                  </div>
                  <div className={`flex flex-col items-end gap-3`}>
                    {onRefresh && (
                      <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className={`p-2 rounded-full bg-white/20 ${ui.textWhite} hover:bg-white/30 active:scale-95 transition-all`}>
                        <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                      </button>
                    )}
                    <div className="p-3.5 bg-white/15 rounded-[1.25rem] backdrop-blur-sm"><CloudSun className={ui.textWhite} size={40} /></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {weatherLocations.length > 1 && (
        <div className="absolute top-8 right-10 flex gap-2 z-20">
          {weatherLocations.map((_, dotIdx) => (
            <button key={dotIdx} onClick={() => scrollToIdx(dotIdx)} className={`w-2 h-2 rounded-full transition-all ${activeLocationIdx === dotIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ItineraryView = () => {
  const config = useContext(ConfigContext);
  const { ui, dates, api, _auth } = config;
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  const [activeDay, setActiveDay] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itineraryData, setItineraryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', time: '', desc: '', icon: 'default' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const apiRequest = (action, payload = {}, timeout = 10000) =>
    apiCall(api && api.url, _auth && _auth.pin, 'itinerary', action, payload, _auth && _auth.onUnauthorized, timeout);

  const fetchItinerary = async (isManualRefresh = false) => {
    if (!(api && api.url)) return;
    if (isManualRefresh) setLoading(true);
    try {
      const res = await apiRequest('read');
      if (res.status === 'success' && Array.isArray(res.data)) {
        const parsedData = {};
        res.data.forEach(item => {
          if (!item.id) return;
          item.id = String(item.id);
          if (item.time && String(item.time).includes('T')) {
            try {
              const date = new Date(item.time);
              item.time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            } catch (e) { }
          }
          const day = parseInt(item.day);
          if (!isNaN(day)) {
            if (!parsedData[day]) parsedData[day] = [];
            parsedData[day].push(item);
          }
        });
        Object.keys(parsedData).forEach(d => parsedData[d].sort((a, b) => (a.time || '').localeCompare(b.time || '')));
        setItineraryData(parsedData);
        localStorage.setItem(`itinerary_cache_${config.title.main}`, JSON.stringify(parsedData));
      } else if (res.status === 'error') {
        console.warn("API Error:", res.message);
      }
    } catch (e) { 
      console.error("Fetch error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(`itinerary_cache_${config.title.main}`);
    if (cached) { try { setItineraryData(JSON.parse(cached)); } catch (e) { fetchItinerary(true); } } else { fetchItinerary(true); }
  }, []);

  const handleSaveItem = async () => {
    setIsSaving(true);
    const currentId = selectedItem.id ? String(selectedItem.id) : null;
    const action = currentId && !currentId.startsWith('new') ? 'update' : 'create';
    const payload = { ...editForm, id: action === 'update' ? currentId : undefined, day: activeDay };
    const res = await apiRequest(action, payload);
    if (res.status === 'success') { await fetchItinerary(true); setSelectedItem(null); setIsEditing(false); } else { alert("儲存失敗: " + res.message); }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSaving(true);
    const currentId = deletingItem.id ? String(deletingItem.id) : null;
    if (currentId && !currentId.startsWith('new')) {
      const res = await apiRequest('delete', { id: currentId });
      if (res.status === 'success') { await fetchItinerary(true); } else { alert("刪除失敗"); }
    } else {
      const newData = { ...itineraryData };
      if (newData[activeDay]) {
        newData[activeDay] = newData[activeDay].filter(i => i.id !== currentId);
        setItineraryData(newData);
      }
    }
    setDeletingItem(null); setIsSaving(false);
  };

  const currentDayItems = itineraryData[activeDay] || [];
  const totalDays = Object.keys(dates).length;

  return (
    <div className="pb-32 relative">
      {loading && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${ui.bgMain} opacity-90`}>
          <div className={`${ui.bgMain} p-8 border ${ui.border} flex flex-col items-center gap-3`}>
            <Loader2 size={40} className="animate-spin" style={{ color: theme.large }} />
            <span className={`${ui.textSub} text-xs uppercase tracking-widest`}>更新中...</span>
          </div>
        </div>
      )}

      <WeatherWidget onRefresh={() => fetchItinerary(true)} isRefreshing={loading} />

      <div className={`sticky top-0 ${ui.bgMain} z-10 py-2 mb-4 flex gap-2.5 overflow-x-auto scrollbar-hide`}>
        {Object.keys(dates).map((dayStr) => {
          const day = parseInt(dayStr);
          const on = activeDay === day;
          return (
            <button key={day} onClick={() => setActiveDay(day)} aria-current={on ? 'true' : undefined}
              className={`flex-shrink-0 w-[4.2rem] py-3 rounded-2xl flex flex-col items-center transition-all ${on ? `${ui.btnPrimary} scale-105` : `bg-white/60 shadow-sm ${ui.textMain}`}`}>
              <span className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">Day {day}</span>
              <span className="text-base font-serif">{dates[day]}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {currentDayItems.length === 0 && <div className={`text-center py-16 ${ui.textSub} font-serif italic`}>本日尚無行程</div>}
        {currentDayItems.map((item, index) => (
          <div key={index} onClick={() => { setSelectedItem(item); setEditForm(item); setIsEditing(false); }} className={`group ${ui.cardSmall} rounded-[1.5rem] p-5 grid grid-cols-[3rem_1fr] gap-3 relative cursor-pointer active:scale-[0.99] transition-all`}>
            <div className="pt-1">
              <span className="text-xs font-mono tabular-nums tracking-tight" style={{ color: theme.large }}>{item.time}</span>
            </div>
            <div className="pr-7">
              <div className="flex items-center gap-2 mb-1">
                <span className={ui.textSub}>{ICON_MAP[item.icon] || ICON_MAP['default']}</span>
                <h4 className={`font-serif text-lg leading-snug ${ui.textMain}`}>{item.title}</h4>
              </div>
              <p className={`${ui.textSub} text-sm line-clamp-2 leading-relaxed`}>{item.desc}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }} className={`absolute top-4 right-4 p-1.5 rounded-full ${ui.textSub} hover:opacity-100 opacity-45 transition-opacity`}><Trash2 size={15} /></button>
          </div>
        ))}
        <button onClick={() => { setEditForm({ id: `new-${Date.now()}`, time: '12:00', title: '', desc: '', icon: 'default', day: activeDay }); setIsEditing(true); setSelectedItem({ id: 'new' }); }} className={`w-full py-4 rounded-[1.5rem] border-2 border-dashed ${ui.border} ${ui.textSub} hover:opacity-100 opacity-70 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity`}>
          <Plus size={14} /> 新增行程
        </button>
      </div>

      {deletingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className={`absolute inset-0 bg-black/30 animate-fade-in`} onClick={() => setDeletingItem(null)}></div>
          <div className={`relative ${ui.bgMain} w-full max-w-xs border ${ui.border} shadow-2xl rounded-3xl p-8 animate-slide-up flex flex-col items-center text-center`}>
            <h3 className={`text-2xl font-serif ${ui.textMain} mb-6`}>確認刪除？</h3>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeletingItem(null)} className={`flex-1 border ${ui.border} ${ui.textMain} py-3 rounded-xl text-sm uppercase tracking-widest`}>取消</button>
              <button onClick={handleConfirmDelete} disabled={isSaving} className={`flex-1 ${ui.btnPrimary} py-3 rounded-xl text-sm uppercase tracking-widest`}>{isSaving ? '...' : "刪除"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className={`absolute inset-0 bg-black/30 animate-fade-in`} onClick={() => setSelectedItem(null)}></div>
          <div className={`${ui.bgMain} w-full max-w-md rounded-t-[2rem] border-t ${ui.border} shadow-2xl relative z-10 overflow-hidden h-[85vh] flex flex-col animate-slide-up`}>
            <div className={`w-full flex justify-between items-center px-6 py-4 border-b ${ui.border}`}>
              {!isEditing ? <button onClick={() => { setIsEditing(true); setEditForm(selectedItem); }} className={ui.textSub}><Edit2 size={20} /></button> : <div className="w-6"></div>}
              <button onClick={() => setSelectedItem(null)} className={ui.textSub}><X size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto px-8 pb-8 pt-6">
              {isEditing ? (
                <div className="space-y-6">
                  <h3 className={`text-2xl font-serif ${ui.textMain}`}>{selectedItem.id && String(selectedItem.id).startsWith('new-') ? '新增行程' : '編輯行程'}</h3>
                  <div><label className={`text-[10px] uppercase tracking-widest ${ui.textSub} mb-2 block`}>時間</label><input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className={`w-full ${ui.inputGlass} p-3 rounded-xl`} /></div>
                  <div><label className={`text-[10px] uppercase tracking-widest ${ui.textSub} mb-2 block`}>標題</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={`w-full ${ui.inputGlass} p-3 rounded-xl text-lg font-serif`} /></div>
                  <div><label className={`text-[10px] uppercase tracking-widest ${ui.textSub} mb-2 block`}>圖示</label><div className="flex flex-wrap gap-2">{Object.keys(ICON_MAP).map(key => { const on = editForm.icon === key; return (<button key={key} onClick={() => setEditForm({ ...editForm, icon: key })} className={`p-3 rounded-xl border transition-all ${on ? '' : ui.border}`} style={{ backgroundColor: on ? theme.large : 'transparent', color: on ? theme.base : theme.text, borderColor: on ? theme.large : undefined }}>{ICON_MAP[key]}</button>); })}</div></div>
                  <div><label className={`text-[10px] uppercase tracking-widest ${ui.textSub} mb-2 block`}>詳細內容</label><textarea value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} className={`w-full ${ui.inputGlass} p-3 rounded-xl h-40 leading-relaxed`} /></div>
                </div>
              ) : (
                <>
                  <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: theme.large }}>{selectedItem.time}</div>
                  <h3 className={`text-4xl font-serif ${ui.textMain} leading-tight mb-6`}>{selectedItem.title}</h3>
                  <div className={`${ui.textMain} leading-loose whitespace-pre-line text-lg`}>{selectedItem.desc}</div>
                </>
              )}
            </div>
            {isEditing && (
              <div className={`p-6 border-t ${ui.border} pb-safe`}>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} disabled={isSaving} className={`flex-1 border ${ui.border} ${ui.textMain} py-3 rounded-xl text-sm uppercase tracking-widest`}>取消</button>
                  <button onClick={handleSaveItem} disabled={isSaving} className={`flex-1 ${ui.btnPrimary} py-3 rounded-xl text-sm uppercase tracking-widest flex justify-center gap-2`}>儲存</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ExpenseView = ({ expenses, loading, onRefresh, onAddExpense, onDeleteExpense }) => {
  const config = useContext(ConfigContext);
  const { ui, members, baseCurrency, exchangeRates } = config;
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  if (!members || members.length === 0) return <div className="p-8">Expense split needs members configured.</div>;

  const [viewMode, setViewMode] = useState('list');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ item: '', amount: '', category: '食物', payer: members[0], splitWith: members });
  const [currencyMode, setCurrencyMode] = useState(baseCurrency);
  const [submitting, setSubmitting] = useState(false);

  const availableCurrencies = [baseCurrency, ...Object.keys(exchangeRates)];

  const splitData = useMemo(() => {
    const netBalance = {}; const paidTotal = {}; members.forEach(p => { netBalance[p] = 0; paidTotal[p] = 0; });
    expenses.forEach(item => {
      const amount = item.amount; const payer = item.author ? item.author.trim() : '';
      if (members.includes(payer)) { netBalance[payer] += amount; paidTotal[payer] += amount; }
      const splitMembers = item.splitWith && item.splitWith.length > 0 ? item.splitWith : members;
      const costPerPerson = amount / splitMembers.length;
      splitMembers.forEach(member => { if (netBalance[member] !== undefined) netBalance[member] -= costPerPerson; });
    });
    return { debts: members.map(p => ({ name: p, paid: paidTotal[p], net: netBalance[p] })).sort((a, b) => a.net - b.net) };
  }, [expenses, members]);

  const toggleSplitMember = (member) => {
    setFormData(prev => {
      const current = prev.splitWith;
      return current.includes(member) ? { ...prev, splitWith: current.filter(m => m !== member) } : { ...prev, splitWith: [...current, member] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (formData.splitWith.length === 0) { alert("請至少選擇一位分攤對象"); return; }
    setSubmitting(true);
    let amountToSave = parseFloat(formData.amount);
    if (currencyMode !== baseCurrency) {
      amountToSave = Math.round(amountToSave * exchangeRates[currencyMode]);
    }
    let finalItemName = formData.item;
    // Only append #split if it's NOT the default (all members) or if we want to be explicit
    // The test expects explicit #split even for all members
    finalItemName += ` #split:${formData.splitWith.join(',')}`;

    await onAddExpense({ item: finalItemName, amount: amountToSave, category: formData.category, payer: formData.payer, splitWith: formData.splitWith });
    setFormData({ item: '', amount: '', category: '食物', payer: members[0], splitWith: members }); setSubmitting(false); setShowFormModal(false);
  };

  const totalBase = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="pb-32 pt-2">
      <div className={`${ui.cardLarge} rounded-[1.75rem] p-7 mb-6 relative overflow-hidden`}>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className={`${ui.textWhite} opacity-80 text-[11px] uppercase tracking-[0.22em] mb-2`}>Total Expenses</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-serif italic ${ui.textWhite} opacity-80`}>{baseCurrency}</span>
              <h2 className={`text-5xl font-serif tracking-tight ${ui.textWhite}`}>{totalBase.toLocaleString()}</h2>
            </div>
          </div>
          {onRefresh && (
            <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className={`p-2 rounded-full bg-white/20 ${ui.textWhite} hover:bg-white/30 active:scale-95 transition-all`}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>
      <div className={`flex ${ui.cardSmall} rounded-2xl p-1.5 mb-6`}>
        {['list', 'split'].map(mode => {
          const on = viewMode === mode;
          return (<button key={mode} onClick={() => setViewMode(mode)}
            className={`flex-1 py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${on ? `${ui.btnPrimary}` : `${ui.textMain} hover:opacity-70`}`}>
            {mode === 'list' ? <><List size={15} /> 消費明細</> : <><PieChart size={15} /> 拆帳計算</>}</button>);
        })}
      </div>
      {viewMode === 'list' ? (
        <>
          <button onClick={() => setShowFormModal(true)} className={`w-full ${ui.btnPrimary} py-4 rounded-2xl flex items-center justify-center gap-2 mb-5`}><Plus size={20} /> 記一筆</button>
          <div className="space-y-3">
            {expenses.map((item, idx) => (
              <div key={idx} className={`${ui.cardSmall} p-4 rounded-[1.5rem] flex items-center justify-between gap-3 ${item.isPending ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex-none flex items-center justify-center bg-white/60 ${ui.textMain}`}><CreditCard size={18} /></div>
                  <div className="min-w-0">
                    <p className={`font-serif ${ui.textMain} text-lg leading-snug truncate`}>{item.desc.split('#')[0]}</p>
                    <span className={`inline-block text-xs font-bold ${ui.textSub} bg-white/50 px-2 py-0.5 rounded-md mt-1`}>{item.author || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-none">
                  <p className={`font-serif text-lg ${ui.textMain} tabular-nums`}>{baseCurrency} {item.amount.toLocaleString()}</p>
                  <button onClick={() => onDeleteExpense(item.id)} className={`p-1 rounded-lg ${ui.textSub} hover:opacity-100 opacity-50`}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`${ui.cardSmall} rounded-[1.75rem] p-6 space-y-5`}>
          {splitData.debts.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-none bg-white/60 ${ui.textMain}`}>{p.name}</div>
                <div>
                  <p className={`text-base font-serif ${ui.textMain}`}>{p.name}</p>
                  <p className={`text-xs ${ui.textSub}`}>已墊付 {p.paid.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-lg font-serif tabular-nums" style={{ color: p.net >= 0 ? theme.large : theme.text }}>{p.net >= 0 ? `+${Math.round(p.net).toLocaleString()}` : `-${Math.round(Math.abs(p.net)).toLocaleString()}`}</div>
            </div>
          ))}
        </div>
      )}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className={`absolute inset-0 bg-black/30`} onClick={() => setShowFormModal(false)}></div>
          <div className={`${ui.bgMain} w-full max-w-sm border ${ui.border} shadow-2xl rounded-3xl relative z-10 p-8`}>
            <div className={`flex justify-between items-center mb-6 pb-4 border-b ${ui.border}`}><h3 className={`font-serif text-2xl ${ui.textMain}`}>新增支出</h3><button onClick={() => setShowFormModal(false)} className={ui.textSub}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={`border-b ${ui.border} pb-3`}><label className={`text-[10px] uppercase tracking-widest ${ui.textSub} block mb-1`}>金額</label><div className="flex items-baseline gap-2"><span className={`text-lg font-serif italic ${ui.textSub}`}>{currencyMode}</span><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={`w-full bg-transparent text-4xl font-serif ${ui.textMain} outline-none`} placeholder="0" required /></div></div>
              <div className={`flex border ${ui.border} overflow-x-auto`}>
                {availableCurrencies.map(cur => { const on = currencyMode === cur; return (
                  <button key={cur} type="button" onClick={() => setCurrencyMode(cur)} className={`flex-1 py-2 px-3 text-sm border-r ${ui.border} last:border-r-0 transition-colors`} style={{ backgroundColor: on ? theme.text : 'transparent', color: on ? theme.base : theme.text }}>{cur}</button>
                ); })}
              </div>
              <input type="text" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} className={`w-full p-3 ${ui.inputGlass} rounded-xl outline-none font-serif text-lg ${ui.textMain}`} placeholder="例如：烤肉" required />

              <div className="space-y-3">
                <label className={`text-[10px] uppercase tracking-widest ${ui.textSub}`}>分攤對象</label>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => { const on = formData.splitWith.includes(m); return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleSplitMember(m)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${on ? '' : ui.border}`}
                      style={{ backgroundColor: on ? theme.large : 'transparent', color: on ? theme.base : theme.text, borderColor: on ? theme.large : undefined }}
                    >
                      {m}
                    </button>
                  ); })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.payer} onChange={(e) => setFormData({ ...formData, payer: e.target.value })} className={`w-full p-3 ${ui.inputGlass} rounded-xl`}>{members.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full p-3 ${ui.inputGlass} rounded-xl`}><option>食物</option><option>交通</option><option>住宿</option><option>購物</option></select>
              </div>
              <button type="submit" disabled={submitting} className={`w-full ${ui.btnPrimary} py-4 rounded-xl text-sm uppercase tracking-widest mt-2`}>確認記帳</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const RemindersView = () => {
  const config = useContext(ConfigContext);
  const { ui, checklist: defaultChecklist, tips } = config;
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  const [checklist, setChecklist] = useState(defaultChecklist || []);
  const [newItemText, setNewItemText] = useState('');

  const toggleItem = (id) => setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  const addItem = (e) => { e.preventDefault(); if (!newItemText.trim()) return; setChecklist([...checklist, { id: Date.now(), text: newItemText, checked: false }]); setNewItemText(''); };
  const deleteItem = (id) => setChecklist(prev => prev.filter(item => item.id !== id));

  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className={`${ui.cardSmall} p-6 rounded-[1.75rem]`}>
        <h3 className={`font-serif ${ui.textMain} text-2xl mb-5 flex items-center gap-3`}><CheckSquare size={22} style={{ color: theme.large }} /> 行前檢查</h3>
        <form onSubmit={addItem} className="flex gap-3 mb-5"><input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Add item..." className={`flex-1 ${ui.inputGlass} p-4 rounded-2xl outline-none text-sm font-bold`} /><button type="submit" className={`${ui.btnPrimary} p-4 rounded-2xl`}><Plus size={20} /></button></form>
        <div className="space-y-3">{checklist.map((item) => (<div key={item.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl group"><label className="flex items-center gap-4 cursor-pointer flex-1"><input type="checkbox" className="w-6 h-6 rounded-md" style={{ accentColor: theme.large }} checked={item.checked} onChange={() => toggleItem(item.id)} /><span className={`font-serif text-lg ${item.checked ? `line-through ${ui.textSub} opacity-50` : ui.textMain}`}>{item.text}</span></label><button onClick={() => deleteItem(item.id)} className={`${ui.textSub} hover:opacity-100 opacity-50 p-1`}><Trash2 size={18} /></button></div>))}</div>
      </div>
      {tips && tips.length > 0 && (
        <div className={`${ui.cardSmall} p-6 rounded-[1.75rem]`}>
          <h3 className={`font-serif ${ui.textMain} text-2xl mb-5 flex items-center gap-3`}><Lightbulb size={22} style={{ color: theme.large }} /> 小貼士</h3>
          <div className="space-y-3">
            {tips.map((t, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white/50 rounded-2xl">
                <div className={`w-11 h-11 rounded-2xl flex-none flex items-center justify-center bg-white/60 ${ui.textMain}`}>{ICON_MAP[t.icon] || <Lightbulb size={18} />}</div>
                <div><h4 className={`font-serif ${ui.textMain} mb-0.5 text-lg`}>{t.title}</h4><p className={`text-sm ${ui.textSub} leading-relaxed`}>{t.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OthersView = () => {
  const config = useContext(ConfigContext);
  const { ui, exchangeRates, baseCurrency, phrases } = config;
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  const [foreignInput, setForeignInput] = useState('');
  const [activeCurrency, setActiveCurrency] = useState(Object.keys(exchangeRates)[0] || 'USD');

  const baseOutput = useMemo(() => {
    if (!foreignInput || !exchangeRates[activeCurrency]) return 0;
    return parseFloat(foreignInput) * exchangeRates[activeCurrency];
  }, [foreignInput, activeCurrency, exchangeRates]);

  return (
    <div className="pb-32 pt-2 space-y-6">
      <div>
        <h3 className={`font-serif ${ui.textMain} text-2xl mb-4 flex items-center gap-2`}><Calculator size={20} style={{ color: theme.large }} /> 匯率計算機</h3>
        <div className={`${ui.cardLarge} p-6 rounded-[1.75rem]`}>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {Object.keys(exchangeRates).map(cur => {
              const on = activeCurrency === cur;
              return (<button key={cur} onClick={() => setActiveCurrency(cur)} className="px-4 py-1.5 rounded-xl text-sm whitespace-nowrap border transition-colors" style={{ borderColor: on ? theme.base : `${theme.base}44`, backgroundColor: on ? theme.base : 'transparent', color: on ? theme.text : theme.base }}>{cur}</button>);
            })}
          </div>
          <div className="space-y-3">
            <div className="relative"><label className={`text-[10px] uppercase tracking-widest ${ui.textWhite} opacity-70 absolute left-0 top-2`}>{activeCurrency}</label><input type="number" value={foreignInput} onChange={(e) => setForeignInput(e.target.value)} className={`w-full pt-8 pb-3 bg-transparent border-b text-3xl font-serif ${ui.textWhite} outline-none`} style={{ borderColor: `${theme.base}55` }} placeholder="0" /></div>
            <div className={`flex justify-center ${ui.textWhite} opacity-50`}><ArrowLeftRight className="rotate-90" size={18} /></div>
            <div className="relative"><label className={`text-[10px] uppercase tracking-widest ${ui.textWhite} opacity-70 absolute left-0 top-2`}>{baseCurrency}</label><div className={`w-full pt-8 pb-3 border-b text-3xl font-serif ${ui.textWhite}`} style={{ borderColor: `${theme.base}55` }}>{baseOutput.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
            <p className={`text-[11px] ${ui.textWhite} opacity-60 mt-1`}>Rate: {exchangeRates[activeCurrency]}</p>
          </div>
        </div>
      </div>
      {phrases && phrases.length > 0 && (
        <div>
          <h3 className={`font-serif ${ui.textMain} text-2xl mb-4 flex items-center gap-2`}><Languages size={20} style={{ color: theme.large }} /> {config.phraseTitle || "常用語句"}</h3>
          <div className={`border-t ${ui.border}`}>{phrases.map((p, i) => (<div key={i} className={`flex justify-between items-center py-3 border-b ${ui.border}`}><div className="w-2/3"><p className={`font-serif text-lg mb-0.5 ${ui.textMain}`}>{p.src}</p><p className={`text-xs ${ui.textSub}`}>{p.pro}</p></div><span className="text-sm" style={{ color: theme.large }}>{p.zh}</span></div>))}</div>
        </div>
      )}
    </div>
  );
};

export default function TripApp({ config }) {
  const theme = config.theme || {}; // ponytail: 測試 mock 可能沒帶 theme
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const tabs = [
    { id: 'itinerary', icon: <MapPin /> },
    { id: 'expense', icon: <Wallet /> },
    { id: 'reminders', icon: <Bell /> },
    { id: 'others', icon: <Grid /> }
  ];

  const authKey = `tripAppAuth_${config.title.main}`;
  const pinKey = `tripAppPin_${config.title.main}`;

  useEffect(() => {
    if (localStorage.getItem(authKey) === 'true') {
      setIsAuthenticated(true);
      setPin(localStorage.getItem(pinKey) || ''); // ponytail: PIN 存使用者自己的 device（非 repo/bundle），是他本來就知道的值
    }
  }, []);

  // 伺服器回 unauthorized（例如 PIN 被改）→ 登出，退回登入頁
  const logout = () => {
    setIsAuthenticated(false); setPin('');
    localStorage.removeItem(authKey); localStorage.removeItem(pinKey);
  };

  // Expenses 分頁一列 {id,timestamp,item,amount,category,payer} → 畫面用的形狀（#split 從 item 拆出）
  const parseExpenseRow = (row) => {
    const item = String(row.item || '');
    const m = item.match(/#split:(.*)/);
    return {
      id: row.id, timestamp: row.timestamp, desc: item, amount: parseFloat(row.amount) || 0,
      category: row.category, author: row.payer,
      splitWith: m ? m[1].split(',').map(s => s.trim()) : config.members,
    };
  };

  const fetchExpenses = async () => {
    if (!config.api.url) return;
    setLoadingExpenses(true);
    const res = await apiCall(config.api.url, pin, 'expense', 'read', {}, logout);
    if (res.status === 'success' && Array.isArray(res.data)) setExpenses(res.data.map(parseExpenseRow).reverse());
    setLoadingExpenses(false);
  };

  const handleAddExpense = async (data) => {
    const res = await apiCall(config.api.url, pin, 'expense', 'create',
      { item: data.item, amount: data.amount, category: data.category, payer: data.payer }, logout);
    if (res.status === 'success') fetchExpenses(); else alert('記帳失敗: ' + (res.message || ''));
  };

  const handleDeleteExpense = async (id) => {
    const res = await apiCall(config.api.url, pin, 'expense', 'delete', { id }, logout);
    if (res.status === 'success') fetchExpenses(); else alert('刪除失敗: ' + (res.message || ''));
  };

  useEffect(() => { if (isAuthenticated) fetchExpenses(); }, [isAuthenticated]);

  return (
    <ConfigContext.Provider value={{ ...config, _auth: { pin, onUnauthorized: logout } }}>
      {!isAuthenticated ? (
        <LoginView onLogin={(enteredPin) => {
          setPin(enteredPin); setIsAuthenticated(true);
          localStorage.setItem(authKey, 'true'); localStorage.setItem(pinKey, enteredPin);
        }} />
      ) : (
        <div className={`min-h-screen ${config.ui.bgMain} font-sans ${config.ui.textMain} flex justify-center`}>
          <div className={`w-full max-w-md min-h-screen relative shadow-2xl ${config.ui.bgMain}`}>
            <header className="px-6 pt-9 pb-4">
              <div className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: theme.large }}>{config.title.sub}{config.title.year ? ` · ${config.title.year}` : ''}</div>
              <h1 className={`text-4xl font-serif tracking-tight ${config.ui.textMain}`}>{config.title.main}</h1>
              <div className="flex items-center gap-3 mt-2">
                {config.title.duration.map((d, i) => (
                  <span key={i} className={`text-[10px] ${config.ui.textSub} uppercase tracking-widest`}>{d}</span>
                ))}
              </div>
            </header>
            <main className="px-5">
              {activeTab === 'itinerary' && <ItineraryView />}
              {activeTab === 'expense' && <ExpenseView expenses={expenses} loading={loadingExpenses} onRefresh={fetchExpenses} onDeleteExpense={handleDeleteExpense} onAddExpense={handleAddExpense} />}
              {activeTab === 'reminders' && <RemindersView />}
              {activeTab === 'others' && <OthersView />}
            </main>
            <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[21rem] bg-white/95 backdrop-blur-xl border ${config.ui.border} shadow-xl shadow-black/5 rounded-[1.75rem] py-2 px-3 flex justify-around items-center z-50`}>
              {tabs.map((tab) => {
                const on = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all relative ${on ? '' : `${config.ui.textSub} hover:opacity-100`}`}
                    style={{ color: on ? theme.large : '' }}
                  >
                    {on && <div className="absolute inset-0 rounded-2xl -z-10 scale-90" style={{ backgroundColor: `${theme.large}26` }}></div>}
                    {React.cloneElement(tab.icon, { size: 25, strokeWidth: 2.4, className: on ? 'scale-105' : '' })}
                  </button>
                );
              })}
            </nav>
          </div>
          <style>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; } .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); } body { background-color: ${theme.base}; } `}</style>
        </div>
      )}
    </ConfigContext.Provider>
  );
}