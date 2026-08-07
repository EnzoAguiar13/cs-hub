// Validated categorical/status/sequential slots — see the dataviz skill's palette.md.
// Kept as plain hex (not Tailwind CSS vars) because ECharts option objects need real
// color values, not custom-property strings.

export const CHART_INK = {
  light: { primary: "#0b0b0b", secondary: "#52514e", muted: "#898781", grid: "#e1e0d9", axis: "#c3c2b7" },
  dark: { primary: "#ffffff", secondary: "#c3c2b7", muted: "#898781", grid: "#2c2c2a", axis: "#383835" },
};

export const STATUS_COLOR = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

/** Ordinal sequential blue ramp (funnel stages) — lightest step still clears 2:1 on its surface. */
export const FUNNEL_RAMP = {
  light: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"],
  dark: ["#3987e5", "#256abf", "#184f95", "#0d366b"],
};
