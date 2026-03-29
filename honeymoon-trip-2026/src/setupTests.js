import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 1. 擴充 Vitest 的 expect，讓它認得 toBeInTheDocument 等語法
expect.extend(matchers);

// 2. 確保每個測試案例結束後，清除模擬的 DOM 狀態 (避免干擾下一個測試)
afterEach(() => {
  cleanup();
});