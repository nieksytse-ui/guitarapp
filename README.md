# 🎸 FretFlow

> Een moderne gitaar-leer & oefen-app — *Duolingo voor gitaar*. Bouw een dagelijkse
> oefenroutine op met XP, streaks en een speelse, motiverende interface.

FretFlow draait volledig in de browser, bewaart je voortgang **lokaal** (IndexedDB,
geen account of backend nodig) en gebruikt een ingebouwde synth (Tone.js) voor al het
geluid. De hele interface is in het **Nederlands**.

---

## ✨ Functies

| Module | Wat je ermee doet |
| --- | --- |
| 🏠 **Dashboard** | Level, XP, dag-streak, oefenkalender (heatmap), prestaties en recente activiteit. |
| 🎵 **Akkoorden** | Blader door 36 akkoorden met **uit data gerenderde** diagrammen (SVGuitar), vingerzetting en geluid. Zoeken & filteren op type/niveau. |
| 🤘 **Strumming-trainer** | Meelopende ↓↑-pijlen, metronoom, 9 patronen + een **eigen-patroon-editor**, instelbaar tempo en maatsoort. |
| 🔁 **Wisseltrainer** | Oefen akkoordwissels tegen de klok (60 s), tel mee met de spatiebalk en zie je records-historie in een grafiek. |
| 📖 **Theorie** | Noten, intervallen, toonladders, akkoordopbouw en kwintencirkel — interactief met fretboard & piano, plus quizzes per stage. |
| 👂 **Gehoortraining** | Herken intervallen en akkoorden puur op gehoor, met oplopende moeilijkheid. |
| 🎼 **Meespelen** | Speel mee met akkoordschema's en een backing-beat; akkoorden lichten op de beat op. Inclusief **eigen liedje invoeren**. |
| 🗂️ **Sessies** | Stel een oefensessie samen uit getimede blokken, laat je leiden door de timer en **bewaar je eigen sjablonen**. |

Alles levert **XP** op, voedt je **streak** en vult de **oefenkalender** — zo blijft oefenen leuk.

---

## 🛠️ Tech-stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** met HSL-thema (licht/donker, indigo/violet + amber)
- **Tone.js** — audio-engine (synth, metronoom, sample-accurate timing via `Tone.Transport`)
- **SVGuitar** — akkoorddiagrammen uit pure data
- **Tonal.js** — muziektheorie-berekeningen
- **Zustand** — state, **idb** — IndexedDB-opslag
- **React Router** (HashRouter, geschikt voor statische hosting)
- **Vitest** + Testing Library — unit-tests

---

## 🚀 Aan de slag

Vereisten: **Node.js 18+** (ontwikkeld op Node 24) en npm.

```bash
# 1. Dependencies installeren
npm install

# 2. Dev-server starten
npm run dev
```

Open vervolgens **http://localhost:5273** in je browser.

> ℹ️ FretFlow draait op een **vaste poort 5273** (`strictPort`), zodat hij niet botst
> met andere Vite-projecten op de standaardpoort 5173 of met gecachte pagina's daarvan.

### Beschikbare scripts

| Script | Doet |
| --- | --- |
| `npm run dev` | Start de dev-server (HMR) op poort 5273. |
| `npm run build` | Type-check (`tsc -b`) + productie-build naar `dist/`. |
| `npm run preview` | Bekijk de productie-build lokaal op poort 5273. |
| `npm test` | Draai de test-suite eenmalig (Vitest). |
| `npm run test:watch` | Tests in watch-modus. |
| `npm run typecheck` | Alleen de TypeScript-typecheck. |

---

## 📂 Projectstructuur

```
src/
├── components/      # UI-primitives (shadcn-stijl) + app-componenten
│   ├── ui/          # button, card, dialog, select, tabs, …
│   ├── layout/      # AppLayout, Sidebar, MobileTopNav
│   ├── chords/      # ChordCard, ChordDetailDialog
│   ├── strumming/   # StrumArrow
│   └── theory/      # Fretboard, PianoKeyboard, CircleOfFifths, Quiz
├── config/          # navigatie-config
├── data/            # akkoorden, strumming-patronen, theorie-stages, liedjes, sessie-sjablonen
├── hooks/           # useAudio, useAward, useStrummingPlayer, useSongPlayer, …
├── lib/             # types, xp-logica, theory (Tonal), audio-engine, IndexedDB
├── pages/           # één pagina per module
├── store/           # Zustand-stores (progress, settings, toast)
└── test/            # test-setup
```

### Data & privacy

Alle voortgang (XP, activiteiten, records, eigen patronen/sessies) wordt **lokaal**
in je browser opgeslagen via IndexedDB. Er is geen server en er worden geen gegevens
verstuurd. Wis de site-data van je browser om opnieuw te beginnen.

### Liedjes & licenties

De ingebouwde liedjes zijn uitsluitend **traditioneel / publiek domein** (o.a.
*Amazing Grace*, *House of the Rising Sun*, *Drunken Sailor*, *Oh! Susanna*). Wil je
met eigen nummers oefenen? Gebruik **Meespelen → Eigen liedje** en voer zelf een
akkoordschema in. De architectuur is bewust modulair, zodat een gelicenseerde
song-bron later toegevoegd kan worden zonder de meespeel-logica te wijzigen.

---

## 🌐 Deployen

De build is een statische site (`dist/`) met relatieve asset-paden (`base: './'`) en
**HashRouter**, dus hij werkt zonder server-side rewrites — ideaal voor GitHub Pages,
Vercel, Netlify of elke statische host.

### GitHub Pages

Er staat een kant-en-klare workflow in `.github/workflows/deploy.yml`. Zet in je repo
**Settings → Pages → Build and deployment → Source** op **GitHub Actions**. Elke push
naar `main` bouwt en publiceert de site automatisch.

### Vercel

Importeer de repo in Vercel. De instellingen in `vercel.json` worden opgepikt
(framework Vite, build `npm run build`, output `dist`). Of lokaal:

```bash
npm i -g vercel
vercel
```

---

## 🧪 Tests

De muziek- en XP-logica is gedekt met unit-tests:

```bash
npm test
```

---

Gemaakt met ❤️ voor gitaristen. Veel speelplezier! 🎶
