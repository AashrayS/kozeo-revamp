/**
 * Monochrome theme object — drives programmatic style={} usages in components.
 *
 * ⚠ These values MUST mirror globals.css :root exactly.
 *    When you update globals.css, update this file too.
 */
export const theme = {
  light: {
    colors: {
      primary:    "#000000",   /* forge-ember */
      secondary:  "#fafafa",   /* forge-bg-raised */
      background: "#ffffff",   /* forge-bg */
      text:       "#000000",   /* forge-ink */
      input:      "#fafafa",   /* forge-bg-raised */
      border:     "rgba(0, 0, 0, 0.1)", /* forge-line */
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
      primary:    "#ffffff",   /* forge-ember */
      secondary:  "#121212",   /* forge-bg-raised */
      background: "#080808",   /* forge-bg */
      text:       "#ffffff",   /* forge-ink */
      input:      "#121212",   /* forge-bg-raised */
      border:     "rgba(255, 255, 255, 0.1)", /* forge-line */
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
