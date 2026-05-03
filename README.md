# 咔嚓 App v3.3

React + TypeScript + Capacitor 混合移动应用，功能覆盖：
纪念日、番茄钟/倒计时/秒表/秒杀管理、物品保质期/保修期/优惠券/报销、日程（含日历视图）、旅行行程、OCR扫描识别。

## 快速开始

### 1. 安装依赖
```bash
cd c:\Users\yule\WorkBuddy\20260503120703\kacha-app
npm install
```

### 2. 本地预览（浏览器）
```bash
npm run dev
```
浏览器打开 `htp://localhost:3000`

### 3. 构建 Android APK

```bash
# 1) 构建前端
npm run build

# 2) 初始化 Capacitor（首次执行）
npx cap add android

# 3) 同步到 Android 项目
npm run cap:sync
# 或：npx cap sync

# 4) 用 Android Studio 打开 android/ 目录，点击 Build → Build Bundle(s) / APK → Build APK
```

最低支持 Android 7.0（API 24），包名 `com.kacha.app`

## 项目结构

```
kacha-app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.ts
└── src/
    ├── main.tsx              # 入口
    ├── App.tsx                # 主路由 + Tab 栏
    ├── types/index.ts        # 所有数据模型
    ├── utils/
    │   ├── date.ts          # 日期工具函数
    │   ├── lunar.ts         # 农历转换（lunar-javascript）
    │   └── storage.ts      # localStorage 读写
    ├── store/                # Zustand 状态管理（8个store）
    │   ├── useAnniversaryStore.ts
    │   ├── useFlashStore.ts
    │   ├── useExpiryStore.ts
    │   ├── useWarrantyStore.ts
    │   ├── useCouponStore.ts
    │   ├── useExpenseStore.ts
    │   ├── useScheduleStore.ts
    │   ├── useTravelStore.ts
    │   └── useSettingsStore.ts
    ├── styles/
    │   ├── variables.css    # CSS 变量（浅色/深色主题）
    │   └── global.css      # 全局样式
    ├── components/            # 通用组件
    │   ├── ConfirmDialog.tsx
    │   ├── Modal.tsx
    │   ├── Toggle.tsx
    │   ├── PageHeader.tsx
    │   └── AddPanel.tsx
    └── pages/               # 页面组件
        ├── HomePage.tsx
        ├── AnniversaryPage.tsx
        ├── FocusPage.tsx
        ├── PomodoroPage.tsx
        ├── TimerPage.tsx
        ├── StopwatchPage.tsx
        ├── FlashPage.tsx
        ├── ExpiryPage.tsx
        ├── WarrantyPage.tsx
        ├── CouponPage.tsx
        ├── ExpensePage.tsx
        ├── ItemsPage.tsx
        ├── SchedulePage.tsx
        ├── TravelPage.tsx
        ├── TravelDetailPage.tsx
        ├── ScanPage.tsx
        ├── SettingsPage.tsx
        └── StatsPage.tsx
```

## 注意事项

- OCR 功能：本地使用 tesseract.js（已打包到前端），也可配置云端 RapidOCR 服务器地址
- 农历功能依赖 `lunar-javascript` 包，已写入 package.json
- 数据全部存储在 localStorage，支持导出/导入 JSON 备份
- 首次执行 `npx cap add android` 后，后续只需 `npm run cap:sync` 同步最新前端代码

## 技术栈

| 层级 | 技术 |
|------|------|
| UI 框架 | React 19 + TypeScript |
| 状态管理 | Zustand 5 |
| 构建工具 | Vite 6 |
| 移动端 | Capacitor 6 |
| 图表 | Recharts |
| 日期 | date-fns + lunar-javascript |
| OCR | tesseract.js（本地）+ RapidOCR（云端，可选）|
