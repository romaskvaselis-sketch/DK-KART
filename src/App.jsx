import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) { try { const v = localStorage.getItem(key); return v !== null ? {key, value:v} : null; } catch { return null; } },
    async set(key, value) { try { localStorage.setItem(key, value); return {key, value}; } catch (e) { throw e; } },
    async delete(key) { try { localStorage.removeItem(key); return {key, deleted:true}; } catch { return null; } },
    async list(prefix) { const keys=[]; for (let i=0;i<localStorage.length;i++) { const k=localStorage.key(i); if (!prefix||k.startsWith(prefix)) keys.push(k); } return {keys, prefix}; },
  };
}


// ============================================================
// BASELINE: vakar dienos 5 sesijos (2026-05-21)
// ============================================================
const TODAY = new Date().toISOString().slice(0, 10);

// Dates (relative to start of project)
const D1 = "2026-05-21"; // First training - testing jets
const D2 = "2026-05-22"; // Breakthrough day - sub-40 first time
const D3 = "2026-05-23"; // Race day - consistent sub-40

const BASELINE_SESSIONS = [
  // ===== DAY 1: 2026-05-21 — JET TESTING (gear 12/76, needle 3) =====
  { id: "d1_s1", date: D1, time: "11:32", track: "Anykščiai", driver: "Dovydas",
    airTemp: 14, pressure: 1020, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "naudotos (varžybos)", 
    cold_F: 0.85, cold_R: 0.80, hot_F: 1.15, hot_R: 1.20,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "netikrintas", camber: -2,
    gear_F: 12, gear_R: 76, mainJet: 127, needle: 3, airScrew: "atsuktas",
    bestLap: 41.754, avgLap: 42.21, std: 0.41, lapCount: 15,
    waterMin: 41.1, waterMax: 59.8, waterAvg: 50.8, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 12777, rpmNearTop: 12981, pedalEventsPerLap: null,
    topSpeedP99: 101.3, topSpeedMax: 105.8,
    notes: "Jet 127 — per liesas, variklis užsikemšą.", weight: 162 },
  { id: "d1_s2", date: D1, time: "12:29", track: "Anykščiai", driver: "Dovydas",
    airTemp: 16, pressure: 1020, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "naujos",
    cold_F: 0.70, cold_R: 0.70, hot_F: 1.00, hot_R: 1.00,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "netikrintas", camber: -2,
    gear_F: 12, gear_R: 76, mainJet: 130, needle: 3, airScrew: "atsuktas",
    bestLap: 41.160, avgLap: 41.87, std: 0.70, lapCount: 21,
    waterMin: 29.3, waterMax: 52.9, waterAvg: 49.3, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13218, rpmNearTop: 13716, pedalEventsPerLap: null,
    topSpeedP99: 107.6, topSpeedMax: 112.3,
    notes: "Jet 130 — geresnis. Variklis pradėjo dirbti.", weight: 162 },
  { id: "d1_s3", date: D1, time: "13:29", track: "Anykščiai", driver: "Dovydas",
    airTemp: 20, pressure: 1020, humidity: null, weather: "Lengvas lietus", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "naujos",
    cold_F: 0.70, cold_R: 0.70, hot_F: 1.00, hot_R: 1.00,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "netikrintas", camber: -2,
    gear_F: 12, gear_R: 76, mainJet: 133, needle: 3, airScrew: "atsuktas",
    bestLap: 40.849, avgLap: 41.70, std: 0.78, lapCount: 22,
    waterMin: 31.0, waterMax: 52.2, waterAvg: 47.3, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13250, rpmNearTop: 13453, pedalEventsPerLap: null,
    topSpeedP99: 104.6, topSpeedMax: 111.0,
    notes: "🏁 D1 GERIAUSIAS. Jet 133 sweet spot 20°C ore.", weight: 155 },
  { id: "d1_s4", date: D1, time: "14:29", track: "Anykščiai", driver: "Dovydas",
    airTemp: 20, pressure: 1020, humidity: null, weather: "Lengvas lietus", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "perverstos",
    cold_F: 0.70, cold_R: 0.60, hot_F: 1.00, hot_R: 0.85,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "netikrintas", camber: -2,
    gear_F: 12, gear_R: 76, mainJet: 135, needle: 3, airScrew: "atsuktas",
    bestLap: 40.883, avgLap: 41.78, std: 0.65, lapCount: 22,
    waterMin: 32.5, waterMax: 49.8, waterAvg: 46.6, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13341, rpmNearTop: 13616, pedalEventsPerLap: null,
    topSpeedP99: 105.4, topSpeedMax: 111.3,
    notes: "Padangos perverstos. Jet 135.", weight: 155 },
  { id: "d1_s5", date: D1, time: "15:29", track: "Anykščiai", driver: "Dovydas",
    airTemp: 19, pressure: 1020, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "sudilusios",
    cold_F: 0.70, cold_R: 0.60, hot_F: 1.00, hot_R: 0.85,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "netikrintas", camber: -2,
    gear_F: 12, gear_R: 76, mainJet: 138, needle: 3, airScrew: "atsuktas",
    bestLap: 40.937, avgLap: 41.15, std: 0.16, lapCount: 14,
    waterMin: 30.5, waterMax: 49.8, waterAvg: 45.8, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13728, rpmNearTop: 13684, pedalEventsPerLap: null,
    topSpeedP99: 107.2, topSpeedMax: 115.1,
    notes: "Konsistencija idealu. Jet 138 - vairuotojas jaučia per riebų.", weight: 155 },
  
  // ===== DAY 2: 2026-05-22 — BREAKTHROUGH (chassis change + gear progression) =====
  { id: "d2_s1", date: D2, time: "09:31", track: "Anykščiai", driver: "Dovydas",
    airTemp: 13, pressure: 1020, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "used (2-3 train.)",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 76, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 40.776, avgLap: 41.20, std: 0.35, lapCount: 14,
    waterMin: 28.5, waterMax: 52.1, waterAvg: 45.2, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 12500, rpmNearTop: 13200, pedalEventsPerLap: null,
    topSpeedP99: 109.0, topSpeedMax: 113.5,
    notes: "Rytinis šasi pakeitimas: camber -2→-1, toe 0→+1mm. Adata pozicija 2 (riebesnis posūkiuose).", weight: 162 },
  { id: "d2_s2", date: D2, time: "11:05", track: "Anykščiai", driver: "Dovydas",
    airTemp: 16, pressure: 1020, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "used",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 75, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 40.092, avgLap: 40.95, std: 0.55, lapCount: 16,
    waterMin: 30.1, waterMax: 51.8, waterAvg: 47.8, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 12950, rpmNearTop: 13520, pedalEventsPerLap: null,
    topSpeedP99: 109.5, topSpeedMax: 113.8,
    notes: "Gear 76→75. Pirmas didelis šuolis: -0.68s. Posūkių išvažiavimas geresnis.", weight: 162 },
  { id: "d2_s3", date: D2, time: "13:29", track: "Anykščiai", driver: "Dovydas",
    airTemp: 19, pressure: 1019, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Mojo D5", tireAge: "used",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 75, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 40.265, avgLap: 40.99, std: 0.48, lapCount: 17,
    waterMin: 35.2, waterMax: 52.5, waterAvg: 48.5, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13020, rpmNearTop: 13320, pedalEventsPerLap: null,
    topSpeedP99: 108.8, topSpeedMax: 112.5,
    notes: "Konsistencija auga.", weight: 155 },
  { id: "d2_s6", date: D2, time: "15:54", track: "Anykščiai", driver: "Dovydas",
    airTemp: 20, pressure: 1018, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Vega Whites", tireAge: "NEW",
    cold_F: 0.65, cold_R: 0.60, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.686, avgLap: 39.836, std: 0.115, lapCount: 3,
    waterMin: 49.8, waterMax: 53.1, waterAvg: 51.5, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 12471, rpmNearTop: 13832, pedalEventsPerLap: null,
    topSpeedP99: 110.3, topSpeedMax: 113.3,
    notes: "🏆 BREAKTHROUGH SUB-40! 3 sub-40 ratai (39.965, 39.858, 39.686). Naujos Vega Whites + gear 74. Vairuotojas pataikė tikslą ir sustojo push'inti.", weight: 155 },
  
  // ===== DAY 3: 2026-05-23 — RACE DAY (vietinės varžybos) =====
  { id: "d3_s1", date: D3, time: "09:45", track: "Anykščiai (varžybos)", driver: "Dovydas",
    airTemp: 14, pressure: 1019, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Vega Whites", tireAge: "naujos",
    cold_F: 0.63, cold_R: 0.57, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.622, avgLap: 40.42, std: 0.715, lapCount: 7,
    waterMin: 17.1, waterMax: 51.4, waterAvg: 41.6, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13380, rpmNearTop: 13646, pedalEventsPerLap: 76,
    topSpeedP99: 110.8, topSpeedMax: 113.4,
    notes: "Apšildymas/quali. Tikslas pasiektas — sub-40 jau pirmoje sesijoje. Padangos atramine desine 0.57, kaire 0.62.", weight: 155 },
  { id: "d3_s2", date: D3, time: "12:16", track: "Anykščiai (varžybos)", driver: "Dovydas",
    airTemp: 18, pressure: 1019, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Vega Whites", tireAge: "1 sesija",
    cold_F: 0.63, cold_R: 0.57, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.611, avgLap: 39.95, std: 0.395, lapCount: 12,
    waterMin: 21.1, waterMax: 51.7, waterAvg: 43.4, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13420, rpmNearTop: 13536, pedalEventsPerLap: 76,
    topSpeedP99: 110.5, topSpeedMax: 113.2,
    notes: "Finalas A. 9 sub-40 iš 12 ratų.", weight: 155 },
  { id: "d3_s3", date: D3, time: "14:31", track: "Anykščiai (varžybos)", driver: "Dovydas",
    airTemp: 20, pressure: 1018, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Vega Whites", tireAge: "2 sesijos",
    cold_F: 0.63, cold_R: 0.57, hot_F: 0.80, hot_R: 0.80,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.598, avgLap: 40.10, std: 0.42, lapCount: 10,
    waterMin: 25.9, waterMax: 54.3, waterAvg: 47.8, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13580, rpmNearTop: 13838, pedalEventsPerLap: 74,
    topSpeedP99: 111.5, topSpeedMax: 116.0,
    notes: "🏆 VARŽYBŲ GERIAUSIAS. Dieninė lenktynė.", weight: 155 },
  { id: "d3_s4", date: D3, time: "16:53", track: "Anykščiai (varžybos)", driver: "Dovydas",
    airTemp: 19, pressure: 1018, humidity: null, weather: "Sausa", trackTemp: null,
    tireBrand: "Vega Whites", tireAge: "3 sesijos",
    cold_F: 0.63, cold_R: 0.52, hot_F: 0.80, hot_R: 0.77,
    chassisAxle: "N", caster: 0, trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: null, torsion: null, toe: "+1mm", camber: -1,
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.625, avgLap: 40.07, std: 0.445, lapCount: 23,
    waterMin: 25.6, waterMax: 54.6, waterAvg: 49.7, egtMax: null, egtAvg: null,
    rpmSustainedStraight: 13510, rpmNearTop: 13719, pedalEventsPerLap: 75,
    topSpeedP99: 111.2, topSpeedMax: 114.8,
    notes: "Long stint 23 ratai. 18 sub-40 — geriausia konsistencija. Slėgis galui nuleistas dėl ilgesnės sesijos.", weight: 155 },
];

// ============================================================
// REKOMENDACIJŲ VARIKLIS
// ============================================================

// ============================================================
// MyChron CSV PARSER (AiM / Race Studio 3 / LapSnap format)
// ============================================================

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) { result.push(current); current = ""; }
    else current += c;
  }
  result.push(current);
  return result.map(s => s.trim());
}

function parseAiMTime(str) {
  // "11:32 AM" -> "11:32", "1:29 PM" -> "13:29"
  if (!str) return "";
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return "";
  let h = parseInt(m[1]);
  const mn = m[2];
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mn}`;
}

function parseAiMDate(str) {
  // "Thursday, May 21, 2026" -> "2026-05-21"
  if (!str) return "";
  const months = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
  const m = str.match(/(\w+)\s+(\d+),\s+(\d+)/);
  if (!m) return "";
  const mo = months[m[1]];
  if (!mo) return "";
  return `${m[3]}-${String(mo).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
}

// ============================================================
// UNIVERSAL TELEMETRY CSV PARSER
// Supports: AiM MyChron, Alfano, RaceChrono, RaceCapture, Unipro
// ============================================================

/**
 * Detect telemetry CSV format from file content.
 * Returns: 'aim' | 'alfano' | 'racechrono' | 'racecapture' | 'unipro' | 'generic'
 */
function detectTelemetryFormat(text) {
  const firstChunk = text.substring(0, 4000).toLowerCase();
  
  // AiM Race Studio CSV (MyChron, SoloDL, EVO)
  if (firstChunk.includes('"format"') && firstChunk.includes('aim')) return 'aim';
  if (firstChunk.includes('beacon markers') && firstChunk.includes('segment times')) return 'aim';
  
  // Alfano
  if (firstChunk.includes('alfano') || firstChunk.includes('visor')) return 'alfano';
  if (firstChunk.includes('"#kart_id"') || firstChunk.includes('"lap";"sector"')) return 'alfano';
  
  // RaceChrono
  if (firstChunk.includes('racechrono')) return 'racechrono';
  if (firstChunk.includes('# session created') && firstChunk.includes('utc time')) return 'racechrono';
  
  // RaceCapture
  if (firstChunk.includes('racecapture') || firstChunk.includes('autosport labs')) return 'racecapture';
  if (firstChunk.includes('"interval"') && firstChunk.includes('"utc"') && firstChunk.includes('"latitude"')) return 'racecapture';
  
  // Unipro
  if (firstChunk.includes('unipro') || firstChunk.includes('laptimer 7003')) return 'unipro';
  
  return 'generic';
}

/**
 * Universal parser dispatcher — calls correct parser based on format.
 */
function parseTelemetryCSV(text, formatHint = null) {
  const format = formatHint || detectTelemetryFormat(text);
  
  switch (format) {
    case 'aim': return { ...parseAiMCSV(text), _format: 'AiM MyChron' };
    case 'alfano': return { ...parseAlfanoCSV(text), _format: 'Alfano' };
    case 'racechrono': return { ...parseRaceChronoCSV(text), _format: 'RaceChrono' };
    case 'racecapture': return { ...parseRaceCaptureCSV(text), _format: 'RaceCapture' };
    case 'unipro': return { ...parseUniproCSV(text), _format: 'Unipro' };
    default:
      // Try AiM as default (most common); fall back to generic
      try {
        return { ...parseAiMCSV(text), _format: 'Generic (auto-AiM)' };
      } catch (e) {
        return { ...parseGenericCSV(text), _format: 'Generic' };
      }
  }
}

/**
 * Alfano CSV parser.
 * Format: ";" separator (European), columns vary by Alfano version.
 * Typical columns: Lap, Sector, Time, Speed, RPM, T1 (water), T2, GPS
 */
