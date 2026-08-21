# Starbucks Clone (Simple React App)

A small React app that copies the look of a Starbucks-style homepage.
Built with Vite + React + Tailwind CSS, and written in simple, well-commented code.

## How it's organized

```
starbucks-app/
├── index.html          <- the single HTML page
├── package.json        <- list of tools the app needs
├── vite.config.js       <- Vite (dev server) settings
├── tailwind.config.js   <- Tailwind CSS settings
├── postcss.config.js    <- needed for Tailwind to work
└── src/
    ├── main.jsx          <- starts up React
    ├── index.css         <- loads Tailwind styles
    └── App.jsx            <- the actual page (all sections)
```

Everything the page shows lives in `src/App.jsx`, split into small
functions so it's easy to read:

- `TopBar` – logo, menu links, search box, profile icon
- `SignInStrip` – the dark green "Earn Stars" bar
- `HeroBanner` – the big "New this season" box with arrows and Buy Now button
- `Curations` – the row of round category circles at the bottom
- `App` – puts all the pieces together into one page

## How to run it on your computer

You need [Node.js](https://nodejs.org) installed first (version 18 or newer).

1. Open a terminal in this folder.
2. Install the tools the app needs:
   ```
   npm install
   ```
3. Start the app:
   ```
   npm run dev
   ```
4. Open the link it shows you (usually `http://localhost:5173`) in your browser.

That's it — you should see the page!

## Notes

- The category pictures are colored circles for now (no real photos included).
  You can swap them for real images by putting an `<img>` tag inside the circle `div`
  in the `Curations` part of `App.jsx`.
- All the visual styling is done with Tailwind CSS class names directly in the JSX,
  so you won't find separate `.css` files for each section.
