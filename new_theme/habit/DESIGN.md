---
name: Obsidion Void
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is engineered for deep immersion and high-performance spatial computing. It targets power users who require a distraction-free environment where the interface recedes into the background, leaving only essential data and windows visible. 

The aesthetic is **High-Fidelity Glassmorphism** set against a "Void" backdrop—a pure #000000 canvas. This maximizes OLED contrast and creates an infinite sense of depth. UI elements appear as hyper-precise glass slabs with internal luminescence and razor-sharp perimeter strokes, evoking the feel of a high-end physical workstation or a futuristic cockpit.

## Colors
The palette is rooted in the absence of light. The primary background is strictly **#000000** to ensure perfect black levels and "spatial" floating effects.

- **Primary:** Electric Blue (#2563eb) is used for active states, primary actions, and high-priority data points.
- **Secondary:** Indigo (#6366f1) provides a subtle shift in hue for secondary interactive elements and depth gradients.
- **Surface Strategy:** Surfaces are built using a layering of deep navy (#0f172a) at varying opacities. 
- **The Glow:** Components utilize low-opacity blue and violet glows to simulate light refraction through glass, rather than traditional drop shadows.

## Typography
The typographic hierarchy balances technical precision with high-impact display. 

**Space Grotesk** is the primary display face, used for headers and branding to provide a geometric, futuristic character. **Inter** handles all body copy and functional UI text for its exceptional legibility at small sizes and neutral tone. **JetBrains Mono** is utilized for "Telemetry Data"—any numerical values, status labels, or system information—reinforcing the OS-level performance narrative. Use uppercase for labels to enhance the technical aesthetic.

## Layout & Spacing
This design system employs a **Fluid Grid** model with a hard 4px baseline shift. 

On desktop, the layout utilizes wide margins (64px) to allow the "void" to breathe around the content. Components should be spaced generously to prevent the glass effects from overlapping and becoming visually muddy. For spatial windows, use a 12-column grid. On mobile/handheld devices, the grid collapses to 4 columns with increased vertical padding to maintain a sense of "objects" floating in space rather than a flat interface.

## Elevation & Depth
Depth in this design system is achieved through **optical stacking** rather than traditional elevation scales.

1.  **The Void (Base):** #000000 background.
2.  **Backdrop Level:** A 20px blur applied to a semi-transparent Navy (#0f172a) fill.
3.  **The Edge:** Every elevated component must have a 1px solid border. The top and left edges use a lighter `border_highlight`, while the bottom and right edges use the primary accent color at 20% opacity.
4.  **Luminescence:** Instead of black shadows, use "Bloom"—a soft, 30px-60px blur of the primary blue color behind active or focused windows, creating a neon-like halo that suggests the element is emitting light.

## Shapes
The shape language is "Sophisticated Industrial." Sharp corners are avoided to prevent a dated "brutalist" look, but overly rounded corners are rejected to maintain a professional, high-performance feel. Use **Soft (0.25rem)** for small UI controls (buttons, inputs) and **rounded-lg (0.5rem)** for main app windows and large containers. This slight rounding suggests precision-milled glass edges.

## Components
- **Windows / Cards:** Heavy backdrop blur (20px+), semi-transparent deep navy fill, and a 1px "inner-glow" stroke.
- **Primary Buttons:** Solid Electric Blue (#2563eb) with a subtle Indigo gradient. On hover, the element should trigger a blue outer glow (bloom).
- **Inputs:** Dark, recessed backgrounds with a bright 1px bottom border. Use JetBrains Mono for input text.
- **Status Chips:** Small, pill-shaped elements with high-contrast mono text and a leading "pulse" dot to indicate live system processes.
- **Telemetry Readouts:** Monospace data blocks grouped in "Data Cells" with thin, low-opacity dividers.
- **Glass Sliders:** Thin tracks with a high-glow circular handle that leaves a light trail of primary blue.