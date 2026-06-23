import OrdersClient from "./OrdersClient";
import { supabase } from "@/lib/supabase/client";

export const revalidate = 0;

interface OrderProducts {
  name: string;
  sku: string;
  avg_unit_cost: number;
}

type RawOrder = {
  id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  fixed_setup_cost: number;
  status: "pending" | "completed";
  created_at: string;
  products: unknown;
};

export default async function OrdersPage() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      product_id,
      quantity,
      selling_price,
      fixed_setup_cost,
      status,
      created_at,
      products (
        name,
        sku,
        avg_unit_cost
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading orders on server:", error.message);
  }

  const typedData = (data as unknown as RawOrder[])?.map((o) => {
    let products: OrderProducts | null = null;
    if (o.products && typeof o.products === "object" && !Array.isArray(o.products)) {
      const p = o.products as Record<string, unknown>;
      if (
        typeof p.name === "string" &&
        typeof p.sku === "string" &&
        typeof p.avg_unit_cost === "number"
      ) {
        products = {
          name: p.name,
          sku: p.sku,
          avg_unit_cost: p.avg_unit_cost,
        };
      }
    }
    return {
      id: o.id,
      product_id: o.product_id,
      quantity: o.quantity,
      selling_price: o.selling_price,
      fixed_setup_cost: o.fixed_setup_cost,
      status: o.status,
      created_at: o.created_at,
      products,
    };
  }) || [];

  return <OrdersClient initialOrders={typedData} />;
}
