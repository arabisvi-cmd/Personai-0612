# ◼️ PersonAI

> **PersonAI:** transforming to your Personal. *coming soon.*

This repository contains the ultra-minimalist, premium "coming soon" landing page for **personai.in**. The design targets sophisticated simplicity—focusing on elegant typography, balanced negative space, and smooth, breathing visual animations.

---

## 🖤 Design Elements

- **Premium Obsidian Space**: A pure black background (`#000000`) styled with an incredibly soft, breathing central radial ambient glow.
- **Elite Typography**: Uses clamp-based fluid headers in a light, geometric sans-serif typeface (*Plus Jakarta Sans*), combining narrow titles with extra-wide taglines.
- **Liquid Painting Background (Interactive Art)**: Clicking on the word **`Personal`** inside the tagline triggers a stunning hardware-accelerated liquid painting simulation. High-contrast organic paint drops (magenta, cyan, violet, orange) explode and flow, organically merging together (via high-contrast CSS blur filters) to repaint the page in a living, breathing abstract fluid wallpaper!
- **Micro-interactions**: 
  - An understated, thin-line email waitlist capture form that highlights smoothly upon user interaction.
  - Slow, elegant breathing animations on key typographic text blocks to make the page feel subtly alive.
  - A hidden, single-line stats bar for administrating visits and subscribers.

---

## 🔒 Secret Admin Indicators

To preserve the absolute purity of the interface, the visitor counters and waitlist statistics are completely hidden from normal users.

### How to Toggle the Admin Stats Bar:
- **Keyboard Sequence**: Type the word **`admin`** in order anywhere on the screen.
- **Footer Interaction**: Double-click the domain name **`personai.in`** at the bottom-left of the page.

*Once activated, a microscopic stats bar will elegantly fade into view in the footer: `visits: X / waitlist: Y`.*

---

## 📁 File Structure
```text
personai/
├── index.html   # Semantic HTML5 layout
├── style.css    # Minimalist HSL variables, fluid typography, breathing animations
├── app.js       # Light waitlist processing, local storage counts, secret admin toggler
└── README.md    # Repository details and instructions
```

---

## 🚀 Running the Project

Open **[index.html](file:///Users/prithviraju/work/personai/index.html)** in any web browser, or run a simple local http server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` to preview.
