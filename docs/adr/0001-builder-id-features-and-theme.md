# 1. Builder ID Features and Theme Preservation

* **Status:** Accepted
* **Context:** Analyzed `https://hhgoa26-id.vercel.app/` which provides Front/Back card flipping, PFP frame mode, interactive photo controls, quick role pills, and multi-option HD downloads.
* **Decision:** Adopt all core features from the reference app (PFP Frame toggle, 2-sided card preview, combined side-by-side HD download, quick role pills), while strictly preserving our Dark Tropical Palm baseline aesthetic (forest green background, Devanagari logo badge, Playfair Display typography, and ticket stub layout).
* **Consequences:** The HTML5 Canvas graphics engine in `main.js` will support dual-surface rendering (Front and Back card views) and a 1:1 PFP Frame mode.
