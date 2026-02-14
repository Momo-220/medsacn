# AI MediScan Frontend

> A calm, intelligent, and trustworthy pharmaceutical companion - PWA Frontend

## ✨ Features

- 🎨 **Premium Medical Minimalism** - Glassmorphism, vaporeux shadows, organic animations
- 📱 **PWA Ready** - Installable on Android & iOS, offline support
- 🚀 **Performance Optimized** - Next.js 14, React 18, optimized images
- 🔐 **Firebase Authentication** - Secure user authentication
- 💬 **AI Chat** - Real-time streaming responses
- 📸 **Medication Scanning** - Camera integration with instant analysis
- 🎭 **Framer Motion** - Smooth, emotional animations
- 🎨 **Tailwind CSS** - Utility-first styling with custom theme

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** React 18 + Tailwind CSS
- **Animations:** Framer Motion
- **Auth:** Firebase Authentication
- **API:** Axios with interceptors
- **Icons:** Lucide React
- **PWA:** Custom service worker

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase project configured
- Backend API running

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── features/       # Feature components
│   │   │   ├── ScanModal.tsx
│   │   │   └── ScanResultView.tsx
│   │   ├── screens/        # Screen components
│   │   │   └── HomeScreen.tsx
│   │   └── providers.tsx   # Context providers
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts   # API client
│   │   ├── auth/
│   │   │   └── AuthContext.tsx
│   │   ├── firebase/
│   │   │   └── config.ts
│   │   └── utils/
│   │       ├── cn.ts       # Class name utility
│   │       └── format.ts   # Formatting utilities
│   └── types/
│       └── index.ts        # TypeScript types
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
└── package.json
```

## 🎨 Design System

### Colors

```typescript
background: '#FBFBF9'
brand-primary: '#4A90E2'  // Primary Blue
brand-deep: '#1A3B5D'      // Deep Blue
brand-accent: '#C7E65A'    // AI Accent
text-primary: '#1A3B5D'
text-secondary: 'rgba(26, 59, 93, 0.5)'
```

### Typography

- **Display Hero:** 42px, weight 600
- **H1:** 32px, weight 600
- **H2:** 24px, weight 500
- **Body:** 16px, weight 300
- **Micro:** 10px, weight 700

### Effects

- **Glassmorphism:** `backdrop-blur(15px)`, opacity 0.7
- **Vaporeux Shadow:** Soft diffused blue shadow
- **AI Glow:** Subtle green halo for AI elements
- **Organic Animations:** Breathing, floating, wave effects

## 🔧 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 📱 PWA Configuration

### Manifest

- **Name:** AI MediScan
- **Theme Color:** #4A90E2
- **Background:** #FBFBF9
- **Display:** Standalone
- **Orientation:** Portrait

### Service Worker

- **Strategy:** Network first, cache fallback
- **Cached Assets:** Static pages, icons, manifest
- **Runtime Cache:** API responses, images
- **Offline Support:** Read-only history

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
npm run build
npm run start
```

## 🔐 Environment Variables

Required variables (see `.env.example`):

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
```

## 🎯 Performance

- **Lighthouse Score Target:** 95+
- **First Contentful Paint:** < 1s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3s
- **Cumulative Layout Shift:** < 0.1

## 🧪 Testing

```bash
# Unit tests (to be implemented)
npm run test

# E2E tests (to be implemented)
npm run test:e2e
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain design system consistency
4. Add animations for emotional impact
5. Test on multiple devices
6. Ensure accessibility (WCAG 2.1 AA)

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ to create emotions, not just apps.**


