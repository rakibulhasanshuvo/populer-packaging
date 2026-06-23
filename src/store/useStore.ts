import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  category: string;
  qtyInStock: number;
  avgBuyingPrice: number;
  wasteFactor: number; // percentage (e.g. 4.5)
  size?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  productId: string;
  quantity: number;
  status: "cylinder_setup" | "printing" | "cutting" | "ready";
  quotedUnitSellingPrice: number;
  unitBuyingMaterialPrice: number;
  fixedSetupOverhead: number;
  deliveryDate: string;
  specifications?: {
    size?: string;
    podPocket?: boolean;
    color?: string;
    hasBubbleLining?: boolean;
    customNotes?: string;
    bagType?: "D-cut Shopping Bag" | "D-cut Folding Bag";
    printType?: "Single Side" | "Both Side";
    gsm?: string;
  };
}

export interface SupplierInfo {
  id: string;
  name: string;
  productId: string;
  basePrice: number;
  leadTimeDays: number;
  historicalDeviation: number; // e.g. 0.02
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: "amber" | "red";
  timestamp: string;
}

interface DashboardState {
  products: Product[];
  orders: Order[];
  suppliers: SupplierInfo[];
  alerts: AlertItem[];
  
  // Product actions
  addProduct: (product: Omit<Product, "id">) => void;
  updateProductWaste: (productId: string, newWaste: number) => void;
  logBulkPurchase: (productId: string, quantity: number, pricePerUnit: number) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (productId: string, updated: Partial<Product>) => void;
  
  // Order actions
  createOrder: (order: Omit<Order, "id" | "orderNumber">) => void;
  updateOrderStatus: (orderId: string, newStatus: Order["status"]) => void;
  
  // Alert actions
  dismissAlert: (alertId: string) => void;
}

// Initial seed data matching the blueprint spec
const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Courier Poly Bag (Medium)",
    category: "Courier Poly",
    qtyInStock: 50000,
    avgBuyingPrice: 0.08,
    wasteFactor: 4.5,
    size: '10x14" (M)',
  },
  {
    id: "prod-2",
    name: "Garments Laminated Bag",
    category: "Garments",
    qtyInStock: 12000,
    avgBuyingPrice: 0.35,
    wasteFactor: 3.0,
    size: "L",
  },
  {
    id: "prod-3",
    name: "Product Label Sticker",
    category: "Labels",
    qtyInStock: 95000,
    avgBuyingPrice: 0.02,
    wasteFactor: 1.5,
    size: "Custom",
  },
  {
    id: "prod-4",
    name: "Customized D-cut Bag",
    category: "D-cut Shopping Bag",
    qtyInStock: 25000,
    avgBuyingPrice: 3.50,
    wasteFactor: 4.5,
    size: "L",
  },
  {
    id: "prod-5",
    name: "Customized Tissue Bag",
    category: "Tissue Bag",
    qtyInStock: 30000,
    avgBuyingPrice: 4.00,
    wasteFactor: 3.5,
    size: "10X13",
  },
  {
    id: "prod-6",
    name: "Customized Handel Tissue Bag",
    category: "Handel Tissue Bag",
    qtyInStock: 15000,
    avgBuyingPrice: 4.50,
    wasteFactor: 3.5,
    size: "12X16",
  },
  {
    id: "prod-7",
    name: "Mailer Poly (Non-Print)",
    category: "Mailer Poly",
    qtyInStock: 40000,
    avgBuyingPrice: 2.20,
    wasteFactor: 2.0,
    size: "10/14+2",
  },
  {
    id: "prod-8",
    name: "Readymade Miller Poly",
    category: "Readymade Miller Poly",
    qtyInStock: 20000,
    avgBuyingPrice: 3.00,
    wasteFactor: 2.5,
    size: "10x14",
  },
];

const initialOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "SP-1001",
    clientName: "AeroExpress Logistics",
    clientPhone: "+8801712345678",
    productId: "prod-1",
    quantity: 10000,
    status: "printing",
    quotedUnitSellingPrice: 0.15,
    unitBuyingMaterialPrice: 0.08,
    fixedSetupOverhead: 150.00,
    deliveryDate: "2026-06-20",
    specifications: {
      size: '10x14" (M)',
      podPocket: true,
      color: "Standard Grey",
      hasBubbleLining: false,
    },
  },
  {
    id: "order-2",
    orderNumber: "SP-1002",
    clientName: "Apex Garments Ltd",
    clientPhone: "+8801812345678",
    productId: "prod-2",
    quantity: 5000,
    status: "cylinder_setup",
    quotedUnitSellingPrice: 0.55,
    unitBuyingMaterialPrice: 0.35,
    fixedSetupOverhead: 250.00,
    deliveryDate: "2026-06-25",
  },
  {
    id: "order-3",
    orderNumber: "SP-1003",
    clientName: "Green Foods Co.",
    clientPhone: "+8801912345678",
    productId: "prod-3",
    quantity: 30000,
    status: "ready",
    quotedUnitSellingPrice: 0.05,
    unitBuyingMaterialPrice: 0.02,
    fixedSetupOverhead: 80.00,
    deliveryDate: "2026-06-15",
  },
];

