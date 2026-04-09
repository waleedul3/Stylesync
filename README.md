# StyleSync — Design System Extractor

> Extract, edit, and export design systems from any website. Paste a URL and instantly get an interactive, editable design token dashboard.

![StyleSync Dashboard](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase) ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)

## 🚀 Features

- **Client-Side URL Scraping** — Fetches any website via CORS proxies and parses colors, typography, and spacing using the browser's built-in DOMParser
- **Interactive Color Editor** — Click color swatches to open inline hex pickers, edit hex values directly, lock/unlock tokens
- **Typography Inspector** — Edit heading/body fonts, base size, line height, font weights with live preview
- **Spacing Visualizer** — Base unit input with animated scale bars and editable multipliers
- **Live Preview Grid** — Buttons, inputs, cards, and type scale all render with extracted CSS custom properties
- **Export Panel** — Export as CSS Variables, JSON, or Tailwind config
- **Version History** — Timeline of all token changes with restore functionality
- **Token Locking** — Lock tokens with Framer Motion animations to prevent accidental edits
- **Real-Time Sync** — Firestore `onSnapshot` listeners for live collaborative editing
- **Error Handling** — Smart error cards for bot-protected sites, timeouts, invalid URLs

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Color UI | react-colorful |
| Database | Firebase Firestore (Spark plan) |
| Hosting | Firebase Hosting |

## 📦 Setup

### 1. Clone & Install

```bash
cd stylesync
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project named "stylesync"
3. Enable **Firestore Database** (test mode)
4. Register a **Web App** and copy the config
5. Set Firestore security rules (open for assessment):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scraped_sites/{docId} { allow read, write: if true; }
    match /design_tokens/{docId} { allow read, write: if true; }
    match /locked_tokens/{docId} { allow read, write: if true; }
    match /version_history/{docId} { allow read, write: if true; }
  }
}
```

### 3. Environment Variables

Create `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## 🏗 Architecture

```
stylesync/
├── src/
│   ├── components/
│   │   ├── URLInput.tsx           # URL entry with animated states
│   │   ├── SkeletonLoader.tsx     # Dashboard-mirroring shimmer loader
│   │   ├── ErrorCard.tsx          # Contextual error display
│   │   ├── ExportPanel.tsx        # CSS/JSON/Tailwind export dropdown
│   │   ├── VersionHistory.tsx     # Timeline with restore buttons
│   │   ├── TokenEditor/
│   │   │   ├── ColorPicker.tsx    # Hex picker with lock/unlock
│   │   │   ├── TypographyInspector.tsx  # Font controls + live specimen
│   │   │   └── SpacingVisualizer.tsx    # Scale bars + custom editor
│   │   └── PreviewGrid/
│   │       ├── ButtonSet.tsx      # Primary/Secondary/Ghost/Accent buttons
│   │       ├── InputSet.tsx       # Default/Focus/Error/Textarea inputs
│   │       ├── CardSet.tsx        # Bordered/Shadow/Branded cards
│   │       └── TypeScale.tsx      # H1-H6 + Body/Small/Caption
│   ├── lib/
│   │   ├── firebase.ts           # Firestore initialization
│   │   ├── scraper.ts            # CORS proxy fetch + DOMParser extraction
│   │   ├── cssVariables.ts       # Inject CSS custom properties
│   │   ├── firestoreService.ts   # All Firestore CRUD operations
│   │   └── exporter.ts           # CSS/JSON/Tailwind export generators
│   ├── store/useTokenStore.ts    # Zustand with debounced Firestore writes
│   ├── hooks/useTokenListener.ts # Real-time Firestore onSnapshot
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with scrape flow
│   │   └── Dashboard.tsx         # Token editor + live preview
│   ├── types.ts                  # TypeScript interfaces
│   └── App.tsx                   # React Router setup
├── .env.local                    # Firebase credentials
├── firebase.json                 # Hosting config
└── tailwind.config.ts            # Custom theme + animations
```

## 🔄 How It Works

1. **User pastes a URL** in the React app
2. **React fetches via CORS proxy** (allorigins.win → corsproxy.io → codetabs.com fallback)
3. **DOMParser extracts tokens** — colors from styles/meta tags, fonts from CSS/Google Fonts links, spacing from padding/margin values
4. **Tokens saved to Firestore** (non-blocking, app works offline too)
5. **Dashboard renders instantly** using CSS custom properties
6. **Edits sync back** via debounced Firestore writes with version history

## 📸 Screenshots

### Home Page
Beautiful dark landing page with gradient hero text, URL input, and feature cards.

### Error Handling
Contextual error cards for bot-protected sites with retry and manual entry options.

### Dashboard — Color Tokens
Interactive color swatches with inline hex pickers and lock/unlock controls.

### Dashboard — Spacing System
Visual scale bars with editable multipliers and computed pixel values.

---

**Built by Md Waleedul Haque** · Purple Merit Technologies Assessment
