# 🍅 Pomodoro Timer

一個現代化的番茄鐘 PWA 網頁應用，使用 Vue 3 + Vite 建構。

## ✨ 功能特色

### 計時器
- 圓形進度計時器，視覺化呈現時間流逝
- 工作時間（25分鐘）與休息時間（5分鐘）自動切換
- 暫停、繼續、終止、跳過控制
- 番茄鐘進度指示器

### 任務管理
- 新增、刪除、排序任務
- 為每個任務設定預估番茄數
- 任務自動完成追蹤
- 已完成任務歷史記錄

### 音效提醒
- 工作/休息時段結束提醒
- 12種音效可選擇
- 可開關鬧鐘提醒

### 統計報表
- **番茄報表**：本週/今日專注時間、番茄數統計
- **任務報表**：本週/今日任務達成數、達成率
- 視覺化折線圖呈現趨勢

### 其他
- 資料自動保存至 localStorage
- 響應式設計，支援各種螢幕尺寸
- PWA 支援，可離線使用

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 建構生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 🛠️ 技術棧

- **Vue 3** - 漸進式 JavaScript 框架
- **Vite** - 下一代前端建構工具
- **Pinia** - Vue 狀態管理
- **VueUse** - Vue Composition API 工具集
- **Vite PWA** - PWA 支援

## 📁 專案結構

```
src/
├── assets/
│   └── styles/
│       └── main.css          # 全域樣式與 CSS 變數
├── components/
│   ├── modals/
│   │   ├── AddTaskModal.vue  # 新增任務彈窗
│   │   └── ConfirmModal.vue  # 確認彈窗
│   ├── Reports.vue           # 統計報表
│   ├── SideNav.vue           # 側邊導航
│   ├── SoundSettings.vue     # 音效設定
│   ├── TaskItem.vue          # 任務項目
│   ├── TaskList.vue          # 任務列表
│   └── Timer.vue             # 計時器
├── composables/
│   ├── useSound.js           # 音效邏輯
│   ├── useStats.js           # 統計邏輯
│   └── useTimer.js           # 計時器邏輯
├── stores/
│   └── pomodoroStore.js      # Pinia 狀態管理
├── App.vue                   # 根元件
└── main.js                   # 應用進入點
```

## 📝 授權

MIT License
