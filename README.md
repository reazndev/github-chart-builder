# <p align="center">GitHub Chart Builder</p>
<p align="center">
  <img src="./public/vite.svg" width="160" alt="GitHub Chart Builder Logo">
</p>
<p align="center">
  <strong>Customize and export a GitHub contributions chart image.</strong> <br>
  Lightweight tool to preview, tweak colors/layout, and generate a sharable URL or image to use on your own website :)
</p>
<p align="center">
  <a href="https://github.com/reazndev/github-chart-builder"><img src="https://img.shields.io/badge/repo-reazndev%2Fgithub--chart--builder-24292f" alt="repo" /></a>
  <a href="https://github.com/reazndev/github-chart-builder/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build"/></a>
  <a href="https://github.com/reazndev/github-chart-builder/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-24292f.svg" alt="license"/></a>
</p>

---

## 🚀 Features

- Live preview of a GitHub contributions chart (by username)
- Export a generated URL you can share or embed
- Preset color themes and fine-grained color controls
- Controls for months, box size, spacing, and border radius
- Minimal, responsive UI with copy-to-clipboard and quick export

## ⚙️ Configurable options

Most options are available in the UI. Key fields you can change:

- Username (GitHub handle) - which user to preview
- Timeframe (1-12 months),
- _box size (bit buggy, use default setting)_
- _spacing (bit buggy, use default setting)_
- border radius
- Colors:
  - inactive
  - min/max activity
  - label color

The app constructs a shareable URL with the options encoded as query params.

## 📸 Screenshots

<img width="1316" height="1023" alt="image" src="https://github.com/user-attachments/assets/11e89580-922e-4a75-9eef-e196f6c9967f" />



## 🤝 Contributing

The backend API that powers this tool is in a separate repository: [my old portfolio](https://github.com/reazndev/Portfolio-v2/blob/master/gh-contributions.js). I wrote it a while ago and recently revisited it, realizing the tool might be useful to others. This frontend is a simple interface I built to make it easy to preview and share charts.

At the moment, there’s not much to contribute, but feedback, bug reports, or ideas for improvements are always welcome!

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/reazndev">
        <img src="https://github.com/reazndev.png" width="80px" alt="Reazn"/>
        <br /><sub><b>Reazn</b></sub>
        <br /><sub>Author</sub>
      </a>
    </td>
</table>

## 📄 License

This project is MIT licensed — see [LICENSE](LICENSE).
