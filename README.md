# <p align="center">GitHub Chart Builder</p>
<p align="center">
  <img src="./public/vite.svg" width="120" alt="GitHub Chart Builder Logo">
</p>
<p align="center">
  <strong>Customize and embed a clean, dynamic GitHub contributions chart.</strong> <br>
  A lightweight utility to tweak color palettes, configure spacing, adjust grids, and generate an SVG chart URL for your portfolio or readme.
</p>
<p align="center">
  <a href="https://gh.ruu.by"><img src="https://img.shields.io/badge/website-gh.ruu.by-24292f" alt="website" /></a>
  <a href="https://github.com/reazndev/github-chart-builder/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-24292f.svg" alt="license"/></a>
</p>

---

## What is this?

This is a self-contained full-stack app that wraps GitHub's GraphQL API and serves custom contribution charts as clean SVGs. It features an interactive UI built with React/Vite to customize layout parameters (such as grid spacing, borders, size, and duration) and construct custom color palettes, outputting a shareable API URL to use in image tags.

## Core Features

- **Live Customization Preview:** Enter a GitHub handle to immediately see how the chart renders.
- **Dynamic Color Palettes:** Includes standard presets (like classic GitHub, Sunset, Ocean, and Purple) and custom color inputs to define exact active and inactive states.
- **Fine-grained Sizing controls:** Adjust timeframes (1 to 12 months), box spacing, box sizes, and border-radius.
- **Copy-to-Clipboard Link Generator:** Automatically encodes configuration rules into clean query parameters on a shareable URL.
- **Unified Full-Stack App:** Combines a fast Express-based SVG generation API and static build hosting in a single, lightweight repository.
- **Dockerized Deployment:** Bundled with multi-stage Dockerfiles and compose setups for immediate hosting on a VPS or homelab cluster.

## Query Options

The backend handles parameters directly via URL queries, including:

- `months` (1-12)
- `boxSize` (pixel dimension of grid cells)
- `boxSpacing` (pixel spacing between grid cells)
- `borderRadius` (border curves for grid cells)
- `inactiveColor` (hex code for zero contribution days)
- `minActivityColor` (hex code for low contribution days)
- `maxActivityColor` (hex code for high contribution days)
- `showLabels` (boolean flag to toggle month listings)
- `labelColor` (hex code for month labels)

---

## Screenshots

<img width="1316" height="1023" alt="image" src="https://github.com/user-attachments/assets/11e89580-922e-4a75-9eef-e196f6c9967f" />

---

## Local Development

To run the application locally, you will need a personal GitHub access token (minimal `read:user` scope).

1. Clone the repository:
   ```bash
   git clone https://github.com/reazndev/github-chart-builder.git
   cd github-chart-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env` and fill in your GITHUB_TOKEN:
   ```bash
   cp .env.example .env
   ```

4. Launch in development mode:
   ```bash
   npm run dev
   ```
   *Runs both Vite and Express concurrently. Open `http://localhost:5173` to view the app.*

---

## Production & Docker Deployment

To build and host using Docker Compose:

1. Copy `.env.example` to `.env` and specify your `GITHUB_TOKEN`.
2. Spin up the container stack:
   ```bash
   docker compose up -d
   ```
   *The container exposes port `8030`, serving both the API endpoints and the optimized built frontend assets.*

---

## Contributing

Originally, the API logic lived in my old portfolio repo, and the frontend served as a separate preview tool. Since then, the two have been merged into this unified repository. 

Feel free to open an issue or submit a pull request if you run into bugs or have layout improvements to share!

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/reazndev">
        <img src="https://github.com/reazndev.png" width="80px" alt="Reazn"/>
        <br /><sub><b>Reazn</b></sub>
        <br /><sub>Author</sub>
        <br /><sub>@reazndev</sub>
      </a>
    </td>
  </tr>
</table>

## License

This project is MIT licensed — see [LICENSE](LICENSE).
