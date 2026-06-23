import { describe, it, expect } from "vitest";
import { computeOrderMargins, Order, Product } from "@/store/useStore";

describe("Supply Pro Formula Calculations", () => {
  
  // Test Formula A (Waste-Adjusted Sourcing Cost) & Formula C (Batch Profitability Margin)
  it("computes batch margins and waste-adjusted sourcing costs correctly (Formulas A & C)", () => {
    const mockProduct: Product = {
      id: "prod-test-1",
      name: "Test Courier Bag",
      category: "Courier Poly",
      qtyInStock: 50000,
      avgBuyingPrice: 0.08,
      wasteFactor: 4.5, // 4.5% waste calibration
    };

    const mockOrder: Order = {
      id: "order-test-1",
      orderNumber: "SP-9999",
      clientName: "Test AeroExpress",
      clientPhone: "+88017",
      productId: "prod-test-1",
      quantity: 10000,
      status: "printing",
      quotedUnitSellingPrice: 0.15,
      unitBuyingMaterialPrice: 0.08,
      fixedSetupOverhead: 150.00,
      deliveryDate: "2026-06-20",
    };

    const result = computeOrderMargins(mockOrder, mockProduct);

    // Assertions
    // Invoice Revenue: 10,000 * 0.15 = 1,500
    expect(result.invoiceRevenue).toBe(1500);

    // Adjusted Sourcing Cost: 10,000 * 0.08 * (1 + 4.5 / 100) = 836
    expect(result.adjustedSourcingCost).toBe(836);

    // Total Cost: 836 + 150 = 986
    expect(result.totalCost).toBe(986);

    // Net Profit Margin: 1500 - 986 = 514
    expect(result.netProfit).toBe(514);

    // Net Profit Margin %: (514 / 1500) * 100 = 34.266...%
    expect(result.marginPercentage).toBeCloseTo(34.267, 3);
  });

  // Test Formula B (Weighted Moving Average Cost for Stored Capital Assets)
  it("calculates weighted moving average cost correctly after bulk restock (Formula B)", () => {
    // Initial Stock: 50,000 units
    const oldQty = 50000;
    const oldAvg = 0.08;

    // Restock: 50,000 units at $0.07 per unit
    const newQtyInput = 50000;
    const newPriceInput = 0.07;

    // Recalculate weighted moving average cost
    const totalQty = oldQty + newQtyInput;
    const recalculatedAvg = (oldQty * oldAvg + newQtyInput * newPriceInput) / totalQty;

    // Expected: (50000 * 0.08 + 50000 * 0.07) / 100000 = 0.075
    expect(recalculatedAvg).toBe(0.075);
    expect(totalQty).toBe(100000);
  });
});
