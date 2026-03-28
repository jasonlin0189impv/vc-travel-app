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

export const LoginView = ({ onLogin }) => {
  const config = useContext(ConfigContext);
  const { ui, authPin, title } = config;
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === authPin) onLogin(); else { setError(true); setInput(''); }
  };
  return (
    <div className={`min-h-screen ${ui.bgMain} flex flex-col items-center justify-center p-6 ${ui.textMain}`}>
      <div className={`absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl`} style={{ backgroundColor: `${config.theme.small}66` }}></div>
      <div className={`absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl`} style={{ backgroundColor: `${config.theme.large}4D` }}></div>
      <div className={`relative z-10 w-full max-w-xs ${ui.cardLarge} p-8 rounded-[2rem] flex flex-col items-center`}>
        <div className={`w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-6`}><Plane size={40} className="text-white" /></div>
        <h1 className="text-2xl font-black mb-2 tracking-wide text-white">{title.main} {title.year || ""}</h1>
        <p className={`text-white/80 text-xs mb-8 font-bold`}>請輸入 PIN 碼以解鎖行程</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div><input type="tel" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }} placeholder="••••" className={`w-full bg-white/90 border-2 border-transparent focus:border-[${config.theme.small}] rounded-2xl py-4 px-6 text-center text-xl font-bold tracking-[0.5em] outline-none transition-all ${ui.textMain} placeholder-[${config.theme.small}]`} maxLength={6} />{error && <p className={`text-white text-xs text-center mt-2 font-bold animate-bounce`}>密碼錯誤</p>}</div>
          <button type="submit" className={`w-full ${ui.btnSecondary} py-4 rounded-2xl text-lg shadow-md`}>進入旅程</button>
        </form>
      </div>
    </div>
  );
};

