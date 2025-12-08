import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// 注意：請確保 SeoulTripApp.jsx 檔案中有將這些元件 export 出來
import App, { 
  smartParseCSV, 
  LoginView, 
  OthersView, 
  ExpenseView 
} from './App';

// -----------------------------------------------------------------------------
// 1. Helper Function Tests
// -----------------------------------------------------------------------------
describe('smartParseCSV', () => {
  it('should parse simple CSV correctly', () => {
    const csv = 'Name,Age\nAlice,30\nBob,25';
    const result = smartParseCSV(csv);
    expect(result).toEqual([
      ['Name', 'Age'],
      ['Alice', '30'],
      ['Bob', '25']
    ]);
  });

  it('should handle quoted fields with commas', () => {
    const csv = 'Item,Cost\n"Apple, Red",10';
    const result = smartParseCSV(csv);
    expect(result).toEqual([
      ['Item', 'Cost'],
      ['Apple, Red', '10']
    ]);
  });

  it('should handle newlines within quotes', () => {
    const csv = 'Description,ID\n"Line 1\nLine 2",123';
    const result = smartParseCSV(csv);
    expect(result[1][0]).toContain('Line 1');
    expect(result[1][0]).toContain('Line 2');
  });
});

// -----------------------------------------------------------------------------
// 2. Component Unit Tests
// -----------------------------------------------------------------------------

describe('LoginView', () => {
  it('should show error on wrong password', () => {
    const mockLogin = vi.fn();
    render(<LoginView onLogin={mockLogin} />);
    
    const input = screen.getByPlaceholderText('••••');
    fireEvent.change(input, { target: { value: '0000' } }); // Wrong PIN
    // 尋找按鈕 (新版按鈕文字仍為 "進入旅程")
    const submitBtn = screen.getByRole('button', { name: /進入旅程/i });
    fireEvent.submit(submitBtn.closest('form')); // 或是直接 click button
    
    expect(screen.getByText(/密碼錯誤/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call onLogin on correct password', () => {
    // 假設環境變數 VITE_AUTH_PIN 為預設值 2026
    const mockLogin = vi.fn();
    render(<LoginView onLogin={mockLogin} />);
    
    const input = screen.getByPlaceholderText('••••');
    fireEvent.change(input, { target: { value: '2026' } });
    const submitBtn = screen.getByRole('button', { name: /進入旅程/i });
    fireEvent.submit(submitBtn.closest('form'));
    
    expect(mockLogin).toHaveBeenCalled();
  });
});

describe('OthersView (Currency Converter)', () => {
  it('should convert KRW to TWD correctly', () => {
    render(<OthersView />);
    
    // 假設匯率為 0.0236
    const krwInput = screen.getByPlaceholderText('0');
    fireEvent.change(krwInput, { target: { value: '10000' } });
    
    // 驗證 TWD 輸出結果 (10000 * 0.0236 = 236)
    // 這裡我們直接查找顯示結果的元素
    expect(screen.getByText('236')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------------
// 3. Integration Tests (Expense Flow)
// -----------------------------------------------------------------------------

describe('ExpenseView Integration', () => {
  const mockExpenses = [];
  const mockOnAdd = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open modal and submit new expense', async () => {
    render(
      <ExpenseView 
        expenses={mockExpenses} 
        loading={false} 
        onAddExpense={mockOnAdd}
        onDeleteExpense={mockOnDelete}
        onRefresh={mockOnRefresh}
        exchangeRate={0.0236}
      />
    );

    // 1. 點擊 "記一筆"
    fireEvent.click(screen.getByText(/記一筆/i));
    
    // 2. 填寫表單
    const amountInput = screen.getByPlaceholderText('0');
    const itemInput = screen.getByPlaceholderText('例如：烤肉');
    
    fireEvent.change(amountInput, { target: { value: '1000' } });
    fireEvent.change(itemInput, { target: { value: 'Test BBQ' } });
    
    // 3. 提交
    fireEvent.click(screen.getByText('確認記帳'));

    // 4. 驗證 onAddExpense 是否被呼叫，且參數正確
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
        item: 'Test BBQ',
        amount: 1000,
        category: '食物', // 預設值
        payer: '爸'      // 預設值
      }));
    });
  });

  it('should switch between List and Split views', () => {
    render(
      <ExpenseView 
        expenses={[]} 
        loading={false} 
        onAddExpense={mockOnAdd}
        onDeleteExpense={mockOnDelete}
        onRefresh={mockOnRefresh}
        exchangeRate={0.0236} 
      />
    );

    // 預設是列表模式，應該看得到 "記一筆" 按鈕
    expect(screen.getByText(/記一筆/i)).toBeInTheDocument();

    // 切換到拆帳模式
    fireEvent.click(screen.getByText(/拆帳計算/i));
    
    // "記一筆" 按鈕應該消失
    expect(screen.queryByText(/記一筆/i)).not.toBeInTheDocument();
    // 應該看到結算相關文字
    expect(screen.getByText(/結算狀況/i)).toBeInTheDocument();
  });

  it('should calculate complex splits correctly', () => {
    // 模擬複雜的記帳情境
    const expenses = [
      {
        id: '1',
        desc: '晚餐', // 補上 desc 欄位
        category: '食物',
        amount: 1000,
        author: '爸',
        // 假設所有人 (5人) 分攤，每人 -200
        // 爸付 1000: 淨額 +1000 - 200 = +800
        splitWith: ['爸', '媽', '信', '屏', '樸'] 
      },
      {
        id: '2',
        desc: '計程車', // 補上 desc 欄位
        category: '交通',
        amount: 500,
        author: '信',
        // 只有信跟屏 (2人) 分攤，每人 -250
        // 信付 500: 淨額 +500 - 250 = +250
        // 屏: -250
        splitWith: ['信', '屏']
      }
    ];

    // 預期結果:
    // 爸: +800
    // 媽: -200
    // 信: -200 (第一筆) + 250 (第二筆) = +50
    // 屏: -200 (第一筆) - 250 (第二筆) = -450
    // 樸: -200

    render(
      <ExpenseView 
        expenses={expenses} 
        loading={false} 
        onAddExpense={mockOnAdd}
        onDeleteExpense={mockOnDelete}
        onRefresh={mockOnRefresh}
        exchangeRate={1} // 設為 1 方便計算
      />
    );

    // 切換到拆帳模式
    fireEvent.click(screen.getByText(/拆帳計算/i));

    // 驗證數值顯示 (使用正則表達式來匹配可能包含千分位符號的文字)
    
    // 爸應收 +800
    expect(screen.getByText('+800')).toBeInTheDocument();
    
    // 信應收 +50
    expect(screen.getByText('+50')).toBeInTheDocument();
    
    // 屏應付 -450
    expect(screen.getByText('-450')).toBeInTheDocument();
    
    // 媽和樸都是應付 -200，應該出現兩次
    const minus200 = screen.getAllByText('-200');
    expect(minus200).toHaveLength(2);
  });
});

