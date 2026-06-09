# Contributing to DK Kart

Thank you for considering contributing to DK Kart! This is an open-source
karting telemetry and setup tracker built for the karting community.

## Ways to contribute

### 1. Sample telemetry files

If you use one of these devices, **please share sample CSV exports**:
- Alfano 6 / 7 / Astro
- RaceChrono Pro
- RaceCapture/Pro
- Unipro Laptimer 7003
- AiM SoloDL, EVO5 (different from MyChron 5)

Submit via GitHub issue with the CSV attached. We use these to improve parsers.
Please anonymize personal data (driver name, etc.) if needed.

### 2. Engine/chassis database

If your engine class is missing from `ENGINE_METADATA`, submit a PR with:
- Engine name (exact label used in racing)
- Stroke (2 or 4)
- Has gearbox (yes/no)
- Front brakes (yes/no)
- Peak power RPM
- Max safe RPM
- Displacement (cm³)
- Approximate HP

### 3. Track data

If you race at a specific track regularly, contributing GPS coordinates of
apex points and ideal racing lines is invaluable.

### 4. Translation

Currently the UI is in Lithuanian. Translations welcome:
- English
- Latvian
- Polish
- Italian (karting heartland)
- Other languages

### 5. Bug reports / feature requests

Open an issue with:
- What you tried
- What happened
- What you expected to happen
- Screenshots if relevant

## Development setup

```bash
git clone https://github.com/YOUR_USERNAME/dk-kart.git
cd dk-kart
npm install
npm run dev
```

Then open http://localhost:5173

## Code style

- Use Lithuanian for user-facing strings (translations welcome)
- Use English for code comments and variable names
- React functional components only
- No external state management library (just useState/useReducer)
- LocalStorage via the `window.storage` wrapper for compatibility

## Telemetry parser contribution guide

Each parser lives in `src/App.jsx`. To add a new format:

1. Add format detector logic to `detectTelemetryFormat()`
2. Create `parseYOURFORMATCSV(text)` function returning standard fields:
   - `bestLap, avgLap, std, lapCount`
   - `topSpeedMax, topSpeedP99`
   - `rpmSustainedStraight, rpmNearTop, pedalEventsPerLap`
   - `waterMin, waterMax, waterAvg, egtAvg, egtMax`
   - `date, time, racer, track`
3. Add case to `parseTelemetryCSV()` dispatcher
4. Submit PR with sample file in `samples/` folder

## Code of conduct

Be respectful. Karting is a small, passionate community. We're all here to
go faster.
