import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, percentOf, roundHalfUp, toMinorUnits, toYoupiAmount } from "@/lib/money/money";

describe("money", () => {
  it("rounds half up, including negatives away from zero", () => {
    expect(roundHalfUp(2.5)).toBe(3);
    expect(roundHalfUp(2.4)).toBe(2);
    expect(roundHalfUp(-2.5)).toBe(-3);
  });

  it("converts major units to minor units with half-up rounding", () => {
    expect(toMinorUnits(10.005)).toBe(1001);
    expect(toMinorUnits(560)).toBe(56000);
  });

  it("formats minor units as currency", () => {
    expect(formatMoney(100000, "INR")).toBe("₹1,000.00");
  });

  it("produces YouPI's 2-decimal amount string", () => {
    expect(toYoupiAmount(49900)).toBe("499.00");
  });

  it("sums money and computes percentages with half-up rounding", () => {
    expect(addMoney(100, 200, 300)).toBe(600);
    expect(percentOf(10000, 18)).toBe(1800);
  });
});
