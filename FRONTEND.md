# **Frontend Architecture & Detailed Implementation Specification**

This document details the frontend architecture, design token system, directory layout, and component-level specifications for the company's internal Progressive Web App (PWA). It provides developer-ready design guidelines, state management strategies, component API definitions, and optimization standards needed to build a premium, minimalist, Apple-style mobile-first dashboard.

---

## **1. Tech Stack Selection & Rationale**

| Technology | Role | Rationale |
| :--- | :--- | :--- |
| **Next.js (App Router)** | Core Framework | Hybrid Server Components (RSC) for immediate paint speeds (SSR) and Client Components for dynamic sub-sheets and real-time WebSockets. |
| **TypeScript** | Language | Type safety from database schema (Supabase CLI auto-generated types) straight to UI component props. |
| **Tailwind CSS** | Styling | Highly customizable CSS utility generation with container-query support and design token integration. |
| **shadcn/ui (Radix UI)** | Component Primitives | Accessible (WAI-ARIA compliant), unstyled behavioral foundations. Allows visual tailoring to meet high-end aesthetic goals. |
| **Zustand** | Local Client State | Lightweight, boilerplate-free state manager for managing UI overlays, active tab animations, and local cache updates. |
| **TanStack Query (v5)** | Server Cache State | Handles query deduplication, background refetching on window focus, and structured optimistic updates for network-resilient writes. |
| **Framer Motion** | Animation Library | Custom spring physical metrics (`tension`, `friction`, `mass`) to replicate fluid native iOS screen transitions and tab highlights. |
| **Recharts** | Interactive Charts | Canvas and SVG charting library engineered to handle real-time metric streams and responsive grid layouts. |

---

## **2. Directory Structure**

The project follows a standard Next.js App Router structure, structured for modular features, separation of server vs. client code, and clean state boundary separation:

```text
src/
├── app/
│   ├── layout.tsx                # Persistent global HTML, fonts, and viewport settings
│   ├── page.tsx                  # Root redirect logic to /home
│   ├── (auth)/
│   │   ├── login/page.tsx        # Authentication view (Supabase OTP / credentials)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # The Persistent Shell (Top Bar, Bottom Tab Bar)
│   │   ├── home/page.tsx         # /home - Cash flow & Bento Metrics
│   │   ├── products/page.tsx     # /products - Raw materials & Storage catalog
│   │   ├── orders/page.tsx       # /orders - Real-time Pipeline
│   │   └── analytics/page.tsx    # /analytics - Business intelligence reports
│   └── api/                      # Edge routes for transactional actions (e.g. WhatsApp trigger)
├── components/
│   ├── ui/                       # Unstyled shadcn / Radix primitives
│   ├── dashboard/                # Shareable dashboard widgets
│   ├── home/                     # Components specialized for Page 1
│   ├── products/                 # Components specialized for Page 2
│   ├── orders/                   # Components specialized for Page 3
│   └── analytics/                # Components specialized for Page 4
├── hooks/
│   ├── useSupabaseRealtime.ts    # Custom WebSocket sync hook
│   ├── useOptimisticMutation.ts  # Generic cache updates on mutating state
│   └── useMediaQuery.ts          # Responsive checks for screen sizes
├── lib/
│   ├── supabaseClient.ts         # Initialized Supabase Browser Client
│   └── utils.ts                  # Tailwind merger utility (cn helper)
├── store/
│   ├── useUIStore.ts             # Global UI overlays, active drawer handles
│   └── useOrderStore.ts          # Local cache of live pipeline orders
└── styles/
    └── globals.css               # Core styling variables, fonts, Apple-glass declarations
```

---

## **3. Design System & Tokens**

### **A. Tailwind Config Integration**
We configure the custom colors, border radii, and soft shadows matching Apple's Human Interface Guidelines. Add this configuration to `tailwind.config.js`:

```javascript
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: {
          light: "#F5F5F7",
          dark: "#0F0F10",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1C1C1E",
        },
        apple: {
          blue: "#0071E3",
          green: "#34C759",
          red: "#FF3B30",
          amber: "#FF9500",
          indigo: "#5856D6",
        },
        typography: {
          primary: "#1D1D1F",
          secondary: "#86868B",
        }
      },
      fontFamily: {
        sans: ["var(--font-sf-pro)", ...fontFamily.sans],
      },
      borderRadius: {
        "apple-lg": "16px",
        "apple-xl": "24px",
      },
      boxShadow: {
        "apple-soft": "0 4px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)",
        "apple-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
      }
    },
  },
}
```

### **B. Glassmorphism CSS Utility Class**
To create the system top bars and sheets that feel transparent and reflective:

```css
/* src/styles/globals.css */
@layer utilities {
  .apple-glass {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(190%);
    -webkit-backdrop-filter: blur(20px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}
```

