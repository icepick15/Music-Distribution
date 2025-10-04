# Analytics Dashboard - Quick Reference

## 🚀 Quick Start

### For Users Without Uploads
1. Navigate to **Analytics** or **Sales & Revenue** in sidebar
2. See locked state with feature preview
3. Click **"Upload Your First Track"** button
4. Complete upload to unlock demo mode

### For Users With Uploads
1. Analytics and Sales dashboards automatically unlock
2. View sample data with "Demo" badge in sidebar
3. See sample analytics to understand future features
4. Wait 7-14 days after music goes live for real data

## 🎯 Access Levels

| Upload Count | State | What User Sees |
|--------------|-------|----------------|
| 0 | Locked | Feature preview + Upload CTA |
| 1+ | Demo Mode | Sample data + Educational banners |
| 1+ (After distribution) | Real Data | Live streaming analytics |

## 📊 Available Dashboards

### Analytics Dashboard (`/dashboard/analytics`)
- Total streams, revenue, listeners
- Streaming analytics charts (Area, Line, Bar, Pie)
- Platform distribution (Spotify, Apple Music, etc.)
- Song performance tracking
- Notifications panel

### Sales & Revenue (`/dashboard/sales`)
- Same as Analytics (combined dashboard)
- Sales report table
- Payout summary
- Revenue breakdown by platform

## 🔐 How to Unlock

```javascript
// Unlock condition
user.publicMetadata.uploadCount > 0
```

**Steps:**
1. Go to **Upload** page
2. Complete music upload
3. `uploadCount` increments automatically
4. Analytics dashboards unlock
5. Demo mode active immediately
6. Real data appears 7-14 days after music goes live

## 📱 Sidebar Badges

### Before Upload
- Badge: "Upload to Unlock"
- Status: Clickable (shows locked state)

### After Upload
- Badge: "Demo"
- Status: Active (shows demo mode)

## 🎨 Visual Indicators

### Locked State
- 🔒 Lock icon
- Feature preview grid
- Large Upload CTA button
- Timeline information

### Demo Mode
- 🟡 Yellow/orange top banner
- ✨ "Viewing Sample Data" badge
- ℹ️ Blue info panel
- 90% opacity on content
- Educational bottom banner

## ⏱️ Timeline Expectations

### Distribution Phase
- **3-5 business days**: Music goes live on platforms

### Data Collection Phase
- **7-14 days**: Platforms report initial data
- **Daily**: Updates once data flow starts

## 🎯 Sample Data Preview

### Overview Cards
- Total Streams: 1.2M
- Total Revenue: ₦6,200,000
- Monthly Listeners: 45,800
- Avg. Daily Streams: 7,200

### Charts Available
- Stream trends (7-day view)
- Platform distribution
- Song performance
- Revenue analytics

## 🔄 State Transitions

```
No Upload → Upload Track → Demo Unlocked → Music Distributed → Real Data
```

## 💡 Key Features

### Locked State
✅ Feature preview  
✅ Motivational messaging  
✅ Clear unlock condition  
✅ Large CTA button  

### Demo Mode
✅ Sample analytics data  
✅ All chart types functional  
✅ Clear "Demo" labeling  
✅ Educational banners  
✅ Timeline information  
✅ CTAs for next steps  

## 📖 User Education

### Locked State Message
> "Upload your first track to unlock comprehensive analytics, streaming insights, and revenue tracking across all platforms."

### Demo Mode Message
> "You're viewing sample data to help you understand what analytics will look like once your music is live on streaming platforms. Real data will begin appearing 7-14 days after your release goes live."

### When Real Data Appears
1. **Distribution**: 3-5 days for music to go live
2. **Data Collection**: 7-14 days for platforms to report
3. **Updates**: Daily updates once data flows

## 🔗 Quick Links

| Page | Route | Purpose |
|------|-------|---------|
| Analytics | `/dashboard/analytics` | Stream & revenue analytics |
| Sales | `/dashboard/sales` | Same as analytics (combined) |
| Upload | `/dashboard/upload` | Upload music to unlock |
| My Music | `/dashboard/music` | View uploaded releases |

## 🛠️ For Developers

### Check Upload Status
```jsx
import { useAuth } from '../context/AuthContext';

const { user } = useAuth();
const hasUploads = user?.publicMetadata?.uploadCount > 0;
```

### Conditional Rendering
```jsx
if (!hasUploads) {
  return <LockedState />;
}
return <DemoMode />;
```

### Upload Count Source
```javascript
// From AuthContext.jsx
publicMetadata: {
  uploadCount: user.upload_count || 0,
  // ... other metadata
}
```

## 🎨 Color Codes

| Element | Color | Hex |
|---------|-------|-----|
| Top Banner | Yellow-Orange | #F59E0B → #EA580C |
| Info Panel | Blue | #DBEAFE / #BFDBFE |
| Lock Icon BG | Blue-Purple | #3B82F6 → #A855F7 |
| CTA Button | Blue-Purple | #2563EB → #9333EA |
| Bottom Banner | Blue-Purple | #2563EB → #9333EA |

## 📋 Testing Checklist

- [ ] Locked state shows for users with no uploads
- [ ] Demo mode shows for users with uploads
- [ ] Sidebar badges update correctly
- [ ] Upload CTA redirects to `/dashboard/upload`
- [ ] All charts render in demo mode
- [ ] Educational banners display properly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Clear distinction between demo and real data

## 🚦 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔒 Locked | No uploads yet |
| 🟡 Demo | Sample data active |
| 🟢 Live | Real data flowing |

## 📞 Support

**Common Questions:**

**Q: When will I see real data?**  
A: 7-14 days after your music goes live on streaming platforms.

**Q: How do I unlock analytics?**  
A: Upload your first track via the Upload page.

**Q: Is the demo data accurate?**  
A: No, it's sample data to show what analytics will look like.

**Q: Can I trust the demo numbers?**  
A: No, they're examples. Real data will replace them automatically.

**Q: What's the difference between Analytics and Sales?**  
A: They currently show the same combined dashboard with both metrics.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Active
