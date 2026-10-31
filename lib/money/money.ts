// All money is stored as an integer number of minor units (paise/cents) — never a float.
// This is the one shared place that formats and rounds money.

export type MinorUnits = number;

export function roundHalfUp(value: number): MinorUnits {
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

export function toMajorUnits(minorUnits: MinorUnits): number {
  return minorUnits / 100;
}

export function toMinorUnits(majorUnits: number): MinorUnits {
  return roundHalfUp(majorUnits * 100);
}

export function formatMoney(minorUnits: MinorUnits, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toMajorUnits(minorUnits));
}

// YouPI expects amount as a string with 2 decimals, e.g. "499.00".
export function toYoupiAmount(minorUnits: MinorUnits): string {
  return toMajorUnits(minorUnits).toFixed(2);
}

export function addMoney(...amounts: MinorUnits[]): MinorUnits {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

export function percentOf(minorUnits: MinorUnits, percent: number): MinorUnits {
  return roundHalfUp((minorUnits * percent) / 100);
}
