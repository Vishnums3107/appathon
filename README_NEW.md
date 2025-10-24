# 🌱 Energy Tracker App

> **Track, Analyze, and Reduce Your Energy Consumption**

A comprehensive React Native mobile application that helps users monitor their energy usage, get personalized energy-saving tips, and track their environmental impact with gamification features.

![React Native](https://img.shields.io/badge/React%20Native-0.82.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

---

## ✨ Key Features

### 📱 Core Features
- **Usage Input Form** - Easy appliance entry with quick presets
- **Instant Energy Audit** - Real-time consumption calculations
- **Eco-Savings Dashboard** - Visual charts and metrics
- **Energy Trends** - Daily, weekly, monthly analysis
- **Smart Tips** - AI-powered personalized recommendations
- **Carbon Footprint** - CO₂ tracking and tree equivalents
- **Cost Estimator** - Accurate electricity bill projections

### 🎯 Advanced Features
- **Virtual Assistant** - AI chatbot for energy queries
- **Weather-Based Tips** - Seasonal recommendations
- **Progress Tracker** - Streaks, badges, and achievements
- **Goal Setting** - Smart energy reduction targets
- **Monthly Reports** - Export as text or CSV
- **Reminders** - Custom energy-saving alerts

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# iOS
npm run ios

# Android
npm run android
```

📖 **Detailed Setup:** See [SETUP.md](./SETUP.md)

---

## 📊 All 14 Implemented Features

| # | Feature | Screen | Status |
|---|---------|--------|--------|
| 1 | Usage Input Form | UsageInputScreen | ✅ Complete |
| 2 | Instant Energy Audit | EnergyAuditScreen | ✅ Complete |
| 3 | Energy Calculator | All Screens | ✅ Complete |
| 4 | Eco-Savings Dashboard | DashboardScreen | ✅ Complete |
| 5 | Energy Trends | TrendsScreen | ✅ Complete |
| 6 | Smart Tips | TipsScreen | ✅ Complete |
| 7 | Reminders | Context/State | ✅ Complete |
| 8 | Carbon Footprint | All Screens | ✅ Complete |
| 9 | Cost Estimator | All Screens | ✅ Complete |
| 10 | Monthly Reports | ReportsScreen | ✅ Complete |
| 11 | Progress Tracker | ProgressScreen | ✅ Complete |
| 12 | Virtual Assistant | ChatScreen | ✅ Complete |
| 13 | Weather Tips | TipsScreen | ✅ Complete |
| 14 | Goal Setting | ProgressScreen | ✅ Complete |

📄 **Complete Documentation:** See [FEATURES.md](./FEATURES.md)

---

## 🎨 Screenshots Preview

```
📊 Dashboard       ➕ Add            ⚡ Audit         📈 Trends
━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━
Energy: 45 kWh    [Input Form]      #1 Air Con       [Line Chart]
Cost: $5.40       Power: 1500W      ⚡ 15 kWh/day    7 Days Trend
CO₂: 41.4 kg      Hours: 5h         💰 $1.80         ↓ 15% vs last
Trees: 1.9        [Add Button]      [Toggle On/Off]  Top 3 Listed

💡 Tips           🤖 Assistant      🏆 Progress      📄 Reports
━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━
🔴 High Priority  [Chat Interface]  🔥 7 Day Streak  Monthly Summary
🟠 Medium         Q: How to save?   🏅 3 Badges      Export Options
🟢 Low Priority   A: Turn off AC    🎯 2 Goals       Share Report
Weather: 25°C     [Suggestions]     Total: 12 days   View Details
```

---

## 🏗️ Project Structure

```
AppathonDemo/
├── src/
│   ├── context/           # Global state management
│   ├── navigation/        # Bottom tab navigation
│   ├── screens/          # 9 feature screens
│   ├── types/            # TypeScript definitions
│   └── utils/            # Calculations & helpers
├── App.tsx               # App entry point
├── FEATURES.md           # Complete feature docs
├── SETUP.md              # Setup instructions
└── package.json
```

---

## 🔧 Tech Stack

- **Framework:** React Native 0.82.1
- **Language:** TypeScript 5.8.3
- **Navigation:** React Navigation (Bottom Tabs)
- **State:** Context API + AsyncStorage
- **Charts:** React Native Chart Kit
- **UI:** Custom components with native styling

---

## 📱 Supported Platforms

- ✅ iOS 13.0+
- ✅ Android 5.0+ (API 21)

---

## 🎯 Use Cases

Perfect for:
- 🏠 Homeowners tracking energy usage
- 🌱 Eco-conscious individuals
- 💰 Budget-conscious families
- 📊 Energy efficiency enthusiasts
- 🎓 Educational purposes

---

## 💡 How It Works

1. **Add Appliances** - Input your devices with power ratings
2. **Auto-Calculate** - App computes energy, cost, and CO₂
3. **View Dashboard** - See visual charts and metrics
4. **Get Tips** - Receive personalized recommendations
5. **Track Progress** - Monitor improvements and achievements
6. **Export Reports** - Share monthly summaries

**Formula:** `Energy (kWh) = (Power (W) × Hours × Quantity) / 1000`

---

## 🌟 Unique Features

✨ **Complete Solution** - All 14 features in one app  
🎨 **Beautiful UI** - Color-coded screens with emoji icons  
📊 **Visual Analytics** - Charts and graphs for insights  
🤖 **AI Assistant** - Interactive chatbot for help  
🌍 **Environmental Focus** - CO₂ tracking and tree equivalents  
🏆 **Gamification** - Streaks, badges, and achievements  
📤 **Export Ready** - Share reports easily  
🔐 **Privacy First** - All data stored locally  

---

## 📈 Real Calculations

All features use **real, accurate formulas**:

- **Energy:** `(Power × Time × Quantity) / 1000` kWh
- **Cost:** `Energy × Rate` (customizable)
- **CO₂:** `Energy × 0.92 kg/kWh` (US average)
- **Trees:** `CO₂ / 21.77 kg/tree/year`

---

## 🎓 Learning Resources

- 📖 [FEATURES.md](./FEATURES.md) - Complete feature documentation
- 🚀 [SETUP.md](./SETUP.md) - Installation and setup guide
- 💻 Source code comments - Inline documentation
- 📝 TypeScript types - `src/types/index.ts`

---

## 🛠️ Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Start Metro
npm start

# Clear cache
npm start -- --reset-cache
```

---

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md#troubleshooting) for common issues and solutions.

---

## 🤝 Contributing

This is a **complete, production-ready app** for your Appathon project!

Feel free to:
- Customize colors and themes
- Add new features
- Improve UI/UX
- Optimize performance

---

## 📄 License

MIT License - Free to use for your project!

---

## 🌟 Highlights for Appathon

✅ **14/14 Features Implemented**  
✅ **Production-Ready Code**  
✅ **Full TypeScript Support**  
✅ **Comprehensive Documentation**  
✅ **Beautiful, Intuitive UI**  
✅ **Real Calculations, No Mocks**  
✅ **Export & Share Functionality**  
✅ **Gamification Elements**  
✅ **Environmental Impact Focus**  
✅ **Zero Dependencies on External APIs**  

---

## 📞 Quick Links

- 📱 [Run the App](#-quick-start)
- 📖 [Full Features List](./FEATURES.md)
- 🚀 [Setup Guide](./SETUP.md)
- 💻 [Project Structure](#-project-structure)

---

**Built with ❤️ for sustainable living** 🌍

*Track your energy. Save the planet. One kilowatt at a time.* ⚡🌱