function parseAlfanoCSV(text) {
  const lines = text.split(/\r?\n/);
  const meta = { format: 'alfano' };
  let lapTimes = [];
  let dataStart = -1;
  let columns = [];
  const sep = text.includes(';') ? ';' : ',';
  
  // Find header row (look for "Lap" or "Time" column)
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('lap') && (lower.includes('time') || lower.includes('temps'))) {
      columns = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
      dataStart = i + 1;
      break;
    }
    // Capture metadata (Kart, Driver, Track)
    const parts = lines[i].split(sep);
    if (parts.length === 2) {
      const k = parts[0].trim().toLowerCase().replace(/[":]/g, '');
      const v = parts[1].trim().replace(/[":]/g, '');
      if (k === 'pilote' || k === 'driver' || k === 'racer') meta.racer = v;
      if (k === 'date') meta.date = v;
      if (k === 'circuit' || k === 'track') meta.session = v;
      if (k === 'kart' || k === 'chassis') meta.kart = v;
    }
  }
  
  if (dataStart < 0) throw new Error("Alfano CSV: nepavyko rasti duomenų antraštės");
  
  // Find column indices
  const findCol = (...names) => {
    for (const n of names) {
      const idx = columns.findIndex(c => c.toLowerCase().includes(n.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  const iLap = findCol('lap', 'tour');
  const iTime = findCol('time', 'temps');
  const iSpeed = findCol('speed', 'vitesse');
  const iRpm = findCol('rpm', 'tour/min');
  const iTemp1 = findCol('t1', 'temp1', 'water');
  const iTemp2 = findCol('t2', 'temp2', 'egt');
  
  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(sep);
    if (parts.length < 2) continue;
    rows.push(parts.map(p => parseFloat(p.replace(',', '.'))));
  }
  
  // Extract lap times — assume one row per lap with lap time in time column
  // (some Alfano exports give per-lap summary, others give samples)
  const lapTimesSet = new Set();
  const samples = [];
  let lastLap = -1;
  for (const row of rows) {
    if (iLap >= 0) {
      const lap = row[iLap];
      const t = iTime >= 0 ? row[iTime] : null;
      if (!isNaN(lap) && t !== null && !isNaN(t) && t > 25 && t < 90 && lap !== lastLap) {
        lapTimesSet.add(t);
        lastLap = lap;
      }
    }
    samples.push(row);
  }
  lapTimes = Array.from(lapTimesSet);
  
  // Stats
  const cleanLaps = lapTimes.filter(t => t < (Math.min(...lapTimes) * 1.10));
  const bestLap = cleanLaps.length ? Math.min(...cleanLaps) : null;
  const avgLap = cleanLaps.length ? cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length : null;
  const stdLap = cleanLaps.length > 1 ? Math.sqrt(cleanLaps.reduce((s, t) => s + (t - avgLap) ** 2, 0) / cleanLaps.length) : null;
  
  // Top speed and RPM
  let topSpeed = null, topP99 = null, sustainedMax = 0;
  if (iSpeed >= 0) {
    const speeds = samples.map(r => r[iSpeed]).filter(v => !isNaN(v) && v > 0);
    if (speeds.length) {
      topSpeed = Math.max(...speeds);
      const sorted = [...speeds].sort((a, b) => a - b);
      topP99 = sorted[Math.floor(sorted.length * 0.99)];
    }
  }
  
  // Water temp
  let waterMin = null, waterMax = null, waterAvg = null;
  if (iTemp1 >= 0) {
    const temps = samples.map(r => r[iTemp1]).filter(v => !isNaN(v) && v > 0 && v < 200);
    if (temps.length) {
      waterMin = Math.min(...temps);
      waterMax = Math.max(...temps);
      waterAvg = temps.reduce((a, b) => a + b, 0) / temps.length;
    }
  }
  
  // EGT (Temp 2)
  let egtAvg = null, egtMax = null;
  if (iTemp2 >= 0) {
    const egts = samples.map(r => r[iTemp2]).filter(v => !isNaN(v) && v > 200);
    if (egts.length) {
      egtMax = Math.max(...egts);
      egtAvg = egts.reduce((a, b) => a + b, 0) / egts.length;
    }
  }
  
  return {
    date: meta.date || "",
    time: "",
    racer: meta.racer || "",
    track: meta.session || "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: stdLap ? Math.round(stdLap * 100) / 100 : null,
    lapCount: cleanLaps.length,
    topSpeedMax: topSpeed ? Math.round(topSpeed * 10) / 10 : null,
    topSpeedP99: topP99 ? Math.round(topP99 * 10) / 10 : null,
    rpmSustainedStraight: null,
    rpmNearTop: null,
    pedalEventsPerLap: null,
    waterMin: waterMin !== null ? Math.round(waterMin * 10) / 10 : null,
    waterMax: waterMax !== null ? Math.round(waterMax * 10) / 10 : null,
    waterAvg: waterAvg !== null ? Math.round(waterAvg * 10) / 10 : null,
    egtAvg: egtAvg !== null ? Math.round(egtAvg) : null,
    egtMax: egtMax !== null ? Math.round(egtMax) : null,
  };
}

/**
 * RaceChrono CSV parser (mobile app, iOS/Android).
 * Format: "# Session" comment header, then CSV with columns including:
 * UTC Time, Speed (km/h), Latitude, Longitude, Lap, etc.
 */
function parseRaceChronoCSV(text) {
  const lines = text.split(/\r?\n/);
  const meta = { format: 'racechrono' };
  let dataStart = -1;
  let columns = [];
  
  // Parse header comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      const m = line.match(/^#\s*(\w[\w ]+)[:\s]+(.*)$/);
      if (m) {
        const k = m[1].trim().toLowerCase();
        const v = m[2].trim();
        if (k.includes('session created')) meta.date = v.substring(0, 10);
        if (k.includes('driver')) meta.racer = v;
        if (k.includes('venue') || k.includes('track')) meta.session = v;
      }
      continue;
    }
    // Found column header (not starting with #)
    if (line && (line.toLowerCase().includes('time') || line.toLowerCase().includes('speed'))) {
      columns = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      dataStart = i + 1;
      break;
    }
  }
  
  if (dataStart < 0) throw new Error("RaceChrono CSV: nepavyko rasti header");
  
  const findCol = (...names) => {
    for (const n of names) {
      const idx = columns.findIndex(c => c.toLowerCase().includes(n.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  
  const iLap = findCol('lap');
  const iLapTime = findCol('lap time', 'lapTime');
  const iSpeed = findCol('speed (km/h)', 'speed (kph)', 'speed');
  const iDist = findCol('distance (m)', 'distance');
  
  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(',').map(p => parseFloat(p));
    if (parts.length < 3) continue;
    rows.push(parts);
  }
  
  // Extract lap times — find unique lap numbers and their durations
  const lapTimesMap = {};
  for (const row of rows) {
    if (iLap >= 0 && iLapTime >= 0) {
      const lap = Math.floor(row[iLap]);
      const t = row[iLapTime];
      if (!isNaN(lap) && !isNaN(t) && t > 25 && t < 120) {
        if (!lapTimesMap[lap] || t > lapTimesMap[lap]) lapTimesMap[lap] = t;
      }
    }
  }
  const lapTimes = Object.values(lapTimesMap);
  
  const cleanLaps = lapTimes.filter(t => t < (Math.min(...lapTimes, Infinity) * 1.10));
  const bestLap = cleanLaps.length ? Math.min(...cleanLaps) : null;
  const avgLap = cleanLaps.length ? cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length : null;
  const stdLap = cleanLaps.length > 1 ? Math.sqrt(cleanLaps.reduce((s, t) => s + (t - avgLap) ** 2, 0) / cleanLaps.length) : null;
  
  let topSpeed = null, topP99 = null;
  if (iSpeed >= 0) {
    const speeds = rows.map(r => r[iSpeed]).filter(v => !isNaN(v) && v > 0);
    if (speeds.length) {
      topSpeed = Math.max(...speeds);
      const sorted = [...speeds].sort((a, b) => a - b);
      topP99 = sorted[Math.floor(sorted.length * 0.99)];
    }
  }
  
  return {
    date: meta.date || "",
    time: "",
    racer: meta.racer || "",
    track: meta.session || "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: stdLap ? Math.round(stdLap * 100) / 100 : null,
    lapCount: cleanLaps.length,
    topSpeedMax: topSpeed ? Math.round(topSpeed * 10) / 10 : null,
    topSpeedP99: topP99 ? Math.round(topP99 * 10) / 10 : null,
    rpmSustainedStraight: null,
    rpmNearTop: null,
    pedalEventsPerLap: null,
    waterMin: null, waterMax: null, waterAvg: null,
    egtAvg: null, egtMax: null,
  };
}

/**
 * RaceCapture CSV parser.
 * Format: CSV with "Interval", "Utc", "Latitude", "Longitude", "Speed", "RPM", etc.
 */
function parseRaceCaptureCSV(text) {
  const lines = text.split(/\r?\n/);
  const meta = { format: 'racecapture' };
  let dataStart = -1;
  let columns = [];
  
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('"interval"') || lower.includes('"utc"')) {
      columns = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      dataStart = i + 1;
      break;
    }
  }
  
  if (dataStart < 0) throw new Error("RaceCapture CSV: nepavyko rasti header");
  
  const findCol = (...names) => {
    for (const n of names) {
      const idx = columns.findIndex(c => c.toLowerCase() === n.toLowerCase());
      if (idx >= 0) return idx;
    }
    return -1;
  };
  
  const iLap = findCol('lapcount', 'lap');
  const iLapTime = findCol('laptime');
  const iSpeed = findCol('speed');
  const iRpm = findCol('rpm');
  
  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => parseFloat(p.replace(/"/g, '')));
    if (parts.length < 5) continue;
    rows.push(parts);
  }
  
  // Lap times — find max lap time per lap number
  const lapTimesMap = {};
  for (const row of rows) {
    if (iLap >= 0 && iLapTime >= 0) {
      const lap = Math.floor(row[iLap]);
      const t = row[iLapTime];
      if (!isNaN(lap) && !isNaN(t) && t > 25 && t < 120) {
        if (!lapTimesMap[lap] || t > lapTimesMap[lap]) lapTimesMap[lap] = t;
      }
    }
  }
  const lapTimes = Object.values(lapTimesMap);
  
  const cleanLaps = lapTimes.filter(t => t < (Math.min(...lapTimes, Infinity) * 1.10));
  const bestLap = cleanLaps.length ? Math.min(...cleanLaps) : null;
  const avgLap = cleanLaps.length ? cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length : null;
  
  let topSpeed = null;
  if (iSpeed >= 0) {
    const speeds = rows.map(r => r[iSpeed]).filter(v => !isNaN(v) && v > 0);
    if (speeds.length) topSpeed = Math.max(...speeds);
  }
  
  return {
    date: "", time: "",
    racer: "", track: "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: null,
    lapCount: cleanLaps.length,
    topSpeedMax: topSpeed ? Math.round(topSpeed * 10) / 10 : null,
    topSpeedP99: null,
    rpmSustainedStraight: null,
    rpmNearTop: null,
    pedalEventsPerLap: null,
    waterMin: null, waterMax: null, waterAvg: null,
    egtAvg: null, egtMax: null,
  };
}

/**
 * Unipro Laptimer 7003 CSV parser.
 * Format: tab or comma-separated, typically lap-by-lap summary.
 */
function parseUniproCSV(text) {
  const lines = text.split(/\r?\n/);
  const meta = { format: 'unipro' };
  const sep = text.split('\n')[0].includes('\t') ? '\t' : ',';
  
  let dataStart = -1;
  let columns = [];
  
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('lap') && lower.includes('time')) {
      columns = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
      dataStart = i + 1;
      break;
    }
  }
  
  if (dataStart < 0) throw new Error("Unipro CSV: nepavyko rasti header");
  
  const findCol = (...names) => {
    for (const n of names) {
      const idx = columns.findIndex(c => c.toLowerCase().includes(n.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  
  const iTime = findCol('time', 'lap time');
  
  const lapTimes = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(sep);
    if (iTime >= 0 && parts[iTime]) {
      const t = parseFloat(parts[iTime].replace(',', '.'));
      if (!isNaN(t) && t > 25 && t < 120) lapTimes.push(t);
    }
  }
  
  const cleanLaps = lapTimes.filter(t => t < (Math.min(...lapTimes, Infinity) * 1.10));
  const bestLap = cleanLaps.length ? Math.min(...cleanLaps) : null;
  const avgLap = cleanLaps.length ? cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length : null;
  
  return {
    date: "", time: "", racer: "", track: "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: null,
    lapCount: cleanLaps.length,
    topSpeedMax: null, topSpeedP99: null,
    rpmSustainedStraight: null, rpmNearTop: null,
    pedalEventsPerLap: null,
    waterMin: null, waterMax: null, waterAvg: null,
    egtAvg: null, egtMax: null,
  };
}

/**
 * Generic CSV fallback — just tries to find any column called "lap" and "time".
 */
function parseGenericCSV(text) {
  const lines = text.split(/\r?\n/);
  const sep = text.includes('\t') ? '\t' : (text.includes(';') ? ';' : ',');
  
  // Find header
  let dataStart = -1;
  let columns = [];
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('lap') && lower.includes('time')) {
      columns = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
      dataStart = i + 1;
      break;
    }
  }
  
  if (dataStart < 0) {
    // No structured header found — return minimal
    return {
      date: "", time: "", racer: "", track: "",
      bestLap: null, avgLap: null, std: null, lapCount: 0,
      topSpeedMax: null, topSpeedP99: null,
      rpmSustainedStraight: null, rpmNearTop: null,
      pedalEventsPerLap: null,
      waterMin: null, waterMax: null, waterAvg: null,
      egtAvg: null, egtMax: null,
    };
  }
  
  const findCol = (...names) => {
    for (const n of names) {
      const idx = columns.findIndex(c => c.toLowerCase().includes(n.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  
  const iLapTime = findCol('lap time', 'laptime', 'time');
  
  const lapTimes = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(sep);
    if (iLapTime >= 0 && parts[iLapTime]) {
      const t = parseFloat(parts[iLapTime].replace(',', '.'));
      if (!isNaN(t) && t > 25 && t < 120) lapTimes.push(t);
    }
  }
  
  const cleanLaps = lapTimes.filter(t => t < (Math.min(...lapTimes, Infinity) * 1.10));
  const bestLap = cleanLaps.length ? Math.min(...cleanLaps) : null;
  const avgLap = cleanLaps.length ? cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length : null;
  
  return {
    date: "", time: "", racer: "", track: "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: null,
    lapCount: cleanLaps.length,
    topSpeedMax: null, topSpeedP99: null,
    rpmSustainedStraight: null, rpmNearTop: null,
    pedalEventsPerLap: null,
    waterMin: null, waterMax: null, waterAvg: null,
    egtAvg: null, egtMax: null,
  };
}

function parseAiMCSV(text) {
  const lines = text.split(/\r?\n/);
  const meta = {};
  let segmentTimes = [];
  let dataStart = -1;
  let columns = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('"Time","GPS Speed"') || line.startsWith("Time,GPS Speed") || line.startsWith('"Xtime"')) {
      dataStart = i;
      columns = parseCSVLine(line);
      break;
    }
    const parts = parseCSVLine(line);
    if (parts.length < 2) continue;
    const key = parts[0];
    if (key === "Session") meta.session = parts[1];
    else if (key === "Vehicle") meta.vehicle = parts[1];
    else if (key === "Racer") meta.racer = parts[1];
    else if (key === "Date") meta.date = parts[1];
    else if (key === "Time") meta.time = parts[1];
    else if (key === "Sample Rate") meta.sampleRate = parseFloat(parts[1]);
    else if (key === "Duration") meta.duration = parseFloat(parts[1]);
    else if (key === "Comment") meta.comment = parts[1];
    else if (key === "Segment Times") {
      segmentTimes = parts.slice(1).map(p => {
        const m = p.match(/(\d+):([\d.]+)/);
        return m ? parseInt(m[1]) * 60 + parseFloat(m[2]) : null;
      }).filter(x => x !== null);
    }
  }
  if (dataStart < 0) throw new Error("Nesurado duomenų skyriaus CSV faile.");

  const ci = {};
  columns.forEach((c, i) => { ci[c] = i; });

  const rows = [];
  // Skip header + units row
  for (let i = dataStart + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = parseCSVLine(line);
    if (parts.length < 3) continue;
    rows.push(parts.map(p => parseFloat(p)));
  }

  return { meta, segmentTimes, columns, ci, rows };
}

function analyzeAiMData(parsed) {
  const { meta, segmentTimes, ci, rows } = parsed;
  
  // Lap times analysis - first cut: realistic karting range
  const allLaps = segmentTimes.filter(t => t > 25 && t < 120);
  // Tight filter: exclude out lap (much slower) and in lap (much faster, partial)
  let cleanLaps = [];
  if (allLaps.length > 0) {
    const minTime = Math.min(...allLaps);
    // Within 110% of best (filters out lap) and >90% of best (filters in-lap partial)
    cleanLaps = allLaps.filter(t => t >= minTime * 0.90 && t <= minTime * 1.10);
  }
  let bestLap = null, avgLap = null, stdLap = null;
  if (cleanLaps.length > 0) {
    bestLap = Math.min(...cleanLaps);
    avgLap = cleanLaps.reduce((a, b) => a + b, 0) / cleanLaps.length;
    stdLap = Math.sqrt(cleanLaps.reduce((s, x) => s + (x - avgLap) ** 2, 0) / cleanLaps.length);
  }

  // Find column indices (handle quoted/unquoted)
  const findCol = (...names) => {
    for (const n of names) {
      if (ci[n] !== undefined) return ci[n];
      if (ci[`"${n}"`] !== undefined) return ci[`"${n}"`];
    }
    return -1;
  };
  const iSp = findCol("GPS Speed");
  const iRpm = findCol("RPM");
  const iTemp = findCol("Temp", "Water Temp");
  const iTemp2 = findCol("Temp 2", "EGT");
  const iLatAcc = findCol("GPS LatAcc");

  // Speed stats
  const speeds = rows.map(r => r[iSp]).filter(v => !isNaN(v) && v > 0);
  speeds.sort((a, b) => a - b);
  const topSpeed = speeds.length ? speeds[speeds.length - 1] : null;
  const topP99 = speeds.length ? speeds[Math.floor(speeds.length * 0.99)] : null;

  // Sustained max RPM in straights (high speed, low lat acc)
  // Use rolling min of 5 samples (250ms at 20Hz)
  let sustainedMaxRPM = 0;
  for (let i = 2; i < rows.length - 2; i++) {
    const sp = rows[i][iSp];
    const la = iLatAcc >= 0 ? Math.abs(rows[i][iLatAcc] || 0) : 0;
    if (sp > 90 && la < 0.5) {
      const w = [rows[i-2][iRpm], rows[i-1][iRpm], rows[i][iRpm], rows[i+1][iRpm], rows[i+2][iRpm]]
        .filter(v => !isNaN(v));
      if (w.length === 5) {
        const rollMin = Math.min(...w);
        if (rollMin > sustainedMaxRPM) sustainedMaxRPM = rollMin;
      }
    }
  }

  // Water temp stats
  let waterMin = null, waterMax = null, waterAvg = null;
  if (iTemp >= 0) {
    const temps = rows.map(r => r[iTemp]).filter(v => !isNaN(v) && v > 0);
    if (temps.length > 0) {
      waterMin = Math.min(...temps);
      waterMax = Math.max(...temps);
      waterAvg = temps.reduce((a, b) => a + b, 0) / temps.length;
    }
  }

  // EGT stats (if Temp 2 exists)
  let egtAvg = null, egtMax = null;
  if (iTemp2 >= 0) {
    const egts = rows.map(r => r[iTemp2]).filter(v => !isNaN(v) && v > 200);
    if (egts.length > 0) {
      egtMax = Math.max(...egts);
      egtAvg = egts.reduce((a, b) => a + b, 0) / egts.length;
    }
  }

  // PEDAL EVENT DETECTION — count significant throttle modulation events
  // dRPM/dt > 1500 = clear throttle UP, < -1500 = clear throttle DOWN
  // This reveals "pedal driver" vs "steering driver" style
  let pedalEvents = 0;
  let prevDr = null;
  // Use 3-sample smoothing for dRPM
  for (let i = 3; i < rows.length - 1; i++) {
    if (isNaN(rows[i][iRpm]) || isNaN(rows[i-1][iRpm]) || isNaN(rows[i-2][iRpm]) || isNaN(rows[i+1][iRpm])) continue;
    const dr1 = (rows[i-1][iRpm] - rows[i-2][iRpm]) / 0.05;
    const dr2 = (rows[i][iRpm] - rows[i-1][iRpm]) / 0.05;
    const dr3 = (rows[i+1][iRpm] - rows[i][iRpm]) / 0.05;
    const drSmooth = (dr1 + dr2 + dr3) / 3;
    const THRESHOLD = 1500;
    if (drSmooth > THRESHOLD && (prevDr === null || prevDr <= THRESHOLD)) pedalEvents++;
    if (drSmooth < -THRESHOLD && (prevDr === null || prevDr >= -THRESHOLD)) pedalEvents++;
    prevDr = drSmooth;
  }
  // Normalize to per-lap (rough: assume even distribution across laps)
  const pedalEventsPerLap = cleanLaps.length > 0 ? Math.round(pedalEvents / Math.max(1, cleanLaps.length)) : pedalEvents;

  // RPM in top-speed window (median ±1 second around max speed) — better than rolling-min sustained
  let rpmNearTop = null;
  if (topSpeed && iSp >= 0 && iRpm >= 0) {
    let topIdx = 0;
    let maxSp = -1;
    for (let i = 0; i < rows.length; i++) {
      if (!isNaN(rows[i][iSp]) && rows[i][iSp] > maxSp) {
        maxSp = rows[i][iSp];
        topIdx = i;
      }
    }
    const startW = Math.max(0, topIdx - 20);
    const endW = Math.min(rows.length, topIdx + 21);
    const rpms = [];
    for (let i = startW; i < endW; i++) {
      if (!isNaN(rows[i][iRpm])) rpms.push(rows[i][iRpm]);
    }
    if (rpms.length > 0) {
      rpms.sort((a, b) => a - b);
      rpmNearTop = rpms[Math.floor(rpms.length / 2)];
    }
  }

  return {
    date: parseAiMDate(meta.date),
    time: parseAiMTime(meta.time),
    racer: meta.racer || "",
    track: meta.session || "",
    comment: meta.comment || "",
    bestLap: bestLap ? Math.round(bestLap * 1000) / 1000 : null,
    avgLap: avgLap ? Math.round(avgLap * 1000) / 1000 : null,
    std: stdLap ? Math.round(stdLap * 100) / 100 : null,
    lapCount: cleanLaps.length,
    topSpeedMax: topSpeed ? Math.round(topSpeed * 10) / 10 : null,
    topSpeedP99: topP99 ? Math.round(topP99 * 10) / 10 : null,
    rpmSustainedStraight: sustainedMaxRPM > 0 ? Math.round(sustainedMaxRPM) : null,
    rpmNearTop: rpmNearTop !== null ? Math.round(rpmNearTop) : null,
    pedalEventsPerLap: pedalEventsPerLap,
    waterMin: waterMin !== null ? Math.round(waterMin * 10) / 10 : null,
    waterMax: waterMax !== null ? Math.round(waterMax * 10) / 10 : null,
    waterAvg: waterAvg !== null ? Math.round(waterAvg * 10) / 10 : null,
    egtAvg: egtAvg !== null ? Math.round(egtAvg) : null,
    egtMax: egtMax !== null ? Math.round(egtMax) : null,
  };
}

function airDensity(tempC, pressureHpa, humidity = 0.5) {
  // Simple density calc using temperature and pressure
  const T = tempC + 273.15;
  const P = pressureHpa * 100;
  // Saturation vapor pressure (Tetens formula) for humidity correction
  const Es = 611.2 * Math.exp(17.62 * tempC / (243.12 + tempC));
  const Pv = humidity * Es;
  const Pd = P - Pv;
  return (Pd / (287.05 * T)) + (Pv / (461.495 * T));
}

// ============================================================
// EQUIPMENT PROFILE (pirmojo paleidimo metu sukurtas)
// ============================================================

const CHASSIS_OPTIONS = [
  "CRG", "Tony Kart", "Birel ART", "OTK / Kosmic", "Kart Republic", "Parolin",
  "Praga", "DR Racing", "Energy Corse", "FA Kart", "Sodi", "Top Kart",
  "Margay", "Coyote", "Trackmagic", "Arrow", "Ricciardo Kart", "GP / Maranello",
  "IPK / Formula K", "Intrepid", "CompKart", "Exprit", "Kosmic", "Zanardi",
  "Tibikart", "DPE Kart", "Italkart", "MS Kart", "Kitas",
];

const ENGINE_FAMILIES = {
  Rotax: ["Micro MAX", "Mini MAX", "Junior MAX", "Senior MAX", "DD2", "DD2 Masters"],
  IAME: ["X30 Mini", "X30 Junior", "X30 Senior", "KA100", "Parilla Leopard", "Waterswift", "Screamer III (KZ)"],
  Vortex: ["Mini ROK", "Micro ROK", "ROK GP", "ROK VLR", "ROK Shifter", "DVS (OK)", "DJT (OKJ)"],
  TM: ["KZ R1", "KZ R2", "OK", "OKJ", "Mini"],
  Modena: ["KK1", "KK2 Junior", "ME"],
  Comer: ["C50", "C51", "S60", "S80", "K80"],
  // 4-stroke categories (sealed engines, mass classes)
  Briggs: ["LO206 Senior", "LO206 Junior", "LO206 Cadet", "Animal"],
  Tillotson: ["T225 RS Senior", "T225 RS Junior", "T196 R", "T196 R Cadet", "T212 RS"],
  Honda: ["GX160", "GX200", "GX270", "GX390"],
  // Specialty
  PRD: ["Fireball", "RK100"],
  Wankel: ["KZ Wankel"],
  Kitas: ["Kitas variklis"],
};

// Engine class metadata — for algorithms
const ENGINE_METADATA = {
  // 2-stroke single-speed (direct drive, rear-only brake)
  "Senior MAX": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 13500, maxRPM: 14250, displacement: 125, hpApprox: 30 },
  "Junior MAX": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 12500, maxRPM: 13000, displacement: 125, hpApprox: 21 },
  "Mini MAX": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 11500, maxRPM: 12000, displacement: 125, hpApprox: 16 },
  "Micro MAX": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 11000, maxRPM: 11500, displacement: 125, hpApprox: 11 },
  "X30 Senior": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 15000, maxRPM: 16000, displacement: 125, hpApprox: 28 },
  "X30 Junior": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 13000, maxRPM: 14000, displacement: 125, hpApprox: 20 },
  "X30 Mini": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 12500, maxRPM: 13500, displacement: 60, hpApprox: 14 },
  "KA100": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 14500, maxRPM: 16000, displacement: 100, hpApprox: 21 },
  "ROK GP": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 14000, maxRPM: 16000, displacement: 125, hpApprox: 24 },
  "Mini ROK": { stroke: 2, hasGearbox: false, frontBrake: false, peakRPM: 13000, maxRPM: 14000, displacement: 60, hpApprox: 12 },
  // 2-stroke with gearbox (shifter, front + rear brakes)
  "DD2": { stroke: 2, hasGearbox: true, gears: 2, frontBrake: true, peakRPM: 11000, maxRPM: 12500, displacement: 125, hpApprox: 34 },
  "DD2 Masters": { stroke: 2, hasGearbox: true, gears: 2, frontBrake: true, peakRPM: 11000, maxRPM: 12500, displacement: 125, hpApprox: 34 },
  "KZ R1": { stroke: 2, hasGearbox: true, gears: 6, frontBrake: true, peakRPM: 14000, maxRPM: 16000, displacement: 125, hpApprox: 50 },
  "KZ R2": { stroke: 2, hasGearbox: true, gears: 6, frontBrake: true, peakRPM: 14000, maxRPM: 16000, displacement: 125, hpApprox: 50 },
  "Screamer III (KZ)": { stroke: 2, hasGearbox: true, gears: 6, frontBrake: true, peakRPM: 14000, maxRPM: 16000, displacement: 125, hpApprox: 50 },
  "ROK Shifter": { stroke: 2, hasGearbox: true, gears: 6, frontBrake: true, peakRPM: 14000, maxRPM: 16000, displacement: 125, hpApprox: 42 },
  // 4-stroke (sealed engines for mass classes)
  "LO206 Senior": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 5800, maxRPM: 6100, displacement: 204, hpApprox: 9 },
  "LO206 Junior": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 5500, maxRPM: 6100, displacement: 204, hpApprox: 7.5 },
  "LO206 Cadet": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 5000, maxRPM: 6100, displacement: 204, hpApprox: 6 },
  "T225 RS Senior": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 6200, maxRPM: 6500, displacement: 225, hpApprox: 15 },
  "T225 RS Junior": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 6000, maxRPM: 6500, displacement: 225, hpApprox: 12 },
  "T196 R": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 5800, maxRPM: 6500, displacement: 196, hpApprox: 9 },
  "T196 R Cadet": { stroke: 4, hasGearbox: false, frontBrake: false, peakRPM: 5500, maxRPM: 6000, displacement: 196, hpApprox: 5.5 },
};

// Brake configuration by engine — does it have front brakes?
// Uses ENGINE_METADATA for precise lookup, fallback to keyword detection.
function engineHasFrontBrakes(engineFamily, engineModel) {
  if (!engineModel) return false;
  // Direct metadata lookup (precise)
  if (ENGINE_METADATA[engineModel]) {
    return ENGINE_METADATA[engineModel].frontBrake === true;
  }
  // Fallback for legacy / unknown
  const m = engineModel.toLowerCase();
  if (m.includes("dd2")) return true;
  if (m.includes("kz") || m.includes("shifter")) return true;
  if (m.includes("rok shifter")) return true;
  return false;
}

// Get engine peak power RPM target for analysis
function getEnginePeakRPM(engineModel) {
  return ENGINE_METADATA[engineModel]?.peakRPM || 13500;
}
function getEngineMaxRPM(engineModel) {
  return ENGINE_METADATA[engineModel]?.maxRPM || 14500;
}
function engineIsFourStroke(engineModel) {
  return ENGINE_METADATA[engineModel]?.stroke === 4;
}
function engineHasGearbox(engineModel) {
  return ENGINE_METADATA[engineModel]?.hasGearbox === true;
}

const TIRE_BRANDS = [
  "Mojo D5", "Mojo D2", "Mojo C2", "Vega XH3", "Vega SL3", "Vega XM", "Vega XL4",
  "LeCont", "MG FZ", "MG SH", "MG Yellow", "Bridgestone YJL", "Bridgestone YLB",
  "Komet K1H", "Komet K2H", "Kitos",
];

const TELEMETRY_OPTIONS = [
  { id: "mychron5", label: "MyChron 5", desc: "Pagrindinis modelis (be Temp 2)" },
  { id: "mychron5s", label: "MyChron 5S", desc: "Su WiFi" },
  { id: "mychron5s2t", label: "MyChron 5S 2T", desc: "Du temperatūros kanalai" },
  { id: "mychron6", label: "MyChron 6", desc: "Naujausias AiM modelis" },
  { id: "alfano6", label: "Alfano 6", desc: "Italian telemetrija" },
  { id: "alfano7", label: "Alfano 7", desc: "Naujesnis Alfano" },
  { id: "unipro", label: "Unipro", desc: "Danų telemetrija" },
  { id: "none", label: "Neturi", desc: "Tik ratų laikrodis" },
];

const SENSOR_OPTIONS = [
  { id: "rpm", label: "RPM (apsukos)", default: true, alwaysOn: true, desc: "Pagrindinis — visada įjungtas" },
  { id: "gps", label: "GPS greitis ir pozicija", default: true, desc: "Standartas MyChron 5S+" },
  { id: "water", label: "Vandens temperatūra", default: true, desc: "Aušinimo skysčio davikis" },
  { id: "egt", label: "EGT (išmetimo dujų temp.)", default: false, desc: "Termopora kolektoriuje. KRITIŠKA mišinio derinimui." },
  { id: "cht", label: "CHT (cilindro galvutės temp.)", default: false, desc: "Daviklis ant cilindro galvutės" },
  { id: "lambda", label: "Lambda (O2 sensorius)", default: false, desc: "Reto naudojimo kartinge" },
  { id: "fuel_pressure", label: "Degalų slėgis", default: false, desc: "Aukšto lygio sąranga" },
  { id: "throttle", label: "Droselio pozicija", default: false, desc: "TPS sensorius" },
  { id: "brake", label: "Stabdžio slėgis", default: false, desc: "Brake pressure sensor" },
  { id: "steering", label: "Vairo kampas", default: false, desc: "Steering angle sensor" },
  { id: "hrm", label: "Vairuotojo pulsas (HRM)", default: false, desc: "ANT+ heart rate" },
];

const TOOL_OPTIONS = [
  { id: "tire_gauge_cal", label: "Kalibruotas slėgio manometras", default: true, important: true },
  { id: "tire_pyrometer", label: "Padangų IR pirometras", default: false, important: true },
  { id: "track_pyrometer", label: "Asfalto IR pirometras", default: false, important: true },
  { id: "tire_depth", label: "Protektoriaus gyliamatis", default: false },
  { id: "toe_laser", label: "Suvedimo lazeris", default: false, important: true },
  { id: "caster_gauge", label: "Caster/camber matuoklis", default: false },
  { id: "scales", label: "Svarstyklės (kart+vairuotojas)", default: false },
  { id: "spark_plug_cam", label: "Žvakės nuotrauka (telefono kamera)", default: true },
  { id: "weather_station", label: "Meteo stotelė (oro tankis)", default: false },
];

// Default profile if user skips setup
const DEFAULT_PROFILE = {
  driverName: "",
  chassis: "",
  engineFamily: "Rotax",
  engineModel: "Senior MAX",
  tireBrand: "Mojo D5",
  telemetry: "mychron5s2t",
  sensors: { rpm: true, gps: true, water: true, egt: false, cht: false, lambda: false,
    fuel_pressure: false, throttle: false, brake: false, steering: false, hrm: false },
  tools: { tire_gauge_cal: true, tire_pyrometer: false, track_pyrometer: false,
    tire_depth: false, toe_laser: false, caster_gauge: false, scales: false,
    spark_plug_cam: true, weather_station: false },
  homeTrack: "",
  targetLapTime: "",
  setupComplete: false,
};

// ============================================================
// PHOTO HELPERS
// ============================================================

// Photo categories the user can attach to a session
const PHOTO_CATEGORIES = [
  { id: "plug", label: "Žvakė", icon: "🔥", hint: "Po S1 ir paskutinės sesijos. Spalva = mišinys (šviesiai ruda = OK)" },
  { id: "tire_fl", label: "Padanga PK", icon: "🛞", hint: "Priekinė kairė — protektoriaus dilimas" },
  { id: "tire_fr", label: "Padanga PD", icon: "🛞", hint: "Priekinė dešinė" },
  { id: "tire_rl", label: "Padanga GK", icon: "🛞", hint: "Galinė kairė" },
  { id: "tire_rr", label: "Padanga GD", icon: "🛞", hint: "Galinė dešinė" },
  { id: "chassis", label: "Sąranga", icon: "🔧", hint: "Toe, caster, hubs, axle" },
  { id: "carb", label: "Karbiuratorius", icon: "⛽", hint: "Adata, žiklerius, oro varžtas" },
  { id: "mychron", label: "MyChron ekranas", icon: "📊", hint: "Sesijos suvestinė, ratų laikai" },
  { id: "other", label: "Kita", icon: "📸", hint: "Bet kokia kita nuotrauka" },
];

// Compress image: resize to max 1200px wide, JPEG quality 0.75
function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Negaliu nuskaityti failo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Negaliu apdoroti vaizdo"));
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Photo storage: keep photos in separate keys to avoid 5MB session limit
async function savePhoto(sessionId, photoId, dataUrl) {
  const key = `dkkart:photo:${sessionId}:${photoId}`;
  await window.storage.set(key, dataUrl);
  return key;
}

async function loadPhoto(photoKey) {
  try {
    const r = await window.storage.get(photoKey);
    return r?.value || null;
  } catch {
    return null;
  }
}

async function deletePhoto(photoKey) {
  try {
    await window.storage.delete(photoKey);
  } catch (e) { /* ignore */ }
}

function recommendJet(currentJet, baselineDensity, currentDensity) {
  // Jet size approximately proportional to sqrt(density)
  const ratio = Math.sqrt(currentDensity / baselineDensity);
  const recommended = currentJet * ratio;
  return Math.round(recommended);
}

function analyzePressureDelta(coldF, coldR, hotF, hotR) {
  const dF = hotF - coldF;
  const dR = hotR - coldR;
  const out = [];
  if (dF < 0.25) out.push({ severity: "mid", text: `Priekis delta tik ${dF.toFixed(2)} bar — padanga neįkaista. Sumažinti cold +0.05.` });
  else if (dF > 0.35) out.push({ severity: "high", text: `Priekis delta ${dF.toFixed(2)} bar — per daug. Padidinti cold ${(coldF + 0.05).toFixed(2)}.` });
  if (dR < 0.25) out.push({ severity: "mid", text: `Galas delta tik ${dR.toFixed(2)} bar — padanga neįkaista. Cold sumažinti.` });
  else if (dR > 0.35) out.push({ severity: "high", text: `Galas delta ${dR.toFixed(2)} bar — per daug. Padidinti cold.` });
  if (out.length === 0) out.push({ severity: "good", text: `Slėgio delta priekis ${dF.toFixed(2)} / galas ${dR.toFixed(2)} — idealu.` });
  return out;
}

function analyzeWaterTemp(avg, max) {
  if (avg < 50) return [{ severity: "mid", text: `Vandens vidut ${avg}°C — per šaltas. Užklijuoti 25-35% radiatoriaus priekio.` }];
  if (avg > 65) return [{ severity: "mid", text: `Vandens vidut ${avg}°C — per karštas. Nuimti tape arba patikrinti aušinimą.` }];
  if (max > 70) return [{ severity: "high", text: `Vandens max ${max}°C — kritiškai aukštas.` }];
  return [{ severity: "good", text: `Vanduo ${avg}°C avg — geras diapazone.` }];
}

function analyzeRPM(sustainedRPM, topSpeed, gearF, gearR, engineModel = null) {
  // Engine-specific peak power zone (defaults to Senior MAX values)
  const peakRPM = engineModel ? getEnginePeakRPM(engineModel) : 13500;
  const maxRPM = engineModel ? getEngineMaxRPM(engineModel) : 14250;
  const lowZone = peakRPM - 1000;  // below peak power zone
  const highZone = peakRPM + 300;  // slightly above peak (acceptable transient)
  const overRev = maxRPM;
  
  const out = [];
  if (sustainedRPM < lowZone) {
    const gap = lowZone - sustainedRPM;
    out.push({ 
      severity: gap > 1500 ? "mid" : "info", 
      text: `Sustained ${sustainedRPM} RPM tiesumoje — žemiau peak power zonos (${lowZone}-${peakRPM}). Variklis neišnaudoja galios. Gear gali būti per ilgas — bandyti trumpinti -1 dantį (${gearF}/${gearR + 1}).`
    });
  } else if (sustainedRPM > overRev) {
    const overBy = sustainedRPM - peakRPM;
    out.push({ 
      severity: "high", 
      text: `Sustained ${sustainedRPM} RPM — virš max RPM (${overRev}). Variklis "užsikemšą" tiesumoje. PRIVALOMA ilginti gear: bandyti ${gearF}/${gearR - 1}.`
    });
  } else if (sustainedRPM > highZone) {
    out.push({ 
      severity: "info", 
      text: `Sustained ${sustainedRPM} RPM — viršuje peak power zonos. Jei tiesė trumpa ir pedalų vairuotojas — gear gali būti optimalus. Žiūrėk apex paspartinimą prieš keisti.`
    });
  } else {
    out.push({ 
      severity: "good", 
      text: `RPM ${sustainedRPM} peak power zonoje (${lowZone}-${highZone}). Gear ${gearF}/${gearR} dirba gerai${engineModel ? ` ${engineModel}` : ""}.`
    });
  }
  return out;
}

// ============================================================
// GEAR RATIO CALCULATIONS — pilna logika
// ============================================================

// km/h per 1000 RPM with given gear (front sprocket Z, rear sprocket Z)
// Formula: speed = (RPM × tire_circumference × 60) / (gear_ratio × 1000)
// gear_ratio = rear/front
// For karting, typical rear wheel diameter ~28cm → circ 0.88m
function gearKmhPerKRPM(gearF, gearR, tireCirc = 0.88) {
  if (!gearF || !gearR) return null;
  const gearRatio = gearR / gearF;
  // RPM 1000 → wheel revs = 1000 / gearRatio per min
  // distance per min = wheelRevs × tireCirc (meters)
  // km/h = (m/min × 60) / 1000
  const kmhPer1000 = (1000 / gearRatio) * tireCirc * 60 / 1000;
  return kmhPer1000;
}

// Predict top speed given RPM and gear
function predictTopSpeed(maxRPM, gearF, gearR, tireCirc = 0.88) {
  const kmh = gearKmhPerKRPM(gearF, gearR, tireCirc);
  if (!kmh) return null;
  return kmh * (maxRPM / 1000);
}

// Recommend gear change to hit target RPM at known top speed
function recommendGearForRPM(currentTopSpeed, currentMaxRPM, targetRPM, currentGearF, currentGearR) {
  if (!currentTopSpeed || !currentMaxRPM) return null;
  // Current km/h per 1000 RPM = topSpeed / (maxRPM/1000)
  const currentRatio = currentTopSpeed / (currentMaxRPM / 1000);
  const targetRatio = currentTopSpeed / (targetRPM / 1000);
  // ratio scales inversely with gear ratio: newRatio/currentRatio = currentGearR/newGearR (front constant)
  const newGearR = Math.round(currentGearR * (currentRatio / targetRatio));
  return { newGearF: currentGearF, newGearR, deltaTeeth: newGearR - currentGearR };
}

// Comprehensive gear analysis for current session
function analyzeGearChoice(session, engineModel = null) {
  const recs = [];
  if (!session.gear_F || !session.gear_R) return recs;
  
  const peakRPM = engineModel ? getEnginePeakRPM(engineModel) : 13500;
  const kmh = gearKmhPerKRPM(session.gear_F, session.gear_R);
  
  if (kmh) {
    recs.push({
      severity: "info",
      text: `Gear ${session.gear_F}/${session.gear_R} = ${kmh.toFixed(2)} km/h per 1000 RPM. Teorinis top speed @ peak power: ${(kmh * peakRPM / 1000).toFixed(1)} km/h.`
    });
  }
  
  // If we have actual top speed and RPM near top — recommend
  const actualRPM = session.rpmNearTop || session.rpmSustainedStraight;
  if (session.topSpeedP99 && actualRPM) {
    if (actualRPM > peakRPM + 500) {
      const rec = recommendGearForRPM(session.topSpeedP99, actualRPM, peakRPM, session.gear_F, session.gear_R);
      if (rec && rec.deltaTeeth !== 0) {
        recs.push({
          severity: "info",
          text: `Pasiūlymas: bandyti ${rec.newGearF}/${rec.newGearR} (${rec.deltaTeeth > 0 ? "+" : ""}${rec.deltaTeeth} dantis gale) → RPM tiesumoje arčiau peak power.`
        });
      }
    }
  }
  
  return recs;
}

