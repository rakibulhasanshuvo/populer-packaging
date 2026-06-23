import { createClient } from "@supabase/supabase-js";
import { getMockDb, saveMockDb } from "./mockDb";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Use mock client if there's no supabase URL or if it's the placeholder URL
const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
               process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co");

class MockBuilder {
  table: string;
  filters: Array<(item: any) => boolean> = [];
  sortCol: string | null = null;
  sortAscending = false;
  isSingle = false;
  isCountOnly = false;
  action: "select" | "insert" | "update" | "delete" = "select";
  payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string, options?: any) {
    this.action = "select";
    if (options?.count === "exact" && options?.head === true) {
      this.isCountOnly = true;
    }
    return this;
  }

  insert(payload: any) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push((item) => {
      const itemVal = item[col];
      return itemVal === val;
    });
    return this;
  }

  lt(col: string, val: any) {
    this.filters.push((item) => {
      const itemVal = item[col];
      return typeof itemVal === "number" && itemVal < val;
    });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.sortCol = col;
    this.sortAscending = options?.ascending ?? false;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    const db = getMockDb();
    const list: any[] = db[this.table] || [];

    if (this.action === "select") {
      let filtered = [...list];
      for (const filter of this.filters) {
        filtered = filtered.filter(filter);
      }

      if (this.sortCol) {
        const col = this.sortCol;
        const asc = this.sortAscending;
        filtered.sort((a, b) => {
          const aVal = a[col];
          const bVal = b[col];
          if (aVal < bVal) return asc ? -1 : 1;
          if (aVal > bVal) return asc ? 1 : -1;
          return 0;
        });
      }

      // Join support for products on orders table
      if (this.table === "orders") {
        filtered = filtered.map((order) => {
          const product = db.products.find((p: any) => p.id === order.product_id);
          return {
            ...order,
            products: product
              ? {
                  name: product.name,
                  sku: product.sku,
                  avg_unit_cost: product.avg_unit_cost,
                }
              : null,
          };
        });
      }

      // Handle full_name for profiles
      if (this.table === "profiles") {
        filtered = filtered.map((profile) => ({
          ...profile,
          full_name: profile.name || profile.full_name
        }));
      }

      if (this.isCountOnly) {
        return { count: filtered.length, data: null, error: null };
      }

      if (this.isSingle) {
        return { data: filtered[0] || null, error: filtered[0] ? null : { message: "Not found" } };
      }

      return { data: filtered, error: null, count: filtered.length };
    }

    if (this.action === "insert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const newRows = rows.map((row) => ({
        id: `${this.table === "orders" ? "order" : "prod"}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        ...row,
      }));
      list.push(...newRows);
      db[this.table] = list;
      saveMockDb(db);
      return { data: newRows, error: null };
    }

    if (this.action === "update") {
      let updatedCount = 0;
      const updatedList = list.map((item) => {
        let match = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            match = false;
            break;
          }
        }
        if (match) {
          updatedCount++;
          return { ...item, ...this.payload };
        }
        return item;
      });
      db[this.table] = updatedList;
      saveMockDb(db);
      
      const filteredResult = updatedList.filter(item => {
        const match = true;
        for (const filter of this.filters) {
          if (!filter(item)) return false;
        }
        return true;
      });
      return { data: filteredResult, error: null };
    }

    if (this.action === "delete") {
      const remainingList = list.filter((item) => {
        let match = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            match = false;
            break;
          }
        }
        return !match;
      });
      db[this.table] = remainingList;
      saveMockDb(db);
      return { data: null, error: null };
    }

    return { data: null, error: { message: "Unknown action" } };
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }
}

const mockAuth = {
  getUser: async () => {
    return {
      data: {
        user: {
          id: "mock-user-id",
          email: "shuvo@popularpackaging.com",
          user_metadata: { name: "Rakibul Hasan Shuvo" }
        }
      },
      error: null
    };
  }
};

const mockChannel = {
  on: () => mockChannel,
  subscribe: () => ({ unsubscribe: () => {} })
};

const mockSupabase = {
  from: (table: string) => new MockBuilder(table),
  auth: mockAuth,
  channel: () => mockChannel,
  removeChannel: () => {}
} as any;

export const supabase = isMock ? mockSupabase : createClient(supabaseUrl, supabaseAnonKey);

