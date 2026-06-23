import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "@/store/useStore";

describe("Supply Pro Catalog Management State", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useStore.setState({
      products: [
        {
          id: "prod-1",
          name: "Courier Poly Bag (Medium)",
          category: "Courier Poly",
          qtyInStock: 50000,
          avgBuyingPrice: 0.08,
          wasteFactor: 4.5,
          size: "Medium",
        },
      ],
      suppliers: [
        { id: "sup-1", name: "PolyTech Industries", productId: "prod-1", basePrice: 0.075, leadTimeDays: 5, historicalDeviation: 0.005 },
      ],
      alerts: [],
    });
  });

  it("adds a new product to the catalog successfully", () => {
    const { addProduct } = useStore.getState();

    addProduct({
      name: "Custom Box",
      category: "Paper Box",
      qtyInStock: 500,
      avgBuyingPrice: 15.00,
      wasteFactor: 2.0,
      size: "12x12",
    });

    const state = useStore.getState();
    expect(state.products.length).toBe(2);
    expect(state.products[1].name).toBe("Custom Box");
    expect(state.products[1].qtyInStock).toBe(500);
    expect(state.products[1].size).toBe("12x12");
  });

  it("updates product price and details successfully", () => {
    const { updateProduct } = useStore.getState();

    updateProduct("prod-1", {
      name: "Updated Courier Bag Name",
      avgBuyingPrice: 0.12,
      qtyInStock: 45000,
      size: "Small",
    });

    const state = useStore.getState();
    const prod = state.products.find((p) => p.id === "prod-1");
    expect(prod).toBeDefined();
    expect(prod?.name).toBe("Updated Courier Bag Name");
    expect(prod?.avgBuyingPrice).toBe(0.12);
    expect(prod?.qtyInStock).toBe(45000);
    expect(prod?.size).toBe("Small");
    expect(state.alerts.length).toBe(1);
    expect(state.alerts[0].title).toBe("Product Updated");
  });

  it("deletes a product and its associated suppliers from the store catalog", () => {
    const { deleteProduct } = useStore.getState();

    deleteProduct("prod-1");

    const state = useStore.getState();
    expect(state.products.length).toBe(0);
    // Associated supplier should be deleted
    expect(state.suppliers.length).toBe(0);
    expect(state.alerts.length).toBe(1);
    expect(state.alerts[0].title).toBe("Product Deleted");
  });
});