---

## **4. The Persistent Layout Shell**

To run as an app-like PWA, the root layout uses a fixed viewport setting that ignores user zooming and is optimized for the notch of iOS/Android phones.

```tsx
// src/app/layout.tsx
import { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Forces application content behind notch space
}

export const metadata: Metadata = {
  title: "Supply Pro Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
}
```

### **A. Global Header Component (`Header.tsx`)**
Positioned static/sticky at the top. Provides access to settings and user identity:

* **Props API:** None (reads profile context from global auth hooks).
* **Behavior:** Clicking the user profile avatar invokes `useUIStore.getState().toggleSettingsDrawer(true)`.

### **B. Bottom Tab Bar Component (`TabBar.tsx`)**
A floating panel using Framer Motion to slide the active background capsule.

```tsx
// src/components/dashboard/TabBar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Package, ShoppingBag, BarChart2 } from "lucide-react"

const TABS = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/products", label: "Products", icon: Package },
  { path: "/orders", label: "Orders", icon: ShoppingBag },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[84px] pb-5 apple-glass flex items-center justify-around px-4 z-50">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.path)
        const Icon = tab.icon

        return (
          <Link key={tab.path} href={tab.path} className="relative flex flex-col items-center py-2 px-3 focus:outline-none">
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-apple-blue/10 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={`h-5 w-5 ${isActive ? "text-apple-blue" : "text-typography-secondary"}`} />
            <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-apple-blue" : "text-typography-secondary"}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

---

## **5. Detailed Page Breakdown & Component APIs**

### **Page 1: Home Dashboard (`/home`)**

#### **1. Cash Flow Graph Widget (`CashFlowChart.tsx`)**
A client component wrapping Recharts Area charts to visualize sales vs. raw material acquisition purchases.

* **State Actions:**
  * Toggle variable `isAssetGrowthMode: boolean` (default: `false`).
  * If `true`, the total buy/sourcing values are adjusted by a computed factor of stored inventory value in the ledger.
* **Component API:**
  ```typescript
  interface ChartDataPoint {
    date: string;
    totalSales: number;
    totalBuys: number;
    inventoryAdjustedValue: number;
  }
  interface CashFlowChartProps {
    data: ChartDataPoint[];
  }
  ```

#### **2. Metric Bento Grid Layout**
Organizes statistical summary blocks. Each card has a standardized structure:
* **Metric Card Props API:**
  ```typescript
  interface MetricCardProps {
    title: string;
    value: string | number;
    changePercentage: number;  // positive displays green, negative displays red
    trendDirection: 'up' | 'down' | 'neutral';
    colorTheme?: 'blue' | 'green' | 'amber' | 'indigo';
  }
  ```

#### **3. Critical Alerts Panel (`HomeAlerts.tsx`)**
* Reads real-time alert triggers from database alerts table.
* Displays a scrollable stack of amber and red banner cards.
* Swiping left on an alert triggers a Framer Motion animation, calling a mutation endpoint to mark the warning as acknowledged.

---

### **Page 2: Products & Storage Catalog (`/products`)**

#### **1. Product Category Filter Bar**
Horizontal scroll container hiding native scrollbars:
* **Props API:**
  ```typescript
  interface CategoryFilterProps {
    activeCategory: string;
    categories: string[];
    onCategorySelect: (category: string) => void;
  }
  ```

#### **2. Product Detail Card (`ProductCard.tsx`)**
Displays live catalog details, stock warnings, and margins:
* **Left Highlight Border Logic:**
  * Margin > 40%: **Green** indicator tag (`bg-apple-green`).
  * Margin 20% to 40%: **Yellow** indicator tag (`bg-apple-amber`).
  * Margin < 20%: **Red** critical indicator tag (`bg-apple-red`).
* **Interactive Trigger:** Tapping the card opens the bottom storage sheet.
  ```typescript
  interface ProductCardProps {
    id: string;
    name: string;
    category: string;
    qtyInStock: number;
    marginPercentage: number;
    wasteFactor: number;
    avgBuyingPrice: number;
  }
  ```

#### **3. Storage & Waste Drawer Sheet (`StorageDrawer.tsx`)**
Using Radix UI Dialog primitive, this sheet slides up from the viewport bottom:

* **State Fields:**
  * `wasteFactorInput`: string, allows updating wastage percentage (0.00% - 99.99%).
  * `newPurchaseQty`: string, quantity of newly acquired stock.
  * `newPurchasePrice`: string, cost per unit for calculating the weighted moving average database record.
* **Optimistic Workflow:** Submitting the form runs an optimistic update against the active `/products` cache immediately, updating the average cost locally.

---

### **Page 3: Live Order Pipeline (`/orders`)**

#### **1. Interactive Status Switcher**
A responsive slider mimicking standard iOS Segmented Controls:
* **States:** `[All] [Setup] [Printing] [Cutting] [Ready]`.

#### **2. Bento Order Card Component (`OrderCard.tsx`)**
Presents client metadata alongside real-time calculations:

* **Transactional Margin Calculation:**
  $$\text{Invoice Revenue} = \text{Order Quantity} \times \text{Quoted Unit Selling Price}$$
  $$\text{Waste Factor Adjustment} = 1 + \left( \frac{\text{Product Waste Factor}}{100} \right)$$
  $$\text{Adjusted Raw Sourcing Cost} = \text{Order Quantity} \times \text{Unit Buying Material Price} \times \text{Waste Factor Adjustment}$$
  $$\text{Total Cost} = \text{Adjusted Raw Sourcing Cost} + \text{Fixed Setup Overhead}$$
  $$\text{Net Profit Margin} = \text{Invoice Revenue} - \text{Total Cost}$$
* **WhatsApp Update Button Props:**
  * Uses standard link: `https://wa.me/{clientPhone}?text={encodedText}`
  * Pre-formatted message logic:
    ```typescript
    const generateStatusMessage = (clientName: string, orderNumber: string, status: string) => {
      return encodeURIComponent(
        `Hi ${clientName}, your order #${orderNumber} has progressed to the ${status.toUpperCase()} stage.`
      );
    }
    ```

---

### **Page 4: Business Analytics (`/analytics`)**

#### **1. Supplier Cost Matrix**
A custom layout displaying suppliers side-by-side:
* Tracks minimum base price offered, historical deviation values, and lead times.
* Displays a highlight badge on the cheapest provider per raw material.

#### **2. Category Profit Analysis**
* A Recharts vertical bar chart displaying Net margins sorted from highest categories (e.g. `Labels`) to lowest categories.

---

## **6. State Management & Server Synchronization**

### **A. Supabase Real-Time Sync Hook**
A React hook mapping live DB event subscriptions to local component caches:

```typescript
// src/hooks/useSupabaseRealtime.ts
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"

