# 🚀 Energy Tracker App - Setup Guide

## 📋 Prerequisites

- Node.js >= 20
- React Native development environment
- iOS: Xcode (for iOS development)
- Android: Android Studio with SDK (for Android development)

---

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd AppathonDemo
npm install
```

### 2. iOS Setup (Mac only)

```bash
cd ios
pod install
cd ..
```

### 3. Run the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Start Metro Bundler (if needed)
```bash
npm start
```

---

## 📱 First Time Setup

When you first launch the app:

1. **Add Your First Appliance**
   - Navigate to "Add" tab (➕)
   - Fill in appliance details
   - Use Quick Select for common appliances
   - Tap "Add Appliance"

2. **View Your Dashboard**
   - Navigate to "Dashboard" tab (📊)
   - See real-time energy calculations
   - Explore charts and metrics

3. **Configure Settings**
   - Go to "Settings" tab (⚙️)
   - Set your electricity rate (default: $0.12/kWh)
   - Configure your location for weather tips
   - Save settings

4. **Explore Features**
   - Check "Audit" for detailed breakdown
   - View "Trends" for historical analysis
   - Get "Tips" for energy savings
   - Chat with "Assistant" for help

---

## 🔧 Configuration

### Electricity Rate
Update in Settings screen or modify default in:
```typescript
src/utils/energy.ts
const DEFAULT_ELECTRICITY_RATE = 0.12; // $/kWh
```

### CO₂ Factor
Adjust for your region in:
```typescript
src/utils/energy.ts
const CO2_FACTOR = 0.92; // kg CO₂ per kWh
```

### Weather API (Optional)
To enable real-time weather:

1. Get API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add to `src/utils/weather.ts`:
```typescript
const WEATHER_API_KEY = 'YOUR_API_KEY_HERE';
```

---

## 📂 Project Structure

```
AppathonDemo/
├── src/
│   ├── context/
│   │   └── EnergyContext.tsx       # Global state management
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Tab navigation setup
│   ├── screens/
│   │   ├── DashboardScreen.tsx     # Main dashboard
│   │   ├── UsageInputScreen.tsx    # Add appliances
│   │   ├── EnergyAuditScreen.tsx   # Detailed audit
│   │   ├── TrendsScreen.tsx        # Usage trends
│   │   ├── TipsScreen.tsx          # Energy tips
│   │   ├── ChatScreen.tsx          # AI assistant
│   │   ├── ProgressScreen.tsx      # Achievements
│   │   ├── ReportsScreen.tsx       # Export reports
│   │   └── SettingsScreen.tsx      # App settings
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   └── utils/
│       ├── energy.ts               # Core calculations
│       ├── tips.ts                 # Tip generation
│       └── weather.ts              # Weather integration
├── App.tsx                          # App entry point
├── package.json
└── FEATURES.md                      # Feature documentation
```

---

## 🎯 Usage Examples

### Adding an Appliance

```typescript
// Example: LED Bulb
Name: "Living Room Light"
Power Rating: 10 watts
Hours Per Day: 5 hours
Quantity: 4
Category: Lighting
```

### Expected Results
- Daily Consumption: 0.20 kWh
- Monthly Consumption: 6.00 kWh
- Monthly Cost: $0.72 (at $0.12/kWh)

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### iOS Build Errors
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### AsyncStorage Not Working
```bash
npm install @react-native-async-storage/async-storage
# Then rebuild the app
```

---

## 📊 Data Storage

All data is stored locally using AsyncStorage:

- `@energy_app_appliances` - User's appliances
- `@energy_app_usage_records` - Historical usage
- `@energy_app_reminders` - Custom reminders
- `@energy_app_goals` - User goals
- `@energy_app_streak` - Progress tracking
- `@energy_app_badges` - Achievements
- `@energy_app_settings` - App configuration

### Clear All Data (Reset App)
```typescript
// In Settings screen, add a "Reset" button that calls:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

---

## 📱 Platform-Specific Notes

### iOS
- Minimum iOS version: 13.0
- Supports iPhone and iPad
- Dark mode ready (foundation)

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34
- Supports phones and tablets

---

## 🔐 Privacy & Data

- **All data stored locally** on device
- **No cloud sync** (yet)
- **No tracking or analytics**
- **No personal information collected**

---

## 🚀 Performance Tips

1. **Limit Appliances:** Recommended max 50 appliances
2. **Clear Old Records:** Keep last 90 days of usage
3. **Optimize Charts:** Large datasets may slow rendering

---

## 📞 Common Questions

**Q: Can I use this without internet?**
A: Yes! All features work offline except weather tips.

**Q: How accurate are the calculations?**
A: Very accurate! Uses standard formula: `kWh = (Watts × Hours) / 1000`

**Q: Can I export my data?**
A: Yes! Use the Reports screen to export as Text or CSV.

**Q: Is dark mode available?**
A: Foundation is ready, full implementation coming soon.

**Q: Can multiple people use the app?**
A: Currently single-user, multi-user support planned for future.

---

## 🎨 Customization

### Change App Colors
Edit screen headers in respective screen files:
```typescript
header: {
  backgroundColor: '#4CAF50', // Change this
}
```

### Add Custom Appliance Presets
Edit `src/utils/energy.ts`:
```typescript
export const getDefaultAppliances = () => {
  return [
    { name: 'Your Custom Appliance', category: ApplianceCategory.OTHER, powerRating: 100 },
    // Add more...
  ];
};
```

---

## 📈 Next Steps

1. ✅ App is fully functional
2. 🎨 Customize colors/themes to your liking
3. 🌐 Add weather API key for real-time tips
4. 📱 Test on physical devices
5. 🚀 Deploy to App Store / Play Store

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

---

## 🤝 Contributing

This is a complete, production-ready app. Feel free to:
- Add new features
- Improve UI/UX
- Optimize performance
- Add tests
- Fix bugs

---

## 📄 License

MIT License - Feel free to use for your Appathon project!

---

**Happy Energy Tracking! 🌱⚡**

If you need help, check:
- `FEATURES.md` - Complete feature list
- Code comments in source files
- TypeScript definitions in `src/types/index.ts`