const WeatherWidget = ({ onRefresh, isRefreshing }) => {
  const config = useContext(ConfigContext);
  const { ui, weatherLocations } = config;
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocationIdx, setActiveLocationIdx] = useState(0);

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

  const currentLocWeather = weatherData[activeLocationIdx];
  const locName = weatherLocations[activeLocationIdx].name;

  return (
    <div className={`${ui.cardLarge} rounded-[2.5rem] p-7 mb-6 flex flex-col relative overflow-hidden transition-all duration-300`}>
      <div className={`absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full -mr-12 -mt-12 z-0`}></div>
      <div className="flex items-center justify-between z-10 w-full mb-2">
        <div className={`flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-widest`}>
          <MapPin size={12} />
          {locName}
        </div>
        {weatherLocations.length > 1 && (
          <div className="flex gap-2">
            {weatherLocations.map((_, idx) => (
              <button key={idx} onClick={() => setActiveLocationIdx(idx)} className={`w-2 h-2 rounded-full transition-all ${activeLocationIdx === idx ? 'bg-white scale-125' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-end z-10 w-full">
        <div className="flex flex-col">
          <span className={`text-7xl font-black text-white tracking-tighter leading-[0.9]`}>
            {currentLocWeather ? Math.round(currentLocWeather.current?.temperature_2m) : "--"}°
          </span>
          <div className={`flex gap-3 text-sm font-bold text-white/90 mt-2`}>
            <span>H:{currentLocWeather ? Math.round(currentLocWeather.daily?.temperature_2m_max[0]) : "-"}°</span>
            <span className="opacity-60">|</span>
            <span>L:{currentLocWeather ? Math.round(currentLocWeather.daily?.temperature_2m_min[0]) : "-"}°</span>
          </div>
        </div>
        <div className={`flex flex-col items-end gap-3`}>
          {onRefresh && (
            <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className={`p-2 rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all`}>
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          )}
          <div className="p-4 bg-white/20 rounded-[1.5rem] border border-white/10 shadow-sm backdrop-blur-sm">
            <CloudSun className="text-white" size={48} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ItineraryView = () => {
  const config = useContext(ConfigContext);
  const { ui, dates, api } = config;
  const [activeDay, setActiveDay] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itineraryData, setItineraryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', time: '', desc: '', icon: 'default' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const apiRequest = async (action, payload = {}) => {
    if (!api.planCsvUrl) return { status: 'error', message: 'API URL missing' };
    try {
      const response = await fetch(api.planCsvUrl, { method: 'POST', body: JSON.stringify({ action, ...payload }) });
      return await response.json();
    } catch (error) { return { status: 'error', message: error.toString() }; }
  };

  const fetchItinerary = async (isManualRefresh = false) => {
    if (!api.planCsvUrl) return;
    if (isManualRefresh) setLoading(true);
    try {
      const res = await apiRequest('read');
      if (res.status === 'success') {
        const parsedData = {};
        res.data.forEach(item => {
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
        Object.keys(parsedData).forEach(d => parsedData[d].sort((a, b) => a.time.localeCompare(b.time)));
        setItineraryData(parsedData);
        localStorage.setItem(`itinerary_cache_${config.title.main}`, JSON.stringify(parsedData));
      }
    } catch (e) { console.error("Fetch error", e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = localStorage.getItem(`itinerary_cache_${config.title.main}`);
    if (cached) { try { setItineraryData(JSON.parse(cached)); } catch (e) { fetchItinerary(true); } } else { fetchItinerary(true); }
  }, []);

  const handleSaveItem = async () => {
    setIsSaving(true);
    const currentId = selectedItem.id ? String(selectedItem.id) : null;
    const action = currentId && !currentId.startsWith('new-') ? 'update' : 'create';
    const payload = { ...editForm, id: action === 'update' ? currentId : undefined, day: activeDay };
    const res = await apiRequest(action, payload);
    if (res.status === 'success') { await fetchItinerary(true); setSelectedItem(null); setIsEditing(false); } else { alert("儲存失敗: " + res.message); }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSaving(true);
    const currentId = deletingItem.id ? String(deletingItem.id) : null;
    if (currentId && !currentId.startsWith('new-')) {
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
        <div className={`fixed inset-0 z-[120] flex items-center justify-center ${ui.bgMain} opacity-80 backdrop-blur-sm`}>
          <div className="bg-white p-6 rounded-3xl shadow-xl animate-bounce-slight flex flex-col items-center gap-3">
            <Loader2 size={48} className={`animate-spin ${ui.textMain}`} style={{ color: config.theme.large }} />
            <span className={`${ui.textMain} font-bold text-sm`}>更新中...</span>
          </div>
        </div>
      )}

      <WeatherWidget onRefresh={() => fetchItinerary(true)} isRefreshing={loading} />

      <div className={`sticky top-0 ${ui.bgMain}/95 backdrop-blur-sm z-10 py-3 -mx-4 px-4 overflow-x-auto scrollbar-hide flex gap-3 mb-6`}>
        {Object.keys(dates).map((dayStr) => {
          const day = parseInt(dayStr);
          return (
            <button key={day} onClick={() => setActiveDay(day)} className={`flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 ${activeDay === day ? `${ui.btnPrimary} scale-105 border-transparent` : `bg-white/50 border-transparent ${ui.textMain} hover:border-[#c7dbcf]`}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Day {day}</div>
              <div className="text-lg font-black">{dates[day]}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {currentDayItems.length === 0 && <div className={`text-center py-16 ${ui.textMain}`}>本日尚無行程</div>}
        {currentDayItems.map((item, index) => (
          <div key={index} onClick={() => { setSelectedItem(item); setEditForm(item); setIsEditing(false); }} className={`group ${ui.cardSmall} rounded-[2rem] p-5 relative active:scale-[0.98] transition-all cursor-pointer overflow-hidden`}>
            <button onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }} className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 ${ui.textSub} hover:opacity-100 shadow-sm transition-all`}><Trash2 size={16} /></button>
            <div className="flex gap-5">
              <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                <span className={`text-sm font-black ${ui.textMain}`}>{item.time}</span>
                <div className={`h-full w-0.5 bg-black/10 mt-3 mb-[-2rem] group-last:bg-transparent`}></div>
              </div>
              <div className="flex-grow pb-1 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 bg-white/50 ${ui.textMain} rounded-xl`}>{ICON_MAP[item.icon] || ICON_MAP['default']}</div>
                </div>
                <h4 className={`font-black ${ui.textMain} text-xl mb-1`}>{item.title}</h4>
                <p className={`${ui.textSub} text-sm line-clamp-2 leading-relaxed font-medium`}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => { setEditForm({ id: `new-${Date.now()}`, time: '12:00', title: '', desc: '', icon: 'default', day: activeDay }); setIsEditing(true); setSelectedItem({ id: 'new' }); }} className={`w-full py-4 rounded-[2rem] border-2 border-dashed ${ui.border} ${ui.textMain} font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all mt-4`}>
          <Plus size={16} /> 新增行程
        </button>
      </div>

      {deletingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in`} onClick={() => setDeletingItem(null)}></div>
          <div className={`relative ${ui.bgMain} w-full max-w-xs rounded-[2rem] shadow-2xl p-6 animate-slide-up flex flex-col items-center text-center`}>
            <h3 className={`text-xl font-black ${ui.textMain} mb-4`}>確認刪除？</h3>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeletingItem(null)} className={`flex-1 bg-white/50 ${ui.textMain} py-3 rounded-xl font-bold`}>取消</button>
              <button onClick={handleConfirmDelete} disabled={isSaving} className={`flex-1 ${ui.btnPrimary} py-3 rounded-xl font-bold`}>{isSaving ? '...' : "刪除"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in`} onClick={() => setSelectedItem(null)}></div>
          <div className={`${ui.bgMain} w-full max-w-md rounded-t-[2.5rem] shadow-2xl relative z-10 overflow-hidden h-[85vh] flex flex-col animate-slide-up`}>
            <div className="w-full flex justify-between items-center p-6 pb-2">
              {!isEditing ? <button onClick={() => { setIsEditing(true); setEditForm(selectedItem); }} className={`${ui.btnIcon}`}><Edit2 size={20} /></button> : <div className="w-10"></div>}
              <button onClick={() => setSelectedItem(null)} className={`${ui.btnIcon}`}><X size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto px-8 pb-8 pt-2">
              {isEditing ? (
                <div className="space-y-6">
                  <h3 className={`text-2xl font-black ${ui.textMain}`}>{selectedItem.id && String(selectedItem.id).startsWith('new-') ? '新增行程' : '編輯行程'}</h3>
                  <div><label className={`text-xs font-bold ${ui.textMain} ml-1 mb-1 block`}>時間</label><input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className={`w-full ${ui.inputGlass} p-4 rounded-2xl font-bold`} /></div>
                  <div><label className={`text-xs font-bold ${ui.textMain} ml-1 mb-1 block`}>標題</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={`w-full ${ui.inputGlass} p-4 rounded-2xl font-bold text-lg`} /></div>
                  <div><label className={`text-xs font-bold ${ui.textMain} ml-1 mb-2 block`}>圖示</label><div className="flex flex-wrap gap-2">{Object.keys(ICON_MAP).map(key => (<button key={key} onClick={() => setEditForm({ ...editForm, icon: key })} className={`p-3 rounded-xl transition-all ${editForm.icon === key ? `${ui.btnPrimary}` : `bg-white/50 ${ui.textMain}`}`}>{ICON_MAP[key]}</button>))}</div></div>
                  <div><label className={`text-xs font-bold ${ui.textMain} ml-1 mb-1 block`}>詳細內容</label><textarea value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} className={`w-full ${ui.inputGlass} p-4 rounded-2xl h-40 leading-relaxed`} /></div>
                </div>
              ) : (
                <>
                  <h3 className={`text-4xl font-black ${ui.textMain} leading-tight mb-6 mt-4`}>{selectedItem.title}</h3>
                  <div className={`prose ${ui.textMain} leading-loose whitespace-pre-line text-lg`}>{selectedItem.desc}</div>
                </>
              )}
            </div>
            {isEditing && (
              <div className={`p-6 border-t ${ui.border} pb-safe bg-white/50 backdrop-blur-sm`}>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} disabled={isSaving} className={`flex-1 bg-white/80 ${ui.textMain} py-4 rounded-2xl font-bold`}>取消</button>
                  <button onClick={handleSaveItem} disabled={isSaving} className={`flex-1 ${ui.btnPrimary} py-4 rounded-2xl font-bold flex justify-center gap-2`}>儲存</button>
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
      <div className={`${ui.cardLarge} rounded-[2.5rem] p-8 mb-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mt-10 -mr-10"></div>
        <div className="relative z-10">
          <p className={`text-white/80 text-sm font-bold uppercase tracking-widest mb-2`}>Total Expenses</p>
          <div className="flex items-baseline gap-2 mb-4"><span className="text-2xl font-light opacity-80">{baseCurrency}</span><h2 className="text-5xl font-black tracking-tight">{totalBase.toLocaleString()}</h2></div>
        </div>
      </div>
      <div className={`bg-white/50 p-1.5 rounded-2xl flex mb-8 border ${ui.border}`}>
        {['list', 'split'].map(mode => (<button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${viewMode === mode ? `${ui.btnPrimary} shadow-sm` : `${ui.textMain} hover:bg-black/5`}`}>{mode === 'list' ? <><List size={16} /> 消費明細</> : <><PieChart size={16} /> 拆帳計算</>}</button>))}
      </div>
      {viewMode === 'list' ? (
        <>
          <button onClick={() => setShowFormModal(true)} className={`w-full ${ui.btnPrimary} py-5 rounded-[2rem] flex items-center justify-center gap-2 mb-8`}><Plus size={24} /> 記一筆</button>
          <div className="space-y-4">
            {expenses.map((item, idx) => (
              <div key={idx} className={`${ui.cardSmall} p-5 rounded-[2rem] flex items-center justify-between transition-all ${item.isPending ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-white/60 ${ui.textMain}`}>{<CreditCard size={20} />}</div>
                  <div>
                    <p className={`font-black ${ui.textMain} text-lg`}>{item.desc.split('#')[0]}</p>
                    <div className="flex items-center gap-2 mt-1"><span className={`text-xs font-bold ${ui.textSub} bg-white/40 px-2 py-0.5 rounded-md`}>{item.author || 'N/A'}</span></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2"><div><p className={`font-black ${ui.textMain} text-right`}>{baseCurrency} {item.amount.toLocaleString()}</p></div><button onClick={() => onDeleteExpense(item.id)} className={`p-1.5 rounded-lg hover:bg-white/50 ${ui.textMain} opacity-50`}><Trash2 size={16} /></button></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className={`${ui.cardSmall} p-8 rounded-[2.5rem]`}>
            <div className="space-y-6">{splitData.debts.map((p, i) => (<div key={i} className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${p.net >= 0 ? ui.bgMain : 'bg-white/50'} ${ui.textMain}`}>{p.name}</div><div><p className={`text-base font-bold ${ui.textMain}`}>{p.name}</p><p className={`text-xs ${ui.textSub} font-medium`}>已墊付 {p.paid.toLocaleString()}</p></div></div><div className={`text-base font-black ${ui.textMain}`}>{p.net >= 0 ? `+${Math.round(p.net).toLocaleString()}` : `-${Math.round(Math.abs(p.net)).toLocaleString()}`}</div></div>))}</div>
          </div>
        </div>
      )}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm`} onClick={() => setShowFormModal(false)}></div>
          <div className={`${ui.bgMain} w-full max-w-sm rounded-[2.5rem] relative z-10 p-8`}>
            <div className="flex justify-between items-center mb-8"><h3 className={`font-black text-2xl ${ui.textMain}`}>新增支出</h3><button onClick={() => setShowFormModal(false)} className={`${ui.btnIcon}`}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`${ui.cardSmall} p-5 rounded-[2rem]`}><label className={`text-xs font-bold ${ui.textSub} block mb-1`}>金額</label><div className="flex items-center gap-2"><span className={`text-3xl font-light`}>{currencyMode}</span><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={`w-full bg-transparent text-4xl font-black ${ui.textMain} outline-none`} placeholder="0" required /></div></div>
              <div className={`flex bg-white/40 p-1.5 rounded-xl overflow-x-auto`} gap="2">
                {availableCurrencies.map(cur => (
                  <button key={cur} type="button" onClick={() => setCurrencyMode(cur)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-black transition-all ${currencyMode === cur ? `${ui.btnPrimary}` : `${ui.textMain}`}`}>{cur}</button>
                ))}
              </div>
              <input type="text" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} className={`w-full p-5 ${ui.inputGlass} rounded-2xl outline-none font-bold ${ui.textMain}`} placeholder="例如：烤肉" required />

              <div className="space-y-3">
                <label className={`text-xs font-bold ${ui.textSub} ml-1`}>分攤對象</label>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleSplitMember(m)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.splitWith.includes(m) ? `${ui.btnPrimary}` : `bg-white/50 ${ui.textMain}`}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.payer} onChange={(e) => setFormData({ ...formData, payer: e.target.value })} className={`w-full p-5 ${ui.inputGlass} rounded-2xl font-bold`}>{members.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full p-5 ${ui.inputGlass} rounded-2xl font-bold`}><option>食物</option><option>交通</option><option>住宿</option><option>購物</option></select>
              </div>
              <button type="submit" disabled={submitting} className={`w-full ${ui.btnPrimary} py-5 rounded-2xl text-lg mt-6`}>確認記帳</button>
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
  const [checklist, setChecklist] = useState(defaultChecklist || []);
  const [newItemText, setNewItemText] = useState('');

  const toggleItem = (id) => setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  const addItem = (e) => { e.preventDefault(); if (!newItemText.trim()) return; setChecklist([...checklist, { id: Date.now(), text: newItemText, checked: false }]); setNewItemText(''); };
  const deleteItem = (id) => setChecklist(prev => prev.filter(item => item.id !== id));

  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className={`${ui.cardSmall} p-6 rounded-[2.5rem]`}>
        <h3 className={`font-black ${ui.textMain} text-xl mb-6 flex items-center gap-3`}><CheckSquare className="text-[#d9a78b]" size={24} style={{ color: config.theme.large }} /> 行前檢查</h3>
        <form onSubmit={addItem} className="flex gap-3 mb-6"><input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Add item..." className={`flex-1 ${ui.inputGlass} p-4 rounded-2xl outline-none text-sm font-bold`} /><button type="submit" className={`${ui.btnPrimary} p-4 rounded-2xl`}><Plus size={20} /></button></form>
        <div className="space-y-3">{checklist.map((item) => (<div key={item.id} className={`flex items-center justify-between p-4 bg-white/50 rounded-2xl group`}><label className="flex items-center space-x-4 cursor-pointer flex-1"><input type="checkbox" className={`w-6 h-6 rounded-md`} checked={item.checked} onChange={() => toggleItem(item.id)} /><span className={`font-bold text-base ${item.checked ? `line-through ${ui.textSub} opacity-50` : ui.textMain}`}>{item.text}</span></label><button onClick={() => deleteItem(item.id)} className={`${ui.textSub} hover:opacity-100 p-2`}><Trash2 size={18} /></button></div>))}</div>
      </div>
      {tips && tips.length > 0 && (
        <div className={`${ui.cardSmall} p-6 rounded-[2.5rem]`}>
          <h3 className={`font-black ${ui.textMain} text-xl mb-6 flex items-center gap-3`}><Lightbulb size={24} /> 小貼士</h3>
          <div className="grid gap-4">
            {tips.map((t, i) => (
              <div key={i} className={`flex gap-4 p-5 bg-white/50 rounded-3xl`}>
                <div className={`p-3 bg-white/50 rounded-2xl h-fit`}>{ICON_MAP[t.icon] || <Lightbulb size={24} />}</div>
                <div><h4 className={`font-black ${ui.textMain} mb-1 text-lg`}>{t.title}</h4><p className={`text-sm ${ui.textSub} leading-relaxed font-medium`}>{t.desc}</p></div>
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
  const [foreignInput, setForeignInput] = useState('');
  const [activeCurrency, setActiveCurrency] = useState(Object.keys(exchangeRates)[0] || 'USD');

  const baseOutput = useMemo(() => {
    if (!foreignInput || !exchangeRates[activeCurrency]) return 0;
    return parseFloat(foreignInput) * exchangeRates[activeCurrency];
  }, [foreignInput, activeCurrency, exchangeRates]);

  return (
    <div className="pb-32 pt-2 space-y-6">
      <div className={`${ui.cardLarge} p-8 rounded-[2.5rem]`}>
        <h3 className={`font-black text-white text-xl mb-6 flex items-center gap-3`}><Calculator size={24} /> 匯率計算機</h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {Object.keys(exchangeRates).map(cur => (
            <button key={cur} onClick={() => setActiveCurrency(cur)} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${activeCurrency === cur ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}>{cur}</button>
          ))}
        </div>
        <div className="space-y-4">
          <div className="relative"><label className={`text-xs font-bold text-white/80 absolute left-5 top-4`}>{activeCurrency}</label><input type="number" value={foreignInput} onChange={(e) => setForeignInput(e.target.value)} className={`w-full pt-10 pb-4 px-5 bg-white/20 rounded-3xl text-3xl font-black text-white outline-none border-2 border-transparent focus:border-white/50`} placeholder="0" /></div>
          <div className={`flex justify-center text-white/60`}><ArrowLeftRight className="rotate-90" size={20} /></div>
          <div className="relative"><label className={`text-xs font-bold text-white/80 absolute left-5 top-4`}>{baseCurrency} (Approx)</label><div className={`w-full pt-10 pb-4 px-5 bg-white/40 rounded-3xl text-3xl font-black text-white border-2 border-white/20 shadow-sm`}>{baseOutput.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
          <p className={`text-xs text-white/70 text-center font-bold mt-2`}>Rate: {exchangeRates[activeCurrency]}</p>
        </div>
      </div>
      {phrases && phrases.length > 0 && (
        <div className={`${ui.cardSmall} rounded-[2.5rem] p-8`}><h3 className="font-black text-xl mb-6 flex items-center gap-3"><Languages size={24} /> {config.phraseTitle || "常用語句"}</h3><div className="space-y-4">{phrases.map((p, i) => (<div key={i} className="flex justify-between items-center bg-white/60 p-4 rounded-2xl"><div className="w-2/3"><p className="font-bold text-lg mb-1">{p.src}</p><p className="text-xs opacity-60 font-medium">{p.pro}</p></div><span className={`text-sm font-bold ${ui.bgMain} ${ui.textMain} px-4 py-1.5 rounded-full text-center whitespace-nowrap`}>{p.zh}</span></div>))}</div></div>
      )}
    </div>
  );
};

export default function TripApp({ config }) {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const tabs = [
    { id: 'itinerary', icon: <MapPin /> },
    { id: 'expense', icon: <Wallet /> },
    { id: 'reminders', icon: <Bell /> },
    { id: 'others', icon: <Grid /> }
  ];

  useEffect(() => { if (localStorage.getItem(`tripAppAuth_${config.title.main}`) === 'true') setIsAuthenticated(true); }, []);

  const fetchExpenses = async () => {
    if (!config.api.sheetCsvUrl) return;
    setLoadingExpenses(true);
    try {
      const response = await fetch(`${config.api.sheetCsvUrl}&t=${Date.now()}`);
      if (response.ok) {
        const rows = smartParseCSV(await response.text());
        if (rows.length >= 2) {
          const headers = rows[0];
          const getIndex = (k) => headers.findIndex(h => k.some(key => h.includes(key)));
          const idxItem = getIndex(['項目', 'Item']); const idxAmount = getIndex(['金額']); const idxCategory = getIndex(['分類']); const idxPayer = getIndex(['付款人']); const idxTime = getIndex(['時間']);
          let fetchedData = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]; if (row.length < 2) continue;
            let rawItem = idxItem > -1 ? row[idxItem] : row[1]; let splitWith = config.members; const splitMatch = rawItem.match(/#split:(.*)/); if (splitMatch) splitWith = splitMatch[1].split(',').map(s => s.trim());
            fetchedData.push({ id: `sheet-${i}`, timestamp: idxTime > -1 ? row[idxTime] : row[0], desc: rawItem, amount: parseFloat((idxAmount > -1 ? row[idxAmount] : row[2]) || 0), category: idxCategory > -1 ? row[idxCategory] : row[3], author: idxPayer > -1 ? row[idxPayer] : (row[4] || ''), splitWith: splitWith });
          }
          const pendingItems = JSON.parse(localStorage.getItem(`pendingExpenses_${config.title.main}`) || '[]');
          const validPending = pendingItems.filter(pending => { const isSynced = fetchedData.some(sheetItem => sheetItem.desc === pending.desc && Math.abs(sheetItem.amount - pending.amount) < 1 && sheetItem.author === pending.author); return !isSynced && (Date.now() - pending.createdAt) < 3600000; });
          localStorage.setItem(`pendingExpenses_${config.title.main}`, JSON.stringify(validPending));
          setExpenses([...validPending, ...fetchedData.reverse()]);
        }
      }
    } catch (e) { console.warn("Fetch failed"); } finally { setLoadingExpenses(false); }
  };

  const handleAddExpenseLocal = (data) => {
    const newItem = { id: `local-${Date.now()}`, timestamp: new Date().toLocaleDateString(), desc: data.item, amount: data.amount, category: data.category, author: data.payer, splitWith: data.splitWith, isPending: true, createdAt: Date.now() };
    const current = JSON.parse(localStorage.getItem(`pendingExpenses_${config.title.main}`) || '[]');
    localStorage.setItem(`pendingExpenses_${config.title.main}`, JSON.stringify([newItem, ...current]));
    setExpenses(prev => [newItem, ...prev]);
  };

  const handleDeleteExpense = (id) => { const currentPending = JSON.parse(localStorage.getItem(`pendingExpenses_${config.title.main}`) || '[]'); const newPending = currentPending.filter(item => item.id !== id); localStorage.setItem(`pendingExpenses_${config.title.main}`, JSON.stringify(newPending)); setExpenses(prev => prev.filter(item => item.id !== id)); };

  useEffect(() => { if (isAuthenticated) fetchExpenses(); }, [isAuthenticated]);

  return (
    <ConfigContext.Provider value={config}>
      {!isAuthenticated ? (
        <LoginView onLogin={() => { setIsAuthenticated(true); localStorage.setItem(`tripAppAuth_${config.title.main}`, 'true'); }} />
      ) : (
        <div className={`min-h-screen ${config.ui.bgMain} font-sans ${config.ui.textMain} flex justify-center`}>
          <div className={`w-full max-w-md min-h-screen relative shadow-2xl ${config.ui.bgMain}`}>
            <header className="px-6 pt-12 pb-4">
              <h1 className={`text-3xl font-black tracking-tight ${config.ui.textMain}`}>{config.title.main} <span style={{ color: config.theme.large }}>{config.title.sub}</span></h1>
              <div className="flex items-center gap-2 mt-2">
                {config.title.duration.map((d, i) => (
                  <span key={i} className={`text-[10px] font-bold ${config.ui.textSub} uppercase tracking-widest bg-black/5 px-2 py-1 rounded-md`}>{d}</span>
                ))}
              </div>
            </header>
            <main className="px-5">
              {activeTab === 'itinerary' && <ItineraryView />}
              {activeTab === 'expense' && <ExpenseView expenses={expenses} loading={loadingExpenses} onRefresh={fetchExpenses} onDeleteExpense={handleDeleteExpense} onAddExpense={async (data) => { handleAddExpenseLocal(data); if (config.api.formActionUrl) { const fd = new FormData(); fd.append(config.api.formEntryIds.ITEM, data.item); fd.append(config.api.formEntryIds.AMOUNT, data.amount); fd.append(config.api.formEntryIds.CATEGORY, data.category); fd.append(config.api.formEntryIds.PAYER, data.payer); try { await fetch(config.api.formActionUrl, { method: 'POST', body: fd, mode: 'no-cors' }); } catch (e) { } } }} />}
              {activeTab === 'reminders' && <RemindersView />}
              {activeTab === 'others' && <OthersView />}
            </main>
            <nav className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[20rem] bg-white/95 backdrop-blur-xl border ${config.ui.border} shadow-2xl shadow-black/5 rounded-[2rem] py-2 px-3 flex justify-around items-center z-50`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${activeTab === tab.id ? "" : `${config.ui.textSub} hover:opacity-100`}`}
                  style={{ color: activeTab === tab.id ? config.theme.large : '' }}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 rounded-2xl -z-10 scale-90 animate-fade-in" style={{ backgroundColor: `${config.theme.large}33` }}></div>
                  )}
                  {React.cloneElement(tab.icon, { size: 26, strokeWidth: 2.5, className: activeTab === tab.id ? 'transform scale-105 transition-transform' : '' })}
                </button>
              ))}
            </nav>
          </div>
          <style>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; } .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); } body { background-color: ${config.theme.base}; } `}</style>
        </div>
      )}
    </ConfigContext.Provider>
  );
}