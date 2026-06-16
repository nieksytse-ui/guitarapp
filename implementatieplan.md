# Bouw: "FretFlow" — een moderne gitaar-leer & oefen-app

## Doel
Bouw een moderne, gebruiksvriendelijke web-app waarmee iemand thuis gitaar leert spelen en oefent. De app motiveert via XP, streaks en een oefenkalender. De look moet modern, clean en speels zijn (denk Duolingo-meets-muziek-app).

## Tech-stack (verplicht)
- **React 18 + TypeScript + Vite** (snel opstarten)
- **Tailwind CSS + shadcn/ui** voor een strakke, moderne UI met dark/light mode
- **Tone.js** voor alle audio en sample-accurate timing (metronoom, gehoortraining)
- **SVGuitar** voor akkoord-diagrammen (gerenderd als SVG uit data — NOOIT afbeeldingen genereren)
- **Tonal.js** voor muziektheorie-berekeningen (akkoorden, toonladders, intervallen)
- **VexFlow** voor het renderen van bladmuziek/notatie waar nodig
- **IndexedDB** (via een lichte wrapper zoals `idb` of `Dexie`) voor het lokaal opslaan van voortgang, XP, streaks en sessies — geen backend nodig in v1
- State management: lichtgewicht (Zustand) 
- Routing: React Router

## Opstarten (must)
- De hele app moet draaien met: `npm install` en daarna `npm run dev`
- Geen externe API-keys of database nodig om v1 te draaien
- Voeg een duidelijke `README.md` toe met installatie- en startinstructies

## Functionaliteiten

### 1. Strumming-patroon trainer
- Visuele weergave van down/up strokes met pijlen (↓ ↑) die meelopen met de beat
- Instelbaar BPM (slider + numerieke input), maatsoort (4/4, 3/4, 6/8) en patroon
- Een bibliotheek met veelgebruikte strumming-patronen + mogelijkheid om een eigen patroon te maken
- Hoorbare metronoom-klik (accent op tel 1) via Tone.js
- Visuele "playhead" die over het patroon beweegt, gesynchroniseerd met de audio
- Tel-aanduiding (1 & 2 & 3 & 4 &)

### 2. Akkoord-database met visualisatie
- Akkoorden opgeslagen als **data** (JSON), gerenderd met SVGuitar — dus geen afbeeldingen
- Toon per akkoord: de frets, welk **vingernummer** (1–4) op welke snaar, open snaren (O) en gemute snaren (X)
- Zoek/filter op akkoordnaam, type (majeur, mineur, 7, sus, etc.) en moeilijkheidsgraad
- Begin met een ruime set basis- en barré-akkoorden; structuur moet eenvoudig uitbreidbaar zijn
- Optioneel een akkoord beluisteren (Tone.js speelt de noten)

### 3. Akkoordwissel-trainer
- Kies 2+ akkoorden; app toont ze afwisselend met een **60-seconden timer**
- Gebruiker kan na afloop het **aantal succesvolle wissels invoeren** (en dit wordt bewaard in de geschiedenis met grafiek over tijd)
- Toon persoonlijk record per akkoordcombinatie

### 4. Meespelen met nummers
- **v1:** "Bring your own song" — gebruiker voert akkoorden + tempo + structuur in, app laat de akkoorden meelopen met een klik/backing-beat en scrollt mee
- Plus een kleine ingebouwde bibliotheek van **public-domain / Creative Commons** oefenliedjes
- Bouw dit modulair zodat later een gelicenseerde song-bron toegevoegd kan worden
- (GEEN populaire copyrighted nummers/tabs hardcoden)

### 5. Oefensessie-builder
- Gebruiker stelt een sessie samen uit blokken, bijv.: 5 min opwarmen (wissels) → 10 min ritme → 10 min liedje
- Elk blok linkt naar de bijbehorende oefenmodule en heeft een eigen timer
- Voortgang door de sessie heen met een "volgende"-flow
- Mogelijkheid om sessie-templates op te slaan en opnieuw te gebruiken

### 6. Muziektheorie (gefact-checkt!)
- Opgebouwd in stages, van beginner tot gevorderd (bijv. noten op de hals → intervallen → toonladders → akkoordopbouw → toonsoorten/cadensen)
- Duidelijke, interactieve visualisaties (fretboard, pianoklavier, cirkel van kwinten)
- **Alle theorie-content moet correct en gefact-checkt zijn** — gebruik Tonal.js voor berekeningen en verifieer de uitleg
- Korte quizzes per stage

### 7. Gehoortraining
- Herken **intervallen** en **akkoorden** op gehoor (tonen gegenereerd via Tone.js, geen audiobestanden nodig)
- Instelbare moeilijkheid (welke intervallen/akkoordtypes meedoen)
- Directe feedback + score

### 8. XP, streaks & kalender (motivatie!)
- Elke voltooide activiteit geeft **XP** (bepaal een eerlijke verdeling per onderdeel)
- **Streak**-systeem: dagelijks oefenen bouwt een streak op
- **Kalender-/heatmap-weergave** (GitHub-contributions-stijl) die laat zien wat en wanneer je geoefend hebt, per onderdeel
- Levels/badges op basis van XP voor extra motivatie
- Alles lokaal opgeslagen (IndexedDB)

## UX / Design-eisen
- Modern, clean, met afgeronde hoeken, zachte schaduwen en een vrolijk maar rustig kleurenpalet
- Volledig responsive (werkt op telefoon, tablet, desktop)
- Dark mode én light mode
- Toegankelijk (toetsenbordbediening, voldoende contrast, ARIA-labels)
- Soepele animaties (bijv. Framer Motion) waar het de ervaring verbetert
- Een duidelijk dashboard/home met je XP, streak, kalender en snelkoppelingen naar de modules

## Code-kwaliteit
- Nette mappenstructuur, herbruikbare componenten
- TypeScript types voor akkoorden, patronen, sessies en voortgang
- Comments waar logica complex is (vooral audio-timing)
- Een paar basis-tests voor de theorie-/berekeningslogica