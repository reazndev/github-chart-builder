# <p align="center">GitHub Chart Builder</p>
<p align="center">
  <img src="./public/favicon.png" width="100" alt="GitHub Chart Builder Logo">
</p>
<p align="center">
  <strong>Generate customizable SVG contribution charts for your portfolio or README.</strong>
</p>
<p align="center">
  <a href="https://gh.ruu.by"><img src="https://img.shields.io/badge/website-gh.ruu.by-24292f" alt="website" /></a>
  <a href="https://github.com/reazndev/github-chart-builder/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-24292f.svg" alt="license"/></a>
</p>

---

A simple tool to customize your GitHub contribution graph and generate a clean SVG image to embed in your portfolio or profile README. 

## Features

- **Interactive Preview:** Type any GitHub username to see their graph instantly.
- **Custom Themes:** Pick from built-in presets or configure custom Hex colors for active/inactive days.
- **Tweak Everything:** Adjust months (1-12), box sizes, cell spacing, and border radius.
- **Unified & Containerized:** Single React + Node application with simple Docker/Compose setup.

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
