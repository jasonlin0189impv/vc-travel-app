import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    fireEvent.submit(screen.getByRole('button', { name: /進入旅程/i }));
    
    expect(screen.getByText(/密碼錯誤/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call onLogin on correct password', () => {
    // 假設環境變數 VITE_AUTH_PIN 為預設值 2026
    const mockLogin = vi.fn();
    render(<LoginView onLogin={mockLogin} />);
    
    const input = screen.getByPlaceholderText('••••');
    fireEvent.change(input, { target: { value: '2026' } });
    fireEvent.submit(screen.getByRole('button', { name: /進入旅程/i }));
    
    expect(mockLogin).toHaveBeenCalled();
  });
});

describe('OthersView (Currency Converter)', () => {
  it('should convert KRW to TWD correctly', () => {
    render(<OthersView />);
    
    // 假設匯率為 0.0236
    const krwInput = screen.getByPlaceholderText('0');
    fireEvent.change(krwInput, { target: { value: '10000' } });
    
    // 10000 * 0.0236 = 236
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
        exchangeRate={0.0236} 
      />
    );

    // 預設是列表模式
    expect(screen.getByText(/記一筆/i)).toBeInTheDocument();

    // 切換到拆帳模式
    fireEvent.click(screen.getByText(/拆帳計算/i));
    expect(screen.queryByText(/記一筆/i)).not.toBeInTheDocument();
    expect(screen.getByText(/結算狀況/i)).toBeInTheDocument();
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
    
    // Mock fetch for weather/sheets
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ current: { temperature_2m: 20 }, daily: { temperature_2m_max: [25], temperature_2m_min: [15] } }),
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
    expect(await screen.findByText('SEOUL, KOREA')).toBeInTheDocument();
    
    // 切換到其他 (Others) 頁面
    // 這裡我們需要找到對應的 icon 或按鈕。由於 lucid-react icons 渲染為 svg，我們可以透過測試 ID 或 aria-label，但這裡我們簡單用文字判斷頁面內容變化
    
    // 模擬點擊導航列的最後一個按鈕 (Others)
    // 注意：實際測試中建議給按鈕加 data-testid
    const buttons = screen.getAllByRole('button');
    const othersTabBtn = buttons[buttons.length - 1]; // 假設最後一個是 Others
    fireEvent.click(othersTabBtn);

    // 確認生存韓語出現
    expect(await screen.findByText('生存韓語')).toBeInTheDocument();
  });
});