# Chinese Language Flashcards

Chinese Language Flashcards is a lightweight, browser-based tool for practicing Mandarin vocabulary. Each card shows a Chinese phrase with pinyin, English translation, and an image to reinforce memory. Shuffle through the deck, flip cards to check your understanding, and study at your own pace.

## Live Demo
- https://chinese-language-flashcards.web.app

## Features
- **Simple study loop:** Browse through curated flashcards, flip them for translations, and repeat for quick review sessions.
- **Clear visuals:** Each card pairs vocabulary with supportive imagery for stronger recall.
- **Keyboard-friendly:** Use arrow keys to navigate forward/backward and the spacebar to flip cards.
- **Responsive layout:** Optimized for desktop and mobile study sessions.

## Screenshots
Front of a flashcard:

![Flashcard front](./fc1.png)

Back of a flashcard:

![Flashcard back](./fc2.png)

## Tech Stack
- **Frontend:** TypeScript
- **Build tooling:** Vite
- **Styling:** CSS

## Run Locally
**Prerequisites:** Node.js (v18+ recommended) and npm.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the Vite dev server URL shown in the terminal (defaults to http://localhost:5173).

## Available Scripts
- `npm run dev` – Start a hot-reloading development server.
- `npm run build` – Create an optimized production build.
- `npm run preview` – Preview the production build locally.

## Project Structure
- `index.ts` – App entry point and flashcard logic.
- `index.css` – Styling for the flashcard layout and controls.
- `fc1.png`, `fc2.png` – Example front/back flashcard images used in the README.

## Contributing
Issues and pull requests are welcome. Please open an issue to discuss major changes before submitting a PR.
