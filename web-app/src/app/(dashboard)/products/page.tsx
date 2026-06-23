import ProductsClient from "./ProductsClient";
import { supabase } from "@/lib/supabase/client";

export const revalidate = 0;

export default async function ProductsPage() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products on server:", error.message);
  }

  return <ProductsClient initialProducts={data || []} />;
}