// -----------------------------------------------------------------------------
// 4. Full App Navigation Test
// -----------------------------------------------------------------------------

describe('App Navigation', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'tripAppAuth') return 'true'; // Simulate logged in
      return null;
    });
    
    // Mock fetch for weather/sheets/gas
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
            // Mock Weather Data
            current: { temperature_2m: 20, weather_code: 0 }, 
            daily: { temperature_2m_max: [25], temperature_2m_min: [15] },
            // Mock GAS Response (Standard structure)
            status: 'success',
            data: [] 
        }),
        text: () => Promise.resolve('Day,Time,Title,Desc\n1,10:00,Test,Desc')
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render itinerary by default and switch tabs', async () => {
    render(<App />);
    
    // 預設顯示行程頁面
    // 修正：新版 WeatherWidget 只顯示 "SEOUL"，不顯示 ", KOREA"
    expect(await screen.findByText('SEOUL')).toBeInTheDocument();
    
    // 切換到其他 (Others) 頁面
    // 使用 navigation role 來限縮範圍，避免抓到頁面內其他的按鈕
    const navBar = screen.getByRole('navigation');
    const buttons = within(navBar).getAllByRole('button');
    
    // 假設最後一個按鈕是 Others (Tabs 順序: Itinerary, Expense, Reminders, Others)
    const othersTabBtn = buttons[buttons.length - 1]; 
    fireEvent.click(othersTabBtn);

    // 確認生存韓語出現 (代表切換成功)
    expect(await screen.findByText('生存韓語')).toBeInTheDocument();
  });
});