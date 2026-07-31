# Kozeo Design System — "Forge" Theme

Applies to every page and component. Core idea: Kozeo is a workshop where
developers turn real project work into permanent proof — not a SaaS dashboard.
Dark, warm, textured, quiet. No glass cards, no pill badges, no gradient blobs,
no emoji, no boxed containers as a default layout device.

---

## 1. Color Palette

| Token | Hex | Use |
|---|---|---|
| `--forge-bg` | `#15120d` | Primary dark background (warm ash-charcoal, NOT neutral/pure black) |
| `--forge-bg-raised` | `#1c1812` | Slightly lighter dark surface — section-to-section variation, never a bordered "card" |
| `--forge-ink` | `#f2ece0` | Primary text on dark — warm off-white, never pure `#fff` |
| `--forge-ink-muted` | `#a8a297` | Secondary/body text on dark |
| `--forge-line` | `#3a382f` | Borders, dividers, hairlines — always warm-toned, never cool gray |
| `--forge-ember` | `#c98a4f` | Primary accent — links, active states, small labels |
| `--forge-ember-hot` | `#d2793d` | Hover/active accent, animation peak color |
| `--forge-ember-low` | `#5a2f18` | Accent resting/unlit state, deep shadow tint |
| `--forge-paper` | `#eeeae1` | Light-mode surface (if a light section is ever needed) — warm paper, not clinical white |
| `--forge-paper-ink` | `#15120d` | Text on light surface |

Rules:
- Never use pure black (`#000`) or pure white (`#fff`) anywhere.
- Every "dark" section uses `--forge-bg`; every "light" section (if any) uses `--forge-paper`. Don't invent new grays outside this table.
- Ember accent is used sparingly — small labels, one word in a headline, hover states, the signature animated element. It is never a large fill, never a full-width banner.
- No second competing accent color. If a section needs contrast, use `--forge-ink` vs `--forge-ink-muted` weight, not a new hue.

## 2. Typography

| Role | Family | Fallback stack | Weight | Notes |
|---|---|---|---|---|
| Display / headlines | Fraunces | `ui-serif, Georgia, serif` | 500 (use italic for a single accented word, not whole lines) | Set via `next/font/google`. Tight tracking (`-0.01em`), line-height `1.05–1.15`. |
| Body copy | Inter (or existing body sans already in project) | `ui-sans-serif, system-ui, sans-serif` | 400 | Line-height `1.6–1.7`. Never justify. |
| Labels / eyebrows / stats / tech tags | IBM Plex Mono | `ui-monospace, SFMono-Regular, monospace` | 400–500 | Uppercase, `letter-spacing: 0.15–0.2em`, small size (`0.7–0.85rem`). This is the "workshop ledger" voice — used for anything factual: tags, counts, timestamps, tech stacks. |

Type scale (use `clamp()` as the existing codebase already does):
- H1: `clamp(2.75rem, 7vw, 5.5rem)`
- H2: `clamp(2.25rem, 5vw, 3.5rem)`
- H3: `clamp(1.25rem, 2.5vw, 1.75rem)`
- Body large: `clamp(1rem, 1.6vw, 1.15rem)`
- Body / UI: `clamp(0.9rem, 1.4vw, 1rem)`
- Mono label: `clamp(0.7rem, 1.5vw, 0.8rem)`

Rules:
- Headlines are set in Fraunces, sentence case, never all-caps.
- Mono is the only face allowed in all-caps/tracked-out treatment.
- Don't mix a third display face in anywhere — Fraunces/Inter/Plex Mono is the whole system.

## 3. Layout & Components

- **No boxed containers as decoration.** Content sits directly on the background. A border or raised surface (`--forge-bg-raised`) is only used when it represents a real object (a project card, a form) — never to "frame" text that doesn't need framing.
- **No glassmorphism.** No `backdrop-blur` + translucent-white-border combo anywhere in the project.
- **No pill badges with a pulsing dot.** If a status needs marking, use a mono label (see Typography) with plain text, e.g. `AVAILABLE NOW`, not a rounded chip.
- **No gradient text.** Headline color is solid `--forge-ink`, with at most one word in `--forge-ember` (italic, not gradient).
- **Corners:** sharp or barely-rounded (`rounded-sm`, ~2–4px). Nothing pill-shaped except actual round elements (avatars).
- **Buttons:** solid ink-on-dark primary, outlined ghost secondary with ember hover — as built in the hero. No shadow/glow by default; a soft ember glow only on hover, sparingly.
- **Dividers:** thin `--forge-line` hairlines where they mark a real content boundary (e.g., between a numbered step list), not decorative.

## 4. Texture & Motion (the "cozy" part)

- **Grain overlay:** every dark section gets a subtle `feTurbulence` SVG noise layer at `opacity: 0.05–0.07`, `mix-blend-mode: overlay`. This is what keeps the dark background from feeling flat/digital — reuse the exact data-URI from the hero.
- **Signature motion — the ember field:** the heating contribution-grid pattern from the hero is the site's one recurring animated motif. Reuse it (scaled down) as a background texture in other dark sections that talk about progress/activity/proof (e.g., behind the "Profile > Money" or stats sections) — don't invent a second animation language.
- **Motion budget:** one orchestrated animation per section, max. Hover states get simple transforms (`translate`, opacity, color) — no bounce, no spring, no scale-pop on scroll-in for every element. Respect `prefers-reduced-motion` everywhere the ember animation is used (see hero's reduced-motion block for the pattern).
- **No blurred gradient blobs.** Remove any remaining `blur-3xl` colored-circle decorations project-wide; replace atmosphere with grain + ember field only.

## 5. Voice (copy)

- Plain, active voice. Say what the feature does, not what it "empowers you to unlock."
- Specific over clever: "Browse open projects," not "Explore possibilities."
- Mono labels state facts (`4–6 weeks`, `3–5 developers`), never marketing fluff.
- No invented stats or testimonials. If a number isn't real yet, don't display one.

## 6. Apply-across-project checklist

- [ ] Swap every section background between `--forge-bg` and `--forge-paper` only — remove `bg-stone-50`, `bg-gray-50`, `bg-white`, generic Tailwind grays.
- [ ] Replace all card borders/shadows using cool grays (`border-gray-800`, `shadow-xl` etc.) with `--forge-line` and warm-toned shadows (`rgba(21,18,13,...)` not `rgba(0,0,0,...)`).
- [ ] Replace any remaining pill/badge/glass elements (e.g., the "Skill Forge" tag, "Available Now" badge) with the mono-label treatment.
- [ ] Re-set all headings to Fraunces; body to Inter; all tags/stats/tech-stack chips to Plex Mono.
- [ ] Add the grain overlay to every full-bleed dark section, not just the hero.
- [ ] Comparison table, footer, and CTA section: restyle checkmarks/×'s and borders to the palette above instead of default green-600/red-500.