export function useSupabaseRealtime(tableName: string, queryKey: any[]) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-realtime-channel`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName },
        (payload) => {
          // Invalidate key cache to trigger seamless client-side background hydration
          queryClient.invalidateQueries({ queryKey })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, queryKey, queryClient])
}
```

### **B. Optimistic UI Mutation Flow (Zustand UI Sync)**
When mutating an order state, the app updates the Zustand store state immediately without waiting for a database return message:

```typescript
// src/store/useOrderStore.ts
import { create } from "zustand"

interface Order {
  id: string;
  status: string;
}

interface OrderStoreState {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  optimisticUpdateStatus: (orderId: string, newStatus: string) => void;
}

export const useOrderStore = create<OrderStoreState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  optimisticUpdateStatus: (orderId, newStatus) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ),
    }))
  },
}))
```

---

## **7. Progressive Web App (PWA) & Mobile Optimization**

### **A. PWA Service Worker Cache Strategy**
Configure Next.js PWA compilation strategies inside `next.config.js`:

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache assets & static categories
      urlPattern: /\/(?:products|categories)/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-catalog-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 Hours
        },
      },
    },
    {
      // Orders require up-to-date values; attempt network lookup first
      urlPattern: /\/orders/,
      handler: "NetworkFirst",
      options: {
        cacheName: "live-orders-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
})

module.exports = withPWA({
  reactStrictMode: true,
})
```

### **B. Native Web App Configuration (`manifest.json`)**
Saved to `public/manifest.json` for installing as a standalone launcher icon:

```json
{
  "name": "Supply Pro Packaging",
  "short_name": "Supply Pro",
  "theme_color": "#F5F5F7",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/home",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **C. Viewport iOS Safe Zone Adjustments**
Ensure bottom bars do not conflict with device home indicators or overlays. Apply viewport safe spacing:

```css
/* Padding setup in global navigation shells */
.nav-tab-bar {
  padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
}
.header-top-bar {
  padding-top: calc(env(safe-area-inset-top) + 8px);
}
```

---

## **8. Testing & Validation Strategy**

### **A. Component Testing (Vitest + Testing Library)**
* Verify that math logic computes net margins correctly on the order card components.
* Verify margin highlight colors change correctly when feeding varying cost matrices.

### **B. End-to-End User Flow Tests (Playwright)**
We automate operational testing scenarios:
1. **The Sourcing Workflow:** Open the products panel, open the drawer component, submit a new raw material purchase transaction, and confirm the average unit pricing update immediately recalculates on the dashboard.
2. **Order Tracking Progress:** Click on an active order status, update it from Setup to Cutting, confirm optimistic UI adjustments, and verify the WhatsApp link reflects the updated state parameters.