// Detect driving style from RPM oscillation pattern
function analyzeDrivingStyle(pedalEvents, lapTime) {
  if (!pedalEvents || !lapTime) return null;
  const eventsPerSec = pedalEvents / lapTime;
  
  if (pedalEvents < 12) {
    return { style: "Vairo vairuotojas", desc: "Klasikinis stilius — daugiausia gas-off-brake-gas seka", icon: "🎯" };
  } else if (pedalEvents < 20) {
    return { style: "Mišrus stilius", desc: "Vairas + pedalų korekcijos posūkiuose", icon: "🔄" };
  } else if (pedalEvents < 35) {
    return { style: "Pedalų vairuotojas", desc: "Aktyvi gaso modulacija posūkiuose — daugiau throttle work nei vairo", icon: "🦶" };
  } else {
    return { style: "Intensyvus pedalų vairuotojas", desc: "Rallycross-tipo stilius — nuolatinis gaso 'pumping' posūkyje", icon: "⚡" };
  }
}

function analyzeEGT(egtAvg, egtMax, hasEGTSensor = true) {
  if (egtAvg === null || egtAvg === undefined) {
    if (!hasEGTSensor) {
      // User doesn't have EGT sensor - don't nag, just inform
      return [{ severity: "info", text: `EGT sensorius nenaudojamas. Mišinio derinimui rekomenduojame stebėti žvakės spalvą po sesijos.` }];
    }
    return [{ severity: "high", text: `EGT NEPRIJUNGTAS — kritiška problema. Prijungti Temp 2 kanalą prie MyChron.` }];
  }
  // Rotax Senior optimal EGT: 580-650°C
  if (egtAvg < 560) return [{ severity: "mid", text: `EGT ${egtAvg}°C per žemas — mišinys per riebus. Mažinti jet -2.` }];
  if (egtAvg > 660) return [{ severity: "high", text: `EGT ${egtAvg}°C per aukštas — mišinys per liesas. Didinti jet +3. PAVOJUS varikliui!` }];
  if (egtMax > 680) return [{ severity: "high", text: `EGT max ${egtMax}°C — pavojinga peak. Didinti jet bent +2.` }];
  return [{ severity: "good", text: `EGT ${egtAvg}°C (max ${egtMax}) — idealu Rotax Senior.` }];
}

function analyzeToe(toe) {
  if (toe === "netikrintas" || toe === null || toe === "") {
    return [{ severity: "high", text: `Toe NETIKRINTAS — pirmas darbas boksuose! Pradėti su 0 mm.` }];
  }
  return [{ severity: "good", text: `Toe ${toe} — užfiksuota.` }];
}

function compareToBest(currentSession, allSessions) {
  // Find best baseline session
  const best = allSessions.reduce((b, s) => (!b || s.bestLap < b.bestLap) ? s : b, null);
  if (!best || best.id === currentSession.id) return null;
  
  const diff = currentSession.bestLap - best.bestLap;
  const out = [];
  if (diff < 0) {
    out.push({ severity: "good", text: `Geriau už geriausią ${best.date}/${best.time} (${best.bestLap}s) per ${(-diff).toFixed(3)}s!` });
  } else {
    out.push({ severity: "info", text: `Gap iki geriausio ${best.bestLap}s (${best.date}/${best.time}): +${diff.toFixed(3)}s` });
  }
  // Compare top speeds
  if (currentSession.topSpeedP99 && best.topSpeedP99) {
    const dsp = currentSession.topSpeedP99 - best.topSpeedP99;
    if (Math.abs(dsp) > 1) {
      out.push({ severity: "info", text: `Top speed ${dsp > 0 ? "+" : ""}${dsp.toFixed(1)} km/h vs geriausia` });
    }
  }
  return out;
}

function generateRecommendations(session, history = [], profile = null) {
  const recs = [];
  const hasEGT = profile?.sensors?.egt !== false;
  const engineModel = profile?.engineModel || null;
  const isFourStroke = engineModel ? engineIsFourStroke(engineModel) : false;
  
  // 1. ŠASI - toe
  recs.push(...analyzeToe(session.toe));
  
  // 2. PADANGOS - slėgio delta + slėgio strategija pagal sąlygas
  if (session.cold_F && session.hot_F) {
    recs.push(...analyzePressureDelta(session.cold_F, session.cold_R, session.hot_F, session.hot_R));
  }
  recs.push(...analyzeTirePressureStrategy(session));
  
  // 3. VARIKLIS - temperatūros
  if (session.waterAvg) recs.push(...analyzeWaterTemp(session.waterAvg, session.waterMax));
  if (!isFourStroke) {
    recs.push(...analyzeEGT(session.egtAvg, session.egtMax, hasEGT));
  }
  
  // 4. RPM ir GEAR (engine-aware)
  const actualRPM = session.rpmNearTop || session.rpmSustainedStraight;
  if (actualRPM) {
    recs.push(...analyzeRPM(actualRPM, session.topSpeedP99, session.gear_F, session.gear_R, engineModel));
  }
  recs.push(...analyzeGearChoice(session, engineModel));
  
  // 5. STABDŽIAI - max decel pagal kategoriją
  if (session.brakeMaxDecel_g) {
    recs.push(...analyzeBrakingForce(session.brakeMaxDecel_g, engineModel));
  }
  
  // 6. PADANGŲ PAVIRŠIAUS T° balansas
  recs.push(...analyzeTireSurfaceTemps(session));
  
  // 7. SVORIO BALANSAS
  recs.push(...analyzeWeightBalance(session));
  
  // 8. CAMBER pagal padangos vidinis/išorinis
  recs.push(...analyzeCamberFromTireTemps(session));
  
  // 9. STILIUS — pedalų vs vairo
  if (session.pedalEventsPerLap) {
    const style = analyzeDrivingStyle(session.pedalEventsPerLap, session.bestLap || 40);
    if (style) {
      recs.push({
        severity: style.style.startsWith("Intensyvus") ? "info" : "good",
        text: `${style.icon} ${style.style} (${session.pedalEventsPerLap} pedalų judesių/ratą). ${style.desc}.`,
      });
      if (session.pedalEventsPerLap >= 25) {
        recs.push({
          severity: "info",
          text: `💡 Pedalų vairuotojo stiliumi: adata svarbesnė nei jet (vidutinio drosselio režimas). Trumpesnis gear duoda greitesnį RPM atsaką po kiekvieno paspaudimo. Padangos slėgio sumažinimas priekyje sumažina pedalo darbo poreikį posūkyje.`,
        });
      }
    }
  }
  
  // 10. ORO TANKIS / JET (2-strokes only)
  if (!isFourStroke && session.airTemp && session.pressure && history.length > 0) {
    const last = history[history.length - 1];
    if (last && last.airTemp && last.pressure && last.mainJet) {
      const d1 = airDensity(last.airTemp, last.pressure, 0.5);
      const d2 = airDensity(session.airTemp, session.pressure, 0.5);
      const ratio = Math.sqrt(d2 / d1);
      const expectedJet = Math.round(last.mainJet * ratio);
      if (session.mainJet && Math.abs(session.mainJet - expectedJet) > 2) {
        recs.push({
          severity: "info",
          text: `Pagal oro tankį (${(d2*1000).toFixed(0)} g/m³) palyginus su ${last.time}, teorinis jet būtų ${expectedJet}. Naudoji ${session.mainJet}.`
        });
      }
    }
  }
  
  // 11. KONSISTENCIJA (std)
  if (session.std && session.bestLap) {
    recs.push(...analyzeConsistency(session.std, session.lapCount));
  }
  
  // 12. PADANGŲ AMŽIUS (heat cycles)
  if (session.tireHeatCycles) {
    recs.push(...analyzeTireAge(session.tireHeatCycles, session.tireBrand));
  }
  
  // 13. VARIKLIO VALANDOS
  if (session.engineHours) {
    recs.push(...analyzeEngineHours(session.engineHours, engineModel));
  }
  
  return recs;
}

// ============================================================
// NAUJI ALGORITMAI
// ============================================================

// Tire pressure strategy based on conditions
function analyzeTirePressureStrategy(s) {
  const recs = [];
  if (!s.cold_F || !s.airTemp) return recs;
  
  const T = parseFloat(s.airTemp);
  const trackT = s.trackTemp ? parseFloat(s.trackTemp) : null;
  const cold_F = parseFloat(s.cold_F);
  
  // Recommended cold pressure based on conditions
  let recCold = 0.65; // default
  if (T < 10) recCold = 0.70;       // šaltas oras = aukštesnis cold
  else if (T < 18) recCold = 0.65;
  else if (T < 25) recCold = 0.60;
  else recCold = 0.55;              // karštas oras = žemesnis cold
  
  // If we have track temp, adjust further
  if (trackT) {
    if (trackT > 40) recCold -= 0.05;
    else if (trackT < 15) recCold += 0.05;
  }
  
  // Brand-specific adjustments
  if (s.tireBrand && s.tireBrand.includes("Vega")) {
    recCold -= 0.05;  // Vega works better with lower cold
  } else if (s.tireBrand && s.tireBrand.includes("LeCont")) {
    recCold += 0.03;  // LeCont slightly higher
  }
  
  const delta = Math.abs(cold_F - recCold);
  if (delta > 0.08) {
    recs.push({
      severity: "info",
      text: `Padangų slėgis priekyje cold ${cold_F.toFixed(2)} bar. Pagal ${T}°C oro (${trackT ? trackT + "°C asfaltas, " : ""}${s.tireBrand || "padangos"}) rekomenduojama ${recCold.toFixed(2)} bar. Skirtumas ${delta.toFixed(2)} bar.`
    });
  }
  
  return recs;
}

// Braking force assessment by engine category
function analyzeBrakingForce(maxG, engineModel) {
  const recs = [];
  const g = parseFloat(maxG);
  if (isNaN(g)) return recs;
  
  // Profesional benchmarks by category
  let target = 1.0;
  let category = "Senior MAX";
  if (engineModel) {
    const isShifter = engineHasGearbox(engineModel);
    if (isShifter) { target = 1.2; category = "KZ/Shifter (su priekio stabdžiu)"; }
    else if (engineIsFourStroke(engineModel)) { target = 0.8; category = "4-stroke (LO206/Tillotson)"; }
    else if (engineModel.includes("Mini") || engineModel.includes("Micro")) { target = 0.7; category = "Mini/Micro"; }
    else if (engineModel.includes("Junior")) { target = 0.9; category = "Junior"; }
    else { target = 1.0; category = "Senior"; }
  }
  
  const pct = (g / target * 100).toFixed(0);
  if (g < target * 0.8) {
    recs.push({ severity: "mid", text: `Max stabdymas ${g}g — ${pct}% nuo ${category} potencialo (${target}g). Tikrinti paduškas/skystį prieš keisti komponentus.` });
  } else if (g < target * 0.95) {
    recs.push({ severity: "info", text: `Max stabdymas ${g}g — geras lygis (${pct}% nuo ${category} potencialo).` });
  } else {
    recs.push({ severity: "good", text: `Max stabdymas ${g}g — beveik profi lygis (${category}).` });
  }
  return recs;
}

// Tire surface temperature balance analysis
function analyzeTireSurfaceTemps(s) {
  const recs = [];
  const tires = [
    { name: "PK", in: s.tireTemp_FL_in, mid: s.tireTemp_FL_mid, out: s.tireTemp_FL_out },
    { name: "PD", in: s.tireTemp_FR_in, mid: s.tireTemp_FR_mid, out: s.tireTemp_FR_out },
    { name: "GK", in: s.tireTemp_RL_in, mid: s.tireTemp_RL_mid, out: s.tireTemp_RL_out },
    { name: "GD", in: s.tireTemp_RR_in, mid: s.tireTemp_RR_mid, out: s.tireTemp_RR_out },
  ];
  
  tires.forEach(t => {
    const inT = parseFloat(t.in);
    const midT = parseFloat(t.mid);
    const outT = parseFloat(t.out);
    if (isNaN(inT) || isNaN(midT) || isNaN(outT)) return;
    
    const inOut = inT - outT;
    const midSpread = midT - (inT + outT) / 2;
    
    if (inOut > 12) {
      recs.push({ severity: "info", text: `${t.name}: vidinis ${inT}°C >> išorinis ${outT}°C (Δ${inOut.toFixed(0)}°C). Per daug NEGATYVAUS camber — sumažinti -0.5°.` });
    } else if (inOut < -12) {
      recs.push({ severity: "info", text: `${t.name}: išorinis ${outT}°C >> vidinis ${inT}°C (Δ${(-inOut).toFixed(0)}°C). Per mažai camber arba chassis minkštas — padidinti negative camber.` });
    }
    if (midSpread > 10) {
      recs.push({ severity: "info", text: `${t.name}: vidurys ${midT}°C >> kraštai. Slėgis per aukštas — sumažinti ~0.05 bar cold.` });
    } else if (midSpread < -10) {
      recs.push({ severity: "info", text: `${t.name}: vidurys ${midT}°C << kraštai. Slėgis per žemas — padidinti ~0.05 bar cold.` });
    }
  });
  
  return recs;
}

// Weight balance from corner scales
function analyzeWeightBalance(s) {
  const recs = [];
  const fl = parseFloat(s.weight_FL), fr = parseFloat(s.weight_FR);
  const rl = parseFloat(s.weight_RL), rr = parseFloat(s.weight_RR);
  if ([fl, fr, rl, rr].some(isNaN)) return recs;
  
  const total = fl + fr + rl + rr;
  const frontPct = (fl + fr) / total * 100;
  const leftPct = (fl + rl) / total * 100;
  const diag1 = fl + rr, diag2 = fr + rl;
  const diagDiff = Math.abs(diag1 - diag2);
  
  if (frontPct < 41) {
    recs.push({ severity: "info", text: `Svorio balansas: priekis ${frontPct.toFixed(1)}% — per mažas (target 42-44%). Sėdynę pajudinti priekiu arba pridėti svorio priekyje.` });
  } else if (frontPct > 45) {
    recs.push({ severity: "info", text: `Svorio balansas: priekis ${frontPct.toFixed(1)}% — per didelis (target 42-44%). Sėdynę pajudinti gale.` });
  }
  if (Math.abs(leftPct - 50) > 2) {
    recs.push({ severity: "info", text: `Svorio balansas: kairė ${leftPct.toFixed(1)}% — disbalansas (target 49-51%). Patikrinti sėdynę / svoriai.` });
  }
  if (diagDiff > 3) {
    recs.push({ severity: "info", text: `Diagonalė: skirtumas ${diagDiff.toFixed(1)} kg (target <2 kg). Tai paveiks elgseną dešinį/kairį.` });
  }
  return recs;
}

// Camber recommendation from tire temps
function analyzeCamberFromTireTemps(s) {
  const recs = [];
  // Check rear (where load matters most) — average rear in vs out
  const rl_in = parseFloat(s.tireTemp_RL_in);
  const rl_out = parseFloat(s.tireTemp_RL_out);
  const rr_in = parseFloat(s.tireTemp_RR_in);
  const rr_out = parseFloat(s.tireTemp_RR_out);
  if ([rl_in, rl_out, rr_in, rr_out].some(isNaN)) return recs;
  
  const avgIn = (rl_in + rr_in) / 2;
  const avgOut = (rl_out + rr_out) / 2;
  const delta = avgIn - avgOut;
  
  if (Math.abs(delta) > 8 && s.camber !== null && s.camber !== "") {
    const camber = parseFloat(s.camber);
    if (delta > 8) {
      recs.push({ severity: "info", text: `Galo padangos: vidinis avg ${avgIn.toFixed(0)}°C >> išorinis (Δ${delta.toFixed(0)}). Bandyti camber ${camber + 0.5}° (mažiau negative).` });
    } else if (delta < -8) {
      recs.push({ severity: "info", text: `Galo padangos: išorinis avg ${avgOut.toFixed(0)}°C >> vidinis (Δ${(-delta).toFixed(0)}). Bandyti camber ${camber - 0.5}° (daugiau negative).` });
    }
  }
  return recs;
}

// Consistency analysis
function analyzeConsistency(std, lapCount) {
  const recs = [];
  const s = parseFloat(std);
  const n = parseInt(lapCount);
  if (isNaN(s) || isNaN(n) || n < 5) return recs;
  
  if (s < 0.20) {
    recs.push({ severity: "good", text: `Konsistencija: std ${s.toFixed(3)}s per ${n} ratus — puiku! Profi lygis.` });
  } else if (s < 0.40) {
    recs.push({ severity: "good", text: `Konsistencija: std ${s.toFixed(3)}s per ${n} ratus — gera.` });
  } else if (s < 0.70) {
    recs.push({ severity: "info", text: `Konsistencija: std ${s.toFixed(3)}s per ${n} ratus — vidutiniška. Treniruoti pastovumą.` });
  } else {
    recs.push({ severity: "mid", text: `Konsistencija: std ${s.toFixed(3)}s — žema. Vairuotojas neranda ritmo arba setup nestabilus.` });
  }
  return recs;
}

// Tire heat cycle analysis
function analyzeTireAge(heatCycles, brand) {
  const recs = [];
  const n = parseInt(heatCycles);
  if (isNaN(n)) return recs;
  
  // Sweet spot varies by brand
  let sweetSpot = [4, 6];
  if (brand) {
    if (brand.includes("Vega")) sweetSpot = [3, 6];
    else if (brand.includes("Mojo")) sweetSpot = [4, 7];
    else if (brand.includes("LeCont")) sweetSpot = [2, 5];
    else if (brand.includes("MG")) sweetSpot = [3, 6];
  }
  
  if (n <= 2) {
    recs.push({ severity: "info", text: `Padangos: ${n} heat cycles — dar šviežios, gali "judėti". Sweet spot ${sweetSpot[0]}-${sweetSpot[1]} ciklai.` });
  } else if (n >= sweetSpot[0] && n <= sweetSpot[1]) {
    recs.push({ severity: "good", text: `Padangos: ${n} heat cycles — sweet spot! Maksimalus griefas.` });
  } else if (n <= sweetSpot[1] + 3) {
    recs.push({ severity: "info", text: `Padangos: ${n} heat cycles — pradeda dilti. Dar tinka treniruotėms.` });
  } else {
    recs.push({ severity: "mid", text: `Padangos: ${n} heat cycles — sudilę. Varžyboms keisti.` });
  }
  return recs;
}

// Engine hours analysis (2-stroke rebuild scheduling)
function analyzeEngineHours(hours, engineModel) {
  const recs = [];
  const h = parseFloat(hours);
  if (isNaN(h)) return recs;
  
  // Rebuild intervals by category
  let rebuildAt = 25;  // Rotax Senior default
  let category = "variklis";
  if (engineModel) {
    if (engineIsFourStroke(engineModel)) {
      rebuildAt = 100;  // 4-stroke much longer
      category = "4-stroke (sealed)";
    } else if (engineModel.includes("Senior MAX")) { rebuildAt = 25; category = "Rotax Senior MAX"; }
    else if (engineModel.includes("Junior MAX")) { rebuildAt = 30; category = "Rotax Junior MAX"; }
    else if (engineModel.includes("Mini MAX")) { rebuildAt = 35; category = "Rotax Mini MAX"; }
    else if (engineModel.includes("X30")) { rebuildAt = 20; category = "IAME X30"; }
    else if (engineModel.includes("KA100")) { rebuildAt = 30; category = "IAME KA100"; }
    else if (engineModel.includes("ROK")) { rebuildAt = 25; category = "Vortex ROK"; }
    else if (engineModel.includes("KZ")) { rebuildAt = 15; category = "KZ shifter"; }
    else if (engineModel.includes("DD2")) { rebuildAt = 25; category = "Rotax DD2"; }
  }
  
  const pct = (h / rebuildAt * 100).toFixed(0);
  if (h < rebuildAt * 0.5) {
    recs.push({ severity: "good", text: `Variklis: ${h}h iš ${rebuildAt}h (${pct}%) — toli iki rebuild. ${category}.` });
  } else if (h < rebuildAt * 0.8) {
    recs.push({ severity: "info", text: `Variklis: ${h}h iš ${rebuildAt}h (${pct}%) — pusiaukelėje. Planuoti rebuild ateičiai.` });
  } else if (h < rebuildAt) {
    recs.push({ severity: "mid", text: `Variklis: ${h}h iš ${rebuildAt}h (${pct}%) — artėja rebuild. Galima galios kritimas. Rezervuoti laiką serviso centre.` });
  } else {
    recs.push({ severity: "high", text: `Variklis: ${h}h — VIRŠ rebuild intervalo (${rebuildAt}h ${category})! Galios kritimas, padidėjusios rizika. SKUBIAI rebuild.` });
  }
  return recs;
}

// ============================================================
// STILIAI
// ============================================================
const C = {
  bg: "#0a0a0b", card: "#131316", border: "#1f1f23",
  text: "#f4f4f5", muted: "#a1a1aa", dim: "#71717a",
  accent: "#FFCB05", danger: "#dc2626", good: "#10b981", info: "#3b82f6",
};

