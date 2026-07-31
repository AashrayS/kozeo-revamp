/**
 * Monochrome theme object — drives programmatic style={} usages in components.
 *
 * ⚠ These values MUST mirror globals.css :root exactly.
 *    When you update globals.css, update this file too.
 */
export const theme = {
  light: {
    colors: {
      primary:    "#1a1a1a",   /* dark gray for light-mode buttons */
      secondary:  "#f2f2f2",   /* forge-paper */
      background: "#f2f2f2",   /* forge-paper */
      text:       "#0a0a0a",   /* forge-paper-ink */
      input:      "#e0e0e0",
      border:     "#c0c0c0",
    },
    fonts: {
      base: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    fontSizes: {
      heading:    "2rem",
      subheading: "1.25rem",
      body:       "1rem",
      small:      "0.875rem",
    },
  },
  dark: {
    colors: {
      primary:    "#d4d4d4",   /* forge-ember — silver accent */
      secondary:  "#111111",   /* forge-bg-raised */
      background: "#080808",   /* forge-bg */
      text:       "#f0f0f0",   /* forge-ink */
      input:      "#111111",   /* forge-bg-raised */
      border:     "#2c2c2c",   /* forge-line */
    },
    fonts: {
      base: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    fontSizes: {
      heading:    "2rem",
      subheading: "1.25rem",
      body:       "1rem",
      small:      "0.875rem",
    },
  },
};
