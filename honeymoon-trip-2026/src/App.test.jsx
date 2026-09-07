import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import {
  smartParseCSV,
  LoginView,
  OthersView,
  ExpenseView,
  ItineraryView,
  RemindersView,
  ConfigContext
} from '../../shared/components/TripApp';

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
});

// -----------------------------------------------------------------------------
// 2. Component Unit Tests
// -----------------------------------------------------------------------------

describe('LoginView', () => {
  // PIN 現在由伺服器端 web app 驗證 → 用 mock fetch 模擬回應
  const mockConfig = {
    ui: { bgMain: '', textMain: '', cardLarge: '', btnSecondary: '' },
    theme: { small: '#ffffff', large: '#ffffff' },
    title: { main: 'HONEYMOON', year: '2026' },
    api: { url: 'https://mock-webapp/exec' }
  };
  const mockFetch = (res) => { global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(JSON.stringify(res)) }); };

  it('should show error on wrong password', async () => {
    mockFetch({ status: 'error', message: 'unauthorized' });
    const mockLogin = vi.fn();
    render(
      <ConfigContext.Provider value={mockConfig}>
        <LoginView onLogin={mockLogin} />
      </ConfigContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('輸入通關密語'), { target: { value: '0000' } });
    fireEvent.submit(screen.getByRole('button', { name: /進入旅程/i }).closest('form'));

    expect(await screen.findByText(/密碼錯誤/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call onLogin on correct password', async () => {
    mockFetch({ status: 'success' });
    const mockLogin = vi.fn();
    render(
      <ConfigContext.Provider value={mockConfig}>
        <LoginView onLogin={mockLogin} />
      </ConfigContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('輸入通關密語'), { target: { value: '2026' } });
    fireEvent.submit(screen.getByRole('button', { name: /進入旅程/i }).closest('form'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('2026'));
  });
});

describe('OthersView', () => {
  const mockConfig = {
    ui: { cardLarge: '', textMain: '' },
    exchangeRates: { 'IDR': 0.002 },
    baseCurrency: 'TWD',
    phrases: [{ src: 'Test', pro: 'Test', zh: '測試' }]
  };

  it('should convert currency correctly', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <OthersView />
      </ConfigContext.Provider>
    );

    const input = screen.getByPlaceholderText('0');
    fireEvent.change(input, { target: { value: '10000' } });
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});

describe('Itinerary & Weather Switching', () => {
  const mockConfig = {
    ui: { bgMain: '', cardLarge: '', cardSmall: '', btnPrimary: 'test-btn', textMain: '', textSub: '', border: '', inputGlass: '' },
    theme: { small: '#ffffff', large: '#ffffff' },
    dates: { 1: '1/1', 12: '1/12' },
    title: { main: 'HONEYMOON' },
    api: { url: '' },
    weatherLocations: [
      { name: "BALI", lat: -8.34, lon: 115.09 },
      { name: "VIETNAM", lat: 14.05, lon: 108.27 }
    ]
  };

  it('should switch weather locations', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        current: { temperature_2m: 28 },
        daily: { temperature_2m_max: [30], temperature_2m_min: [22] }
      }),
      text: () => Promise.resolve('')
    });

    render(
      <ConfigContext.Provider value={mockConfig}>
        <ItineraryView />
      </ConfigContext.Provider>
    );

    // In carousel mode, all locations are rendered in the DOM
    expect(await screen.findByText('BALI')).toBeInTheDocument();
    expect(await screen.findByText('VIETNAM')).toBeInTheDocument();

    // Filter buttons specifically to find the carousel dots (they have 'w-2 h-2')
    const dots = screen.getAllByRole('button').filter(b => b.className.includes('w-2 h-2'));
    if (dots.length > 1) {
      // Check that the first dot is initially active
      expect(dots[0].className).toContain('scale-125');
      
      fireEvent.click(dots[1]);
      
      // Wait for the active state to switch to the second dot
      await waitFor(() => {
        expect(dots[1].className).toContain('scale-125');
      });
    }
  });

  it('should select Day 12', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ItineraryView />
      </ConfigContext.Provider>
    );

    const btn = screen.getByText('1/12');
    fireEvent.click(btn);
    expect(btn.closest('button').getAttribute('aria-current')).toBe('true');
  });
});

describe('RemindersView', () => {
  const mockConfig = {
    ui: { cardSmall: '', inputGlass: '', btnPrimary: 'test-btn', textMain: '', textSub: '' },
    theme: { large: '#000000' },
    checklist: [{ id: 1, text: '護照', checked: true }]
  };

  it('should add item', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <RemindersView />
      </ConfigContext.Provider>
    );

    const input = screen.getByPlaceholderText(/Add item/i);
    fireEvent.change(input, { target: { value: 'Sunscreen' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('Sunscreen')).toBeInTheDocument();
  });
});

describe('ExpenseView', () => {
  const mockConfig = {
    ui: { cardLarge: '', cardSmall: '', btnPrimary: '', textMain: '', textSub: '', inputGlass: '' },
    members: ['信', '屏'],
    baseCurrency: 'TWD',
    exchangeRates: { 'IDR': 0.002 }
  };

  it('should submit expense', async () => {
    const onAdd = vi.fn();
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ExpenseView expenses={[]} loading={false} onAddExpense={onAdd} />
      </ConfigContext.Provider>
    );

    fireEvent.click(screen.getByText(/記一筆/i));

    // Wait for modal components
    const amountInput = await screen.findByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    fireEvent.change(screen.getByPlaceholderText('例如：烤肉'), { target: { value: 'Dinner' } });
    fireEvent.click(screen.getByText('確認記帳'));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        item: 'Dinner #split:信,屏',
        amount: 1000
      }));
    });
  });

  it('should protect 0 members', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => { });
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ExpenseView expenses={[]} loading={false} onAddExpense={vi.fn()} />
      </ConfigContext.Provider>
    );

    fireEvent.click(screen.getByText(/記一筆/i));
    const buttons = await screen.findAllByRole('button');
    ['信', '屏'].forEach(m => {
      const btn = buttons.find(b => b.textContent === m);
      if (btn) fireEvent.click(btn);
    });

    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('例如：烤肉'), { target: { value: 'Test Item' } });

    fireEvent.click(screen.getByText('確認記帳'));
    expect(mockAlert).toHaveBeenCalled();
  });

  it('should toggle view', () => {
    render(
      <ConfigContext.Provider value={mockConfig}>
        <ExpenseView expenses={[]} loading={false} />
      </ConfigContext.Provider>
    );

    fireEvent.click(screen.getByText(/拆帳計算/i));
    expect(screen.queryByText(/記一筆/i)).not.toBeInTheDocument();
  });
});

describe('App Navigation', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(key => key.includes('tripAppAuth') ? 'true' : null);
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        current: { temperature_2m: 25 },
        daily: { temperature_2m_max: [30], temperature_2m_min: [20] }
      }),
      text: () => Promise.resolve('Day,Time,Title,Desc\n1,10:00,Bali,Fun')
    }));
  });

  it('should switch tabs', async () => {
    render(<App />);
    expect(await screen.findAllByText(/HONEYMOON/i)).toBeDefined();
    const navButtons = screen.getAllByRole('button').filter(b => b.closest('nav'));
    fireEvent.click(navButtons[navButtons.length - 1]);
  });
});