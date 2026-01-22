import type { TimeUnit } from "../plugin-types";

// Conversion factors to milliseconds (base unit for calculations)
export const TIME_UNIT_TO_MS: Record<TimeUnit, number> = {
  nanoseconds: 1e-6,
  microseconds: 1e-3,
  milliseconds: 1,
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
};

// Human-readable labels for each time unit
export const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  nanoseconds: "Nanoseconds",
  microseconds: "Microseconds",
  milliseconds: "Milliseconds",
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
};

// Short labels for compact display
export const TIME_UNIT_SHORT_LABELS: Record<TimeUnit, string> = {
  nanoseconds: "ns",
  microseconds: "μs",
  milliseconds: "ms",
  seconds: "s",
  minutes: "min",
  hours: "h",
  days: "d",
};

// All time units in order from smallest to largest
export const TIME_UNITS: TimeUnit[] = [
  "nanoseconds",
  "microseconds",
  "milliseconds",
  "seconds",
  "minutes",
  "hours",
  "days",
];

/**
 * Convert a value from one time unit to another
 * @param value - The numeric value to convert
 * @param fromUnit - The source time unit
 * @param toUnit - The target time unit
 * @returns The converted value
 */
export function convertTimeUnit(
  value: number,
  fromUnit: TimeUnit,
  toUnit: TimeUnit,
): number {
  if (fromUnit === toUnit) return value;
  const valueInMs = value * TIME_UNIT_TO_MS[fromUnit];
  return valueInMs / TIME_UNIT_TO_MS[toUnit];
}

/**
 * Format a time value with its unit for display
 * @param value - The numeric value
 * @param unit - The time unit
 * @param useShortLabel - Whether to use short labels (e.g., "ms" vs "Milliseconds")
 * @returns Formatted string like "30 Minutes" or "30 min"
 */
export function formatTimeValue(
  value: number,
  unit: TimeUnit,
  useShortLabel = false,
): string {
  const label = useShortLabel
    ? TIME_UNIT_SHORT_LABELS[unit]
    : TIME_UNIT_LABELS[unit];
  return `${value} ${label}`;
}