const styles = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Manrope', system-ui, sans-serif", paddingBottom: 90 },
  header: { padding: "20px 16px 12px", borderBottom: `1px solid ${C.border}` },
  brand: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: C.accent, lineHeight: 1 },
  brandSub: { fontSize: 11, letterSpacing: 3, color: C.dim, textTransform: "uppercase", marginTop: 4 },
  content: { padding: "16px", maxWidth: 600, margin: "0 auto" },
  tabs: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f0f11", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 10, paddingBottom: "env(safe-area-inset-bottom, 0)" },
  tab: (active) => ({ flex: 1, padding: "14px 4px", background: "transparent", border: "none", color: active ? C.accent : C.dim, fontFamily: "inherit", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, cursor: "pointer", borderTop: active ? `2px solid ${C.accent}` : "2px solid transparent", marginTop: -1 }),
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardAccent: { borderLeft: `3px solid ${C.accent}` },
  h2: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1.5, marginBottom: 12 },
  h3: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, color: C.accent, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` },
  label: { display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: C.muted, marginBottom: 4, fontWeight: 600 },
  input: { width: "100%", background: C.bg, border: `1px solid #27272a`, color: C.text, padding: "10px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", outline: "none" },
  select: { width: "100%", background: C.bg, border: `1px solid #27272a`, color: C.text, padding: "10px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 14, boxSizing: "border-box", appearance: "none", paddingRight: 30 },
  btn: { width: "100%", background: C.accent, color: C.bg, border: "none", padding: "14px", borderRadius: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, fontWeight: 700, cursor: "pointer", marginTop: 12 },
  btnGhost: { width: "100%", background: "transparent", color: C.muted, border: `1px solid #27272a`, padding: "12px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  row: { display: "flex", gap: 8 },
  recommendation: (sev) => {
    const colors = {
      high: { bg: "#1c0f0f", border: "#7f1d1d", text: "#fca5a5" },
      mid: { bg: "#1c1810", border: "#854d0e", text: "#fde68a" },
      good: { bg: "#0d1c14", border: "#065f46", text: "#6ee7b7" },
      info: { bg: "#0f1420", border: "#1e3a8a", text: "#93c5fd" },
    };
    const c = colors[sev] || colors.info;
    return { background: c.bg, border: `1px solid ${c.border}`, color: c.text, padding: "10px 12px", borderRadius: 8, marginBottom: 6, fontSize: 13, lineHeight: 1.4 };
  },
  fab: { position: "fixed", bottom: 78, right: 16, width: 52, height: 52, borderRadius: "50%", background: C.accent, color: C.bg, border: "none", fontSize: 28, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 20px rgba(255,203,5,0.3)", zIndex: 5 },
};

// ============================================================
// PHOTO SECTION COMPONENT
// ============================================================
function PhotoSection({ sessionId, photos, onPhotosChange }) {
  const [previewPhoto, setPreviewPhoto] = useState(null); // { category, dataUrl }
  const [uploading, setUploading] = useState(null);
  const [loadedPhotos, setLoadedPhotos] = useState({}); // category -> dataUrl
  
  // Load photo thumbnails for display
  useEffect(() => {
    (async () => {
      const loaded = {};
      for (const cat of PHOTO_CATEGORIES) {
        const photoArr = photos[cat.id];
        if (photoArr && photoArr.length > 0) {
          // Load first photo as thumbnail
          const data = await loadPhoto(photoArr[0].key);
          if (data) loaded[cat.id] = data;
        }
      }
      setLoadedPhotos(loaded);
    })();
  }, [photos]);
  
  const handleCapture = async (categoryId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(categoryId);
    try {
      const compressed = await compressImage(file);
      const photoId = `${categoryId}_${Date.now()}`;
      const key = await savePhoto(sessionId, photoId, compressed);
      
      const existing = photos[categoryId] || [];
      const updated = {
        ...photos,
        [categoryId]: [...existing, { key, id: photoId, timestamp: Date.now() }],
      };
      onPhotosChange(updated);
      setLoadedPhotos(prev => ({ ...prev, [categoryId]: compressed }));
    } catch (err) {
      alert("Klaida išsaugant nuotrauką: " + err.message);
    }
    setUploading(null);
    e.target.value = "";
  };
  
  const handleDelete = async (categoryId, photoIdx) => {
    if (!window.confirm("Ištrinti šią nuotrauką?")) return;
    const arr = photos[categoryId] || [];
    const photo = arr[photoIdx];
    if (photo) await deletePhoto(photo.key);
    const newArr = arr.filter((_, i) => i !== photoIdx);
    const updated = { ...photos };
    if (newArr.length === 0) delete updated[categoryId];
    else updated[categoryId] = newArr;
    onPhotosChange(updated);
    
    // Reload thumbnail if any photos left
    if (newArr.length > 0) {
      const data = await loadPhoto(newArr[0].key);
      setLoadedPhotos(prev => ({ ...prev, [categoryId]: data }));
    } else {
      setLoadedPhotos(prev => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
    }
  };
  
  const handleViewAll = async (categoryId) => {
    const arr = photos[categoryId] || [];
    if (arr.length === 0) return;
    // Load all photos in this category
    const all = await Promise.all(arr.map(async (p) => ({
      ...p,
      data: await loadPhoto(p.key),
    })));
    setPreviewPhoto({ categoryId, photos: all, index: 0 });
  };
  
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {PHOTO_CATEGORIES.map(cat => {
          const arr = photos[cat.id] || [];
          const thumb = loadedPhotos[cat.id];
          const isUploading = uploading === cat.id;
          
          return (
            <div key={cat.id} style={{
              background: C.card,
              border: `1px solid ${arr.length > 0 ? C.accent : C.border}`,
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
              aspectRatio: "1",
            }}>
              {thumb ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }} onClick={() => handleViewAll(cat.id)}>
                  <img src={thumb} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                    color: C.text, padding: "16px 6px 4px", fontSize: 10, fontWeight: 700, textAlign: "center",
                  }}>
                    {cat.icon} {cat.label}
                    {arr.length > 1 && <span style={{ marginLeft: 4, color: C.accent }}>·{arr.length}</span>}
                  </div>
                </div>
              ) : (
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  width: "100%", height: "100%", cursor: "pointer", textAlign: "center", padding: 8,
                  opacity: isUploading ? 0.5 : 1,
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleCapture(cat.id, e)}
                    style={{ display: "none" }}
                    disabled={isUploading}
                  />
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.2, fontWeight: 600 }}>{cat.label}</div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 4 }}>{isUploading ? "..." : "+ pridėti"}</div>
                </label>
              )}
              {thumb && (
                <label style={{
                  position: "absolute", top: 4, right: 4,
                  background: "rgba(0,0,0,0.7)", color: C.accent,
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, cursor: "pointer", fontWeight: 700,
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleCapture(cat.id, e)}
                    style={{ display: "none" }}
                  />
                  +
                </label>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Hint about current category if user touches one */}
      <div style={{ marginTop: 10, fontSize: 11, color: C.dim, lineHeight: 1.4 }}>
        💡 Bakstelėk ikoną — atsidarys kamera. Bakstelėk paveikslėlį — peržiūra. <strong style={{ color: C.muted }}>+</strong> kampe = pridėti dar vieną tos pačios kategorijos.
      </div>
      
      {/* Lightbox preview */}
      {previewPhoto && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)",
            zIndex: 1000, display: "flex", flexDirection: "column",
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ color: C.text, fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2 }}>
              {PHOTO_CATEGORIES.find(c => c.id === previewPhoto.categoryId)?.label} ({previewPhoto.index + 1}/{previewPhoto.photos.length})
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(previewPhoto.categoryId, previewPhoto.index); setPreviewPhoto(null); }}
              style={{ background: "transparent", border: `1px solid ${C.danger}`, color: C.danger, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >TRINTI</button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "hidden" }}>
            {previewPhoto.photos[previewPhoto.index]?.data && (
              <img
                src={previewPhoto.photos[previewPhoto.index].data}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          {previewPhoto.photos.length > 1 && (
            <div style={{ padding: 12, display: "flex", justifyContent: "center", gap: 8 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setPreviewPhoto({ ...previewPhoto, index: Math.max(0, previewPhoto.index - 1) })}
                disabled={previewPhoto.index === 0}
                style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, padding: "8px 16px", borderRadius: 6, fontWeight: 700, opacity: previewPhoto.index === 0 ? 0.3 : 1 }}
              >‹ Ankst.</button>
              <button
                onClick={() => setPreviewPhoto({ ...previewPhoto, index: Math.min(previewPhoto.photos.length - 1, previewPhoto.index + 1) })}
                disabled={previewPhoto.index === previewPhoto.photos.length - 1}
                style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, padding: "8px 16px", borderRadius: 6, fontWeight: 700, opacity: previewPhoto.index === previewPhoto.photos.length - 1 ? 0.3 : 1 }}
              >Kita ›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SETUP WIZARD (pirmas paleidimas)
// ============================================================

function SetupWizard({ initialProfile, onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState(initialProfile || DEFAULT_PROFILE);
  
  const upd = (k, v) => setP({ ...p, [k]: v });
  const updSensor = (id, v) => setP({ ...p, sensors: { ...p.sensors, [id]: v } });
  const updTool = (id, v) => setP({ ...p, tools: { ...p.tools, [id]: v } });
  
  const STEPS = [
    { title: "Sveiki", icon: "🏁" },
    { title: "Vairuotojas", icon: "👤" },
    { title: "Įranga", icon: "🏎️" },
    { title: "Telemetrija", icon: "📊" },
    { title: "Sensoriai", icon: "🌡️" },
    { title: "Įrankiai", icon: "🛠️" },
    { title: "Tikslai", icon: "🎯" },
  ];
  
  const next = () => setStep(Math.min(STEPS.length - 1, step + 1));
  const prev = () => setStep(Math.max(0, step - 1));
  
  const finish = () => {
    onComplete({ ...p, setupComplete: true });
  };
  
  const wizardStyles = {
    container: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Manrope', system-ui, sans-serif", display: "flex", flexDirection: "column" },
    progress: { padding: "16px 16px 0", display: "flex", gap: 4, alignItems: "center" },
    progressBar: (active, done) => ({ flex: 1, height: 3, background: done ? C.accent : active ? C.accent : C.border, opacity: done || active ? 1 : 0.4, borderRadius: 2 }),
    header: { padding: "20px 20px 8px" },
    stepLabel: { fontSize: 11, color: C.dim, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 },
    stepTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, color: C.text, marginTop: 4 },
    body: { flex: 1, padding: "12px 20px", overflowY: "auto" },
    nav: { padding: 16, display: "flex", gap: 8, borderTop: `1px solid ${C.border}` },
    label: { display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: C.muted, marginBottom: 6, fontWeight: 600 },
    input: { width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "14px 16px", borderRadius: 10, fontFamily: "inherit", fontSize: 16, boxSizing: "border-box", outline: "none" },
    select: { width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "14px 16px", borderRadius: 10, fontFamily: "inherit", fontSize: 16, boxSizing: "border-box", appearance: "none", paddingRight: 36 },
    btn: { flex: 1, background: C.accent, color: C.bg, border: "none", padding: "16px", borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 2, fontWeight: 700, cursor: "pointer" },
    btnGhost: { flex: 1, background: "transparent", color: C.muted, border: `1px solid ${C.border}`, padding: "16px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" },
    toggle: (selected) => ({
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", marginBottom: 8, borderRadius: 10,
      background: selected ? "linear-gradient(135deg, #1f1611 0%, #131316 100%)" : C.card,
      border: `1px solid ${selected ? C.accent : C.border}`,
      cursor: "pointer", transition: "all 0.2s",
    }),
    toggleLeft: { flex: 1, paddingRight: 12 },
    toggleLabel: { fontSize: 14, fontWeight: 600, color: C.text },
    toggleDesc: { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 },
    toggleSwitch: (on) => ({
      width: 44, height: 26, borderRadius: 13, background: on ? C.accent : "#3f3f46",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }),
    toggleKnob: (on) => ({
      position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20,
      borderRadius: "50%", background: "#fff", transition: "left 0.2s",
    }),
    important: { fontSize: 9, padding: "2px 6px", background: "#3f2d05", color: C.accent, borderRadius: 99, fontWeight: 700, marginLeft: 6, letterSpacing: 0.5 },
    radioGroup: { display: "flex", flexDirection: "column", gap: 6 },
    radio: (selected) => ({
      padding: "14px 16px", borderRadius: 10, cursor: "pointer",
      background: selected ? "linear-gradient(135deg, #1f1611 0%, #131316 100%)" : C.card,
      border: `1px solid ${selected ? C.accent : C.border}`,
      transition: "all 0.2s",
    }),
    radioLabel: { fontSize: 15, fontWeight: 600, color: C.text },
    radioDesc: { fontSize: 11, color: C.muted, marginTop: 2 },
  };
  
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap'); * { box-sizing: border-box; }`}</style>
      <div style={wizardStyles.container}>
        <div style={wizardStyles.progress}>
          {STEPS.map((_, i) => (
            <div key={i} style={wizardStyles.progressBar(i === step, i < step)} />
          ))}
        </div>
        <div style={wizardStyles.header}>
          <div style={wizardStyles.stepLabel}>{STEPS[step].icon} {step + 1}/{STEPS.length} · {STEPS[step].title}</div>
        </div>
        <div style={wizardStyles.body}>
          
          {/* WELCOME */}
          {step === 0 && (
            <div>
              {/* DK Kart simple text logo - wizard intro */}
              <div style={{ marginBottom: 6, textAlign: "center" }}>
                <img src="/icon-512.png" alt="DK Kart" style={{ width: 140, height: 140, borderRadius: 24, boxShadow: "0 10px 40px rgba(255,203,5,0.2)" }} />
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
                Setup &amp; telemetrijos sekiklis jaunųjų kartingo talentų komandai.
              </div>
              <div style={{ background: C.card, padding: 16, borderRadius: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
                  Pirma — sukonfigūruosime tavo įrangą. Tai užtruks 2-3 minutes. Po to aplikacija pritaikys:
                </div>
                <ul style={{ fontSize: 13, color: C.muted, paddingLeft: 20, marginTop: 12, lineHeight: 1.8 }}>
                  <li>Rekomendacijos pagal turimus sensorius</li>
                  <li>Sesijos forma rodys tik aktualius laukus</li>
                  <li>Analizė bus pritaikyta tavo variklio klasei</li>
                </ul>
              </div>
              <div style={{ background: "linear-gradient(135deg, #1f1611 0%, #0a0a0b 100%)", border: `1px solid ${C.accent}`, padding: 14, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                  💡 Visus nustatymus galėsi pakeisti vėliau — tab <strong style={{ color: C.accent }}>Profilis</strong> aplikacijoje.
                </div>
              </div>
            </div>
          )}
          
          {/* DRIVER */}
          {step === 1 && (
            <div>
              <div style={wizardStyles.stepTitle}>Kas vairuoja?</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Pagrindinė informacija apie vairuotoją.
              </div>
              
              <label style={wizardStyles.label}>Vardas, pavardė</label>
              <input style={wizardStyles.input} value={p.driverName} onChange={(e) => upd("driverName", e.target.value)} placeholder="Vardas Pavardė" />
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Gimimo metai (nebūtina)</label>
              <input style={wizardStyles.input} type="number" value={p.birthYear || ""} onChange={(e) => upd("birthYear", e.target.value)} placeholder="pvz. 2008" />
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Bazinė trasa</label>
              <input style={wizardStyles.input} value={p.homeTrack} onChange={(e) => upd("homeTrack", e.target.value)} placeholder="pvz. Anykščių kartodromas" />
            </div>
          )}
          
          {/* EQUIPMENT */}
          {step === 2 && (
            <div>
              <div style={wizardStyles.stepTitle}>Įranga</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Važiuoklė, variklis, padangos.
              </div>
              
              <label style={wizardStyles.label}>Važiuoklės gamintojas</label>
              <select style={wizardStyles.select} value={p.chassis} onChange={(e) => upd("chassis", e.target.value)}>
                <option value="">— pasirink —</option>
                {CHASSIS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Važiuoklės modelis (nebūtinas)</label>
              <input style={wizardStyles.input} value={p.chassisModel || ""} onChange={(e) => upd("chassisModel", e.target.value)} placeholder="pvz. KT2, Racer 401RR" />
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Variklio šeima</label>
              <select style={wizardStyles.select} value={p.engineFamily} onChange={(e) => {
                const f = e.target.value;
                setP({ ...p, engineFamily: f, engineModel: ENGINE_FAMILIES[f][0] });
              }}>
                {Object.keys(ENGINE_FAMILIES).map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Variklio modelis</label>
              <select style={wizardStyles.select} value={p.engineModel} onChange={(e) => upd("engineModel", e.target.value)}>
                {(ENGINE_FAMILIES[p.engineFamily] || []).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              
              <label style={{ ...wizardStyles.label, marginTop: 14 }}>Padangos</label>
              <select style={wizardStyles.select} value={p.tireBrand} onChange={(e) => upd("tireBrand", e.target.value)}>
                {TIRE_BRANDS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          
          {/* TELEMETRY */}
          {step === 3 && (
            <div>
              <div style={wizardStyles.stepTitle}>Telemetrija</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Kokį ratų laikrodį ar telemetrijos sistemą naudoji?
              </div>
              <div style={wizardStyles.radioGroup}>
                {TELEMETRY_OPTIONS.map((t) => (
                  <div key={t.id} style={wizardStyles.radio(p.telemetry === t.id)} onClick={() => upd("telemetry", t.id)}>
                    <div style={wizardStyles.radioLabel}>{t.label}</div>
                    <div style={wizardStyles.radioDesc}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* SENSORS */}
          {step === 4 && (
            <div>
              <div style={wizardStyles.stepTitle}>Sensoriai</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Kuriuos sensorius turi prijungtus? Rekomendacijos bus pritaikytos pagal pasirinkimus.
              </div>
              {p.telemetry === "none" ? (
                <div style={{ ...C.card, background: C.card, padding: 16, borderRadius: 12, color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
                  Neturit telemetrijos sistemos — sensorių pasirinkimas nereikalingas. Galit pildyti tik ratų laikus ranka.
                </div>
              ) : (
                SENSOR_OPTIONS.map((s) => {
                  const on = !!p.sensors[s.id];
                  return (
                    <div key={s.id} style={wizardStyles.toggle(on)} onClick={() => !s.alwaysOn && updSensor(s.id, !on)}>
                      <div style={wizardStyles.toggleLeft}>
                        <div style={wizardStyles.toggleLabel}>
                          {s.label}
                          {s.id === "egt" && <span style={wizardStyles.important}>SVARBU</span>}
                          {s.alwaysOn && <span style={{ ...wizardStyles.important, background: "#1f1f23", color: C.dim }}>VISADA</span>}
                        </div>
                        <div style={wizardStyles.toggleDesc}>{s.desc}</div>
                      </div>
                      <div style={wizardStyles.toggleSwitch(on)}>
                        <div style={wizardStyles.toggleKnob(on)} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          
          {/* TOOLS */}
          {step === 5 && (
            <div>
              <div style={wizardStyles.stepTitle}>Įrankiai</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Kokius matavimo įrankius turi boksuose? Pažymėk visus, kuriuos naudoji.
              </div>
              {TOOL_OPTIONS.map((t) => {
                const on = !!p.tools[t.id];
                return (
                  <div key={t.id} style={wizardStyles.toggle(on)} onClick={() => updTool(t.id, !on)}>
                    <div style={wizardStyles.toggleLeft}>
                      <div style={wizardStyles.toggleLabel}>
                        {t.label}
                        {t.important && <span style={wizardStyles.important}>NAUDINGA</span>}
                      </div>
                    </div>
                    <div style={wizardStyles.toggleSwitch(on)}>
                      <div style={wizardStyles.toggleKnob(on)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* GOALS */}
          {step === 6 && (
            <div>
              <div style={wizardStyles.stepTitle}>Tikslai</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 20 }}>
                Ką nori pasiekti? (Šitas tekstas atsiras kaip motyvacija aplikacijoje.)
              </div>
              
              <label style={wizardStyles.label}>Tikslinis rato laikas (sek.)</label>
              <input style={wizardStyles.input} type="number" step="0.01" value={p.targetLapTime} onChange={(e) => upd("targetLapTime", e.target.value)} placeholder="pvz. 40.00" />
              <div style={{ fontSize: 11, color: C.dim, marginTop: 6, lineHeight: 1.4 }}>
                Geriausias laikas, kurio sieki savo bazinėje trasoje.
              </div>
              
              <label style={{ ...wizardStyles.label, marginTop: 20 }}>Trumpas tikslo aprašymas (nebūtinas)</label>
              <textarea style={{ ...wizardStyles.input, minHeight: 90, fontFamily: "inherit" }} value={p.goalNotes || ""} onChange={(e) => upd("goalNotes", e.target.value)} 
                placeholder="pvz. Sub-40s Anykščiuose iki birželio. RMC čempionato top-3 sezone." />
              
              <div style={{ marginTop: 24, padding: 14, background: "linear-gradient(135deg, #0d1c14 0%, #131316 100%)", border: `1px solid #065f46`, borderRadius: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1.5, color: C.good, marginBottom: 6 }}>✓ VISKAS PARUOŠTA</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                  Paspausk <strong style={{ color: C.accent }}>Pradėti</strong> — eisi į pagrindinį ekraną. Galėsi pradėti pildyti pirmą sesiją.
                </div>
              </div>
            </div>
          )}
          
        </div>
        <div style={wizardStyles.nav}>
          {step === 0 ? (
            <>
              <button style={wizardStyles.btnGhost} onClick={onSkip}>Praleisti</button>
              <button style={wizardStyles.btn} onClick={next}>Pradėti →</button>
            </>
          ) : step === STEPS.length - 1 ? (
            <>
              <button style={wizardStyles.btnGhost} onClick={prev}>← Atgal</button>
              <button style={wizardStyles.btn} onClick={finish}>Pradėti</button>
            </>
          ) : (
            <>
              <button style={wizardStyles.btnGhost} onClick={prev}>← Atgal</button>
              <button style={wizardStyles.btn} onClick={next}>Toliau →</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// SETTINGS VIEW (editable profile)
// ============================================================

function SettingsView({ profile, onSave, onReset }) {
  const [p, setP] = useState(profile);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => { setP(profile); }, [profile]);
  
  if (editing) {
    return <SetupWizard initialProfile={p} onComplete={(newP) => { onSave(newP); setEditing(false); }} onSkip={() => setEditing(false)} />;
  }
  
  return (
    <div>
      <div style={styles.h2}>Profilis ir įranga</div>
      
      <div style={{ ...styles.card, marginBottom: 14 }}>
        <div style={styles.h3}>Vairuotojas</div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div><span style={{ color: C.muted }}>Vardas:</span> <strong>{p.driverName || "—"}</strong></div>
          {p.birthYear && <div><span style={{ color: C.muted }}>Gimimo metai:</span> {p.birthYear}</div>}
          <div><span style={{ color: C.muted }}>Bazinė trasa:</span> {p.homeTrack || "—"}</div>
        </div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.h3}>Įranga</div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div><span style={{ color: C.muted }}>Važiuoklė:</span> <strong>{p.chassis || "—"} {p.chassisModel || ""}</strong></div>
          <div><span style={{ color: C.muted }}>Variklis:</span> <strong>{p.engineFamily} {p.engineModel}</strong></div>
          <div><span style={{ color: C.muted }}>Padangos:</span> <strong>{p.tireBrand}</strong></div>
          <div><span style={{ color: C.muted }}>Telemetrija:</span> <strong>{TELEMETRY_OPTIONS.find(t => t.id === p.telemetry)?.label || "—"}</strong></div>
        </div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.h3}>Sensoriai</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SENSOR_OPTIONS.filter(s => p.sensors?.[s.id]).map(s => (
            <span key={s.id} style={{ padding: "4px 10px", background: "#0d1c14", color: C.good, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
              ✓ {s.label}
            </span>
          ))}
          {SENSOR_OPTIONS.filter(s => !p.sensors?.[s.id] && !s.alwaysOn).map(s => (
            <span key={s.id} style={{ padding: "4px 10px", background: "#1f1f23", color: C.dim, borderRadius: 99, fontSize: 11 }}>
              ✗ {s.label}
            </span>
          ))}
        </div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.h3}>Įrankiai</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TOOL_OPTIONS.filter(t => p.tools?.[t.id]).map(t => (
            <span key={t.id} style={{ padding: "4px 10px", background: "#0d1c14", color: C.good, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
              ✓ {t.label}
            </span>
          ))}
          {TOOL_OPTIONS.filter(t => !p.tools?.[t.id]).map(t => (
            <span key={t.id} style={{ padding: "4px 10px", background: "#1f1f23", color: C.dim, borderRadius: 99, fontSize: 11 }}>
              ✗ {t.label}
            </span>
          ))}
        </div>
      </div>
      
      {(p.targetLapTime || p.goalNotes) && (
        <div style={styles.card}>
          <div style={styles.h3}>Tikslai</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            {p.targetLapTime && <div><span style={{ color: C.muted }}>Tikslinis ratas:</span> <strong style={{ color: C.accent, fontFamily: "'JetBrains Mono', monospace" }}>{p.targetLapTime}s</strong></div>}
            {p.goalNotes && <div style={{ marginTop: 6, color: C.text }}>{p.goalNotes}</div>}
          </div>
        </div>
      )}
      
      <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => setEditing(true)}>Redaguoti profilį</button>
      <button style={styles.btnGhost} onClick={() => {
        if (window.confirm("Atstatyti į pradinius nustatymus? Bus parodytas setup ekranas iš naujo.")) onReset();
      }}>Atstatyti setup</button>
    </div>
  );
}

// ============================================================
// LAP COMMENTS + VIDEO SECTION (v3)
// ============================================================
function LapCommentsSection({ lapComments, lapCount, onChange, sessionId, videoKey, onVideoChange }) {
  const [newLap, setNewLap] = useState("");
  const [newText, setNewText] = useState("");
  const [videoLoaded, setVideoLoaded] = useState(null); // {url, key}
  const [uploading, setUploading] = useState(false);
  
  // Load video if exists
  useEffect(() => {
    if (videoKey) {
      (async () => {
        try {
          const r = await window.storage.get(videoKey);
          if (r && r.value) setVideoLoaded({ url: r.value, key: videoKey });
        } catch {}
      })();
    } else {
      setVideoLoaded(null);
    }
  }, [videoKey]);
  
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Warn about size (storage limit is 5MB per key)
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > 4.5) {
      alert(`Video per didelis (${sizeMB.toFixed(1)} MB). Maksimalus 4.5 MB. Sumažink kokybę arba trumpink.`);
      return;
    }
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        const key = `dkkart:video:${sessionId}`;
        await window.storage.set(key, dataUrl);
        onVideoChange(key);
        setVideoLoaded({ url: dataUrl, key });
        setUploading(false);
      };
      reader.onerror = () => { setUploading(false); alert("Klaida skaitant failą"); };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      alert("Klaida: " + err.message);
    }
    e.target.value = "";
  };
  
  const handleVideoDelete = async () => {
    if (!videoKey) return;
    if (!window.confirm("Ištrinti video?")) return;
    try { await window.storage.delete(videoKey); } catch {}
    onVideoChange(null);
    setVideoLoaded(null);
  };
  
  const addComment = () => {
    const lap = parseInt(newLap);
    if (!lap || !newText.trim()) return;
    const updated = [...(lapComments || []), { lap, text: newText.trim(), ts: Date.now() }]
      .sort((a, b) => a.lap - b.lap);
    onChange(updated);
    setNewLap("");
    setNewText("");
  };
  
  const removeComment = (idx) => {
    onChange(lapComments.filter((_, i) => i !== idx));
  };
  
  return (
    <div>
      {/* Video upload */}
      <div style={{ marginBottom: 12 }}>
        {!videoLoaded ? (
          <label style={{ display: "block", cursor: "pointer" }}>
            <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: "none" }} disabled={uploading} />
            <div style={{ background: C.card, border: `1px dashed ${C.border}`, padding: "16px", borderRadius: 10, textAlign: "center", color: C.muted }}>
              {uploading ? "Įkeliama..." : "🎥 Įkelti video (max 4.5 MB)"}
              <div style={{ fontSize: 10, marginTop: 4, color: C.dim }}>iPhone: kompresijai naudok "Mažas" kokybę</div>
            </div>
          </label>
        ) : (
          <div style={{ position: "relative", background: "#000", borderRadius: 10, overflow: "hidden" }}>
            <video src={videoLoaded.url} controls playsInline style={{ width: "100%", maxHeight: 300, display: "block" }} />
            <button onClick={handleVideoDelete} style={{
              position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: C.danger,
              border: `1px solid ${C.danger}`, padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>TRINTI</button>
          </div>
        )}
      </div>
      
      {/* Lap comments */}
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
        Žiūrint video — pažymėk svarbius ratus ir kas vyko (T1 understeer, T3 perdaug pasviro, etc).
      </div>
      
      <div style={styles.row}>
        <div style={{ flex: "0 0 70px" }}>
          <input style={styles.input} type="number" placeholder="Ratas #" value={newLap} onChange={(e) => setNewLap(e.target.value)} min="1" />
        </div>
        <div style={{ flex: 1 }}>
          <input style={styles.input} placeholder="pvz. T3 perdaug stabdymo" value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()} />
        </div>
        <button onClick={addComment} style={{ ...styles.btnSmall, background: C.accent, color: C.bg, padding: "10px 16px", fontWeight: 700 }}>+</button>
      </div>
      
      {(lapComments || []).length > 0 && (
        <div style={{ marginTop: 10 }}>
          {lapComments.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 10px", background: C.card, borderRadius: 8, marginBottom: 4, borderLeft: `2px solid ${C.accent}` }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.bg, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginRight: 10, flexShrink: 0 }}>
                {c.lap}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: C.text }}>{c.text}</div>
              <button onClick={() => removeComment(i)} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 16, cursor: "pointer", padding: "0 4px" }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORMA
// ============================================================

/**
 * CollapsibleSection — sutraukiamas blokas formoje.
 * Saugo state'ą per visus sesijos render'us.
 * Reaguoja į forceState propą (jei perduotas) — naudojama "Open all / Close all" mygtukuose.
 * 
 * progress: { filled, total } — rodo užpildymo statusą
 * sectionId: stringas elementui id (skip-to navigacijai)
 */
function CollapsibleSection({ title, icon, badge, children, defaultOpen = false, hasError = false, forceState = null, progress = null, sectionId = null }) {
  const [open, setOpen] = useState(defaultOpen);
  
  // Jei perduotas force state — naudoja jį
  useEffect(() => {
    if (forceState === "open") setOpen(true);
    else if (forceState === "closed") setOpen(false);
  }, [forceState]);
  
  // Progress percentage
  const progressPct = progress && progress.total > 0 
    ? Math.round((progress.filled / progress.total) * 100)
    : null;
  
  return (
    <div id={sectionId} style={{ marginBottom: 8, border: `1px solid ${hasError ? C.danger : C.border}`, borderRadius: 10, background: C.card, overflow: "hidden", scrollMarginTop: 80 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          color: C.text,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          position: "relative",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <span>{title}</span>
          {badge && (
            <span style={{ 
              padding: "2px 6px", 
              background: hasError ? C.danger : C.accent + "22",
              color: hasError ? "#fff" : C.accent,
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>{badge}</span>
          )}
          {progressPct !== null && (
            <span style={{ 
              fontSize: 10,
              color: progressPct === 100 ? C.good : (progressPct >= 50 ? C.accent : C.muted),
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: 0,
              marginLeft: "auto",
              marginRight: 8,
            }}>
              {progress.filled}/{progress.total}
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>
      
      {/* Progress bar */}
      {progressPct !== null && progressPct > 0 && (
        <div style={{ height: 2, background: C.border, position: "relative" }}>
          <div style={{ 
            height: "100%",
            width: `${progressPct}%`,
            background: progressPct === 100 ? C.good : C.accent,
            transition: "width 0.3s",
          }} />
        </div>
      )}
      
      {open && (
        <div style={{ padding: "0 14px 14px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 14 }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Swipe-to-back gesture handler hook.
 * Detekas svaipą iš kairės į dešinę → triggerina onBack.
 */
function useSwipeBack(onBack, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let startX = 0, startY = 0, startTime = 0;
    let active = false;
    
    const onTouchStart = (e) => {
      // Tik jei svaipas pradedamas iš pat kairio krašto (60px nuo kairės)
      if (e.touches[0].clientX > 60) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      active = true;
    };
    
    const onTouchEnd = (e) => {
      if (!active) return;
      active = false;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = Math.abs(endY - startY);
      const dt = Date.now() - startTime;
      
      // Svaipas turi būti:
      // - iš kairės į dešinę (dx > 80)
      // - horizontalus (dy < 50)
      // - greitas (< 500ms)
      if (dx > 80 && dy < 50 && dt < 500) {
        onBack();
      }
    };
    
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onBack, enabled]);
}

function SessionForm({ session, history, profile, onSave, onCancel }) {
  // Determine brake config from engine profile
  const hasFrontBrakes = profile ? engineHasFrontBrakes(profile.engineFamily, profile.engineModel) : false;
  
  // Generate stable session ID for photo storage
  const [stableId] = useState(() => session?.id || `s_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
  
  const [s, setS] = useState(session || {
    id: stableId,
    date: TODAY, time: "", track: profile?.homeTrack || "", driver: profile?.driverName || "",
    sessionType: "training", // "training" | "race_event" — turi įtakos dalijimui
    airTemp: "", pressure: 1020, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "",
    cold_F: "", cold_R: "", hot_F: "", hot_R: "",
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "", camber: "",
    gear_F: 12, gear_R: 76, mainJet: "", needle: 3, airScrew: "",
    bestLap: "", avgLap: "", std: "", lapCount: "",
    waterMin: "", waterMax: "", waterAvg: "", egtMax: "", egtAvg: "",
    rpmSustainedStraight: "", rpmNearTop: "", pedalEventsPerLap: "", topSpeedP99: "", topSpeedMax: "",
    notes: "", weight: "",
    // V3 NEW FIELDS:
    engineHours: "",           // Variklio valandos
    tireHeatCycles: "",        // Padangų kaitinimo ciklai
    weight_FL: "", weight_FR: "", weight_RL: "", weight_RR: "", // 4 ratų svoris
    frontStabilizer: "",       // Priekio stabilizatorius (storis/kietumas)
    torsionBarRear: "",        // Galo torsion bar
    seatPosF: "", seatPosV: "", // Sėdynės pozicija (priekio/galo mm, vertikalė mm)
    seatSupportCount: "",      // Atramų skaičius (0-4)
    seatSupportType: "",       // Atramų tipas (kietos/minkštos)
    tireTemp_FL_in: "", tireTemp_FL_mid: "", tireTemp_FL_out: "",  // PK padangos t°
    tireTemp_FR_in: "", tireTemp_FR_mid: "", tireTemp_FR_out: "",  // PD padangos t°
    tireTemp_RL_in: "", tireTemp_RL_mid: "", tireTemp_RL_out: "",  // GK padangos t°
    tireTemp_RR_in: "", tireTemp_RR_mid: "", tireTemp_RR_out: "",  // GD padangos t°
    // BRAKE SYSTEM v3 (Rotax Senior = GALO only, NĖRA priekio stabdžio):
    brakePadRear_compound: "",      // Red Carbon / Ferodo KA / IKP Green / OEM kita
    brakePadRear_thickness: "",     // mm - friction sluoksnio storis
    brakePadRear_glazed: "",        // taip/ne/dalinai
    brakePadRear_ageSessions: "",   // kiek sesijų paduškos
    brakeDiscRear_thickness: "",    // mm
    brakeDiscType: "",              // floating iron / cast iron / ceramic
    brakeFluidType: "",             // DOT 4 / DOT 5.1 / DOT 5.1 racing
    brakeFluidAgeMonths: "",        // amžius mėnesiais
    brakePedalFeel: "",             // kietas / vidutinis / minkstas-spongy
    brakeMaxDecel_g: "",            // iš telemetrijos
    brakeProfile_problematic: "",   // posūkių numeriai, kur EARLY profile
    sparePadsCount: "",             // Atsarginių paduškų skaičius boksuose
    lapComments: [],           // Komentarai pagal ratą: [{lap: 5, text: "T3 perdaug"}]
    videoKey: null,            // Video saugomas atskirai
    photos: {},
  });
  const [importStatus, setImportStatus] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [sectionsForceState, setSectionsForceState] = useState(null);
  
  // Reset force state after applying
  useEffect(() => {
    if (sectionsForceState !== null) {
      const t = setTimeout(() => setSectionsForceState(null), 100);
      return () => clearTimeout(t);
    }
  }, [sectionsForceState]);
  
  // Progress per section — skaičiuoja, kiek esminių laukų užpildyta
  const progress = useMemo(() => {
    const filled = (v) => v !== "" && v !== null && v !== undefined;
    return {
      base: { filled: [s.date, s.time, s.track, s.driver, s.sessionType].filter(filled).length, total: 5 },
      conditions: { filled: [s.airTemp, s.trackTemp, s.pressure, s.weather].filter(filled).length, total: 4 },
      tires: { filled: [s.tireBrand, s.cold_F, s.cold_R, s.hot_F, s.hot_R, s.tireAge].filter(filled).length, total: 6 },
      chassis: { filled: [s.toe, s.camber, s.caster, s.trackWidthR, s.seatPos].filter(filled).length, total: 5 },
      engine: { filled: [s.gear_F, s.gear_R, s.mainJet, s.needle].filter(filled).length, total: 4 },
      telemetry: { filled: [s.bestLap, s.avgLap, s.lapCount, s.rpmNearTop, s.topSpeedP99].filter(filled).length, total: 5 },
      notes: { filled: [s.notes].filter(filled).length, total: 1 },
    };
  }, [s]);
  
  // Required fields check — minimalus rinkinys, kad sesija būtų naudinga
  const validation = useMemo(() => {
    const errors = {};
    if (!s.date) errors.base = "Trūksta datos";
    if (!s.driver) errors.base = "Trūksta vairuotojo";
    if (!s.bestLap) errors.telemetry = "Trūksta geriausio rato";
    return errors;
  }, [s.date, s.driver, s.bestLap]);
  
  // Skip to section
  const scrollToSection = (sectionId) => {
    setSectionsForceState("open");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };
  
  const upd = (k, v) => { setDirty(true); setS({ ...s, [k]: v }); };
  const numOrNull = (v) => (v === "" || v === null) ? null : parseFloat(v);

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus({ type: "loading", text: "Apdorojama..." });
    try {
      const text = await file.text();
      // Universal parser — auto-detects MyChron/Alfano/RaceChrono/RaceCapture/Unipro
      const parsed = parseTelemetryCSV(text);
      const detectedFormat = parsed._format || 'AiM MyChron';
      // For AiM, run additional analysis; for others, the parser already filled all fields
      const analysis = detectedFormat.startsWith('AiM') ? analyzeAiMData(parsed) : parsed;
      
      // Auto-fill fields, preserving manual entries where they exist
      setS(prev => ({
        ...prev,
        date: analysis.date || prev.date,
        time: analysis.time || prev.time,
        driver: analysis.racer || prev.driver,
        bestLap: analysis.bestLap ?? prev.bestLap,
        avgLap: analysis.avgLap ?? prev.avgLap,
        std: analysis.std ?? prev.std,
        lapCount: analysis.lapCount ?? prev.lapCount,
        topSpeedMax: analysis.topSpeedMax ?? prev.topSpeedMax,
        topSpeedP99: analysis.topSpeedP99 ?? prev.topSpeedP99,
        rpmSustainedStraight: analysis.rpmSustainedStraight ?? prev.rpmSustainedStraight,
        rpmNearTop: analysis.rpmNearTop ?? prev.rpmNearTop,
        pedalEventsPerLap: analysis.pedalEventsPerLap ?? prev.pedalEventsPerLap,
        waterMin: analysis.waterMin ?? prev.waterMin,
        waterMax: analysis.waterMax ?? prev.waterMax,
        waterAvg: analysis.waterAvg ?? prev.waterAvg,
        egtAvg: analysis.egtAvg ?? prev.egtAvg,
        egtMax: analysis.egtMax ?? prev.egtMax,
        notes: prev.notes || analysis.comment,
      }));
      
      const lines = [`📁 ${detectedFormat}`, `${analysis.lapCount || 0} švarūs ratai`];
      if (analysis.bestLap) lines.push(`Geriausias: ${analysis.bestLap}s`);
      if (analysis.rpmNearTop) lines.push(`RPM top speed: ${analysis.rpmNearTop}`);
      if (analysis.topSpeedP99) lines.push(`Top p99: ${analysis.topSpeedP99} km/h`);
      if (analysis.pedalEventsPerLap) {
        const style = analyzeDrivingStyle(analysis.pedalEventsPerLap, 40);
        lines.push(`${style?.icon || "🦶"} ${analysis.pedalEventsPerLap} pedalo judesių/ratą`);
      }
      if (analysis.egtAvg) lines.push(`EGT: ${analysis.egtAvg}°C`);
      else if (detectedFormat.startsWith('AiM')) lines.push(`⚠ EGT nerasta CSV faile`);
      setImportStatus({ type: "success", text: lines.join(" · ") });
    } catch (err) {
      setImportStatus({ type: "error", text: `Klaida: ${err.message}` });
    }
    e.target.value = "";
  };
  
  const handleSave = () => {
    const cleaned = { ...s, id: s.id || stableId, photos: s.photos || {}, lapComments: s.lapComments || [] };
    ["airTemp","pressure","humidity","trackTemp","cold_F","cold_R","hot_F","hot_R","mainJet","needle",
     "gear_F","gear_R","bestLap","avgLap","std","lapCount","waterMin","waterMax","waterAvg","egtMin","egtMax","egtAvg",
     "rpmSustainedStraight","rpmNearTop","pedalEventsPerLap","topSpeedP99","topSpeedMax","weight","trackWidthR","camber",
     "engineHours","tireHeatCycles","weight_FL","weight_FR","weight_RL","weight_RR","seatPosF","seatPosV","seatSupportCount",
     "tireTemp_FL_in","tireTemp_FL_mid","tireTemp_FL_out","tireTemp_FR_in","tireTemp_FR_mid","tireTemp_FR_out",
     "tireTemp_RL_in","tireTemp_RL_mid","tireTemp_RL_out","tireTemp_RR_in","tireTemp_RR_mid","tireTemp_RR_out",
     "brakePadRear_thickness","brakePadRear_ageSessions","brakeDiscRear_thickness",
     "brakeFluidAgeMonths","brakeMaxDecel_g","sparePadsCount"].forEach(k => {
      cleaned[k] = numOrNull(cleaned[k]);
    });
    onSave(cleaned);
  };
  
  // Live recommendations as user fills
  const liveRecs = useMemo(() => {
    const sNum = { ...s };
    ["airTemp","pressure","cold_F","cold_R","hot_F","hot_R","mainJet","gear_F","gear_R",
     "waterAvg","waterMax","egtAvg","egtMax","rpmSustainedStraight","topSpeedP99","bestLap"].forEach(k => {
      sNum[k] = numOrNull(s[k]);
    });
    return generateRecommendations(sNum, history);
  }, [s, history]);
  
  // Smart back handler — paklausia jei buvo pakeitimų
  const handleBack = () => {
    if (dirty) {
      if (confirm("Yra neišsaugotų pakeitimų.\n\nAr tikrai norite išeiti be išsaugojimo?")) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };
  
  // Swipe-back gestas (iš kairio krašto į dešinę)
  useSwipeBack(handleBack);
  
  return (
    <div>
      {/* Top bar su atgal mygtuku */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        padding: "8px 0 16px 0",
        position: "sticky",
        top: 0,
        background: C.bg,
        zIndex: 10,
        marginBottom: 4,
      }}>
        <button onClick={handleBack}
          style={{ 
            background: "transparent",
            border: "none",
            color: C.text,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            padding: "8px 12px 8px 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>‹</span>
          <span>Atgal</span>
          {dirty && <span style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, marginLeft: 4 }} title="Neišsaugoti pakeitimai" />}
        </button>
        {!s._isShared && (
          <button onClick={handleSave}
            style={{ 
              background: C.accent,
              color: C.bg,
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 1.5,
            }}>
            Išsaugoti
          </button>
        )}
      </div>
      
      <div style={styles.h2}>{session ? "Sesijos duomenys" : "Nauja sesija"}</div>
      
      {/* CSV Import section */}
      <div style={{ background: "linear-gradient(135deg, #1f1611 0%, #0a0a0b 100%)", border: `1px solid ${C.accent}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, color: C.accent }}>MyChron CSV importas</div>
          <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>iš LapSnap arba RS3</div>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>
          Įkėlus CSV automatiškai užsipildys: data, laikas, ratų laikai, top speed, sustained RPM, vandens temp, EGT (jei prijungta).
        </div>
        <label style={{ display: "block", cursor: "pointer" }}>
          <input type="file" accept=".csv,text/csv" onChange={handleCSVImport} style={{ display: "none" }} />
          <div style={{ background: C.accent, color: C.bg, padding: "12px", borderRadius: 8, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>
            📂 Pasirinkti CSV failą
          </div>
        </label>
        {importStatus && (
          <div style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: importStatus.type === "success" ? "#0d1c14" : importStatus.type === "error" ? "#1c0f0f" : "#0f1420",
            color: importStatus.type === "success" ? "#6ee7b7" : importStatus.type === "error" ? "#fca5a5" : "#93c5fd",
            fontSize: 12,
            lineHeight: 1.5,
          }}>{importStatus.text}</div>
        )}
      </div>
      
      {/* Section controls — overall progress + skip + expand/collapse */}
      <div style={{ marginBottom: 12, padding: 12, background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
        {/* Overall progress bar */}
        {(() => {
          const totalFilled = Object.values(progress).reduce((a, b) => a + b.filled, 0);
          const totalFields = Object.values(progress).reduce((a, b) => a + b.total, 0);
          const overallPct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;
          return (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Sesijos užpildymas
                </div>
                <div style={{ fontSize: 13, color: overallPct === 100 ? C.good : C.accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {totalFilled}/{totalFields} <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>({overallPct}%)</span>
                </div>
              </div>
              <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ 
                  height: "100%",
                  width: `${overallPct}%`,
                  background: overallPct === 100 ? C.good : (overallPct >= 50 ? C.accent : "#854d0e"),
                  transition: "width 0.3s",
                  borderRadius: 2,
                }} />
              </div>
            </div>
          );
        })()}
        
        {/* Skip-to-section selector + expand/collapse */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select 
            value=""
            onChange={(e) => { if (e.target.value) scrollToSection(e.target.value); }}
            style={{ 
              flex: 1, 
              minWidth: 0,
              padding: "8px 10px", 
              background: C.bg, 
              color: C.text, 
              border: `1px solid ${C.border}`, 
              borderRadius: 6, 
              fontSize: 12, 
              fontFamily: "'Manrope', sans-serif",
              cursor: "pointer",
            }}
          >
            <option value="">→ Peršokti į skiltį...</option>
            <option value="sec-base">📋 Bazė ({progress.base.filled}/{progress.base.total})</option>
            <option value="sec-conditions">🌡️ Sąlygos ({progress.conditions.filled}/{progress.conditions.total})</option>
            <option value="sec-tires">🛞 Padangos ({progress.tires.filled}/{progress.tires.total})</option>
            <option value="sec-chassis">⚙️ Važiuoklė ({progress.chassis.filled}/{progress.chassis.total})</option>
            <option value="sec-engine">🏎️ Variklis ({progress.engine.filled}/{progress.engine.total})</option>
            <option value="sec-telemetry">📊 Telemetrija ({progress.telemetry.filled}/{progress.telemetry.total})</option>
            <option value="sec-notes">📝 Pastabos</option>
            <option value="sec-photos">📸 Nuotraukos</option>
          </select>
          <button onClick={() => setSectionsForceState("open")}
            style={{ padding: "8px 10px", background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            ▼ Visi
          </button>
          <button onClick={() => setSectionsForceState("closed")}
            style={{ padding: "8px 10px", background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            ▲ Sutraukti
          </button>
        </div>
      </div>
      
      <CollapsibleSection sectionId="sec-base" title="Bazė" icon="📋" defaultOpen={true} 
        progress={progress.base}
        hasError={!!validation.base}
        badge={validation.base ? "⚠ trūksta" : null}
        forceState={sectionsForceState}>
      {s._isShared && (
        <div style={{ padding: 12, background: "#1c1810", border: `1px solid #854d0e`, color: "#fde68a", fontSize: 12, borderRadius: 8, marginBottom: 12, lineHeight: 1.5 }}>
          👥 <strong>Kolegos sesija</strong> {s._sharedFrom && <>iš <strong>{s._sharedFrom}</strong></>}
          <br/>Šie duomenys yra tik peržiūrai — negalima redaguoti. Naudok juos palyginimui per "Palyginimas" skirtuką.
        </div>
      )}
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Data</label>
          <input style={styles.input} type="date" value={s.date} onChange={(e) => upd("date", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Laikas</label>
          <input style={styles.input} type="time" value={s.time} onChange={(e) => upd("time", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Trasa</label>
          <input style={styles.input} value={s.track} onChange={(e) => upd("track", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Vairuotojas</label>
          <input style={styles.input} value={s.driver} onChange={(e) => upd("driver", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Sesijos tipas</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.sessionType || "training"} onChange={(e) => upd("sessionType", e.target.value)}>
            <option value="training">🔒 Treniruotė (privatu)</option>
            <option value="qualifying">🏁 Kvalifikacija (privatu)</option>
            <option value="race_event">📢 Etapas / Varžybos (galima dalintis)</option>
          </select>
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: 4 }}>
        💡 Treniruočių duomenys privatūs. Tik po etapo / varžybų galima dalintis su kolegomis.
      </div>
      </CollapsibleSection>
      
      <CollapsibleSection sectionId="sec-conditions" progress={progress.conditions} title="Sąlygos" icon="🌡️" defaultOpen={true} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Oro t° (°C)</label>
          <input style={styles.input} type="number" step="0.1" value={s.airTemp} onChange={(e) => upd("airTemp", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Asfalto t° (°C)</label>
          <input style={styles.input} type="number" step="0.1" value={s.trackTemp} onChange={(e) => upd("trackTemp", e.target.value)} placeholder="su pirometru" />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Slėgis (hPa)</label>
          <input style={styles.input} type="number" value={s.pressure} onChange={(e) => upd("pressure", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Drėgmė (%)</label>
          <input style={styles.input} type="number" value={s.humidity} onChange={(e) => upd("humidity", e.target.value)} />
        </div>
      </div>
      <label style={{ ...styles.label, marginTop: 8 }}>Oras</label>
      <select style={styles.select} value={s.weather} onChange={(e) => upd("weather", e.target.value)}>
        <option>Sausa</option><option>Lengvas lietus</option><option>Lietus</option><option>Šlapia po lietaus</option><option>Apsiniaukę</option>
      </select>
      
      </CollapsibleSection>
      <CollapsibleSection sectionId="sec-tires" progress={progress.tires} title="Padangos" icon="🛞" defaultOpen={false} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Padangos / komp.</label>
          <input style={styles.input} value={s.tireBrand} onChange={(e) => upd("tireBrand", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Senumas</label>
          <input style={styles.input} value={s.tireAge} onChange={(e) => upd("tireAge", e.target.value)} placeholder="naujos/2sesij." />
        </div>
      </div>
      <label style={{ ...styles.label, marginTop: 8 }}>Slėgis pradžioje (cold) — bar</label>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <input style={styles.input} type="number" step="0.05" placeholder="priekis" value={s.cold_F} onChange={(e) => upd("cold_F", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <input style={styles.input} type="number" step="0.05" placeholder="galas" value={s.cold_R} onChange={(e) => upd("cold_R", e.target.value)} />
        </div>
      </div>
      <label style={{ ...styles.label, marginTop: 8 }}>Slėgis pabaigoje (hot, per 30s po sustojimo) — bar</label>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <input style={styles.input} type="number" step="0.05" placeholder="priekis" value={s.hot_F} onChange={(e) => upd("hot_F", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <input style={styles.input} type="number" step="0.05" placeholder="galas" value={s.hot_R} onChange={(e) => upd("hot_R", e.target.value)} />
        </div>
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection sectionId="sec-chassis" progress={progress.chassis} title="Važiuoklė" icon="⚙️" defaultOpen={false} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Toe (mm)</label>
          <input style={styles.input} value={s.toe} onChange={(e) => upd("toe", e.target.value)} placeholder="0 / -1 / +2" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Caster</label>
          <input style={styles.input} value={s.caster} onChange={(e) => upd("caster", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Ašis</label>
          <input style={styles.input} value={s.chassisAxle} onChange={(e) => upd("chassisAxle", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Priekio hubs</label>
          <input style={styles.input} value={s.trackWidthF} onChange={(e) => upd("trackWidthF", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Galo plotis cm</label>
          <input style={styles.input} type="number" value={s.trackWidthR} onChange={(e) => upd("trackWidthR", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Sėd. poz.</label>
          <input style={styles.input} value={s.seatPos} onChange={(e) => upd("seatPos", e.target.value)} />
        </div>
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection sectionId="sec-engine" progress={progress.engine} title="Variklis" icon="🏎️" defaultOpen={true} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Gear F</label>
          <input style={styles.input} type="number" value={s.gear_F} onChange={(e) => upd("gear_F", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Gear R</label>
          <input style={styles.input} type="number" value={s.gear_R} onChange={(e) => upd("gear_R", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Main jet</label>
          <input style={styles.input} type="number" value={s.mainJet} onChange={(e) => upd("mainJet", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Adata (poz. 1-5)</label>
          <input style={styles.input} type="number" min="1" max="5" value={s.needle} onChange={(e) => upd("needle", e.target.value)} placeholder="1=virsus" />
        </div>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Oro varžtas</label>
          <input style={styles.input} value={s.airScrew} onChange={(e) => upd("airScrew", e.target.value)} placeholder="2 atsuktas" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: 4 }}>
        💡 Adata 1 (viršus) = riebesnis posūkiuose, 5 (apačia) = liesesnis. Veikia tik vidutinio drosselio režime.
      </div>
      <label style={{ ...styles.label, marginTop: 8 }}>Vairuotojas+kart svoris (kg)</label>
      <input style={styles.input} type="number" value={s.weight} onChange={(e) => upd("weight", e.target.value)} />
      
      </CollapsibleSection>
      <CollapsibleSection sectionId="sec-telemetry" progress={progress.telemetry} hasError={!!validation.telemetry} badge={validation.telemetry ? "⚠ trūksta" : null} title="Telemetrija (iš MyChron)" icon="📊" defaultOpen={true} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Best lap (s)</label>
          <input style={styles.input} type="number" step="0.001" value={s.bestLap} onChange={(e) => upd("bestLap", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Avg lap (s)</label>
          <input style={styles.input} type="number" step="0.001" value={s.avgLap} onChange={(e) => upd("avgLap", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Std (s)</label>
          <input style={styles.input} type="number" step="0.01" value={s.std} onChange={(e) => upd("std", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Vanduo vidut (°C)</label>
          <input style={styles.input} type="number" step="0.1" value={s.waterAvg} onChange={(e) => upd("waterAvg", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Vanduo max</label>
          <input style={styles.input} type="number" step="0.1" value={s.waterMax} onChange={(e) => upd("waterMax", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>EGT vidut (°C)</label>
          <input style={styles.input} type="number" value={s.egtAvg} onChange={(e) => upd("egtAvg", e.target.value)} placeholder="kai prijungtas" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>EGT max</label>
          <input style={styles.input} type="number" value={s.egtMax} onChange={(e) => upd("egtMax", e.target.value)} placeholder="kai prijungtas" />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>RPM tiesumoje (sustained)</label>
          <input style={styles.input} type="number" value={s.rpmSustainedStraight} onChange={(e) => upd("rpmSustainedStraight", e.target.value)} placeholder="rolling min 5 samples" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Top GPS (p99)</label>
          <input style={styles.input} type="number" step="0.1" value={s.topSpeedP99} onChange={(e) => upd("topSpeedP99", e.target.value)} placeholder="be slipstream" />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>RPM @ top speed</label>
          <input style={styles.input} type="number" value={s.rpmNearTop} onChange={(e) => upd("rpmNearTop", e.target.value)} placeholder="median ±1s" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Pedalų judesiai / ratą</label>
          <input style={styles.input} type="number" value={s.pedalEventsPerLap} onChange={(e) => upd("pedalEventsPerLap", e.target.value)} placeholder="stilius" />
        </div>
      </div>
      
      {/* ============ V3 PAPILDOMI DUOMENYS ============ */}
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Variklis" icon="🔧" defaultOpen={false} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Variklio valandos</label>
          <input style={styles.input} type="number" step="0.1" value={s.engineHours} onChange={(e) => upd("engineHours", e.target.value)} placeholder="iš skaitliuko" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Padangų heat cycles</label>
          <input style={styles.input} type="number" value={s.tireHeatCycles} onChange={(e) => upd("tireHeatCycles", e.target.value)} placeholder="kiek sesijų" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>
        💡 Rotax Senior limit ~25h iki rebuild. Vega Whites sweet spot 4-6 ciklai.
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Šasi" icon="🔧" defaultOpen={false} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Priekio stabilizatorius</label>
          <input style={styles.input} value={s.frontStabilizer} onChange={(e) => upd("frontStabilizer", e.target.value)} placeholder="storis ar 'nera'" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Galo torsion bar</label>
          <input style={styles.input} value={s.torsionBarRear} onChange={(e) => upd("torsionBarRear", e.target.value)} placeholder="storis (S/M/H)" />
        </div>
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Sėdynė" icon="💺" defaultOpen={false} forceState={sectionsForceState}>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Pozicija P/G (mm)</label>
          <input style={styles.input} type="number" value={s.seatPosF} onChange={(e) => upd("seatPosF", e.target.value)} placeholder="+/- nuo std" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Pozicija aukštis (mm)</label>
          <input style={styles.input} type="number" value={s.seatPosV} onChange={(e) => upd("seatPosV", e.target.value)} placeholder="+/- nuo std" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Atramų skaičius</label>
          <input style={styles.input} type="number" min="0" max="6" value={s.seatSupportCount} onChange={(e) => upd("seatSupportCount", e.target.value)} placeholder="0-6" />
        </div>
      </div>
      <label style={{ ...styles.label, marginTop: 8 }}>Atramų tipas</label>
      <input style={styles.input} value={s.seatSupportType} onChange={(e) => upd("seatSupportType", e.target.value)} placeholder="kietos / minkstos / mix" />
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Svorio balansas (kg)" icon="⚖️" defaultOpen={false} forceState={sectionsForceState}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
        Su corner scales matuotas svoris kiekvienam ratui (kart + vairuotojas). Idealu: priekis 42-44%, kairė ≈ dešinė.
      </div>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Priekis kairė (PK)</label>
          <input style={styles.input} type="number" step="0.1" value={s.weight_FL} onChange={(e) => upd("weight_FL", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Priekis dešinė (PD)</label>
          <input style={styles.input} type="number" step="0.1" value={s.weight_FR} onChange={(e) => upd("weight_FR", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Galas kairė (GK)</label>
          <input style={styles.input} type="number" step="0.1" value={s.weight_RL} onChange={(e) => upd("weight_RL", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Galas dešinė (GD)</label>
          <input style={styles.input} type="number" step="0.1" value={s.weight_RR} onChange={(e) => upd("weight_RR", e.target.value)} />
        </div>
      </div>
      {/* Auto-calculated balance display */}
      {(s.weight_FL && s.weight_FR && s.weight_RL && s.weight_RR) && (() => {
        const fl = parseFloat(s.weight_FL), fr = parseFloat(s.weight_FR);
        const rl = parseFloat(s.weight_RL), rr = parseFloat(s.weight_RR);
        const total = fl+fr+rl+rr;
        const frontPct = ((fl+fr)/total*100).toFixed(1);
        const leftPct = ((fl+rl)/total*100).toFixed(1);
        const diag1 = fl+rr, diag2 = fr+rl;
        const diagDiff = Math.abs(diag1-diag2);
        const fb = parseFloat(frontPct), lb = parseFloat(leftPct);
        const frontOk = fb >= 42 && fb <= 44;
        const leftOk = Math.abs(lb-50) < 1.5;
        const diagOk = diagDiff < 2;
        return (
          <div style={{ marginTop: 10, padding: 10, background: C.bg, borderRadius: 8, fontSize: 11, color: C.muted }}>
            <div>Suma: <strong style={{color:C.text}}>{total.toFixed(1)} kg</strong></div>
            <div>Priekis: <strong style={{color: frontOk ? C.good : C.accent}}>{frontPct}%</strong> {frontOk ? "✓" : "(target 42-44%)"}</div>
            <div>Kairė: <strong style={{color: leftOk ? C.good : C.accent}}>{leftPct}%</strong> {leftOk ? "✓" : "(target 48.5-51.5%)"}</div>
            <div>Diagonalė: <strong style={{color: diagOk ? C.good : C.accent}}>{diagDiff.toFixed(1)} kg skirt.</strong> {diagOk ? "✓" : "(target <2 kg)"}</div>
          </div>
        );
      })()}
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Padangų paviršiaus t° (IR pirometras)" icon="🌡️" defaultOpen={false} forceState={sectionsForceState}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
        Matuoti per 30 sek po sustojimo. 3 taškai kiekvienoje padangoje: vidinis (in), vidurys (mid), išorinis (out). Skirtumas {'>'}10°C tarp taškų rodo balansą.
      </div>
      
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Priekio kairė (PK)</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" placeholder="in" value={s.tireTemp_FL_in} onChange={(e) => upd("tireTemp_FL_in", e.target.value)} />
        <input style={styles.input} type="number" placeholder="mid" value={s.tireTemp_FL_mid} onChange={(e) => upd("tireTemp_FL_mid", e.target.value)} />
        <input style={styles.input} type="number" placeholder="out" value={s.tireTemp_FL_out} onChange={(e) => upd("tireTemp_FL_out", e.target.value)} />
      </div>
      
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Priekio dešinė (PD)</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" placeholder="in" value={s.tireTemp_FR_in} onChange={(e) => upd("tireTemp_FR_in", e.target.value)} />
        <input style={styles.input} type="number" placeholder="mid" value={s.tireTemp_FR_mid} onChange={(e) => upd("tireTemp_FR_mid", e.target.value)} />
        <input style={styles.input} type="number" placeholder="out" value={s.tireTemp_FR_out} onChange={(e) => upd("tireTemp_FR_out", e.target.value)} />
      </div>
      
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Galo kairė (GK)</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" placeholder="in" value={s.tireTemp_RL_in} onChange={(e) => upd("tireTemp_RL_in", e.target.value)} />
        <input style={styles.input} type="number" placeholder="mid" value={s.tireTemp_RL_mid} onChange={(e) => upd("tireTemp_RL_mid", e.target.value)} />
        <input style={styles.input} type="number" placeholder="out" value={s.tireTemp_RL_out} onChange={(e) => upd("tireTemp_RL_out", e.target.value)} />
      </div>
      
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Galo dešinė (GD)</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" placeholder="in" value={s.tireTemp_RR_in} onChange={(e) => upd("tireTemp_RR_in", e.target.value)} />
        <input style={styles.input} type="number" placeholder="mid" value={s.tireTemp_RR_mid} onChange={(e) => upd("tireTemp_RR_mid", e.target.value)} />
        <input style={styles.input} type="number" placeholder="out" value={s.tireTemp_RR_out} onChange={(e) => upd("tireTemp_RR_out", e.target.value)} />
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Stabdžių sistema" icon="🛑" defaultOpen={false} forceState={sectionsForceState}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
        💡 <strong>Filosofija:</strong> prieš pirkti naujas paduškas — patikrinti dabartinę būklę. Glazed paduškas dažnai galima atgaivinti su švitriniu popieriumi (grit 80-120) už 5€ vietoj 100€ keitimo.
      </div>
      
      {/* Engine config info */}
      <div style={{ padding: 10, background: hasFrontBrakes ? "#0f1420" : "#0d1c14", border: `1px solid ${hasFrontBrakes ? "#1e3a8a" : "#065f46"}`, borderRadius: 8, marginBottom: 12, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
        {profile?.engineModel ? (
          <>
            <strong style={{ color: hasFrontBrakes ? "#93c5fd" : C.good }}>{profile.engineFamily} {profile.engineModel}:</strong>{" "}
            {hasFrontBrakes ? (
              <>Stabdžių sistema = <strong>priekio + galo</strong> (DD2 / KZ shifter klasė)</>
            ) : (
              <>Stabdžių sistema = <strong>tik galo</strong> (single-speed direct drive klasė — Rotax MAX, X30, ROK GP, etc.)</>
            )}
          </>
        ) : (
          <span>⚠ Variklio modelis nenustatytas profilyje. Numatytai rodoma tik galo stabdis (Rotax Senior MAX standartas).</span>
        )}
      </div>
      
      {/* Priekio paduškos — TIK jei variklis turi priekio stabdį (DD2, KZ shifter) */}
      {hasFrontBrakes && (
      <>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 8, marginBottom: 4, letterSpacing: 1 }}>Priekio paduškos</div>
      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Kompozicija</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakePadFront_compound} onChange={(e) => upd("brakePadFront_compound", e.target.value)}>
            <option value="">— pasirink —</option>
            <optgroup label="🔥 Plieniniam diskui (iron)">
              <option value="Raudona (Red)">🔴 Raudona — Medium/Soft, standart</option>
              <option value="Special Red 14.5mm">🔴 Special Red 14.5mm — storesnė versija</option>
              <option value="Oranžinė (Orange)">🟠 Oranžinė — New compound, agresyvesnis bite</option>
              <option value="Juoda Medium">⚫ Juoda Medium — standart kietesnis</option>
              <option value="Juoda Hard">⚫ Juoda Hard — kietesnė, sunkiems vairuotojams</option>
              <option value="Ferodo KA">🟫 Ferodo KA — organic, agresyvus (premium)</option>
            </optgroup>
            <optgroup label="⚠ Keraminiam diskui (Duralcan)">
              <option value="Žalia (IKP Green)">🟢 Žalia (IKP Green) — TIK Duralcan</option>
              <option value="Mėlyna ceramic">🔵 Mėlyna — TIK keraminiam</option>
            </optgroup>
            <option value="OEM kita">OEM kita</option>
            <option value="Nezinau">Nežinau</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Storis (mm)</label>
          <input style={styles.input} type="number" step="0.5" value={s.brakePadFront_thickness} onChange={(e) => upd("brakePadFront_thickness", e.target.value)} placeholder="naujos ~8mm" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Sesijų sk.</label>
          <input style={styles.input} type="number" value={s.brakePadFront_ageSessions} onChange={(e) => upd("brakePadFront_ageSessions", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Glazed (stiklėjimas)?</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakePadFront_glazed} onChange={(e) => upd("brakePadFront_glazed", e.target.value)}>
            <option value="">— pasirink —</option>
            <option value="ne">Ne — matinis paviršius ✓</option>
            <option value="dalinai">Dalinai — pradeda blizgėti</option>
            <option value="taip">Taip — visiškai stiklėjęs ⚠</option>
          </select>
        </div>
      </div>
      </>
      )}
      
      {/* Galo paduškos — VISADA rodoma */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 12, marginBottom: 4, letterSpacing: 1 }}>{hasFrontBrakes ? "Galo paduškos" : "Paduškos (galo)"}</div>
      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Kompozicija</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakePadRear_compound} onChange={(e) => upd("brakePadRear_compound", e.target.value)}>
            <option value="">— pasirink —</option>
            <optgroup label="🔥 Plieniniam diskui (iron)">
              <option value="Raudona (Red)">🔴 Raudona — Medium/Soft, standart</option>
              <option value="Special Red 14.5mm">🔴 Special Red 14.5mm — storesnė versija</option>
              <option value="Oranžinė (Orange)">🟠 Oranžinė — New compound, agresyvesnis bite</option>
              <option value="Juoda Medium">⚫ Juoda Medium — standart kietesnis</option>
              <option value="Juoda Hard">⚫ Juoda Hard — kietesnė, sunkiems vairuotojams</option>
              <option value="Ferodo KA">🟫 Ferodo KA — organic, agresyvus (premium)</option>
            </optgroup>
            <optgroup label="⚠ Keraminiam diskui (Duralcan)">
              <option value="Žalia (IKP Green)">🟢 Žalia (IKP Green) — TIK Duralcan</option>
              <option value="Mėlyna ceramic">🔵 Mėlyna — TIK keraminiam</option>
            </optgroup>
            <option value="OEM kita">OEM kita</option>
            <option value="Nezinau">Nežinau</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Storis (mm)</label>
          <input style={styles.input} type="number" step="0.5" value={s.brakePadRear_thickness} onChange={(e) => upd("brakePadRear_thickness", e.target.value)} placeholder="naujos ~8mm" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Sesijų sk.</label>
          <input style={styles.input} type="number" value={s.brakePadRear_ageSessions} onChange={(e) => upd("brakePadRear_ageSessions", e.target.value)} />
        </div>
      </div>
      <div style={{ ...styles.row, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Glazed (stiklėjimas)?</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakePadRear_glazed} onChange={(e) => upd("brakePadRear_glazed", e.target.value)}>
            <option value="">— pasirink —</option>
            <option value="ne">Ne — matinis paviršius ✓</option>
            <option value="dalinai">Dalinai — pradeda blizgėti</option>
            <option value="taip">Taip — visiškai stiklėjęs ⚠</option>
          </select>
        </div>
      </div>
      
      {/* Diskai */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 12, marginBottom: 4, letterSpacing: 1 }}>Stabdžių diskas</div>
      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Tipas</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakeDiscType} onChange={(e) => upd("brakeDiscType", e.target.value)}>
            <option value="">— pasirink —</option>
            <option value="floating-iron">Floating iron (plūduriuojantis plieninis) ✓ standartas</option>
            <option value="cast-iron">Cast iron (vientisas plieninis)</option>
            <option value="ceramic">Ceramic / Duralcan (brangus)</option>
          </select>
        </div>
        {hasFrontBrakes && (
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Priekio storis (mm)</label>
            <input style={styles.input} type="number" step="0.1" value={s.brakeDiscFront_thickness} onChange={(e) => upd("brakeDiscFront_thickness", e.target.value)} placeholder="orig ~8" />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <label style={styles.label}>{hasFrontBrakes ? "Galo storis (mm)" : "Disko storis (mm)"}</label>
          <input style={styles.input} type="number" step="0.1" value={s.brakeDiscRear_thickness} onChange={(e) => upd("brakeDiscRear_thickness", e.target.value)} placeholder="orig ~8" />
        </div>
      </div>
      
      {/* Skystis */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 12, marginBottom: 4, letterSpacing: 1 }}>Stabdžių skystis</div>
      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Tipas</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakeFluidType} onChange={(e) => upd("brakeFluidType", e.target.value)}>
            <option value="">— pasirink —</option>
            <option value="DOT 4">DOT 4 (standart, drėgmę traukia)</option>
            <option value="DOT 5.1">DOT 5.1 (geriau)</option>
            <option value="DOT 5.1 racing">DOT 5.1 racing (Motul RBF600 / Castrol SRF) ✓</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Amžius (mėn.)</label>
          <input style={styles.input} type="number" value={s.brakeFluidAgeMonths} onChange={(e) => upd("brakeFluidAgeMonths", e.target.value)} placeholder=">12 = keisti" />
        </div>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Pedalo jausmas</label>
          <select style={{ ...styles.input, paddingRight: 24 }} value={s.brakePedalFeel} onChange={(e) => upd("brakePedalFeel", e.target.value)}>
            <option value="">— pasirink —</option>
            <option value="kietas">Kietas — staigus atsakymas ✓</option>
            <option value="vidutinis">Vidutinis</option>
            <option value="spongy">Spongy / minkštas ⚠ (oras sistemoje?)</option>
          </select>
        </div>
      </div>
      
      {/* Telemetrijos diagnostika */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 12, marginBottom: 4, letterSpacing: 1 }}>Telemetrijos diagnostika</div>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Max stabdymas (g)</label>
          <input style={styles.input} type="number" step="0.01" value={s.brakeMaxDecel_g} onChange={(e) => upd("brakeMaxDecel_g", e.target.value)} placeholder="iš LonAcc" />
        </div>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>EARLY profile posūkiai</label>
          <input style={styles.input} value={s.brakeProfile_problematic} onChange={(e) => upd("brakeProfile_problematic", e.target.value)} placeholder="pvz. T2, T4" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: 8 }}>
        🎯 Profi stabdymas pasiekia 1.0-1.2g. EARLY = max decel pradžioj, atleidžia anksti.
      </div>
      
      {/* Atsarginės paduškos */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginTop: 12, marginBottom: 4, letterSpacing: 1 }}>Atsarginės paduškos (boksuose)</div>
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Komplektų skaičius</label>
          <input style={styles.input} type="number" min="0" value={s.sparePadsCount} onChange={(e) => upd("sparePadsCount", e.target.value)} placeholder="0+" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: 8 }}>
        💡 Rekomenduojama turėti bent 1 atsarginį komplektą boksuose — paduškos gali sudilti netikėtai.
      </div>
      
      {/* DIAGNOSTIKA — automatinis sprendimų medis */}
      {(() => {
        const issues = [];
        const tips = [];
        
        // Glazed pad detection
        if (s.brakePadFront_glazed === "taip" || s.brakePadRear_glazed === "taip") {
          issues.push({ severity: "high", text: "⚠ GLAZED paduškos aptiktos. Pirma — bandyk grit treatment (švitrinis popierius 80-120, 10-15 kartų ratuotinai). 5€ vietoj 100€ keitimo." });
        } else if (s.brakePadFront_glazed === "dalinai" || s.brakePadRear_glazed === "dalinai") {
          issues.push({ severity: "mid", text: "💡 Dalinai glazed. Po sesijos — patikrinti 'bed-in' procedūrą: 3-4 ratai lengvo, 3-4 vidutinio stabdymo." });
        }
        
        // Old fluid
        const fluidAge = parseFloat(s.brakeFluidAgeMonths);
        if (fluidAge > 12) {
          issues.push({ severity: "high", text: `⚠ Stabdžių skystis ${fluidAge} mėn. amžiaus. DOT skystis traukia drėgmę → kaitinant verda → "spongy" pedalas. BŪTINAI keisti (25-40€).` });
        } else if (fluidAge > 6 && s.brakePedalFeel === "spongy") {
          issues.push({ severity: "mid", text: "💡 Skystis 6+ mėn. ir pedalas spongy — pakeisti DOT 5.1 racing." });
        }
        
        // Spongy pedal
        if (s.brakePedalFeel === "spongy") {
          issues.push({ severity: "high", text: "⚠ SPONGY pedalas = oras sistemoje arba užvirsęs skystis. Pirma — prabėk oro nuleidimą (free). Tada — keisti skystį." });
        }
        
        // Worn pads (only check front if applicable)
        const rThick = parseFloat(s.brakePadRear_thickness);
        if (hasFrontBrakes) {
          const fThick = parseFloat(s.brakePadFront_thickness);
          if (fThick && fThick < 3) issues.push({ severity: "high", text: `⚠ Priekio paduškos ${fThick}mm — žemiau kritinio 3mm. KEISTI!` });
        }
        if (rThick && rThick < 3) issues.push({ severity: "high", text: `⚠ ${hasFrontBrakes ? "Galo paduškos" : "Paduškos"} ${rThick}mm — žemiau kritinio 3mm. KEISTI!` });
        
        // Disc wear (only check front if applicable)
        const rDisc = parseFloat(s.brakeDiscRear_thickness);
        if (hasFrontBrakes) {
          const fDisc = parseFloat(s.brakeDiscFront_thickness);
          if (fDisc && fDisc < 6) issues.push({ severity: "high", text: `⚠ Priekio diskas ${fDisc}mm — žemiau 6mm minimumo. KEISTI!` });
        }
        if (rDisc && rDisc < 6) issues.push({ severity: "high", text: `⚠ ${hasFrontBrakes ? "Galo diskas" : "Diskas"} ${rDisc}mm — žemiau 6mm minimumo. KEISTI!` });
        
        // Spare pads check
        const spareCount = parseInt(s.sparePadsCount);
        if (!isNaN(spareCount) && spareCount === 0) {
          issues.push({ severity: "mid", text: "💡 Nėra atsarginių paduškų boksuose. Rekomenduojama turėti bent 1 atsarginį komplektą — paduškos gali sudilti netikėtai, ypač varžybose." });
        } else if (!isNaN(spareCount) && spareCount >= 1) {
          issues.push({ severity: "good", text: `✓ Atsarginės paduškos ${spareCount} komplektai — geras pasiruošimas.` });
        }
        
        // Low max decel
        const maxG = parseFloat(s.brakeMaxDecel_g);
        if (maxG && maxG > 0.4 && maxG < 0.75) {
          issues.push({ severity: "mid", text: `💡 Max stabdymas ${maxG}g — žemas (profesionalūs 1.0-1.2g). Tikrinti paduškas + skystį prieš keisti komponentus.` });
        } else if (maxG && maxG >= 0.85) {
          issues.push({ severity: "good", text: `✓ Max stabdymas ${maxG}g — geras lygis.` });
        }
        
        // Ceramic pads on iron disc - critical error (check both front and rear, all ceramic colors)
        const ceramicCompounds = ["Žalia (IKP Green)", "Mėlyna ceramic", "IKP Green"];
        const rearIsCeramic = ceramicCompounds.includes(s.brakePadRear_compound);
        const frontIsCeramic = hasFrontBrakes && ceramicCompounds.includes(s.brakePadFront_compound);
        if ((rearIsCeramic || frontIsCeramic) && s.brakeDiscType !== "ceramic") {
          issues.push({ severity: "high", text: "🚨 KRITIŠKA KLAIDA: Pasirinktos keraminės paduškos (žalia/mėlyna) REIKALAUJA keraminio Duralcan disko! Su plieniniu — paduškos sudegs per 1-2 sesijas. Pirk RAUDONAS arba ORANŽINES." });
        }
        
        // Ceramic disc with iron pads — also wrong combination
        if (s.brakeDiscType === "ceramic" && !rearIsCeramic && s.brakePadRear_compound && s.brakePadRear_compound !== "Nezinau") {
          const isIronPad = ["Raudona (Red)", "Special Red 14.5mm", "Oranžinė (Orange)", "Juoda Medium", "Juoda Hard", "Ferodo KA"].includes(s.brakePadRear_compound);
          if (isIronPad) {
            issues.push({ severity: "high", text: "🚨 Turi keraminį diską, bet plieniniam disko skirtas paduškas. Diskas ilgalaikiai bus pažeistas. Pirk ŽALIAS (IKP Green) arba MĖLYNAS keraminiam." });
          }
        }
        
        // No issues found
        const anyCompound = s.brakePadRear_compound || (hasFrontBrakes && s.brakePadFront_compound);
        if (issues.length === 0 && anyCompound) {
          issues.push({ severity: "good", text: "✓ Stabdžių sistema atrodo gerai. Tęsk reguliarią priežiūrą — patikrinti glazing po kiekvienos intensyvios sesijos." });
        }
        
        if (issues.length === 0) return null;
        
        return (
          <div style={{ marginTop: 12, padding: 12, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Stabdžių sistemos diagnostika</div>
            {issues.map((iss, i) => {
              const colors = {
                high: { bg: "#1c0f0f", brd: "#7f1d1d", txt: "#fca5a5" },
                mid: { bg: "#1c1810", brd: "#854d0e", txt: "#fde68a" },
                good: { bg: "#0d1c14", brd: "#065f46", txt: "#6ee7b7" },
              };
              const c = colors[iss.severity] || colors.mid;
              return (
                <div key={i} style={{ padding: "8px 10px", background: c.bg, border: `1px solid ${c.brd}`, color: c.txt, fontSize: 12, borderRadius: 6, marginBottom: 4, lineHeight: 1.5 }}>
                  {iss.text}
                </div>
              );
            })}
          </div>
        );
      })()}
      
      {/* TAUPYMO FILOSOFIJA */}
      <div style={{ marginTop: 12, padding: 12, background: "linear-gradient(135deg, #0d1c14 0%, #131316 100%)", border: `1px solid #065f46`, borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.good, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>💰 Taupymo prioritetų eilė</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
          <div><strong style={{ color: C.text }}>1.</strong> Pedalo "kelionė" + oro nuleidimas — <strong style={{ color: C.good }}>0€</strong></div>
          <div><strong style={{ color: C.text }}>2.</strong> Grit treatment glazed paduškoms — <strong style={{ color: C.good }}>~5€</strong></div>
          <div><strong style={{ color: C.text }}>3.</strong> Stabdžių skystis DOT 5.1 racing — <strong style={{ color: C.accent }}>~25-40€</strong></div>
          <div><strong style={{ color: C.text }}>4.</strong> Naujos paduškos (Ferodo KA) — <strong style={{ color: C.accent }}>~85-130€</strong></div>
          <div><strong style={{ color: C.text }}>5.</strong> Naujas diskas — <strong style={{ color: C.danger }}>~100-200€</strong></div>
          <div><strong style={{ color: C.text }}>6.</strong> Visa sistema (VEN 11 upgrade) — <strong style={{ color: C.danger }}>800€+</strong></div>
          <div style={{ marginTop: 6, fontSize: 10, fontStyle: "italic", color: C.dim }}>Eik nuo pigaus prie brangaus. Dažnai 1-3 žingsniai pakanka.</div>
        </div>
      </div>
      
      </CollapsibleSection>
      <CollapsibleSection title="Papildomi duomenys ▸ Video + komentarai pagal ratą" icon="🎥" defaultOpen={false} forceState={sectionsForceState}>
      <LapCommentsSection
        lapComments={s.lapComments || []}
        lapCount={s.lapCount}
        onChange={(newComments) => setS(prev => ({ ...prev, lapComments: newComments }))}
        sessionId={stableId}
        videoKey={s.videoKey}
        onVideoChange={(vk) => setS(prev => ({ ...prev, videoKey: vk }))}
      />
      
      </CollapsibleSection>
      <CollapsibleSection sectionId="sec-photos" title="Nuotraukos" icon="📸" defaultOpen={false} forceState={sectionsForceState}>
      <PhotoSection
        sessionId={stableId}
        photos={s.photos || {}}
        onPhotosChange={(newPhotos) => setS(prev => ({ ...prev, photos: newPhotos }))}
      />
      
      <div id="sec-notes" style={{ scrollMarginTop: 80 }}>
        <label style={{ ...styles.label, marginTop: 12 }}>Vairuotojo / mechaniko pastabos</label>
        <textarea style={{ ...styles.input, minHeight: 80, fontFamily: "inherit" }} value={s.notes} onChange={(e) => upd("notes", e.target.value)} 
          placeholder="kur understeer, kur slysta, kaip jaučiasi išvažiavimai, plug spalva..." />
      </div>
      </CollapsibleSection>
      
      {/* Live recommendations as they fill */}
      {liveRecs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={styles.h3}>Realaus laiko rekomendacijos</div>
          {liveRecs.map((r, i) => (
            <div key={i} style={styles.recommendation(r.severity)}>{r.text}</div>
          ))}
        </div>
      )}
      
      {/* Apatinė juosta — sticky save mygtukas */}
      {!s._isShared && (
        <div style={{ 
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(180deg, transparent 0%, ${C.bg} 30%, ${C.bg} 100%)`,
          padding: "20px 0 16px 0",
          marginTop: 24,
          zIndex: 50,
          marginLeft: -20,
          marginRight: -20,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.btnGhost, flex: 1 }} onClick={handleBack}>Atgal</button>
            <button style={{ ...styles.btn, flex: 2, position: "relative" }} onClick={handleSave}>
              {dirty && <span style={{ 
                position: "absolute", 
                top: 8, 
                right: 8,
                width: 8, 
                height: 8, 
                borderRadius: 4, 
                background: "#dc2626", 
                animation: "pulse 1.5s infinite",
              }} />}
              <span>Išsaugoti sesiją</span>
            </button>
          </div>
        </div>
      )}
      {s._isShared && (
        <button style={{ ...styles.btnGhost, marginTop: 16 }} onClick={handleBack}>Atgal į sąrašą</button>
      )}
    </div>
  );
}

// ============================================================
// SESIJOS SĄRAŠAS
// ============================================================
// ============================================================
// SESIJU DALIJIMASIS — tik etapams / varžyboms
// ============================================================

/**
 * Pasidalinti sesija — sukuria JSON failą atsisiuntimui.
 * Galima tik jei sessionType === "race_event".
 */
async function exportSessionForSharing(session, driverName) {
  if (session.sessionType !== "race_event") {
    throw new Error("Tik etapus / varžybas galima dalintis. Pakeisk sesijos tipą.");
  }
  
  // Klonuojam sesiją, pridedam metaduomenis
  const shareData = {
    _format: "dkkart-share",
    _version: 1,
    _exportedAt: new Date().toISOString(),
    _exportedBy: driverName || session.driver || "Anoniminis",
    _sourceId: session.id,
    // Pati sesija (be photos — jos per didelės dalintis)
    session: {
      ...session,
      photos: {}, // pašalinam nuotraukas iš share'o
      videoKey: null, // pašalinam video
      _isShared: true,
      _originalDriver: session.driver,
    },
  };
  
  const json = JSON.stringify(shareData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fname = `${session.driver || "vairuotojas"}_${session.date}_${session.track || "trasa"}.dkkart-share.json`;
  a.download = fname.replace(/[^a-zA-Z0-9._-]/g, "_");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return fname;
}

/**
 * Importuoti kolegos sesiją iš .dkkart-share.json failo.
 * Sesija pridedama kaip read-only "shared" sesija.
 */
async function importSharedSession(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Failas ne tinkamo formato (negaliojantis JSON)");
  }
  
  if (data._format !== "dkkart-share") {
    throw new Error("Tai ne DK Kart share failas");
  }
  if (!data.session) {
    throw new Error("Trūksta sesijos duomenų");
  }
  if (data.session.sessionType !== "race_event") {
    throw new Error("Tik etapų / varžybų sesijos gali būti importuotos");
  }
  
  // Pridedam read-only žymę ir atskirą ID
  const imported = {
    ...data.session,
    id: `shared_${data._sourceId || Date.now()}`,
    _isShared: true,
    _sharedFrom: data._exportedBy,
    _sharedAt: data._exportedAt,
    _readOnly: true,
  };
  return imported;
}

function SessionList({ sessions, onAdd, onEdit, onDelete, onImportShared, onShareSession }) {
  // Atskirti privačias ir kolegų sesijas
  const myOwnSessions = sessions.filter(s => !s._isShared);
  const sharedSessions = sessions.filter(s => s._isShared);
  
  // Per-day collapse state
  const [expandedDays, setExpandedDays] = useState(() => {
    // Pagal nutylėjimą - tik šiandienos + paskutinė diena atidaryta
    const today = new Date().toISOString().slice(0, 10);
    return new Set([today]);
  });
  
  // Group by date
  const grouped = useMemo(() => {
    const m = {};
    myOwnSessions.forEach(s => {
      const d = s.date || "?";
      if (!m[d]) m[d] = [];
      m[d].push(s);
    });
    Object.keys(m).forEach(d => m[d].sort((a, b) => (a.time || "").localeCompare(b.time || "")));
    return m;
  }, [myOwnSessions]);
  
  const dates = Object.keys(grouped).sort().reverse();
  
  // Automatiškai atidaryti naujausią dieną (jei dar nebuvo apsiverstas state)
  useEffect(() => {
    if (dates.length > 0 && expandedDays.size === 1) {
      setExpandedDays(prev => new Set([...prev, dates[0]]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.length]);
  
  const toggleDay = (date) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };
  
  // Day summary computation
  const getDaySummary = (daySessions) => {
    const validLaps = daySessions.filter(s => s.bestLap);
    const bestSession = validLaps.reduce((b, s) => (!b || s.bestLap < b.bestLap) ? s : b, null);
    
    // Padangos — paima dažniausią
    const tireBrands = daySessions.map(s => s.tireBrand).filter(Boolean);
    const tireBrand = tireBrands.length > 0 ? tireBrands[tireBrands.length - 1] : null;
    
    // Gear — paima dažniausią
    const gears = daySessions.map(s => s.gear_F && s.gear_R ? `${s.gear_F}/${s.gear_R}` : null).filter(Boolean);
    const gearCounts = {};
    gears.forEach(g => { gearCounts[g] = (gearCounts[g] || 0) + 1; });
    const topGear = Object.entries(gearCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    // Jets — paima visus unikalius
    const jets = [...new Set(daySessions.map(s => s.mainJet).filter(Boolean))];
    
    // Adata — paima unikalius
    const needles = [...new Set(daySessions.map(s => s.needle).filter(v => v !== "" && v !== null && v !== undefined))];
    
    return {
      sessionCount: daySessions.length,
      bestLap: bestSession?.bestLap,
      bestSessionTime: bestSession?.time,
      tireBrand,
      gear: topGear,
      jets, // gali būti keletas — buvo testuojami skirtingi
      needles,
      hasRaceEvent: daySessions.some(s => s.sessionType === "race_event"),
    };
  };
  
  const handleImportSharedFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSharedSession(file);
      onImportShared(imported);
    } catch (err) {
      alert(`Klaida: ${err.message}`);
    }
    e.target.value = "";
  };
  
  const handleShareClick = async (s, e) => {
    e.stopPropagation();
    try {
      const fname = await exportSessionForSharing(s, s.driver);
      alert(`✓ Atsisiųsta: ${fname}\n\nGali siųsti šitą failą kolegoms.`);
    } catch (err) {
      alert(`Klaida: ${err.message}`);
    }
  };
  
  // Format date for display
  const fmtDate = (dStr) => {
    if (!dStr || dStr === "?") return "Be datos";
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dStr === today) return `Šiandien · ${dStr}`;
    if (dStr === yesterday) return `Vakar · ${dStr}`;
    // Try to parse weekday
    try {
      const d = new Date(dStr);
      const days = ["Sek", "Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt"];
      return `${days[d.getDay()]} · ${dStr}`;
    } catch { return dStr; }
  };
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={styles.h2}>Visos sesijos</div>
        <label style={{ ...styles.btnSmall, background: C.card, color: C.muted, padding: "8px 12px", cursor: "pointer", fontSize: 11, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          📥 Importuoti
          <input type="file" accept=".json,.dkkart-share.json" onChange={handleImportSharedFile} style={{ display: "none" }} />
        </label>
      </div>
      
      {/* Mano sesijos */}
      {myOwnSessions.length === 0 && sharedSessions.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: C.dim }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>🏁</div>
          <div>Dar nėra sesijų. Paspausk geltoną mygtuką.</div>
        </div>
      )}
      
      {dates.map(d => {
        const isExpanded = expandedDays.has(d);
        const summary = getDaySummary(grouped[d]);
        
        return (
          <div key={d} style={{ marginBottom: 10 }}>
            {/* Day header — sukoncentruota dienos kortelė */}
            <div 
              onClick={() => toggleDay(d)}
              style={{ 
                background: C.card,
                border: `1px solid ${isExpanded ? C.accent : C.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                position: "relative",
              }}>
              {/* Top line: date + best lap */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 11, color: C.muted, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", width: 10 }}>▸</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1.5, color: C.text }}>
                    {fmtDate(d)}
                  </span>
                  {summary.hasRaceEvent && (
                    <span style={{ padding: "1px 6px", background: C.accent + "22", color: C.accent, borderRadius: 99, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>📢 ETAPAS</span>
                  )}
                </div>
                <div style={{ textAlign: "right", marginLeft: 8 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: C.accent, fontWeight: 700, lineHeight: 1 }}>
                    {summary.bestLap ? summary.bestLap.toFixed(3) : "—"}
                  </div>
                  <div style={{ fontSize: 8, color: C.dim, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>
                    Geriausias{summary.bestSessionTime ? ` · ${summary.bestSessionTime}` : ""}
                  </div>
                </div>
              </div>
              
              {/* Bottom line: setup summary chips */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ padding: "2px 8px", background: C.bg, color: C.muted, borderRadius: 99, fontSize: 10, fontWeight: 600, border: `1px solid ${C.border}` }}>
                  {summary.sessionCount} {summary.sessionCount === 1 ? "sesija" : "sesijos"}
                </span>
                {summary.tireBrand && (
                  <span style={{ padding: "2px 8px", background: "#1e293b", color: "#94a3b8", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                    🛞 {summary.tireBrand}
                  </span>
                )}
                {summary.gear && (
                  <span style={{ padding: "2px 8px", background: "#1e293b", color: "#94a3b8", borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                    ⚙ {summary.gear}
                  </span>
                )}
                {summary.jets.length > 0 && (
                  <span style={{ padding: "2px 8px", background: "#3f2d05", color: C.accent, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                    🌡 jet {summary.jets.length > 1 ? summary.jets.join("/") : summary.jets[0]}
                  </span>
                )}
                {summary.needles.length > 0 && (
                  <span style={{ padding: "2px 8px", background: "#3f2d05", color: C.accent, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                    📐 pos {summary.needles.length > 1 ? summary.needles.join("/") : summary.needles[0]}
                  </span>
                )}
              </div>
            </div>
            
            {/* Sessions list — expanded */}
            {isExpanded && (
              <div style={{ marginTop: 8, marginLeft: 12 }}>
                {grouped[d].map((s, idx) => {
                  const isRaceEvent = s.sessionType === "race_event";
                  return (
                    <div key={s.id} 
                      style={{ 
                        ...styles.card, 
                        ...styles.cardAccent, 
                        position: "relative",
                        marginBottom: 8,
                        marginLeft: 8,
                        borderLeft: `3px solid ${C.accent}`,
                      }} 
                      onClick={() => onEdit(s)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>
                            S{idx + 1} · {s.time || "—"}
                            {s.sessionType === "training" && <span style={{ fontSize: 9, marginLeft: 6, color: C.muted, letterSpacing: 0.5 }}>🔒 PRIV</span>}
                            {s.sessionType === "qualifying" && <span style={{ fontSize: 9, marginLeft: 6, color: C.muted, letterSpacing: 0.5 }}>🔒 KVALIF</span>}
                            {s.sessionType === "race_event" && <span style={{ fontSize: 9, marginLeft: 6, color: C.accent, letterSpacing: 0.5 }}>📢 ETAPAS</span>}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.track || "—"} · {s.airTemp || "?"}°C · {s.weather || "—"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.accent, fontWeight: 700 }}>{s.bestLap ? s.bestLap.toFixed(3) : "—"}</div>
                          <div style={{ fontSize: 8, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Best lap</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
                        <span style={{ padding: "1px 7px", background: "#3f2d05", color: C.accent, borderRadius: 99, fontSize: 9, fontWeight: 700 }}>jet {s.mainJet || "?"}</span>
                        <span style={{ padding: "1px 7px", background: "#1e293b", color: "#94a3b8", borderRadius: 99, fontSize: 9, fontWeight: 700 }}>{s.gear_F}/{s.gear_R}</span>
                        {s.needle && <span style={{ padding: "1px 7px", background: "#3f2d05", color: C.accent, borderRadius: 99, fontSize: 9, fontWeight: 700 }}>pos {s.needle}</span>}
                        {s.cold_F && s.hot_F && (
                          <span style={{ padding: "1px 7px", background: "#1f1f23", color: C.muted, borderRadius: 99, fontSize: 9 }}>
                            {(typeof s.cold_F === "number" ? s.cold_F : parseFloat(s.cold_F)).toFixed(2)}→{(typeof s.hot_F === "number" ? s.hot_F : parseFloat(s.hot_F)).toFixed(2)} F
                          </span>
                        )}
                        {s.photos && Object.keys(s.photos).length > 0 && (
                          <span style={{ padding: "1px 7px", background: "#0d1c14", color: C.good, borderRadius: 99, fontSize: 9, fontWeight: 700 }}>
                            📸 {Object.values(s.photos).reduce((sum, arr) => sum + arr.length, 0)}
                          </span>
                        )}
                        <div style={{ flex: 1 }} />
                        {isRaceEvent && (
                          <button onClick={(e) => handleShareClick(s, e)}
                            style={{ padding: "3px 8px", background: "transparent", color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 99, fontSize: 9, fontWeight: 700, cursor: "pointer" }}
                            title="Dalintis su kolegomis">
                            📤 Dalintis
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Kolegų sesijos — atskira sekcija */}
      {sharedSessions.length > 0 && (
        <>
          <div style={{ ...styles.h3, marginTop: 30, color: C.muted }}>
            👥 Kolegų sesijos ({sharedSessions.length})
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>
            Importuotos etapų / varžybų sesijos iš kitų vairuotojų. Skirtos palyginimui — negalima redaguoti.
          </div>
          {sharedSessions
            .sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || "")))
            .map(s => (
              <div key={s.id} style={{ ...styles.card, opacity: 0.85, border: `1px dashed ${C.border}` }} onClick={() => onEdit(s)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>
                      👥 {s.driver || s._sharedFrom} · {s.date}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {s.track} · {s.airTemp || "?"}°C
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: C.text, fontWeight: 700 }}>{s.bestLap ? s.bestLap.toFixed(3) : "—"}</div>
                    <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Best lap</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ padding: "2px 8px", background: "#1f1f23", color: C.muted, borderRadius: 99, fontSize: 10 }}>jet {s.mainJet || "?"}</span>
                  <span style={{ padding: "2px 8px", background: "#1f1f23", color: C.muted, borderRadius: 99, fontSize: 10 }}>{s.gear_F}/{s.gear_R}</span>
                  <span style={{ padding: "2px 8px", background: "#1f1f23", color: C.muted, borderRadius: 99, fontSize: 10 }}>📢 ETAPAS</span>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}

// ============================================================
// PALYGINIMAS
// ============================================================
// ============================================================
// ANOMALY DETECTOR
// Detects sudden changes between current session and historical baseline.
// Helps catch: engine wear, setup drift, weather impact, driver fatigue.
// ============================================================
function detectAnomalies(currentSession, historicalSessions) {
  const anomalies = [];
  if (!currentSession || historicalSessions.length < 3) return anomalies;
  
  // Build historical baseline (median + std) for key metrics
  const metrics = ['bestLap', 'avgLap', 'std', 'topSpeedP99', 'rpmNearTop',
                   'waterAvg', 'waterMax', 'egtAvg', 'pedalEventsPerLap'];
  
  const baseline = {};
  for (const m of metrics) {
    const values = historicalSessions.map(s => parseFloat(s[m])).filter(v => !isNaN(v));
    if (values.length < 3) continue;
    values.sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    baseline[m] = { median, q1, q3, iqr, min: values[0], max: values[values.length - 1] };
  }
  
  // Compare current to baseline
  const checks = [
    { key: 'bestLap', label: 'Geriausias ratas', unit: 's', dir: 'lower' },
    { key: 'avgLap', label: 'Vidutinis ratas', unit: 's', dir: 'lower' },
    { key: 'std', label: 'Konsistencija (std)', unit: 's', dir: 'lower' },
    { key: 'topSpeedP99', label: 'Top speed', unit: 'km/h', dir: 'higher' },
    { key: 'rpmNearTop', label: 'RPM @ top', unit: '', dir: 'either' },
    { key: 'waterAvg', label: 'Vandens t°', unit: '°C', dir: 'either' },
    { key: 'waterMax', label: 'Max vandens t°', unit: '°C', dir: 'either' },
    { key: 'egtAvg', label: 'EGT vidut.', unit: '°C', dir: 'either' },
    { key: 'pedalEventsPerLap', label: 'Pedalų judesiai/ratą', unit: '', dir: 'either' },
  ];
  
  for (const check of checks) {
    const current = parseFloat(currentSession[check.key]);
    if (isNaN(current)) continue;
    const b = baseline[check.key];
    if (!b || b.iqr === 0) continue;
    
    // Outlier detection: > 1.5x IQR beyond quartiles
    const lowerBound = b.q1 - 1.5 * b.iqr;
    const upperBound = b.q3 + 1.5 * b.iqr;
    
    let severity = null;
    let direction = '';
    let pctChange = 0;
    
    if (current < lowerBound) {
      direction = 'krito';
      pctChange = (current - b.median) / b.median * 100;
      severity = 'high';
    } else if (current > upperBound) {
      direction = 'pakilo';
      pctChange = (current - b.median) / b.median * 100;
      severity = 'high';
    } else if (Math.abs(current - b.median) > b.iqr) {
      // Moderate deviation
      direction = current > b.median ? 'aukščiau' : 'žemiau';
      pctChange = (current - b.median) / b.median * 100;
      severity = 'mid';
    }
    
    if (!severity) continue;
    
    // Direction-aware interpretation
    let interpretation = '';
    if (check.dir === 'lower' && current < b.median) {
      // Lower is better for laps
      interpretation = severity === 'high' ? '🚀 Didelis pagerinimas!' : '✓ Geresnis nei įprasta';
      severity = 'good';
    } else if (check.dir === 'lower' && current > b.median) {
      interpretation = severity === 'high' ? '⚠ Blogesnis nei įprasta' : 'Šiek tiek blogesnis';
    } else if (check.dir === 'higher' && current > b.median) {
      interpretation = severity === 'high' ? '🚀 Didelis pagerinimas!' : '✓ Geresnis nei įprasta';
      severity = 'good';
    } else if (check.dir === 'higher' && current < b.median) {
      interpretation = severity === 'high' ? '⚠ Mažiau nei įprasta' : 'Šiek tiek mažesnis';
    } else {
      interpretation = severity === 'high' ? '⚠ Reikšminga deviacija' : 'Nukrypimas nuo įprastinio';
    }
    
    anomalies.push({
      severity,
      metric: check.label,
      current: current.toFixed(check.unit === 's' ? 3 : 1),
      median: b.median.toFixed(check.unit === 's' ? 3 : 1),
      unit: check.unit,
      direction,
      pctChange: pctChange.toFixed(1),
      interpretation,
    });
  }
  
  // Special: speed drop without obvious reason (engine wear signal)
  if (currentSession.topSpeedP99 && baseline.topSpeedP99) {
    const drop = baseline.topSpeedP99.median - currentSession.topSpeedP99;
    if (drop > 3 && !currentSession.airTemp) {
      anomalies.push({
        severity: 'mid',
        metric: 'Top speed kritimas',
        interpretation: `⚠ Top speed sumažėjo ${drop.toFixed(1)} km/h nuo įprastinio. Galimos priežastys: variklio dilimas, padangų amžius, oro tankis.`
      });
    }
  }
  
  return anomalies;
}

function CompareView({ sessions }) {
  const sortedSess = useMemo(() => 
    [...sessions].filter(s => s.bestLap).sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""))),
    [sessions]
  );
  
  const [sessionA, setSessionA] = useState(sortedSess[0]?.id || "");
  const [sessionB, setSessionB] = useState(sortedSess[1]?.id || "");
  
  const sA = sortedSess.find(s => s.id === sessionA);
  const sB = sortedSess.find(s => s.id === sessionB);
  
  // Anomaly detection: detect changes in latest session vs historical
  const latestSession = sortedSess[0];
  const historicalSessions = sortedSess.slice(1);
  const anomalies = useMemo(() => 
    latestSession ? detectAnomalies(latestSession, historicalSessions) : [],
    [latestSession, historicalSessions]
  );
  
  const bestEver = sessions.reduce((b, s) => (s.bestLap && (!b || s.bestLap < b.bestLap)) ? s : b, null);
  
  // Chart data
  const chartData = sessions.filter(s => s.bestLap).map(s => ({
    label: `${s.date.slice(5)}/${s.time?.slice(0,5) || "?"}`,
    time: s.bestLap,
    isBest: s.id === bestEver?.id,
  })).sort((a, b) => a.label.localeCompare(b.label));
  
  const fmtSessionLabel = (s) => 
    s ? `${s.date} ${s.time || ""} · ${s.bestLap?.toFixed(3) || "—"}s${s.driver ? " · " + s.driver : ""}` : "—";
  
  return (
    <div>
      <div style={styles.h2}>Palyginimas</div>
      
      {/* Anomalies first — most useful insight */}
      {anomalies.length > 0 && (
        <div style={styles.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            🔍 Anomalijos paskutiniame ratame
          </div>
          {anomalies.map((a, i) => {
            const colors = {
              high: { bg: "#1c0f0f", brd: "#7f1d1d", txt: "#fca5a5" },
              mid: { bg: "#1c1810", brd: "#854d0e", txt: "#fde68a" },
              good: { bg: "#0d1c14", brd: "#065f46", txt: "#6ee7b7" },
            };
            const c = colors[a.severity] || colors.mid;
            return (
              <div key={i} style={{ padding: "8px 10px", background: c.bg, border: `1px solid ${c.brd}`, color: c.txt, fontSize: 12, borderRadius: 6, marginBottom: 4, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{a.interpretation}</div>
                <div style={{ marginTop: 2, color: C.muted, fontSize: 11 }}>
                  {a.metric}: <strong>{a.current}{a.unit}</strong>
                  {a.median && <> (įprastinis: {a.median}{a.unit}{a.pctChange ? `, ${a.pctChange > 0 ? "+" : ""}${a.pctChange}%` : ""})</>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Best ever stat */}
      <div style={{ ...styles.card, textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: C.accent }}>{bestEver?.bestLap?.toFixed(3) || "—"}s</div>
        <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 }}>Visų laikų geriausias</div>
        {bestEver && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{bestEver.date} · gear {bestEver.gear_F}/{bestEver.gear_R} · jet {bestEver.mainJet}</div>}
      </div>
      
      {/* Chart */}
      <div style={{ ...styles.card }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Visi geriausi ratai</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke={C.dim} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
            <YAxis stroke={C.dim} tick={{ fontSize: 10 }} domain={['dataMin - 0.2', 'auto']} />
            <Tooltip contentStyle={{ background: C.bg, border: `1px solid ${C.accent}`, borderRadius: 8 }} formatter={(v) => v?.toFixed(3) + "s"} />
            <Bar dataKey="time" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => <rect key={i} fill={entry.isBest ? C.accent : C.dim} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Session vs Session comparison */}
      <div style={styles.h3}>Lygink dvi sesijas</div>
      <div style={styles.card}>
        <label style={styles.label}>Sesija A</label>
        <select style={{ ...styles.input, paddingRight: 24 }} value={sessionA} onChange={(e) => setSessionA(e.target.value)}>
          <option value="">— pasirink —</option>
          {sortedSess.map(s => <option key={s.id} value={s.id}>{fmtSessionLabel(s)}</option>)}
        </select>
        <label style={{ ...styles.label, marginTop: 8 }}>Sesija B</label>
        <select style={{ ...styles.input, paddingRight: 24 }} value={sessionB} onChange={(e) => setSessionB(e.target.value)}>
          <option value="">— pasirink —</option>
          {sortedSess.map(s => <option key={s.id} value={s.id}>{fmtSessionLabel(s)}</option>)}
        </select>
      </div>
      
      {sA && sB && sA.id !== sB.id && (
        <div style={styles.card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            <div>Parametras</div>
            <div style={{ textAlign: "right" }}>A</div>
            <div style={{ textAlign: "right" }}>B</div>
          </div>
          {[
            { lbl: "Lap time", a: sA.bestLap, b: sB.bestLap, fmt: (v) => v?.toFixed(3) + "s", lowerBetter: true },
            { lbl: "Avg lap", a: sA.avgLap, b: sB.avgLap, fmt: (v) => v?.toFixed(3) + "s", lowerBetter: true },
            { lbl: "Std (konsist.)", a: sA.std, b: sB.std, fmt: (v) => v?.toFixed(3) + "s", lowerBetter: true },
            { lbl: "Pedalų judesiai", a: sA.pedalEventsPerLap, b: sB.pedalEventsPerLap, fmt: (v) => v },
            { lbl: "Top GPS p99", a: sA.topSpeedP99, b: sB.topSpeedP99, fmt: (v) => v?.toFixed(1) + " km/h", higherBetter: true },
            { lbl: "RPM @ top", a: sA.rpmNearTop, b: sB.rpmNearTop, fmt: (v) => v },
            { lbl: "Vandens avg", a: sA.waterAvg, b: sB.waterAvg, fmt: (v) => v + "°C" },
            { lbl: "EGT avg", a: sA.egtAvg, b: sB.egtAvg, fmt: (v) => v + "°C" },
            { lbl: "Oro t°", a: sA.airTemp, b: sB.airTemp, fmt: (v) => v + "°C" },
            { lbl: "Gear", a: `${sA.gear_F || "?"}/${sA.gear_R || "?"}`, b: `${sB.gear_F || "?"}/${sB.gear_R || "?"}`, fmt: (v) => v },
            { lbl: "Jet", a: sA.mainJet, b: sB.mainJet, fmt: (v) => v },
            { lbl: "Adata", a: sA.needle, b: sB.needle, fmt: (v) => "poz " + v },
            { lbl: "Padangos", a: sA.tireBrand, b: sB.tireBrand, fmt: (v) => v },
            { lbl: "Heat cycles", a: sA.tireHeatCycles, b: sB.tireHeatCycles, fmt: (v) => v },
            { lbl: "Toe", a: sA.toe, b: sB.toe, fmt: (v) => v },
            { lbl: "Camber", a: sA.camber, b: sB.camber, fmt: (v) => v },
          ].map((r, i) => {
            const aVal = r.a !== null && r.a !== undefined && r.a !== "" ? r.fmt(r.a) : "—";
            const bVal = r.b !== null && r.b !== undefined && r.b !== "" ? r.fmt(r.b) : "—";
            // Determine which is better
            let aColor = C.text, bColor = C.text;
            if (typeof r.a === "number" && typeof r.b === "number" && r.a !== r.b) {
              if (r.lowerBetter) {
                if (r.a < r.b) aColor = C.good;
                else bColor = C.good;
              } else if (r.higherBetter) {
                if (r.a > r.b) aColor = C.good;
                else bColor = C.good;
              }
            }
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{r.lbl}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: "right", color: aColor }}>{aVal}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: "right", color: bColor }}>{bVal}</span>
              </div>
            );
          })}
          
          {/* Difference summary */}
          {sA.bestLap && sB.bestLap && (
            <div style={{ marginTop: 12, padding: 10, background: C.bg, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Skirtumas (A vs B)</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: sA.bestLap < sB.bestLap ? C.good : C.danger }}>
                {sA.bestLap < sB.bestLap ? "↓" : "+"}{Math.abs(sA.bestLap - sB.bestLap).toFixed(3)}s
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                {sA.bestLap < sB.bestLap ? "A greitesnis nei B" : "A lėtesnis nei B"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DUOMENŲ POREIKIO LAPAS
// ============================================================
function DataNeedsView() {
  const items = [
    { cat: "Variklis", priority: "high", title: "EGT (exhaust gas temp)", desc: "MyChron 5S 2T turi 2 temp kanalus. Prijungti termoparą prie išmetimo kolektoriaus. Be šito mišinio derinimas yra spėjimas.", status: "MISSING" },
    { cat: "Variklis", priority: "high", title: "Žvakės nuotrauka po sesijos", desc: "Po S1 ir S5 išsukti žvakę, nufotografuoti. Spalva rodo mišinio teisingumą (šviesiai ruda = OK).", status: "MISSING" },
    { cat: "Padangos", priority: "high", title: "Kalibruotas slėgio manometras", desc: "Visiems matavimams vienas tas pats. Slėgio matavimai per 30 sek po sustojimo.", status: "PARTIAL" },
    { cat: "Padangos", priority: "mid", title: "IR pirometro padangų paviršiaus t°", desc: "Po sesijos pamatuoti padangos paviršiaus t° (vidinis, vidurinis, išorinis taškas). Rodo, kaip pasiskirsto kontaktas.", status: "MISSING" },
    { cat: "Padangos", priority: "mid", title: "Likučio gylis su gyliamačiu", desc: "Po kiekvienos sesijos matuoti protektorių gylį 3 taškuose. Rodo dilimo greitį ir balansą.", status: "MISSING" },
    { cat: "Trasa", priority: "high", title: "Asfalto temperatūra", desc: "IR pirometru matuoti starto linijoje prieš kiekvieną sesiją. Skirtumas tarp oro ir asfalto kartais 20°C.", status: "MISSING" },
    { cat: "Trasa", priority: "low", title: "Saulės kampas / vėjo kryptis", desc: "Veikia traukos lygį. Galima paprastai užfiksuoti pastebėjimuose.", status: "OPTIONAL" },
    { cat: "Vairuotojas", priority: "high", title: "Komentarai pagal posūkius", desc: "Po sesijos: 'T1 — understeer, T3 — pernelyg sukimas, T6 — gerai' ir t.t.", status: "MISSING" },
    { cat: "Vairuotojas", priority: "mid", title: "Širdies pulsas (HRM)", desc: "MyChron 5S palaiko ANT+ HRM. Aukštas HR rodo įtemptą vairavimą; krintantis = nuovargis.", status: "OPTIONAL" },
    { cat: "Vairuotojas", priority: "low", title: "Video iš boriaus", desc: "GoPro arba MyChron Camera. Padeda interpretuoti telemetriją.", status: "OPTIONAL" },
    { cat: "Variklis", priority: "mid", title: "Karbiuratoriaus poppet checkmas", desc: "Rotax Senior poppet valve periodiškai sensta. Užfiksuoti, kada keista.", status: "MISSING" },
    { cat: "Variklis", priority: "mid", title: "Variklio valandų skaitliukas", desc: "Rotax limit ~25h prieš atstatymą. Atskirti naują variklį nuo dėvėto.", status: "MISSING" },
  ];
  
  const byCat = {};
  items.forEach(i => { (byCat[i.cat] = byCat[i.cat] || []).push(i); });
  
  return (
    <div>
      <div style={styles.h2}>Ką dar galėtum suvesti</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Kuo daugiau šių duomenų suvesi, tuo tikslesnės bus rekomendacijos. <strong style={{ color: C.danger }}>Raudoni</strong> — kritiniai. <strong style={{ color: C.accent }}>Geltoni</strong> — naudingi. <strong style={{ color: C.info }}>Mėlyni</strong> — neprivalomi.
      </div>
      
      {Object.keys(byCat).map(cat => (
        <div key={cat}>
          <div style={styles.h3}>{cat}</div>
          {byCat[cat].map((it, i) => {
            const c = it.priority === "high" ? C.danger : it.priority === "mid" ? C.accent : C.info;
            const stat = it.status === "MISSING" ? { bg: "#1c0f0f", txt: "#fca5a5" } : it.status === "PARTIAL" ? { bg: "#1c1810", txt: "#fde68a" } : { bg: "#0f1420", txt: "#93c5fd" };
            return (
              <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${c}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1, flex: 1 }}>{it.title}</div>
                  <span style={{ padding: "2px 8px", background: stat.bg, color: stat.txt, borderRadius: 99, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{it.status}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{it.desc}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// REKOMENDACIJŲ EKRANAS (atskira tabai)
// ============================================================
function RecommendationsView({ sessions }) {
  const todays = sessions.filter(s => s.date === TODAY);
  const baseline = sessions.filter(s => s.date !== TODAY);
  
  const lastSession = todays.length > 0 ? todays[todays.length - 1] : null;
  const recs = lastSession ? generateRecommendations(lastSession, baseline) : [];
  
  const bestEver = sessions.reduce((b, s) => (s.bestLap && (!b || s.bestLap < b.bestLap)) ? s : b, null);
  
  return (
    <div>
      <div style={styles.h2}>Rekomendacijos</div>
      
      {!lastSession ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📊</div>
          <div style={{ color: C.muted }}>Pridėk šiandienos sesiją, kad gautum rekomendacijas.</div>
          {bestEver && (
            <div style={{ marginTop: 14, fontSize: 12, color: C.dim }}>
              Geriausia istorinė: {bestEver.bestLap?.toFixed(3)}s ({bestEver.date} · jet {bestEver.mainJet})
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ ...styles.card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5 }}>Paskutinė sesija</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 }}>{lastSession.time}</div>
                <div style={{ fontSize: 11, color: C.muted }}>jet {lastSession.mainJet} · {lastSession.gear_F}/{lastSession.gear_R}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: C.accent, fontWeight: 700 }}>{lastSession.bestLap?.toFixed(3) || "—"}</div>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Best lap</div>
              </div>
            </div>
          </div>
          
          <div style={styles.h3}>Analizė pagal duomenis</div>
          {recs.map((r, i) => (
            <div key={i} style={styles.recommendation(r.severity)}>{r.text}</div>
          ))}
        </>
      )}
      
      <div style={{ ...styles.h3, marginTop: 24 }}>Optimali sąranga (pasiteisinusi)</div>
      <div style={{ ...styles.card, background: "linear-gradient(135deg, #1f1611 0%, #0a0a0b 100%)", border: `2px solid ${C.accent}` }}>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>⚙️ <strong>Gear:</strong> 12/74 (sweet spot, peak power zona)</div>
          <div>⛽ <strong>Main jet:</strong> 135 (žvakė rodo idealų mišinį 20°C)</div>
          <div>🪡 <strong>Adata:</strong> pozicija 2 (riebesnis posūkiuose)</div>
          <div>📍 <strong>Toe:</strong> +1 mm (stabilumo bazė)</div>
          <div>📐 <strong>Camber:</strong> -1</div>
          <div>🛞 <strong>Padangos cold:</strong> Vega Whites 0.63F / 0.57R → hot 0.80 bar</div>
          <div>💧 <strong>Radiatorius:</strong> ~30% užklijuotas (vandens t° į 55-60°C)</div>
        </div>
      </div>
      
      <div style={{ ...styles.h3, marginTop: 16 }}>🎯 Likę rezervai sub-39 link</div>
      <div style={styles.card}>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ color: C.good, fontWeight: 600, marginBottom: 4 }}>🥇 Vandens temperatūra (-0.15s)</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>Vis dar 41-50°C. Užklijuoti 30% radiatoriaus.</div>
          
          <div style={{ color: C.accent, fontWeight: 600, marginBottom: 4 }}>🥈 Padangos slėgis priekyje (-0.10s)</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>Cold 0.55-0.58 vietoj 0.63 → daugiau "kibimo" priekyje → mažiau pedalo darbo posūkyje.</div>
          
          <div style={{ color: C.info, fontWeight: 600, marginBottom: 4 }}>🥉 Posūkis #3-#4 segmentas (-0.20s)</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>16 pedalo judesių per 5s — daugiausia visame rate. Caster +1 ar siauresnis galas (138cm) mažintų pedalo darbo poreikį.</div>
          
          <div style={{ color: "#a855f7", fontWeight: 600, marginBottom: 4 }}>🌡️ EGT prijungimas (kritiška ilgalaikiui progresui)</div>
          <div style={{ color: C.muted, fontSize: 12 }}>Be EGT mišinio derinimas yra spėjimas. Prijungti Temp 2 kanalą prie MyChron 5S 2T.</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELP / METODIKA
// ============================================================
function HelpView() {
  return (
    <div>
      <div style={styles.h2}>Metodika ir taisyklės</div>
      
      <div style={styles.h3}>Eksperimentai per sesijas</div>
      <div style={{ ...styles.card, fontSize: 13, lineHeight: 1.7, color: C.text }}>
        <strong style={{ color: C.accent }}>Auksinė taisyklė:</strong> tarp dviejų sesijų keisk TIK VIENĄ dalyką (ar jet, ar gear, ar slėgis). Kitaip neįmanoma suprasti, kas davė efektą.
      </div>
      
      <div style={styles.h3}>Optimalūs diapazonai</div>
      <div style={styles.card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {[
              ["Vandens t° vidut.", "50-65°C"],
              ["EGT (Rotax Senior)", "580-650°C"],
              ["EGT max", "< 680°C"],
              ["Padangų slėgio delta", "0.25-0.35 bar"],
              ["Mojo D5 karštas slėgis", "0.95-1.05 bar"],
              ["Sustained RPM tiesumoje", "13,000-13,900"],
              ["Toe (sausa)", "0 iki -2 mm"],
              ["Toe (šlapia)", "+1 iki +3 mm"],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "8px 4px", color: C.muted }}>{row[0]}</td>
                <td style={{ padding: "8px 4px", fontFamily: "'JetBrains Mono', monospace", textAlign: "right", color: C.accent }}>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={styles.h3}>RPM "sustained" reikšmė</div>
      <div style={{ ...styles.card, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
        Naudoti rolling minimum 5 sample'ų (250ms @ 20Hz) — tai filtruoja RPM šuolius nuo nelygumų (kartas pašoka, ratas ore užsisuka). RS3'iame analizėje: Channels → Custom Function arba paprasčiausiai imti max iš diapazono, kuris yra šalia top GPS speed.
      </div>
      
      <div style={styles.h3}>MyChron failo pavadinimas</div>
      <div style={{ ...styles.card, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
        Geras formatas: <code style={{ background: "#1f1f23", padding: "2px 4px", borderRadius: 4, color: C.text }}>YYYY-MM-DD_anyksciai_S1_jet135_gear12-76.csv</code>
        <br/><br/>Tada pokalbyje su Claude įkėlus failą — jis žinos, kuri sesija ir kokia sąranka. Automatinė analizė.
      </div>
      
      <div style={styles.h3}>Auksinė checklist boksuose</div>
      <div style={styles.card}>
        {[
          "☐ Toe patikrintas su lazeriu ar stygą",
          "☐ Padangų slėgis matuotas su tuo PAČIU manometru",
          "☐ Žvakę ištraukti po pirmos ir paskutinės sesijos",
          "☐ EGT prijungtas ir matomas ekrane",
          "☐ MyChron sesijos pradžios indikatorius nustatytas",
          "☐ GPS rado palydovus (signalas pilnas)",
          "☐ Trasa pažymėta MyChron'e (kad sektoriai būtų teisingi)",
          "☐ Tik VIENAS pakeitimas tarp sesijų",
          "☐ Po sesijos užrašyti subjektyvius pojūčius",
          "☐ Pasiimti pirometrą padangų paviršiaus t° matavimui",
        ].map((c, i) => (
          <div key={i} style={{ padding: "5px 0", fontSize: 13, color: C.text }}>{c}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ============================================================
// PAKVIETIMŲ KODŲ SISTEMA
// ============================================================
// Tai soft-security: kodai matomi naršyklėje, bet užtenka,
// kad atsitiktiniai žmonės negalėtų pradėti naudoti.
// Jei norėtų apeiti — reikia žinoti JS / DevTools (5% žmonių).

// Specialus savininko kodas — pridės baseline sesijas automatiškai
const OWNER_INVITE_CODE = "DK-DOVYDAS-2026";

// Dovydo praeito savaitgalio sesijos (preload tik kai naudojamas owner kodas)
const DOVYDAS_BASELINE_SESSIONS = [
  // ===== D1: 2026-05-21 (Treniruotė — jet testavimas) =====
  { id: "dov_2026-05-21_s1", date: "2026-05-21", time: "11:32", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 14, pressure: 1020, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "naudotos (varžybos)",
    cold_F: 0.85, cold_R: 0.80, hot_F: 1.15, hot_R: 1.20,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "netikrintas", camber: "",
    gear_F: 12, gear_R: 76, mainJet: 127, needle: 3, airScrew: "atsuktas",
    bestLap: 41.754, avgLap: 42.21, std: 0.41, lapCount: 15,
    waterMin: 41.1, waterMax: 59.8, waterAvg: 50.8, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 12777, rpmNearTop: 12777, pedalEventsPerLap: "", topSpeedP99: 101.3, topSpeedMax: 105.8,
    notes: "Padangos po varžybų. Variklis užsikemšą — jet per liesas.", weight: 162,
    photos: {} },
  { id: "dov_2026-05-21_s2", date: "2026-05-21", time: "12:29", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 16, pressure: 1020, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "naujos",
    cold_F: 0.70, cold_R: 0.70, hot_F: 1.00, hot_R: 1.00,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "netikrintas", camber: "",
    gear_F: 12, gear_R: 76, mainJet: 130, needle: 3, airScrew: "atsuktas",
    bestLap: 41.160, avgLap: 41.87, std: 0.70, lapCount: 21,
    waterMin: 29.3, waterMax: 52.9, waterAvg: 49.3, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13218, rpmNearTop: 13218, pedalEventsPerLap: "", topSpeedP99: 107.6, topSpeedMax: 112.3,
    notes: "Padangų sąranga ideali. Variklis pradėjo dirbti.", weight: 162,
    photos: {} },
  { id: "dov_2026-05-21_s3", date: "2026-05-21", time: "13:29", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 20, pressure: 1020, humidity: "", weather: "Lengvas lietus", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "naujos",
    cold_F: 0.70, cold_R: 0.70, hot_F: 1.00, hot_R: 1.00,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "netikrintas", camber: "",
    gear_F: 12, gear_R: 76, mainJet: 133, needle: 3, airScrew: "atsuktas",
    bestLap: 40.849, avgLap: 41.70, std: 0.78, lapCount: 22,
    waterMin: 31.0, waterMax: 52.2, waterAvg: 47.3, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13250, rpmNearTop: 13250, pedalEventsPerLap: "", topSpeedP99: 104.6, topSpeedMax: 111.0,
    notes: "DIENOS GERIAUSIAS. Per lengvą lietų — galimai vėsesnis asfaltas.", weight: 155,
    photos: {} },
  { id: "dov_2026-05-21_s4", date: "2026-05-21", time: "14:29", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 20, pressure: 1020, humidity: "", weather: "Lengvas lietus", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "perverstos",
    cold_F: 0.70, cold_R: 0.60, hot_F: 1.00, hot_R: 0.85,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "netikrintas", camber: "",
    gear_F: 12, gear_R: 76, mainJet: 135, needle: 3, airScrew: "atsuktas",
    bestLap: 40.883, avgLap: 41.78, std: 0.65, lapCount: 22,
    waterMin: 32.5, waterMax: 49.8, waterAvg: 46.6, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13341, rpmNearTop: 13341, pedalEventsPerLap: "", topSpeedP99: 105.4, topSpeedMax: 111.3,
    notes: "Padangos perverstos. Variklis arti peak power.", weight: 155,
    photos: {} },
  { id: "dov_2026-05-21_s5", date: "2026-05-21", time: "15:29", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 19, pressure: 1020, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Mojo D5", tireAge: "sudilusios",
    cold_F: 0.70, cold_R: 0.60, hot_F: 1.00, hot_R: 0.85,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "netikrintas", camber: "",
    gear_F: 12, gear_R: 76, mainJet: 138, needle: 3, airScrew: "atsuktas",
    bestLap: 40.937, avgLap: 41.15, std: 0.16, lapCount: 14,
    waterMin: 30.5, waterMax: 49.8, waterAvg: 45.8, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13728, rpmNearTop: 13728, pedalEventsPerLap: "", topSpeedP99: 107.2, topSpeedMax: 115.1,
    notes: "Konsistencija idealu (std 0.16). Top 115 km/h gal. dėl slipstream. 138 - per riebus.", weight: 155,
    photos: {} },
  
  // ===== D2: 2026-05-22 (BREAKTHROUGH — sub-40 pasiekta) =====
  { id: "dov_2026-05-22_s6", date: "2026-05-22", time: "15:54", track: "Anykščiai", driver: "Dovydas",
    sessionType: "training",
    airTemp: 18, pressure: 1019, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Vega Whites", tireAge: "naujos",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.98, hot_R: 0.92,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "+1mm", camber: "-1",
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 4, airScrew: "atsuktas",
    bestLap: 39.686, avgLap: 39.95, std: 0.21, lapCount: 12,
    waterMin: 35.0, waterMax: 51.0, waterAvg: 47.5, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13420, rpmNearTop: 13420, pedalEventsPerLap: "", topSpeedP99: 108.5, topSpeedMax: 110.2,
    notes: "🎯 SUB-40 PASIEKTA. 3 sub-40 ratai. Trumpesnis gear (12/74) padėjo posūkių išvažiavime. Naujos Vega Whites + camber -1 + toe +1mm.", weight: 155,
    photos: {} },
  
  // ===== D3: 2026-05-23 (RACE DAY — etapas) =====
  { id: "dov_2026-05-23_q1", date: "2026-05-23", time: "10:15", track: "Anykščiai", driver: "Dovydas",
    sessionType: "qualifying",
    airTemp: 16, pressure: 1021, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Vega Whites", tireAge: "2 sesijos",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.95, hot_R: 0.90,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "+1mm", camber: "-1",
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.745, avgLap: 39.98, std: 0.18, lapCount: 8,
    waterMin: 38.0, waterMax: 52.0, waterAvg: 48.0, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13450, rpmNearTop: 13450, pedalEventsPerLap: "", topSpeedP99: 109.0, topSpeedMax: 110.5,
    notes: "Kvalifikacija. Adata į pos 2 (liesesnis mišinys). Stabilūs sub-40 laikai.", weight: 155,
    photos: {} },
  { id: "dov_2026-05-23_r1", date: "2026-05-23", time: "13:30", track: "Anykščiai", driver: "Dovydas",
    sessionType: "race_event",
    airTemp: 19, pressure: 1021, humidity: "", weather: "Sausa", trackTemp: "",
    tireBrand: "Vega Whites", tireAge: "3 sesijos",
    cold_F: 0.70, cold_R: 0.65, hot_F: 0.97, hot_R: 0.92,
    chassisAxle: "N", caster: "", trackWidthF: "1.5 hubs", trackWidthR: 140, seatPos: "", torsion: "", toe: "+1mm", camber: "-1",
    gear_F: 12, gear_R: 74, mainJet: 135, needle: 2, airScrew: "atsuktas",
    bestLap: 39.598, avgLap: 39.85, std: 0.19, lapCount: 23,
    waterMin: 42.0, waterMax: 55.0, waterAvg: 49.5, egtMax: "", egtAvg: "",
    rpmSustainedStraight: 13480, rpmNearTop: 13480, pedalEventsPerLap: "", topSpeedP99: 109.2, topSpeedMax: 111.8,
    notes: "📢 ETAPO LENKTYNĖS. 23 ratų stintas, 18 sub-40 ratų. Geriausias sezono laikas 39.598s!", weight: 155,
    photos: {} },
];

// Galiojantys pakvietimų kodai. Pridėk / pakeisk šitą sąrašą
// kad išplėstum / apribotum prieigą.
// Tipas: { code: "KODAS", note: "Kam skirta", expiresAt?: "YYYY-MM-DD" }
const VALID_INVITE_CODES = [
   { code: "DK-DOVYDAS-2026", note: "Dovydas (savininkas)" },
  { code: "DK-JURGIS-2026", note: "JURGIS #1" },
  { code: "DK-RYTIS-2026", note: "RYTIS #2" },
  { code: "DK-TEAM-003", note: "Komandos draugas #3" },
  { code: "DK-TEAM-004", note: "Komandos draugas #4" },

];

const INVITE_CODE_KEY = "dkkart:invite_code:v1";

function isInviteCodeValid(code) {
  if (!code) return false;
  const normalized = code.trim().toUpperCase();
  const entry = VALID_INVITE_CODES.find(c => c.code.toUpperCase() === normalized);
  if (!entry) return false;
  // Check expiration
  if (entry.expiresAt) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > entry.expiresAt) return false;
  }
  return true;
}

function InviteCodeScreen({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  
  const handleSubmit = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Įvesk pakvietimo kodą");
      return;
    }
    if (!isInviteCodeValid(code)) {
      setError("Neteisingas arba pasibaigęs kodas");
      return;
    }
    // Įrašom kodą į localStorage, kad sekantį kartą nereikėtų vesti
    try {
      await window.storage.set(INVITE_CODE_KEY, code.trim().toUpperCase());
    } catch (e) { console.error(e); }
    onSuccess(code.trim().toUpperCase());
  };
  
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", padding: 20, fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <img src="/icon-512.png" alt="DK Kart" style={{ width: 140, height: 140, borderRadius: 24, boxShadow: "0 10px 40px rgba(255,203,5,0.2)" }} />
          </div>
          
          <div style={{ background: C.card, padding: 24, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8, textAlign: "center" }}>
              🔐 Pakvietimo kodas
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20, textAlign: "center" }}>
              DK Kart šiuo metu yra <strong>uždara beta versija</strong>.<br/>
              Naudojimui reikalingas pakvietimo kodas iš komandos.
            </div>
            
            <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
              Kodas
            </label>
            <input 
              style={{ 
                width: "100%", 
                padding: "14px 16px", 
                background: C.bg, 
                border: `1px solid ${error ? C.danger : C.border}`, 
                borderRadius: 8, 
                color: C.text, 
                fontSize: 16, 
                marginBottom: error ? 4 : 16, 
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="DK-XXXXXX-XXXX"
              autoFocus
              autoCapitalize="characters"
            />
            
            {error && (
              <div style={{ fontSize: 12, color: C.danger, marginBottom: 16, marginTop: 4, fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              style={{ width: "100%", padding: "14px 20px", background: C.accent, color: C.bg, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}
            >
              Patvirtinti
            </button>
            
            <div style={{ fontSize: 11, color: C.dim, marginTop: 16, textAlign: "center", lineHeight: 1.6 }}>
              Neturi kodo? Susisiek su komandos vadovu, kad gautumei pakvietimą.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// DRIVER MANAGEMENT COMPONENTS
// ============================================================

function DriverCreationScreen({ onCreate }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  
  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Įvesk vairuotojo vardą");
      return;
    }
    if (pin && (pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin))) {
      alert("PIN turi būti 4-8 skaitmenys");
      return;
    }
    onCreate(name.trim(), pin || null);
  };
  
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", padding: 20, fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <img src="/icon-512.png" alt="DK Kart" style={{ width: 140, height: 140, borderRadius: 24, boxShadow: "0 10px 40px rgba(255,203,5,0.2)" }} />
          </div>
          
          <div style={{ background: C.card, padding: 24, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Sveikas atvykęs! 👋
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
              Pirmiausia — sukurkim vairuotojo profilį. Kiekvieno vairuotojo duomenys yra <strong>visiškai atskirti</strong>.
              Galėsi pridėti daugiau vairuotojų vėliau.
            </div>
            
            <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
              Vairuotojo vardas *
            </label>
            <input 
              style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 16, marginBottom: 16, outline: "none" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vardas Pavardė"
              autoFocus
            />
            
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={() => setShowPin(!showPin)}
                style={{ background: "transparent", color: C.muted, border: "none", padding: 0, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
              >
                {showPin ? "− Slėpti PIN" : "+ Pridėti PIN (neprivaloma)"}
              </button>
            </div>
            
            {showPin && (
              <>
                <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
                  PIN (4-8 skaitmenys)
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 18, marginBottom: 4, outline: "none", letterSpacing: 4, fontFamily: "'JetBrains Mono', monospace" }}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="••••"
                />
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 16 }}>
                  PIN apsaugo tavo duomenis, jei kas pasiima telefoną.
                </div>
              </>
            )}
            
            <button
              onClick={handleSubmit}
              style={{ width: "100%", padding: "14px 20px", background: C.accent, color: C.bg, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16, letterSpacing: 0.5 }}
            >
              Pradėti
            </button>
          </div>
          
          <div style={{ fontSize: 11, color: C.dim, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            🔒 Visi duomenys saugomi tik tavo telefone.<br/>
            Niekas niekur nesiunčiama be tavo paspaudimo.
          </div>
        </div>
      </div>
    </>
  );
}

function PinPromptScreen({ driver, attempt, onAttemptChange, onSubmit, onCancel }) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", padding: 20, fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ maxWidth: 400, width: "100%", margin: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{driver?.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Įvesk PIN, kad atrakintum</div>
          </div>
          
          <div style={{ background: C.card, padding: 24, borderRadius: 16 }}>
            <input 
              type="password"
              inputMode="numeric"
              style={{ width: "100%", padding: "16px 14px", background: C.bg, border: `2px solid ${C.border}`, borderRadius: 8, color: C.accent, fontSize: 28, marginBottom: 16, outline: "none", letterSpacing: 12, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}
              value={attempt}
              onChange={(e) => onAttemptChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
              placeholder="••••"
              autoFocus
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onCancel}
                style={{ flex: 1, padding: "12px 16px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Atšaukti
              </button>
              <button
                onClick={onSubmit}
                disabled={attempt.length < 4}
                style={{ flex: 1, padding: "12px 16px", background: attempt.length >= 4 ? C.accent : C.border, color: attempt.length >= 4 ? C.bg : C.muted, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: attempt.length >= 4 ? "pointer" : "default" }}
              >
                Patvirtinti
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DriverPickerSheet({ drivers, activeDriverId, onSwitch, onCreate, onDelete, onClose }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  
  const handleCreate = () => {
    if (!newName.trim()) {
      alert("Įvesk vardą");
      return;
    }
    if (newPin && (newPin.length < 4 || newPin.length > 8)) {
      alert("PIN turi būti 4-8 skaitmenys");
      return;
    }
    onCreate(newName.trim(), newPin || null);
    setNewName("");
    setNewPin("");
    setShowCreate(false);
  };
  
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
         onClick={onClose}>
      <div style={{ background: C.bg, width: "100%", maxWidth: 600, borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "80vh", overflowY: "auto" }}
           onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />
        
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>
          Pasirink vairuotoją
        </div>
        
        {!showCreate && (
          <>
            {drivers.map(d => (
              <div key={d.id} style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: 14, background: d.id === activeDriverId ? "#3f2d05" : C.card, 
                border: `1px solid ${d.id === activeDriverId ? C.accent : C.border}`,
                borderRadius: 12, marginBottom: 8, cursor: "pointer"
              }}
              onClick={() => onSwitch(d.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: d.id === activeDriverId ? C.accent : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: d.id === activeDriverId ? C.bg : C.text }}>
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                      {d.name}
                      {d.pin && <span style={{ fontSize: 12, marginLeft: 6 }}>🔒</span>}
                    </div>
                    {d.id === activeDriverId && (
                      <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 2 }}>✓ Aktyvus</div>
                    )}
                  </div>
                </div>
                {drivers.length > 1 && d.id !== activeDriverId && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(d.id); }}
                    style={{ background: "transparent", border: "none", color: C.danger, fontSize: 16, cursor: "pointer", padding: 8 }}>
                    🗑
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={() => setShowCreate(true)}
              style={{ width: "100%", padding: 14, background: "transparent", border: `2px dashed ${C.border}`, color: C.muted, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}
            >
              + Pridėti naują vairuotoją
            </button>
          </>
        )}
        
        {showCreate && (
          <div style={{ background: C.card, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              Naujas vairuotojas
            </div>
            
            <input 
              style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, marginBottom: 12, outline: "none" }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Vardas"
              autoFocus
            />
            
            <button
              onClick={() => setShowNewPin(!showNewPin)}
              style={{ background: "transparent", color: C.muted, border: "none", padding: 0, fontSize: 11, cursor: "pointer", textDecoration: "underline", marginBottom: 8 }}
            >
              {showNewPin ? "− Slėpti PIN" : "+ Pridėti PIN (neprivaloma)"}
            </button>
            
            {showNewPin && (
              <input 
                type="password"
                inputMode="numeric"
                style={{ width: "100%", padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 16, marginBottom: 12, outline: "none", letterSpacing: 4, fontFamily: "'JetBrains Mono', monospace" }}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="PIN"
              />
            )}
            
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setShowCreate(false); setNewName(""); setNewPin(""); }}
                style={{ flex: 1, padding: "10px 14px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer" }}
              >
                Atšaukti
              </button>
              <button
                onClick={handleCreate}
                style={{ flex: 1, padding: "10px 14px", background: C.accent, color: C.bg, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Sukurti
              </button>
            </div>
          </div>
        )}
        
        <button onClick={onClose} style={{ width: "100%", padding: 12, background: "transparent", color: C.muted, border: "none", marginTop: 12, fontSize: 13, cursor: "pointer" }}>
          Uždaryti
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAGRINDINIS KOMPONENTAS
// ============================================================
export default function DKKart() {
  // Driver registry — kelias driver'iai vienoje programėlėje
  const DRIVERS_KEY = "dkkart:drivers:v1";
  const ACTIVE_DRIVER_KEY = "dkkart:active_driver:v1";
  
  // Per-driver storage funkcijos
  const getSessionsKey = (driverId) => `dkkart:sessions:v1:${driverId || "default"}`;
  const getProfileKey = (driverId) => `dkkart:profile:v1:${driverId || "default"}`;
  
  const [drivers, setDrivers] = useState([]); // [{id, name, pin?, createdAt}]
  const [activeDriverId, setActiveDriverId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("recommendations");
  const [editing, setEditing] = useState(null);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [pinPrompt, setPinPrompt] = useState(null); // {driverId, attempt}
  const [inviteVerified, setInviteVerified] = useState(false);
  
  // Initial load
  useEffect(() => {
    (async () => {
      try {
        // PIRMA — patikrinam invite code
        const inviteR = await window.storage.get(INVITE_CODE_KEY).catch(() => null);
        if (inviteR && inviteR.value && isInviteCodeValid(inviteR.value)) {
          setInviteVerified(true);
        } else {
          // Nėra valid invite — nebandom load'inti kitų duomenų
          setLoading(false);
          return;
        }
        
        const driversR = await window.storage.get(DRIVERS_KEY).catch(() => null);
        const activeR = await window.storage.get(ACTIVE_DRIVER_KEY).catch(() => null);
        
        let driverList = [];
        let activeId = null;
        
        if (driversR && driversR.value) {
          driverList = JSON.parse(driversR.value);
        }
        
        if (activeR && activeR.value) {
          activeId = activeR.value;
        }
        
        // Migracijos check: jei yra senas storage be driver ID
        if (driverList.length === 0) {
          // Patikrina, ar yra duomenų pagal seną raktą
          const oldSessions = await window.storage.get("dkkart:sessions:v1").catch(() => null);
          const oldProfile = await window.storage.get("dkkart:profile:v1").catch(() => null);
          
          if (oldSessions && oldSessions.value || oldProfile && oldProfile.value) {
            // Yra senų duomenų — migracija
            const profileData = oldProfile && oldProfile.value ? JSON.parse(oldProfile.value) : null;
            const driverName = profileData?.driverName || "Vairuotojas";
            const migratedDriver = {
              id: `drv_${Date.now()}`,
              name: driverName,
              pin: null,
              createdAt: new Date().toISOString(),
            };
            driverList = [migratedDriver];
            activeId = migratedDriver.id;
            
            // Perkelti duomenis į naują raktą
            if (oldSessions && oldSessions.value) {
              await window.storage.set(getSessionsKey(migratedDriver.id), oldSessions.value);
              await window.storage.delete("dkkart:sessions:v1").catch(() => {});
            }
            if (oldProfile && oldProfile.value) {
              await window.storage.set(getProfileKey(migratedDriver.id), oldProfile.value);
              await window.storage.delete("dkkart:profile:v1").catch(() => {});
            }
            
            await window.storage.set(DRIVERS_KEY, JSON.stringify(driverList));
            await window.storage.set(ACTIVE_DRIVER_KEY, migratedDriver.id);
          }
        }
        
        setDrivers(driverList);
        
        // Užkrauk aktyvaus driver'io duomenis
        if (activeId && driverList.find(d => d.id === activeId)) {
          setActiveDriverId(activeId);
          await loadDriverData(activeId);
        } else if (driverList.length > 0) {
          // Yra driver'iai, bet nėra aktyvaus — paimk pirmą
          setActiveDriverId(driverList[0].id);
          await loadDriverData(driverList[0].id);
        } else {
          // Nėra driver'ių — wizard kurs pirmą
          setProfile(null);
        }
      } catch (e) {
        console.error("Load error:", e);
      }
      setLoading(false);
    })();
  }, []);
  
  // Užkrauti konkrečiam driver'iui duomenis
  const loadDriverData = async (driverId) => {
    try {
      const [sessR, profR] = await Promise.all([
        window.storage.get(getSessionsKey(driverId)).catch(() => null),
        window.storage.get(getProfileKey(driverId)).catch(() => null),
      ]);
      
      if (sessR && sessR.value) {
        setSessions(JSON.parse(sessR.value));
      } else {
        setSessions([]);
      }
      
      if (profR && profR.value) {
        setProfile(JSON.parse(profR.value));
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Load driver data error:", e);
      setSessions([]);
      setProfile(null);
    }
  };
  
  // Sukurti naują driver'į
  const createDriver = async (name, pin = null) => {
    const newDriver = {
      id: `drv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      pin: pin ? pin.trim() : null,
      createdAt: new Date().toISOString(),
    };
    const newDrivers = [...drivers, newDriver];
    setDrivers(newDrivers);
    setActiveDriverId(newDriver.id);
    setSessions([]);
    setProfile(null); // Triggers wizard for new driver
    
    try {
      await window.storage.set(DRIVERS_KEY, JSON.stringify(newDrivers));
      await window.storage.set(ACTIVE_DRIVER_KEY, newDriver.id);
    } catch (e) { console.error(e); }
    
    return newDriver;
  };
  
  // Perjungti į kitą driver'į
  const switchDriver = async (driverId) => {
    const target = drivers.find(d => d.id === driverId);
    if (!target) return;
    
    // Jei turi PIN — paklausk
    if (target.pin) {
      setPinPrompt({ driverId, attempt: "" });
      return;
    }
    
    setActiveDriverId(driverId);
    await window.storage.set(ACTIVE_DRIVER_KEY, driverId);
    await loadDriverData(driverId);
    setShowDriverPicker(false);
    setTab("recommendations");
  };
  
  const verifyPin = async () => {
    const target = drivers.find(d => d.id === pinPrompt.driverId);
    if (!target) return;
    
    if (target.pin && pinPrompt.attempt !== target.pin) {
      alert("Neteisingas PIN");
      setPinPrompt({ ...pinPrompt, attempt: "" });
      return;
    }
    
    setActiveDriverId(pinPrompt.driverId);
    await window.storage.set(ACTIVE_DRIVER_KEY, pinPrompt.driverId);
    await loadDriverData(pinPrompt.driverId);
    setShowDriverPicker(false);
    setPinPrompt(null);
    setTab("recommendations");
  };
  
  // Ištrinti driver'į (ir visus jo duomenis)
  const deleteDriver = async (driverId) => {
    if (drivers.length === 1) {
      alert("Negali ištrinti paskutinio vairuotojo. Pirmiausia sukurk kitą.");
      return;
    }
    
    const target = drivers.find(d => d.id === driverId);
    if (!confirm(`Ar tikrai nori ištrinti "${target?.name}"?\n\nVisos jo sesijos ir profilis bus PRARASTI NEGRĮŽTAMAI.`)) {
      return;
    }
    
    // Pakartotinis patvirtinimas
    if (!confirm(`Patvirtink dar kartą: ištrinti "${target?.name}" ir visus duomenis?`)) {
      return;
    }
    
    const newDrivers = drivers.filter(d => d.id !== driverId);
    setDrivers(newDrivers);
    
    try {
      await window.storage.set(DRIVERS_KEY, JSON.stringify(newDrivers));
      await window.storage.delete(getSessionsKey(driverId));
      await window.storage.delete(getProfileKey(driverId));
    } catch (e) { console.error(e); }
    
    // Jei trynė aktyvų — perjunk į pirmą likusį
    if (activeDriverId === driverId && newDrivers.length > 0) {
      await switchDriver(newDrivers[0].id);
    }
  };
  
  const saveProfile = async (p) => {
    setProfile(p);
    try { await window.storage.set(getProfileKey(activeDriverId), JSON.stringify(p)); } catch (e) { console.error(e); }
  };
  
  const save = async (next) => {
    setSessions(next);
    try { await window.storage.set(getSessionsKey(activeDriverId), JSON.stringify(next)); } catch (e) { console.error(e); }
  };
  
  const handleSaveSession = (s) => {
    const exists = sessions.find(x => x.id === s.id);
    save(exists ? sessions.map(x => x.id === s.id ? s : x) : [...sessions, s]);
    setEditing(null);
  };
  
  const handleDelete = (id) => save(sessions.filter(s => s.id !== id));
  
  const handleImportShared = (importedSession) => {
    if (sessions.find(s => s.id === importedSession.id)) {
      alert("Ši kolegos sesija jau importuota.");
      return;
    }
    save([...sessions, importedSession]);
    alert(`✓ Importuota kolegos ${importedSession._sharedFrom || importedSession.driver || ""} sesija`);
  };
  
  const handleResetProfile = async () => {
    try { await window.storage.delete(getProfileKey(activeDriverId)); } catch (e) { /* ignore */ }
    setProfile(null);
  };
  
  const activeDriver = drivers.find(d => d.id === activeDriverId);
  
  // Loading state
  if (loading) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>
        <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: C.dim }}>Kraunama…</div>
        </div>
      </>
    );
  }
  
  // PIRMA — invite code patikrinimas
  if (!inviteVerified) {
    return <InviteCodeScreen onSuccess={async (code) => {
      setInviteVerified(true);
      // Užkrauk likusius duomenis
      const driversR = await window.storage.get(DRIVERS_KEY).catch(() => null);
      if (driversR && driversR.value) {
        const list = JSON.parse(driversR.value);
        setDrivers(list);
        const activeR = await window.storage.get(ACTIVE_DRIVER_KEY).catch(() => null);
        if (activeR && activeR.value && list.find(d => d.id === activeR.value)) {
          setActiveDriverId(activeR.value);
          await loadDriverData(activeR.value);
        }
      }
    }} />;
  }
  
  // No drivers yet — show driver creation screen first
  if (drivers.length === 0) {
    return <DriverCreationScreen onCreate={async (name, pin) => {
      const newDriver = await createDriver(name, pin);
      
      // Jei naudojamas savininko kodas — automatiškai preload baseline sesijas
      try {
        const inviteR = await window.storage.get(INVITE_CODE_KEY).catch(() => null);
        if (inviteR && inviteR.value === OWNER_INVITE_CODE) {
          // Preload Dovydas baseline sessions
          await window.storage.set(
            getSessionsKey(newDriver.id),
            JSON.stringify(DOVYDAS_BASELINE_SESSIONS)
          );
          setSessions(DOVYDAS_BASELINE_SESSIONS);
        }
      } catch (e) { console.error("Baseline preload error:", e); }
      
      // Profile wizard will trigger next via profile === null
    }} />;
  }
  
  // First-run setup wizard (per driver)
  if (!profile || !profile.setupComplete) {
    return (
      <SetupWizard
        initialProfile={profile}
        onComplete={saveProfile}
        onSkip={() => saveProfile({ ...DEFAULT_PROFILE, setupComplete: true })}
      />
    );
  }
  
  // PIN prompt screen
  if (pinPrompt) {
    return <PinPromptScreen 
      driver={drivers.find(d => d.id === pinPrompt.driverId)}
      attempt={pinPrompt.attempt}
      onAttemptChange={(v) => setPinPrompt({ ...pinPrompt, attempt: v })}
      onSubmit={verifyPin}
      onCancel={() => setPinPrompt(null)}
    />;
  }
  
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap'); * { box-sizing: border-box; } input, select, textarea { -webkit-appearance: none; } @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }`}</style>
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              {/* DK Kart logo + text */}
              <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                <img src="/icon-192.png" alt="DK Kart" style={{ width: 36, height: 36, borderRadius: 7, flexShrink: 0 }} />
                <div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 24, color: C.accent, letterSpacing: -1 }}>DK </span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: 0.5 }}>Kart</span>
                </div>
              </div>
              {/* Driver switcher button — visible if multiple drivers OR can add more */}
              <button onClick={() => setShowDriverPicker(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", marginTop: 2 }}>
                <span style={{ width: 20, height: 20, borderRadius: 10, background: C.accent, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {(activeDriver?.name || "?").charAt(0).toUpperCase()}
                </span>
                <span>{activeDriver?.name || "—"}</span>
                {activeDriver?.pin && <span style={{ fontSize: 9 }}>🔒</span>}
                <span style={{ fontSize: 9, color: C.muted }}>▼</span>
              </button>
            </div>
            {profile.targetLapTime && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Tikslas</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.accent, fontWeight: 700 }}>{profile.targetLapTime}s</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Driver picker overlay */}
        {showDriverPicker && (
          <DriverPickerSheet
            drivers={drivers}
            activeDriverId={activeDriverId}
            onSwitch={switchDriver}
            onCreate={async (name, pin) => { await createDriver(name, pin); setShowDriverPicker(false); }}
            onDelete={deleteDriver}
            onClose={() => setShowDriverPicker(false)}
          />
        )}
        
        <div style={styles.content}>
          {editing !== null ? (
            <SessionForm 
              session={editing.id ? editing : null}
              history={sessions.filter(s => s.id !== editing.id)}
              profile={profile}
              onSave={handleSaveSession}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              {tab === "recommendations" && <RecommendationsView sessions={sessions} />}
              {tab === "sessions" && <SessionList sessions={sessions} onAdd={() => setEditing({})} onEdit={setEditing} onDelete={handleDelete} onImportShared={handleImportShared} />}
              {tab === "compare" && <CompareView sessions={sessions} />}
              {tab === "needs" && <DataNeedsView />}
              {tab === "settings" && <SettingsView profile={profile} onSave={saveProfile} onReset={handleResetProfile} />}
            </>
          )}
        </div>
        
        {!editing && tab === "sessions" && (
          <button style={styles.fab} onClick={() => setEditing({})} aria-label="Pridėti sesiją">+</button>
        )}
        
        {!editing && (
          <div style={styles.tabs}>
            <button style={styles.tab(tab === "recommendations")} onClick={() => setTab("recommendations")}>Rekom.</button>
            <button style={styles.tab(tab === "sessions")} onClick={() => setTab("sessions")}>Sesijos</button>
            <button style={styles.tab(tab === "compare")} onClick={() => setTab("compare")}>Palyg.</button>
            <button style={styles.tab(tab === "needs")} onClick={() => setTab("needs")}>Duomenys</button>
            <button style={styles.tab(tab === "settings")} onClick={() => setTab("settings")}>Profilis</button>
          </div>
        )}
      </div>
    </>
  );
}
