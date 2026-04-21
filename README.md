# 🪙 3D Coin Sculptor

> **Free, browser-based 3D coin, medallion and commemorative plaque designer — upload a portrait, configure your design, and export a print-ready STL file in seconds.**

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?logo=three.js)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ What It Does

3D Coin Sculptor turns a flat portrait photo or depth map into a fully 3D bas-relief mesh ready for:

- **3D printing** (FDM, SLA, SLS)
- **Bronze / silver casting** via lost-wax or sand casting
- **CNC milling** of commemorative coins and medallions
- **Digital collectibles** and NFT coin art

No CAD knowledge needed. No subscription. Runs entirely in your browser.

---

## 🖼️ Screenshots

> <img width="498" height="726" alt="preview 3d 6" src="https://github.com/user-attachments/assets/dc040b6e-2e6a-48ee-8290-bd9bc6755081" />
<img width="582" height="676" alt="preview 3d 1" src="https://github.com/user-attachments/assets/f9b9c8f8-c52a-4c9f-9f4a-47b7b3b0573b" />
<img width="1850" height="818" alt="preview 3d 2" src="https://github.com/user-attachments/assets/4cec0050-6bbc-497a-8610-4489adb0e8b7" />
<img width="571" height="718" alt="preview 3d 3" src="https://github.com/user-attachments/assets/7df8196d-a15c-4146-8a41-b0ea02b76c9e" />
<img width="1850" height="810" alt="preview 3d 5" src="https://github.com/user-attachments/assets/0b5e68be-435f-4fbf-9d56-49b90201ca12" />
_Add your own screenshots here — one of the 3D viewer, one of the settings panel._

---

## 🚀 Live Demo

> [https://github.com/Operac/3d-coin-sculptor](https://github.com/Operac/3d-coin-sculptor)

---

## 🔑 Key Features

| Feature | Detail |
|---|---|
| **AI Portrait Relief** | Converts any image into a depth map using AI; brighter pixels = higher relief |
| **Arc Inscription Text** | Top and bottom arc text with auto-fit font sizing and span control |
| **3 Sculpting Modes** | **Raised (3D)**, **Emboss** (soft rounded relief), **Engraved** (intaglio) |
| **Signature Font Choice** | Great Vibes cursive or Trajan Pro Bold (better for casting) |
| **Portrait Medallion Ring** | Auto-positioned border ring between portrait and text arc |
| **Double-Faced Coins** | Mirror design on the back face — text reads correctly on both sides |
| **Show / Hide Rim** | Toggle a raised border edge with configurable width and height |
| **4 Presets** | Pocket Coin (38 mm), Plaque (150 mm), Primary Plaque (425 mm), Replica Pocket (39 mm) |
| **STL Export** | Watertight, manifold mesh ready to slice or send to a foundry |
| **Advanced Materials** | Gold, Silver, Bronze preview with metallic / roughness controls |
| **Live 3D Viewer** | Orbit, zoom and inspect the coin in real time with Three.js |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| 3D Engine | Three.js r183 |
| AI Depth Model | `@xenova/transformers` (runs in-browser via ONNX) |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Build Tool | Vite 6 |
| Fonts | Trajan Pro (local) · Great Vibes (Google Fonts) |

---

## 📦 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/Operac/3d-coin-sculptor.git
cd 3d-coin-sculptor

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Build for Production

```bash
npm run build
# Output → dist/
```

---

## 🎨 How to Use

1. **Choose a preset** — Pocket Coin, Plaque, Primary Plaque or Replica Pocket
2. **Upload your portrait** — high-contrast photo or grayscale depth map works best
3. **Add arc text** — type your top and bottom inscriptions; adjust span and size
4. **Configure relief** — choose Raised, Emboss or Engraved; set base height and rim
5. **Add a signature** — pick Cursive or Trajan Pro font; position with sliders
6. **Enable the medallion ring** — auto-positioned portrait border circle
7. **Export STL** — download and open in your slicer or send to your casting house

### Tips for Best Results

- Use a **grayscale depth map** where white = highest point and black = base
- High-contrast portraits with a clean background produce the sharpest relief
- For bronze casting, set **Relief Depth ≥ 2 mm** and use **Trajan Pro** for text
- For 3D printing pocket coins, keep **base height ≤ 2 mm** and use **Raised** mode

---

## 📐 Preset Specifications

| Preset | Diameter | Base Height | Relief | Use Case |
|---|---|---|---|---|
| Pocket Coin | 38 mm | 1.5 mm | 1.0 mm | Standard collector coin |
| Plaque | 150 mm | 4.0 mm | 3.0 mm | Wall-mounted medallion |
| Primary Plaque | 425 mm | 5.5 mm | 6.0 mm | Large commemorative plaque |
| Replica Pocket | 39 mm | 1.2 mm | 1.0 mm | Replica / challenge coin |

---

## 🗂️ Project Structure

```
src/
├── components/
│   └── CoinViewer.tsx      # Three.js 3D viewer with orbit controls
├── lib/
│   └── coinGenerator.ts    # Core depth-map → mesh pipeline + text renderer
├── App.tsx                 # Main UI, settings panel, presets
└── main.tsx                # Entry point + font pre-loading
public/
└── fonts/                  # Trajan Pro (Regular, Semibold, Bold)
```

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas for new features — different coin shapes, QR code embedding, batch export, new font options — please open an issue first to discuss.

```bash
# Fork → clone → create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then open a PR
```

---

## 🏷️ Topics & Keywords

<!-- GitHub uses these to index and recommend your repo -->

`3d-coin` `coin-designer` `medallion` `stl-generator` `3d-printing` `bas-relief`
`commemorative-coin` `challenge-coin` `portrait-coin` `coin-maker` `plaque-designer`
`three-js` `react` `typescript` `depth-map` `relief-design` `coin-casting`
`bronze-coin` `stl-export` `coin-engraving` `numismatics` `3d-printable`

---

## 📄 License

[MIT](LICENSE) — free to use, modify and distribute.

---

## ⭐ Support the Project

If this tool saves you time or helps your project, please **star the repository** — it helps others discover it and keeps development going.

> _Built for designers, makers, foundries and anyone who wants to create beautiful coins without expensive CAD software._