const initialSuppliers: SupplierInfo[] = [
  { id: "sup-1", name: "PolyTech Industries", productId: "prod-1", basePrice: 0.075, leadTimeDays: 5, historicalDeviation: 0.005 },
  { id: "sup-2", name: "Apex Raw Materials", productId: "prod-1", basePrice: 0.082, leadTimeDays: 3, historicalDeviation: 0.002 },
  { id: "sup-3", name: "National Lamination", productId: "prod-2", basePrice: 0.33, leadTimeDays: 7, historicalDeviation: 0.015 },
  { id: "sup-4", name: "Star Label Co.", productId: "prod-3", basePrice: 0.018, leadTimeDays: 4, historicalDeviation: 0.001 },
  { id: "sup-5", name: "D-cut Masters", productId: "prod-4", basePrice: 3.20, leadTimeDays: 6, historicalDeviation: 0.10 },
  { id: "sup-6", name: "Dhaka Tissue Suppliers", productId: "prod-5", basePrice: 3.80, leadTimeDays: 5, historicalDeviation: 0.05 },
  { id: "sup-7", name: "Handel & Packaging Ltd", productId: "prod-6", basePrice: 4.20, leadTimeDays: 5, historicalDeviation: 0.05 },
  { id: "sup-8", name: "Mailer Source Co.", productId: "prod-7", basePrice: 2.00, leadTimeDays: 4, historicalDeviation: 0.02 },
  { id: "sup-9", name: "ReadyPoly Factory", productId: "prod-8", basePrice: 2.75, leadTimeDays: 3, historicalDeviation: 0.03 },
];

const initialAlerts: AlertItem[] = [
  {
    id: "alert-1",
    title: "Raw Material Cost Spike Warning",
    message: "Polyethylene feedstock price increased by 8.4% globally.",
    severity: "amber",
    timestamp: "2 hours ago",
  },
  {
    id: "alert-2",
    title: "Critical Stock Level",
    message: "Garments Laminated Bag stock is low (12,000 left, threshold: 15,000).",
    severity: "amber",
    timestamp: "4 hours ago",
  },
  {
    id: "alert-3",
    title: "Upcoming Order Delivery Window",
    message: "Client order SP-1003 for Green Foods Co. is due within 24 hours.",
    severity: "red",
    timestamp: "Just now",
  },
];

export const useStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      orders: initialOrders,
      suppliers: initialSuppliers,
      alerts: initialAlerts,

      addProduct: (p) => set((state) => ({
        products: [
          ...state.products,
          {
            ...p,
            id: `prod-${Date.now()}`,
          },
        ],
      })),

      updateProductWaste: (productId, newWaste) => set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, wasteFactor: newWaste } : p
        ),
      })),

      // Formula B: Weighted Moving Average Cost for Stored Capital Assets
      logBulkPurchase: (productId, quantity, pricePerUnit) => set((state) => {
        const products = state.products.map((p) => {
          if (p.id === productId) {
            const oldQty = p.qtyInStock;
            const oldAvg = p.avgBuyingPrice;
            const newQty = oldQty + quantity;
            // Weighted moving average formula
            const newAvg = (oldQty * oldAvg + quantity * pricePerUnit) / newQty;
            
            return {
              ...p,
              qtyInStock: newQty,
              avgBuyingPrice: Number(newAvg.toFixed(4)),
            };
          }
          return p;
        });

        // Add a log alert
        const product = state.products.find((p) => p.id === productId);
        const alerts = [
          {
            id: `alert-${Date.now()}`,
            title: "Bulk Purchase Logged",
            message: `Restocked ${quantity.toLocaleString()} units of ${product?.name}.`,
            severity: "amber" as const,
            timestamp: "Just now",
          },
          ...state.alerts,
        ];

        return { products, alerts };
      }),

      createOrder: (o) => set((state) => {
        const nextNum = 1001 + state.orders.length;
        const newOrder: Order = {
          ...o,
          id: `order-${Date.now()}`,
          orderNumber: `SP-${nextNum}`,
        };

        // Deduct inventory stock
        const products = state.products.map((p) => {
          if (p.id === o.productId) {
            return {
              ...p,
              qtyInStock: Math.max(0, p.qtyInStock - o.quantity),
            };
          }
          return p;
        });

        return {
          orders: [newOrder, ...state.orders],
          products,
        };
      }),

      updateOrderStatus: (orderId, newStatus) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      })),

      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
        suppliers: state.suppliers.filter((s) => s.productId !== productId),
        alerts: [
          {
            id: `alert-${Date.now()}`,
            title: "Product Deleted",
            message: `Removed product from the catalog.`,
            severity: "amber" as const,
            timestamp: "Just now",
          },
          ...state.alerts,
        ],
      })),

      updateProduct: (productId, updated) => set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, ...updated } : p
        ),
        alerts: [
          {
            id: `alert-${Date.now()}`,
            title: "Product Updated",
            message: `Updated product details and pricing in the catalog.`,
            severity: "amber" as const,
            timestamp: "Just now",
          },
          ...state.alerts,
        ],
      })),

      dismissAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== alertId),
      })),
    }),
    {
      name: "supply-pro-state",
      skipHydration: true,
    }
  )
);

// Transaction Math Functions mapping to Formula A, B, and C
export function computeOrderMargins(order: Order, product?: Product) {
  const invoiceRevenue = order.quantity * order.quotedUnitSellingPrice;
  const wasteFactorAdjustment = 1 + (product ? product.wasteFactor / 100 : 0.04);
  const adjustedSourcingCost = order.quantity * order.unitBuyingMaterialPrice * wasteFactorAdjustment;
  const totalCost = adjustedSourcingCost + order.fixedSetupOverhead;
  const netProfit = invoiceRevenue - totalCost;
  const marginPercentage = invoiceRevenue > 0 ? (netProfit / invoiceRevenue) * 100 : 0;

  return {
    invoiceRevenue,
    adjustedSourcingCost,
    totalCost,
    netProfit,
    marginPercentage,
  };
}
