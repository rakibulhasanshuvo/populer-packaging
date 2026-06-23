/* eslint-disable @typescript-eslint/no-explicit-any */
const initialProducts = [
  {
    id: "prod-1",
    name: "Courier Poly Bag (Medium)",
    category: "Courier Poly",
    stock_quantity: 50000,
    avg_unit_cost: 0.08,
    waste_factor: 4.5,
    size: '10x14" (M)',
    sku: "POLY-M",
    supplier_name: "PolyTech Industries",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-2",
    name: "Garments Laminated Bag",
    category: "Garments",
    stock_quantity: 12000,
    avg_unit_cost: 0.35,
    waste_factor: 3.0,
    size: "L",
    sku: "GAR-L",
    supplier_name: "National Lamination",
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-3",
    name: "Product Label Sticker",
    category: "Labels",
    stock_quantity: 95000,
    avg_unit_cost: 0.02,
    waste_factor: 1.5,
    size: "Custom",
    sku: "LBL-CUST",
    supplier_name: "Star Label Co.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-4",
    name: "Customized D-cut Bag",
    category: "D-cut Shopping Bag",
    stock_quantity: 25000,
    avg_unit_cost: 3.50,
    waste_factor: 4.5,
    size: "L",
    sku: "DCUT-L",
    supplier_name: "D-cut Masters",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-5",
    name: "Customized Tissue Bag",
    category: "Tissue Bag",
    stock_quantity: 30000,
    avg_unit_cost: 4.00,
    waste_factor: 3.5,
    size: "10X13",
    sku: "TIS-1013",
    supplier_name: "Dhaka Tissue Suppliers",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-6",
    name: "Customized Handel Tissue Bag",
    category: "Handel Tissue Bag",
    stock_quantity: 15000,
    avg_unit_cost: 4.50,
    waste_factor: 3.5,
    size: "12X16",
    sku: "HTIS-1216",
    supplier_name: "Handel & Packaging Ltd",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-7",
    name: "Mailer Poly (Non-Print)",
    category: "Mailer Poly",
    stock_quantity: 40000,
    avg_unit_cost: 2.20,
    waste_factor: 2.0,
    size: "10/14+2",
    sku: "MPOLY-NP",
    supplier_name: "Mailer Source Co.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-8",
    name: "Readymade Miller Poly",
    category: "Readymade Miller Poly",
    stock_quantity: 20000,
    avg_unit_cost: 3.00,
    waste_factor: 2.5,
    size: "10x14",
    sku: "RMPOLY-1014",
    supplier_name: "ReadyPoly Factory",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialOrders = [
  {
    id: "order-1",
    product_id: "prod-1",
    quantity: 10000,
    selling_price: 0.15,
    fixed_setup_cost: 150.00,
    status: "pending",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "order-2",
    product_id: "prod-2",
    quantity: 5000,
    selling_price: 0.55,
    fixed_setup_cost: 250.00,
    status: "pending",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "order-3",
    product_id: "prod-3",
    quantity: 30000,
    selling_price: 0.05,
    fixed_setup_cost: 80.00,
    status: "completed",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialProfiles = [
  {
    id: "mock-user-id",
    name: "Rakibul Hasan Shuvo",
    full_name: "Rakibul Hasan Shuvo",
    email: "shuvo@popularpackaging.com",
    phone: "+8801712345678",
    avatar_initials: "RS",
    role: "Operations Administrator",
    theme_preference: "dark"
  }
];

let clientDbCache: any = null;

export function getMockDb() {
  if (typeof window !== "undefined") {
    if (clientDbCache) return clientDbCache;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/mock-db", false); // Synchronous block request to align SSR and initial hydrate
      xhr.send(null);
      if (xhr.status === 200) {
        clientDbCache = JSON.parse(xhr.responseText);
        return clientDbCache;
      }
    } catch (e) {
      // Ignored, fallback to local seeds
    }
    return { products: initialProducts, orders: initialOrders, profiles: initialProfiles };
  }

  // Server-side dynamic require
  const fs = eval('require("fs")');
  const path = eval('require("path")');
  const dbPath = path.join(process.cwd(), "src/lib/supabase/mock-db.json");

  if (!fs.existsSync(dbPath)) {
    const data = { products: initialProducts, orders: initialOrders, profiles: initialProfiles };
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    return data;
  }

  try {
    const content = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    return { products: initialProducts, orders: initialOrders, profiles: initialProfiles };
  }
}

export function saveMockDb(data: any) {
  if (typeof window !== "undefined") {
    clientDbCache = data;
    fetch("/api/mock-db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(err => console.error("Error saving mock db from client:", err));
    return;
  }

  const fs = eval('require("fs")');
  const path = eval('require("path")');
  const dbPath = path.join(process.cwd(), "src/lib/supabase/mock-db.json");
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}
