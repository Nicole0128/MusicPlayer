"use strict";

// Keep the existing database and store names. Version 1 records remain valid;
// online downloads and user overrides are stored as additional fields/records.
const DATABASE_NAME = "personal-music-player";
const DATABASE_VERSION = 1;
const STORE_NAME = "songs";
const CATALOG_CACHE_ID = "__music-player:catalog-cache";
const LOOP_STORAGE_KEY = "personal-music-player.loop-mode";
const SHUFFLE_STORAGE_KEY = "personal-music-player.shuffle-enabled";
const MANUAL_QUEUE_STORAGE_KEY = "personal-music-player.manual-queue";
const LOOP_MODES = ["none", "all", "one"];
const MAX_TITLE_LENGTH = 180;
const COVER_LIMIT = 1024;

const elements = {
  importButton: document.querySelector("#importButton"),
  audioFiles: document.querySelector("#audioFiles"),
  coverFileInput: document.querySelector("#coverFileInput"),
  status: document.querySelector("#statusMessage"),
  songList: document.querySelector("#songList"),
  emptyState: document.querySelector("#emptyState"),
  emptyStateTitle: document.querySelector("#emptyStateTitle"),
  emptyStateDescription: document.querySelector("#emptyStateDescription"),
  emptyRefreshButton: document.querySelector("#emptyRefreshButton"),
  noResults: document.querySelector("#noResults"),
  songCount: document.querySelector("#songCount"),
  visibleCount: document.querySelector("#visibleCount"),
  searchForm: document.querySelector("#searchForm"),
  search: document.querySelector("#songSearch"),
  clearSearchButton: document.querySelector("#clearSearchButton"),
  resetSearchButton: document.querySelector("#resetSearchButton"),
  quickMenuButton: document.querySelector("#quickMenuButton"),
  quickActionsDialog: document.querySelector("#quickActionsDialog"),
  closeQuickActionsButton: document.querySelector("#closeQuickActionsButton"),
  removedSongsButton: document.querySelector("#removedSongsButton"),
  removedSongsDialog: document.querySelector("#removedSongsDialog"),
  removedSongList: document.querySelector("#removedSongList"),
  closeRemovedSongsButton: document.querySelector("#closeRemovedSongsButton"),
  downloadAllButton: document.querySelector("#downloadAllButton"),
  refreshPlaylistButton: document.querySelector("#refreshPlaylistButton"),
  downloadProgress: document.querySelector("#downloadProgress"),
  progressLabel: document.querySelector("#progressLabel"),
  progressCount: document.querySelector("#progressCount"),
  downloadProgressBar: document.querySelector("#downloadProgressBar"),
  audio: document.querySelector("#audioPlayer"),
  miniTrack: document.querySelector("#expandPlayerButton"),
  miniCover: document.querySelector("#miniCover"),
  miniTitle: document.querySelector("#miniTitle"),
  miniSubtitle: document.querySelector("#miniSubtitle"),
  miniPlayButton: document.querySelector("#miniPlayButton"),
  miniPlayIcon: document.querySelector("#miniPlayIcon"),
  desktopShuffleButton: document.querySelector("#desktopShuffleButton"),
  desktopPreviousButton: document.querySelector("#desktopPreviousButton"),
  desktopPlayButton: document.querySelector("#desktopPlayButton"),
  desktopPlayIcon: document.querySelector("#desktopPlayIcon"),
  desktopNextButton: document.querySelector("#desktopNextButton"),
  desktopRepeatButton: document.querySelector("#desktopRepeatButton"),
  desktopSeekBar: document.querySelector("#desktopSeekBar"),
  desktopElapsed: document.querySelector("#desktopElapsed"),
  desktopDuration: document.querySelector("#desktopDuration"),
  miniProgressValue: document.querySelector("#miniProgressValue"),
  queueButton: document.querySelector("#queueButton"),
  fullQueueButton: document.querySelector("#fullQueueButton"),
  queueDialog: document.querySelector("#queueDialog"),
  queueContent: document.querySelector("#queueContent"),
  closeQueueButton: document.querySelector("#closeQueueButton"),
  playerDialog: document.querySelector("#playerDialog"),
  closePlayerButton: document.querySelector("#closePlayerButton"),
  fullTitle: document.querySelector("#fullTitle"),
  fullCover: document.querySelector("#fullCover"),
  fullTrackTitle: document.querySelector("#fullTrackTitle"),
  fullTrackSource: document.querySelector("#fullTrackSource"),
  playButton: document.querySelector("#playButton"),
  playIcon: document.querySelector("#playIcon"),
  previousButton: document.querySelector("#previousButton"),
  nextButton: document.querySelector("#nextButton"),
  seekBar: document.querySelector("#seekBar"),
  elapsedTime: document.querySelector("#elapsedTime"),
  durationTime: document.querySelector("#durationTime"),
  shuffleButton: document.querySelector("#shuffleButton"),
  shuffleCaption: document.querySelector("#shuffleCaption"),
  repeatButton: document.querySelector("#repeatButton"),
  repeatCaption: document.querySelector("#repeatCaption"),
  repeatBadge: document.querySelector("#repeatBadge"),
  playbackStatus: document.querySelector("#playbackStatus"),
  infoButton: document.querySelector("#infoButton"),
  infoDialog: document.querySelector("#infoDialog"),
  closeInfoButton: document.querySelector("#closeInfoButton"),
  infoDoneButton: document.querySelector("#infoDoneButton"),
  offlineSupportNote: document.querySelector("#offlineSupportNote"),
  updateState: document.querySelector("#updateState"),
  applyUpdateButton: document.querySelector("#applyUpdateButton"),
  trackMenuDialog: document.querySelector("#trackMenuDialog"),
  trackMenuTitle: document.querySelector("#trackMenuTitle"),
  trackMenuSource: document.querySelector("#trackMenuSource"),
  trackOriginalFilename: document.querySelector("#trackOriginalFilename"),
  trackActionList: document.querySelector("#trackActionList"),
  closeTrackMenuButton: document.querySelector("#closeTrackMenuButton"),
  coverPreviewDialog: document.querySelector("#coverPreviewDialog"),
  coverPreviewImage: document.querySelector("#coverPreviewImage"),
  coverPreviewError: document.querySelector("#coverPreviewError"),
  confirmCoverButton: document.querySelector("#confirmCoverButton"),
  cancelCoverButton: document.querySelector("#cancelCoverButton"),
  closeCoverPreviewButton: document.querySelector("#closeCoverPreviewButton")
};

const ICON_PATHS = {
  play: ["M8 5v14l11-7z"],
  pause: ["M7 5h4v14H7z", "M15 5h4v14h-4z"],
  next: ["M6 5v14l10-7z", "M18 5v14"],
  previous: ["M18 5v14L8 12z", "M6 5v14"],
  shuffle: ["M3 7h2.5c4.2 0 8.8 10 13 10H21", "m18 14 3 3-3 3", "M3 17h2.5c4.2 0 8.8-10 13-10H21", "m18 4 3 3-3 3"],
  repeat: ["M17 2 21 6l-4 4", "M3 11V9a3 3 0 0 1 3-3h15", "m7 22-4-4 4-4", "M21 13v2a3 3 0 0 1-3 3H3"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  close: ["m6 6 12 12", "M18 6 6 18"],
  upload: ["M12 16V4", "m12 4-4.5 4.5", "M12 4l4.5 4.5", "M5 14v5h14v-5"],
  download: ["M12 3v12", "m7 10 5 5 5-5", "M4 17v3h16v-3"],
  refresh: ["M20 7v5h-5", "M4 17v-5h5", "M5.5 9a7 7 0 0 1 11.9-2L20 12", "M4 12l2.6 5a7 7 0 0 0 11.9-2"],
  image: ["M4 5h16v14H4z", "m4 15 4-4 4 4 3-3 5 5", "M9 9h.01"],
  edit: ["m15 5 4 4", "M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20z"],
  artist: ["M20 21a8 8 0 0 0-16 0", "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  check: ["m5 12 4 4L19 6"],
  cloud: ["M7 18a4 4 0 1 1 .8-7.9A5.5 5.5 0 0 1 18 9a4 4 0 1 1 0 9z"],
  drag: ["M8 5h.01", "M16 5h.01", "M8 12h.01", "M16 12h.01", "M8 19h.01", "M16 19h.01"],
  up: ["m6 14 6-6 6 6"],
  down: ["m6 10 6 6 6-6"],
  restore: ["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"],
  queue: ["M4 6h16", "M4 12h10", "M4 18h7", "m17 15 3 3-3 3"],
  device: ["M5 3h14v18H5z", "M9 7h6", "M10 17h4"]
};

let database = null;
let songs = [];
let localSongs = [];
let catalogSongs = [];
let remoteRecords = new Map();
let currentSongId = null;
let currentObjectUrl = null;
let currentPlaybackWasAutomatic = false;
let autoFailedIds = new Set();
let playbackRequestToken = 0;
let coverObjectUrls = new Map();
let previewCoverUrl = null;
let mediaArtworkUrl = null;
let mediaMetadataKey = "";
let mediaMetadataRequest = 0;
let pendingCoverBlob = null;
let pendingCoverSongId = null;
let actionSongId = null;
let loopMode = readLoopMode();
let shuffleEnabled = readShuffleSetting();
let shuffleUpcoming = [];
let shuffleHistory = [];
let manualQueue = readManualQueue();
let playbackHistory = [];
let downloadStates = new Map();
let importing = false;
let refreshingCatalog = false;
let libraryLoading = false;
let libraryLoadError = "";
let downloadingAll = false;
let serviceWorkerRegistration = null;
let serviceWorkerInitialized = false;
let statusTimer = 0;
let statusVersion = 0;
let queueReturnFocus = null;
let queuePreviousOverflow = "";
let queueDrag = null;

function readLoopMode() {
  try {
    const stored = localStorage.getItem(LOOP_STORAGE_KEY);
    return LOOP_MODES.includes(stored) ? stored : "none";
  } catch {
    return "none";
  }
}

function readShuffleSetting() {
  try { return localStorage.getItem(SHUFFLE_STORAGE_KEY) === "true"; }
  catch { return false; }
}

function readManualQueue() {
  try {
    const value = JSON.parse(localStorage.getItem(MANUAL_QUEUE_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id) => typeof id === "string") : [];
  } catch { return []; }
}

function persistManualQueue() {
  storeSetting(MANUAL_QUEUE_STORAGE_KEY, JSON.stringify(manualQueue));
  renderQueue();
}

function storeSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Playback still works without preference storage. */ }
}

function setStatus(message, kind = "info") {
  const version = ++statusVersion;
  window.clearTimeout(statusTimer);
  elements.status.textContent = message;
  elements.status.dataset.kind = kind;
  if (message) elements.playbackStatus.textContent = message;
  if (message && kind === "success") {
    statusTimer = window.setTimeout(() => {
      if (version !== statusVersion) return;
      elements.status.textContent = "";
      delete elements.status.dataset.kind;
    }, 3000);
  }
}

function storageErrorMessage(error) {
  if (error?.name === "QuotaExceededError" || error?.name === "NS_ERROR_DOM_QUOTA_REACHED") {
    return "此裝置的儲存空間不足；舊下載仍保留，請釋出空間後再試。";
  }
  return "無法保存到此裝置的音樂庫。請確認瀏覽器允許網站使用儲存空間，再重試。";
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("此瀏覽器不支援 IndexedDB。"));
      return;
    }
    let request;
    let settled = false;
    const timeoutId = window.setTimeout(() => finishWithError(new Error("開啟本機音樂庫逾時。請重試；既有下載資料不會被清除。")), 15000);
    const finishWithError = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(error);
    };
    try { request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION); }
    catch (error) { finishWithError(error); return; }

    request.onupgradeneeded = () => {
      // This branch only creates the old store on a genuinely new database.
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => {
      if (settled) {
        request.result.close();
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      database = request.result;
      database.onversionchange = () => {
        database.close();
        database = null;
        setStatus("音樂庫版本已變更，請重新開啟播放器。", "error");
      };
      resolve(database);
    };
    request.onerror = () => finishWithError(request.error || new Error("無法開啟本機音樂庫。"));
    request.onblocked = () => setStatus("資料庫正被其他分頁使用，請關閉其他播放器分頁後重試。", "error");
  });
}

function readAllRecords() {
  return new Promise((resolve, reject) => {
    if (!database) { reject(new Error("本機音樂庫尚未準備好。")); return; }
    let transaction;
    try { transaction = database.transaction(STORE_NAME, "readonly"); }
    catch (error) { reject(error); return; }
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("讀取音樂庫失敗。"));
  });
}

function writeRecords(records) {
  return new Promise((resolve, reject) => {
    if (!database) { reject(new Error("本機音樂庫尚未準備好。")); return; }
    let transaction;
    try {
      transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      for (const record of records) store.put(record);
    } catch (error) { reject(error); return; }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("資料庫寫入失敗。"));
    transaction.onabort = () => reject(transaction.error || new Error("資料庫寫入已取消。"));
  });
}

function writeRecord(record) { return writeRecords([record]); }

function deleteRecord(id) {
  return new Promise((resolve, reject) => {
    if (!database) { reject(new Error("本機音樂庫尚未準備好。")); return; }
    let transaction;
    try {
      transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
    } catch (error) { reject(error); return; }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("資料庫刪除失敗。"));
    transaction.onabort = () => reject(transaction.error || new Error("資料庫刪除已取消。"));
  });
}

function makeId() {
  return window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeIcon(name, className = "svg-icon") {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add(className);
  appendIcon(svg, name);
  return svg;
}

function appendIcon(svg, name) {
  const namespace = "http://www.w3.org/2000/svg";
  svg.dataset.icon = name;
  for (const pathData of ICON_PATHS[name] || []) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  }
}

function replaceIcon(svg, name) {
  svg.replaceChildren();
  appendIcon(svg, name);
}

function isOnlineSong(song) { return song?.source === "online"; }
function isLocalSong(song) { return song?.source === "local"; }
function hasAudioBlob(song) { return song?.audioBlob instanceof Blob && song.audioBlob.size > 0; }
function isDownloaded(song) { return isOnlineSong(song) && hasAudioBlob(song) && typeof song.downloadVersion === "string"; }
function isCurrentDownload(song) { return isDownloaded(song) && song.downloadVersion === song.version; }
function bySongId(id) { return songs.find((song) => song.id === id) || null; }
function currentSong() { return bySongId(currentSongId); }

function normalizeStoredRecord(record) {
  if (!record || typeof record.id !== "string" || record.recordType === "catalog-cache") return null;
  if (record.source === "online" || (typeof record.remoteId === "string" && record.id.startsWith("online:"))) {
    const remoteId = record.remoteId || record.id.slice("online:".length);
    return {
      ...record,
      id: `online:${remoteId}`,
      remoteId,
      source: "online",
      title: typeof record.userTitle === "string" ? record.userTitle : (record.title || record.manifestTitle || remoteId),
      sourceRemoved: Boolean(record.sourceRemoved)
    };
  }
  if (!hasAudioBlob(record)) return null;
  return {
    ...record,
    source: "local",
    title: typeof record.title === "string" ? record.title : "未命名歌曲",
    originalFileName: typeof record.originalFileName === "string" ? record.originalFileName : "本機音訊"
  };
}

function resolveRelativeAsset(path, manifestUrl, fieldName) {
  if (typeof path !== "string" || !path.trim() || path !== path.trim()) throw new Error(`${fieldName} 必須是非空的相對路徑。`);
  if (path.startsWith("/") || path.startsWith("\\") || /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//") || /[?#]/.test(path)) {
    throw new Error(`${fieldName} 必須使用相對路徑，不能使用根路徑、網址、查詢字串或片段。`);
  }
  const base = new URL("./", manifestUrl);
  const resolved = new URL(path, manifestUrl);
  if (resolved.origin !== base.origin || !resolved.pathname.startsWith(base.pathname)) {
    throw new Error(`${fieldName} 必須留在此 GitHub Pages 專案目錄內。`);
  }
  return resolved.href;
}

function validateCatalog(data, manifestUrl) {
  if (!data || typeof data !== "object" || !Array.isArray(data.songs)) throw new Error("songs.json 格式錯誤，頂層必須包含 songs 陣列。");
  const seen = new Set();
  return data.songs.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`第 ${index + 1} 首歌曲資料不是物件。`);
    const { id, title, audioUrl, coverUrl, version, artist, album } = entry;
    if (typeof id !== "string" || !id.trim() || id.length > 120) throw new Error(`第 ${index + 1} 首歌曲的 id 無效。`);
    if (seen.has(id)) throw new Error(`歌曲 id「${id}」重複，歌單未套用。`);
    seen.add(id);
    if (typeof title !== "string" || !title.trim() || title.trim().length > MAX_TITLE_LENGTH) throw new Error(`歌曲「${id}」的 title 無效。`);
    if (typeof version !== "string" || !version.trim()) throw new Error(`歌曲「${id}」缺少音訊 version。`);
    const resolvedAudioUrl = resolveRelativeAsset(audioUrl, manifestUrl, `歌曲「${id}」的 audioUrl`);
    const resolvedCoverUrl = coverUrl == null || coverUrl === "" ? null : resolveRelativeAsset(coverUrl, manifestUrl, `歌曲「${id}」的 coverUrl`);
    return { id, title: title.trim(), artist: typeof artist === "string" ? artist.trim().slice(0, MAX_TITLE_LENGTH) : "", album: typeof album === "string" ? album.trim().slice(0, MAX_TITLE_LENGTH) : "", audioPath: audioUrl, audioUrl: resolvedAudioUrl, coverPath: coverUrl || null, coverUrl: resolvedCoverUrl, version: version.trim() };
  });
}

function catalogCacheRecord(entries) {
  return {
    id: CATALOG_CACHE_ID,
    recordType: "catalog-cache",
    manifestUrl: catalogManifestUrl().href,
    savedAt: new Date().toISOString(),
    entries: entries.map((song) => ({ id: song.id, title: song.title, ...(song.artist ? { artist: song.artist } : {}), ...(song.album ? { album: song.album } : {}), audioUrl: song.audioPath, ...(song.coverPath ? { coverUrl: song.coverPath } : {}), version: song.version }))
  };
}

function getOfflineRemoteRecords() {
  return [...remoteRecords.values()].filter((song) => hasAudioBlob(song) || song.userTitle || song.customCoverBlob instanceof Blob || song.userRestored);
}

function composeSongs() {
  const currentIds = new Set(catalogSongs.map((song) => song.remoteId));
  const archived = getOfflineRemoteRecords()
    .filter((song) => !currentIds.has(song.remoteId) && (song.sourceRemoved || song.id === currentSongId))
    .map((song) => ({ ...song, sourceRemoved: true }));
  songs = [...catalogSongs.filter((song) => !song.hiddenFromLibrary), ...archived.filter((song) => !song.hiddenFromLibrary), ...localSongs];
  const validQueue = manualQueue.filter((id) => songs.some((song) => song.id === id));
  if (validQueue.length !== manualQueue.length) storeSetting(MANUAL_QUEUE_STORAGE_KEY, JSON.stringify(validQueue));
  manualQueue = validQueue;
  reconcileShuffleQueue();
}

async function applyCatalog(entries, { persist = true } = {}) {
  const nextRemoteRecords = new Map(remoteRecords);
  const nextCatalog = [];
  const writes = [];
  const presentIds = new Set(entries.map((entry) => entry.id));

  for (const entry of entries) {
    const internalId = `online:${entry.id}`;
    const old = nextRemoteRecords.get(entry.id);
    const userTitle = typeof old?.userTitle === "string" ? old.userTitle : undefined;
    const next = {
      ...(old || {}),
      id: internalId,
      remoteId: entry.id,
      source: "online",
      manifestTitle: entry.title,
      title: userTitle || entry.title,
      userTitle,
      artist: typeof old?.customArtist === "string" ? old.customArtist : entry.artist,
      album: entry.album,
      audioUrl: entry.audioUrl,
      audioPath: entry.audioPath,
      coverUrl: entry.coverUrl,
      coverPath: entry.coverPath,
      version: entry.version,
      sourceRemoved: false
    };
    nextCatalog.push(next);
    if (old) {
      nextRemoteRecords.set(entry.id, next);
      writes.push(next);
    }
  }

  for (const [remoteId, old] of nextRemoteRecords) {
    if (presentIds.has(remoteId)) continue;
    const keep = hasAudioBlob(old) || Boolean(old.userTitle) || old.customCoverBlob instanceof Blob || old.userRestored || old.id === currentSongId;
    if (keep) {
      const archived = { ...old, sourceRemoved: true };
      nextRemoteRecords.set(remoteId, archived);
      writes.push(archived);
    }
  }

  if (persist && database) {
    // Manifest + changed records are committed together. A failed transaction
    // leaves the previous saved list and downloaded audio intact.
    writes.push(catalogCacheRecord(entries));
    await writeRecords(writes);
  }

  remoteRecords = nextRemoteRecords;
  catalogSongs = nextCatalog;
  composeSongs();
  renderLibrary();
}

function catalogManifestUrl() { return new URL("./songs.json", document.baseURI); }

async function refreshCatalog({ quiet = false } = {}) {
  if (refreshingCatalog) return false;
  refreshingCatalog = true;
  if (!quiet) setStatus("正在讀取最新線上歌單…", "working");
  let timeoutId = 0;
  try {
    const url = catalogManifestUrl();
    const response = await Promise.race([
      fetch(url.href, { cache: "no-store", headers: { Accept: "application/json" } }),
      new Promise((resolve, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("讀取線上歌單逾時。")), 15000);
      })
    ]);
    if (!response.ok) throw new Error(`songs.json 回應 HTTP ${response.status}。`);
    const raw = await response.json();
    const entries = validateCatalog(raw, url);
    await applyCatalog(entries, { persist: Boolean(database) });
    setStatus(`線上歌單已更新，共 ${entries.length} 首。`, "success");
    return true;
  } catch (error) {
    const fallback = catalogSongs.length ? "已繼續使用上次保存的線上歌單。" : "目前只顯示此裝置保存的歌曲。";
    setStatus(`無法更新線上歌單：${error.message || "網路連線失敗。"} ${fallback}`, "error");
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    refreshingCatalog = false;
  }
}

function hashHue(text) {
  let hash = 0;
  for (const character of String(text || "music")) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}

function coverBlobForSong(song) {
  if (song?.customCoverBlob instanceof Blob) return song.customCoverBlob;
  if (isOnlineSong(song) && !navigator.onLine && song.downloadedCoverBlob instanceof Blob) return song.downloadedCoverBlob;
  return null;
}

function coverSource(song) {
  const blob = coverBlobForSong(song);
  if (blob) {
    const existing = coverObjectUrls.get(song.id);
    if (existing?.blob === blob) return existing.url;
    if (existing) URL.revokeObjectURL(existing.url);
    const url = URL.createObjectURL(blob);
    coverObjectUrls.set(song.id, { blob, url });
    return url;
  }
  const existing = coverObjectUrls.get(song?.id);
  if (existing) {
    URL.revokeObjectURL(existing.url);
    coverObjectUrls.delete(song.id);
  }
  return isOnlineSong(song) && navigator.onLine ? song.coverUrl : null;
}

function applyCover(element, song) {
  element.style.setProperty("--cover-hue", `${song ? hashHue(song.id) : 142}deg`);
  const source = song ? coverSource(song) : null;
  element.classList.toggle("has-cover", Boolean(source));
  element.style.backgroundImage = source ? `url("${source}")` : "";
}

function mediaSession() {
  try { return navigator.mediaSession || null; } catch { return null; }
}

function setMediaPlaybackState() {
  const session = mediaSession();
  if (!session) return;
  try { session.playbackState = !currentSongId ? "none" : elements.audio.paused ? "paused" : "playing"; } catch { }
}

function updateMediaPosition() {
  const session = mediaSession();
  if (!session || typeof session.setPositionState !== "function") return;
  const duration = elements.audio.duration;
  const position = elements.audio.currentTime;
  const playbackRate = elements.audio.playbackRate;
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(position) || position < 0) return;
  try {
    session.setPositionState({ duration, position: Math.min(position, duration), playbackRate: Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1 });
  } catch { }
}

async function createPaddedArtwork(song) {
  let blob = coverBlobForSong(song);
  if (!blob && isOnlineSong(song) && song.coverUrl && navigator.onLine) {
    const response = await fetch(song.coverUrl, { cache: "force-cache" });
    if (!response.ok) throw new Error("封面無法載入");
    blob = await response.blob();
  }
  if (!blob) return null;
  const image = await decodeImage(blob);
  try {
    const width = image.width || image.naturalWidth;
    const height = image.height || image.naturalHeight;
    if (!width || !height) return null;
    const size = 512;
    const scale = Math.min(size / width, size / height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return null;
    context.fillStyle = "#f6f2eb";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
    return await canvasToBlob(canvas, "image/jpeg", .9);
  } finally {
    if (typeof image.close === "function") image.close();
  }
}

function assignMediaMetadata(session, song, artworkUrl = null) {
  if (typeof window.MediaMetadata !== "function") return;
  try {
    const artwork = artworkUrl ? [{ src: artworkUrl, sizes: "512x512", type: "image/jpeg" }] : [];
    const metadata = { title: song.title || "音樂庫", artist: song.artist || "", artwork };
    if (song.album) metadata.album = song.album;
    session.metadata = new MediaMetadata(metadata);
  } catch { }
}

function updateMediaSession() {
  const session = mediaSession();
  const song = currentSong();
  setMediaPlaybackState();
  if (!session) return;
  if (!song) {
    mediaMetadataKey = "";
    mediaMetadataRequest += 1;
    try { session.metadata = null; } catch { }
    if (typeof session.setPositionState === "function") { try { session.setPositionState(); } catch { } }
    if (mediaArtworkUrl) URL.revokeObjectURL(mediaArtworkUrl);
    mediaArtworkUrl = null;
    return;
  }
  const source = coverSource(song) || "";
  const key = `${song.id}|${song.title}|${song.artist || ""}|${song.album || ""}|${source}`;
  if (key === mediaMetadataKey) return;
  mediaMetadataKey = key;
  const request = ++mediaMetadataRequest;
  assignMediaMetadata(session, song, source);
  createPaddedArtwork(song).then((blob) => {
    if (!blob || request !== mediaMetadataRequest || currentSongId !== song.id) return;
    if (mediaArtworkUrl) URL.revokeObjectURL(mediaArtworkUrl);
    mediaArtworkUrl = URL.createObjectURL(blob);
    assignMediaMetadata(session, song, mediaArtworkUrl);
  }).catch(() => {});
}

function setupMediaSession() {
  const session = mediaSession();
  if (!session || typeof session.setActionHandler !== "function") return;
  const handlers = { play: () => togglePlayback(), pause: () => elements.audio.pause(), previoustrack: () => playPrevious(), nexttrack: () => playNext() };
  for (const [action, handler] of Object.entries(handlers)) {
    try { session.setActionHandler(action, handler); } catch { }
  }
  updateMediaSession();
}

function createListCover(song) {
  const cover = document.createElement("span");
  cover.className = "cover cover-list";
  cover.setAttribute("aria-hidden", "true");
  applyCover(cover, song);
  return cover;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const value = Math.floor(seconds);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function loopModeLabel(mode = loopMode) {
  if (mode === "all") return "全部循環";
  if (mode === "one") return "單曲循環";
  return "不循環";
}

function persistLoopMode() { storeSetting(LOOP_STORAGE_KEY, loopMode); }
function persistShuffleSetting() { storeSetting(SHUFFLE_STORAGE_KEY, String(shuffleEnabled)); }
function songIds() { return songs.map((song) => song.id); }

function shuffled(ids, avoidFirstId = null) {
  const result = ids.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  if (result.length > 1 && avoidFirstId && result[0] === avoidFirstId) {
    const other = 1 + Math.floor(Math.random() * (result.length - 1));
    [result[0], result[other]] = [result[other], result[0]];
  }
  return result;
}

function insertAtRandomPosition(queue, id) {
  if (queue.includes(id)) return;
  queue.splice(Math.floor(Math.random() * (queue.length + 1)), 0, id);
}

function reconcileShuffleQueue() {
  const valid = new Set(songIds());
  shuffleHistory = shuffleHistory.filter((id) => valid.has(id));
  shuffleUpcoming = shuffleUpcoming.filter((id, index, list) => valid.has(id) && id !== currentSongId && list.indexOf(id) === index);
  const accounted = new Set([...shuffleHistory, ...shuffleUpcoming, ...(currentSongId ? [currentSongId] : [])]);
  for (const id of valid) if (!accounted.has(id)) insertAtRandomPosition(shuffleUpcoming, id);
}

function isPlayableWithoutNetwork(song) {
  return isLocalSong(song) ? hasAudioBlob(song) : isDownloaded(song);
}

function isPlayableNow(song, automatic = false) {
  if (isPlayableWithoutNetwork(song)) return true;
  if (!isOnlineSong(song) || !song.audioUrl) return false;
  if (automatic && !navigator.onLine) return false;
  return navigator.onLine;
}

function offlineReason(song) {
  if (isOnlineSong(song) && !isDownloaded(song)) return "這首線上歌曲尚未下載。請連上網路播放，或先選「下載供離線收聽」。";
  return "此歌曲目前沒有可用的本機音訊。";
}

function releaseAudioUrl() {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = null;
}

function setAudioSource(song, shouldPlay, automatic = false, rememberPrevious = true) {
  if (rememberPrevious && currentSongId && currentSongId !== song.id) {
    playbackHistory.push(currentSongId);
    if (shuffleEnabled) shuffleHistory.push(currentSongId);
  }
  playbackRequestToken += 1;
  elements.audio.pause();
  elements.audio.removeAttribute("src");
  elements.audio.load();
  releaseAudioUrl();
  currentSongId = song.id;
  currentPlaybackWasAutomatic = automatic;
  try { elements.audio.currentTime = 0; } catch { /* load() resets the old timeline for a new source. */ }
  if (hasAudioBlob(song)) {
    currentObjectUrl = URL.createObjectURL(song.audioBlob);
    elements.audio.src = currentObjectUrl;
  } else if (isOnlineSong(song) && song.audioUrl) {
    elements.audio.src = song.audioUrl;
  }
  elements.audio.load();
  updatePlaybackUI();
  setPlaybackStatus("正在載入音訊…");
  if (shouldPlay) playCurrent();
}

function clearCurrentPlayback() {
  playbackRequestToken += 1;
  elements.audio.pause();
  elements.audio.removeAttribute("src");
  elements.audio.load();
  releaseAudioUrl();
  currentSongId = null;
  currentPlaybackWasAutomatic = false;
  elements.seekBar.value = "0";
  elements.seekBar.max = "0";
  updatePlaybackUI();
  updateMediaSession();
  setPlaybackStatus("準備就緒");
}

function selectSong(id, shouldPlay = true, source = "direct", rememberPrevious = true) {
  const song = bySongId(id);
  if (!song) return false;
  if (!isPlayableNow(song, source === "auto" || (source === "queue" && shuffleEnabled))) {
    setStatus(offlineReason(song), "error");
    return false;
  }
  if (currentSongId === id) {
    if (source === "direct" && shouldPlay) {
      if (elements.audio.error) setAudioSource(song, true, false);
      else togglePlayback();
    } else if (["manual-queue", "auto", "queue"].includes(source)) {
      setAudioSource(song, shouldPlay, source === "auto", rememberPrevious);
    }
    return true;
  }
  if (shuffleEnabled && source === "direct") {
    shuffleUpcoming = shuffleUpcoming.filter((queuedId) => queuedId !== id);
  }
  setAudioSource(song, shouldPlay, source === "auto" || (source === "queue" && shuffleEnabled), rememberPrevious);
  updateCurrentIndicators();
  return true;
}

function playCurrent() {
  if (!currentSongId) { startFirstSong(); return; }
  const song = currentSong();
  if (!song) { clearCurrentPlayback(); return; }
  if (!hasAudioBlob(song) && !navigator.onLine) {
    setStatus(offlineReason(song), "error");
    return;
  }
  const requestToken = ++playbackRequestToken;
  let attempt;
  try { attempt = elements.audio.play(); }
  catch (error) { reportPlayFailure(error); return; }
  if (attempt?.then) attempt.then(() => {
    if (requestToken === playbackRequestToken) updatePlaybackUI();
  }).catch((error) => {
    if (requestToken !== playbackRequestToken || error?.name === "AbortError") return;
    reportPlayFailure(error);
  });
}

function nextManualSong(shouldPlay = true) {
  let skippedOffline = false;
  while (manualQueue.length) {
    const id = manualQueue.shift();
    shuffleUpcoming = shuffleUpcoming.filter((queuedId) => queuedId !== id);
    const song = bySongId(id);
    if (song && isPlayableNow(song)) {
      persistManualQueue();
      return selectSong(id, shouldPlay, "manual-queue");
    }
    skippedOffline = true;
  }
  persistManualQueue();
  if (skippedOffline) setStatus("佇列中的部分歌曲尚未下載，已略過並繼續播放。", "error");
  return false;
}

function addToManualQueue(id, next = false) {
  if (!bySongId(id)) return;
  if (next) manualQueue.unshift(id);
  else manualQueue.push(id);
  persistManualQueue();
  setPlaybackStatus(next ? "已排在下一首" : "已加入播放佇列");
}

function automaticQueueIds() {
  const excluded = new Set(manualQueue);
  if (shuffleEnabled) return shuffleUpcoming.filter((id) => !excluded.has(id));
  const currentIndex = songs.findIndex((song) => song.id === currentSongId);
  const upcoming = currentIndex < 0 ? songs : [...songs.slice(currentIndex + 1), ...(loopMode === "all" ? songs.slice(0, currentIndex) : [])];
  return upcoming.map((song) => song.id).filter((id) => !excluded.has(id));
}

function createQueueSong(song, { removable = false, index = -1 } = {}) {
  const row = document.createElement("article");
  row.className = "queue-song";
  if (index >= 0) row.dataset.queueIndex = String(index);
  const cover = document.createElement("span");
  cover.className = "cover cover-queue";
  applyCover(cover, song);
  const copy = document.createElement("span");
  copy.className = "queue-song-copy";
  const title = document.createElement("span");
  title.className = "queue-song-title";
  title.textContent = song.title;
  const artist = document.createElement("span");
  artist.className = "queue-song-artist";
  artist.textContent = song.artist || "";
  copy.append(title, artist);
  row.append(cover, copy);
  if (removable) {
    const reorder = document.createElement("div");
    reorder.className = "queue-song-actions";
    const handle = document.createElement("button");
    handle.className = "queue-handle";
    handle.type = "button";
    handle.setAttribute("aria-label", `拖曳調整「${song.title}」順序`);
    handle.append(makeIcon("drag"));
    handle.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0 || queueDrag) return;
      event.preventDefault();
      queueDrag = { from: index, to: index, pointerId: event.pointerId, startY: event.clientY, row, handle };
      row.classList.add("is-dragging");
      elements.queueContent.classList.add("queue-dragging");
      try { handle.setPointerCapture(event.pointerId); } catch { }
    });
    const more = document.createElement("button");
    more.className = "queue-more";
    more.type = "button";
    more.setAttribute("aria-label", `更多佇列操作：${song.title}`);
    more.setAttribute("aria-expanded", "false");
    more.append(makeIcon("more"));
    const menu = document.createElement("div");
    menu.className = "queue-more-menu";
    menu.id = `queue-menu-${index}`;
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", `佇列操作：${song.title}`);
    menu.hidden = true;
    more.setAttribute("aria-controls", menu.id);
    const up = document.createElement("button");
    up.className = "queue-menu-action";
    up.type = "button";
    up.setAttribute("aria-label", `將「${song.title}」上移`);
    up.append(makeIcon("up"));
    up.append(document.createTextNode("上移"));
    up.disabled = index === 0;
    up.addEventListener("click", () => moveQueueItem(index, index - 1));
    const down = document.createElement("button");
    down.className = "queue-menu-action";
    down.type = "button";
    down.setAttribute("aria-label", `將「${song.title}」下移`);
    down.append(makeIcon("down"));
    down.append(document.createTextNode("下移"));
    down.disabled = index === manualQueue.length - 1;
    down.addEventListener("click", () => moveQueueItem(index, index + 1));
    const remove = document.createElement("button");
    remove.className = "queue-menu-action queue-remove";
    remove.type = "button";
    remove.setAttribute("aria-label", `從佇列移除「${song.title}」`);
    remove.append(makeIcon("close"));
    remove.append(document.createTextNode("從佇列移除"));
    remove.addEventListener("click", () => { manualQueue.splice(index, 1); persistManualQueue(); });
    menu.append(up, down, remove);
    more.addEventListener("click", () => {
      const expanded = more.getAttribute("aria-expanded") === "true";
      for (const otherMenu of elements.queueContent.querySelectorAll(".queue-more-menu")) {
        if (otherMenu === menu) continue;
        otherMenu.hidden = true;
        otherMenu.parentElement.querySelector(".queue-more")?.setAttribute("aria-expanded", "false");
      }
      more.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
      if (!expanded) {
        menu.classList.toggle("open-up", window.innerHeight - row.getBoundingClientRect().bottom < 176);
        menu.querySelector("button:not(:disabled)")?.focus();
      }
    });
    reorder.append(handle, more, menu);
    row.append(reorder);
  }
  return row;
}

function updateQueueDrag(event) {
  if (!queueDrag || event.pointerId !== queueDrag.pointerId) return;
  event.preventDefault();
  queueDrag.row.style.setProperty("--drag-offset", `${event.clientY - queueDrag.startY}px`);
  for (const row of elements.queueContent.querySelectorAll(".queue-song[data-queue-index]")) {
    row.classList.remove("queue-drop-before", "queue-drop-after");
  }
  const target = [...elements.queueContent.querySelectorAll(".queue-song[data-queue-index]")]
    .filter((row) => row !== queueDrag.row)
    .find((row) => event.clientY >= row.getBoundingClientRect().top && event.clientY <= row.getBoundingClientRect().bottom);
  if (!target) return;
  const targetIndex = Number(target.dataset.queueIndex);
  const after = event.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
  target.classList.add(after ? "queue-drop-after" : "queue-drop-before");
  const insertionPoint = targetIndex + (after ? 1 : 0);
  queueDrag.to = Math.max(0, Math.min(manualQueue.length - 1, insertionPoint > queueDrag.from ? insertionPoint - 1 : insertionPoint));
}

function finishQueueDrag(event, shouldMove = true) {
  if (!queueDrag || event.pointerId !== queueDrag.pointerId) return;
  const { from, to, row, handle } = queueDrag;
  queueDrag = null;
  row.classList.remove("is-dragging", "queue-drop-before", "queue-drop-after");
  row.style.removeProperty("--drag-offset");
  elements.queueContent.classList.remove("queue-dragging");
  for (const item of elements.queueContent.querySelectorAll(".queue-drop-before, .queue-drop-after")) item.classList.remove("queue-drop-before", "queue-drop-after");
  try { handle.releasePointerCapture(event.pointerId); } catch { }
  if (shouldMove && from !== to) moveQueueItem(from, to);
}

function moveQueueItem(from, to) {
  if (from < 0 || from >= manualQueue.length || to < 0 || to >= manualQueue.length || from === to) return;
  const [id] = manualQueue.splice(from, 1);
  manualQueue.splice(to, 0, id);
  persistManualQueue();
}

function renderQueue() {
  if (!elements.queueContent) return;
  const current = currentSong();
  const playingSection = document.createElement("section");
  playingSection.className = "queue-section";
  const playingHeading = document.createElement("h3");
  playingHeading.textContent = "正在播放";
  playingSection.append(playingHeading);
  if (current) playingSection.append(createQueueSong(current));
  else {
    const empty = document.createElement("p");
    empty.className = "queue-empty";
    empty.textContent = "尚未選擇歌曲";
    playingSection.append(empty);
  }
  const upcomingSection = document.createElement("section");
  upcomingSection.className = "queue-section";
  const upcomingHeading = document.createElement("h3");
  upcomingHeading.textContent = "接下來播放";
  upcomingSection.append(upcomingHeading);
  const manualRows = manualQueue.map((id, index) => ({ song: bySongId(id), index })).filter((item) => item.song).map(({ song, index }) => createQueueSong(song, { removable: true, index }));
  const automaticRows = automaticQueueIds().map(bySongId).filter(Boolean).map((song) => createQueueSong(song));
  if (!manualRows.length && !automaticRows.length) {
    const empty = document.createElement("p");
    empty.className = "queue-empty";
    empty.textContent = "沒有待播歌曲";
    upcomingSection.append(empty);
  } else {
    upcomingSection.append(...manualRows);
    if (automaticRows.length) {
      const automaticLabel = document.createElement("p");
      automaticLabel.className = "queue-auto-label";
      automaticLabel.textContent = "音樂庫接續播放";
      upcomingSection.append(automaticLabel, ...automaticRows);
    }
    if (manualRows.length) {
      const manualLabel = document.createElement("p");
      manualLabel.className = "queue-auto-label manual-queue-label";
      manualLabel.textContent = "你加入的歌曲";
      upcomingSection.insertBefore(manualLabel, manualRows[0]);
    }
  }
  elements.queueContent.replaceChildren(playingSection, upcomingSection);
}

function reportPlayFailure(error) {
  if (error?.name === "AbortError") return;
  if (error?.name === "NotAllowedError") setStatus("瀏覽器需要使用者操作才能播放，請再按一次播放。", "error");
  else setStatus("播放失敗。請確認音訊格式、網路連線或下載狀態。", "error");
  updatePlaybackUI();
}

function togglePlayback() {
  if (!currentSongId) startFirstSong();
  else if (elements.audio.paused) {
    const song = currentSong();
    if (elements.audio.error && song) setAudioSource(song, true, false);
    else playCurrent();
  } else elements.audio.pause();
}

function findNextRandom({ manual = false, failed = false } = {}) {
  if (!songs.length) return false;
  if (!currentSongId) {
    reconcileShuffleQueue();
    if (!shuffleUpcoming.length) { shuffleHistory = []; shuffleUpcoming = shuffled(songIds()); }
  } else if (!shuffleUpcoming.length) {
    if (loopMode !== "all" || songs.length < 2) return false;
    shuffleHistory = [currentSongId];
    shuffleUpcoming = shuffled(songIds(), currentSongId);
  }

  let skippedUnavailable = false;
  for (let attempts = 0; attempts < songs.length; attempts += 1) {
    const nextId = shuffleUpcoming.shift();
    if (!nextId) break;
    const candidate = bySongId(nextId);
    if (!candidate || (failed && autoFailedIds.has(nextId)) || !isPlayableNow(candidate, true)) {
      if (candidate && !isPlayableNow(candidate, true)) skippedUnavailable = true;
      continue;
    }
    if (skippedUnavailable) setStatus("佇列中有尚未下載或無法播放的歌曲，已略過並繼續播放。", "error");
    return selectSong(nextId, true, manual ? "queue" : "auto");
  }
  reconcileShuffleQueue();
  if (skippedUnavailable) setStatus("佇列中的歌曲尚未下載或無法播放，已略過。", "error");
  return false;
}

function startFirstSong() {
  if (nextManualSong(true)) return;
  if (!songs.length) { setStatus("目前沒有歌曲。", "info"); return; }
  if (shuffleEnabled) {
    const started = findNextRandom({ manual: true });
    if (!started) setStatus("沒有可播放的歌曲；請連線播放線上歌曲，或先下載供離線收聽。", "error");
    return;
  }
  const first = songs.find((song) => isPlayableNow(song, true));
  if (!first) { setStatus("沒有可離線播放的歌曲。請連線播放或下載歌曲。", "error"); return; }
  selectSong(first.id, true, "queue");
}

function playNext() {
  if (nextManualSong(true)) return;
  if (!songs.length) return;
  if (!currentSongId) { startFirstSong(); return; }
  if (shuffleEnabled) {
    if (!findNextRandom({ manual: true })) setStatus(navigator.onLine ? "沒有可播放的下一首歌曲。" : "佇列中沒有已下載供離線播放的下一首歌曲。", navigator.onLine ? "info" : "error");
    return;
  }
  if (!advanceLinearAutomatically(null, "queue")) setStatus(navigator.onLine ? "沒有可播放的下一首歌曲。" : "佇列中沒有已下載供離線播放的下一首歌曲。", navigator.onLine ? "info" : "error");
}

function playPrevious() {
  if (!songs.length || !currentSongId) return;
  while (playbackHistory.length) {
    const previousId = playbackHistory.pop();
    const previousSong = bySongId(previousId);
    if (previousSong && isPlayableNow(previousSong)) {
      if (shuffleEnabled && currentSongId) {
        shuffleUpcoming = shuffleUpcoming.filter((id) => id !== currentSongId);
        shuffleUpcoming.unshift(currentSongId);
      }
      selectSong(previousId, true, "history", false);
      return;
    }
  }
  if (elements.audio.currentTime > 3) { elements.audio.currentTime = 0; return; }
  if (shuffleEnabled) return;
  const index = songs.findIndex((song) => song.id === currentSongId);
  if (index > 0) selectSong(songs[index - 1].id, true, "queue");
  else if (index === 0 && loopMode === "all" && songs.length > 1) selectSong(songs[songs.length - 1].id, true, "queue");
}

function advanceLinearAutomatically(startAfterIndex = null, source = "auto") {
  if (nextManualSong(true)) return true;
  if (!songs.length) return false;
  const currentIndex = startAfterIndex == null ? songs.findIndex((song) => song.id === currentSongId) : startAfterIndex;
  let skippedUnavailable = false;
  for (let offset = 1; offset <= songs.length; offset += 1) {
    let index = currentIndex + offset;
    if (index >= songs.length) {
      if (loopMode !== "all") break;
      index %= songs.length;
    }
    const candidate = songs[index];
    if (candidate.id === currentSongId || autoFailedIds.has(candidate.id) || !isPlayableNow(candidate, true)) {
      if (!isPlayableNow(candidate, true)) skippedUnavailable = true;
      continue;
    }
    if (skippedUnavailable) setStatus("佇列中有尚未下載或無法播放的歌曲，已略過並繼續播放。", "error");
    return selectSong(candidate.id, true, source);
  }
  if (skippedUnavailable) setStatus("佇列中的歌曲尚未下載或無法播放，已略過。", "error");
  return false;
}

function handleNaturalEnd() {
  if (!currentSongId) return;
  if (loopMode === "one" || (loopMode === "all" && songs.length === 1)) {
    try { elements.audio.currentTime = 0; } catch { /* The next play will reload metadata if needed. */ }
    playCurrent();
    return;
  }
  const advanced = nextManualSong(true) || (shuffleEnabled ? findNextRandom() : advanceLinearAutomatically());
  if (!advanced) {
    updatePlaybackUI();
    setPlaybackStatus(navigator.onLine ? "播放佇列已結束" : "沒有可離線播放的下一首歌曲。下載歌曲後即可離線接續播放。");
  }
}

function handleAutomaticLoadFailure() {
  if (!currentPlaybackWasAutomatic || !currentSongId) return;
  const failedId = currentSongId;
  autoFailedIds.add(failedId);
  const advanced = nextManualSong(true) || (shuffleEnabled ? findNextRandom({ failed: true }) : advanceLinearAutomatically(songs.findIndex((song) => song.id === failedId)));
  if (!advanced) {
    currentPlaybackWasAutomatic = false;
    setPlaybackStatus("佇列中沒有其他可播放歌曲；請檢查音訊網址或網路連線。");
  }
}

function canPlayNext() {
  if (manualQueue.some((id) => isPlayableNow(bySongId(id)))) return true;
  if (!songs.length) return false;
  if (!currentSongId) return songs.some((song) => isPlayableNow(song, true));
  if (shuffleEnabled) return shuffleUpcoming.some((id) => isPlayableNow(bySongId(id), true)) || (loopMode === "all" && songs.length > 1);
  const index = songs.findIndex((song) => song.id === currentSongId);
  return songs.slice(index + 1).some((song) => isPlayableNow(song, true)) || (loopMode === "all" && songs.length > 1);
}

function updateModeControls() {
  const shuffleLabel = shuffleEnabled ? "隨機播放，開啟" : "隨機播放，關閉";
  elements.shuffleButton.setAttribute("aria-pressed", String(shuffleEnabled));
  elements.shuffleButton.setAttribute("aria-label", shuffleLabel);
  elements.shuffleButton.title = shuffleLabel;
  elements.shuffleCaption.textContent = shuffleEnabled ? "隨機開" : "隨機關";
  elements.shuffleButton.classList.toggle("is-active", shuffleEnabled);
  elements.desktopShuffleButton.setAttribute("aria-pressed", String(shuffleEnabled));
  elements.desktopShuffleButton.setAttribute("aria-label", shuffleLabel);
  elements.desktopShuffleButton.title = shuffleLabel;
  elements.desktopShuffleButton.classList.toggle("is-active", shuffleEnabled);
  const loopLabel = `循環模式：${loopModeLabel()}`;
  elements.repeatButton.setAttribute("aria-pressed", String(loopMode !== "none"));
  elements.repeatButton.setAttribute("aria-label", loopLabel);
  elements.repeatButton.title = `${loopLabel}，按一下切換`;
  elements.repeatCaption.textContent = loopModeLabel();
  elements.repeatButton.classList.toggle("is-active", loopMode !== "none");
  elements.repeatButton.classList.toggle("is-loop-one", loopMode === "one");
  elements.repeatBadge.hidden = loopMode !== "one";
  elements.desktopRepeatButton.setAttribute("aria-pressed", String(loopMode !== "none"));
  elements.desktopRepeatButton.setAttribute("aria-label", loopLabel);
  elements.desktopRepeatButton.title = `${loopLabel}，按一下切換`;
  elements.desktopRepeatButton.classList.toggle("is-active", loopMode !== "none");
  elements.desktopRepeatButton.classList.toggle("is-loop-one", loopMode === "one");
}

function updateButtonState() {
  const hasSongs = songs.length > 0;
  const hasCurrent = Boolean(currentSong());
  elements.miniTrack.disabled = !hasSongs;
  elements.miniPlayButton.disabled = !hasSongs;
  elements.desktopPlayButton.disabled = !hasSongs;
  elements.desktopPreviousButton.disabled = !hasCurrent;
  elements.desktopNextButton.disabled = !canPlayNext();
  elements.shuffleButton.disabled = !hasCurrent;
  elements.repeatButton.disabled = !hasCurrent;
  elements.desktopShuffleButton.disabled = !hasCurrent;
  elements.desktopRepeatButton.disabled = !hasCurrent;
  elements.playButton.disabled = !hasSongs;
  elements.previousButton.disabled = !hasCurrent;
  elements.nextButton.disabled = !canPlayNext();
  const paused = elements.audio.paused;
  elements.playButton.setAttribute("aria-label", paused ? "播放" : "暫停");
  elements.playButton.title = paused ? "播放" : "暫停";
  elements.miniPlayButton.setAttribute("aria-label", paused ? "播放" : "暫停");
  elements.miniPlayButton.title = paused ? "播放" : "暫停";
  elements.desktopPlayButton.setAttribute("aria-label", paused ? "播放" : "暫停");
  elements.desktopPlayButton.title = paused ? "播放" : "暫停";
  replaceIcon(elements.playIcon, paused ? "play" : "pause");
  replaceIcon(elements.miniPlayIcon, paused ? "play" : "pause");
  replaceIcon(elements.desktopPlayIcon, paused ? "play" : "pause");
  elements.seekBar.disabled = !hasCurrent || !Number.isFinite(elements.audio.duration);
  elements.desktopSeekBar.disabled = elements.seekBar.disabled;
}

function updateCurrentIndicators() {
  for (const row of elements.songList.querySelectorAll(".song-row")) {
    const active = row.dataset.songId === currentSongId;
    row.classList.toggle("is-current", active);
    const button = row.querySelector(".song-select");
    if (button) {
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    const indicator = row.querySelector(".current-indicator");
    if (indicator) {
      indicator.replaceChildren(makeIcon(active && !elements.audio.paused ? "pause" : "play", "indicator-icon"));
      indicator.hidden = !active;
    }
  }
}

function updateTimeline() {
  const current = Number.isFinite(elements.audio.currentTime) ? elements.audio.currentTime : 0;
  const duration = Number.isFinite(elements.audio.duration) ? elements.audio.duration : 0;
  if (!elements.seekBar.matches(":active")) elements.seekBar.value = String(current);
  if (!elements.desktopSeekBar.matches(":active")) elements.desktopSeekBar.value = String(current);
  elements.seekBar.max = String(duration);
  elements.desktopSeekBar.max = String(duration);
  elements.elapsedTime.textContent = formatTime(current);
  elements.durationTime.textContent = formatTime(duration);
  elements.desktopElapsed.textContent = formatTime(current);
  elements.desktopDuration.textContent = formatTime(duration);
  elements.miniProgressValue.style.width = duration > 0 ? `${Math.min(100, Math.max(0, current / duration * 100))}%` : "0%";
  updateMediaPosition();
  updateButtonState();
}

function downloadStateFor(song) {
  const transient = downloadStates.get(song.id);
  if (transient?.state === "downloading") return { state: "downloading", label: "下載中…" };
  if (transient?.state === "failed") {
    return isDownloaded(song)
      ? { state: "newer", label: "有新版・更新失敗" }
      : { state: "failed", label: "下載失敗" };
  }
  if (song.sourceRemoved) return { state: "removed", label: isDownloaded(song) ? "來源已移除・已下載" : "來源已移除" };
  if (isDownloaded(song) && song.downloadVersion !== song.version) return { state: "newer", label: "有新版" };
  if (isDownloaded(song)) return { state: "downloaded", label: "已下載" };
  if (!navigator.onLine) return { state: "offline", label: "未下載・需連網或下載" };
  return { state: "missing", label: "未下載" };
}

function updatePlaybackUI() {
  const song = currentSong();
  elements.miniTitle.textContent = song ? song.title : "選擇一首歌曲";
  elements.miniSubtitle.textContent = song?.artist || "";
  elements.fullTitle.textContent = song ? sourceLabel(song) : "音樂庫";
  elements.fullTrackTitle.textContent = song ? song.title : "尚未選擇歌曲";
  elements.fullTrackSource.textContent = song?.artist || "";
  applyCover(elements.miniCover, song);
  applyCover(elements.fullCover, song);
  updateTimeline();
  updateCurrentIndicators();
  updateModeControls();
  updateMediaSession();
  renderQueue();
}

function sourceLabel(song) {
  if (isLocalSong(song)) return "本機匯入";
  return song.sourceRemoved ? "來源已移除" : "線上歌單";
}

function createSongRow(song) {
  const row = document.createElement("article");
  row.className = "song-row";
  row.dataset.songId = song.id;
  if (song.id === currentSongId) row.classList.add("is-current");

  const info = document.createElement("div");
  info.className = "song-info";
  const select = document.createElement("button");
  select.type = "button";
  select.className = "song-select";
  select.setAttribute("aria-label", `播放：${song.title}，來源：${sourceLabel(song)}`);
  if (song.id === currentSongId) select.setAttribute("aria-current", "true");
  const copy = document.createElement("span");
  copy.className = "song-copy";
  const heading = document.createElement("span");
  heading.className = "song-heading";
  const title = document.createElement("span");
  title.className = "song-name";
  title.textContent = song.title;
  const artist = document.createElement("span");
  artist.className = "song-artist";
  artist.textContent = song.artist || "";
  const meta = document.createElement("span");
  meta.className = "song-meta";
  if (isLocalSong(song)) {
    const origin = document.createElement("span");
    origin.className = "song-meta-icon";
    origin.title = "本機匯入";
    origin.setAttribute("role", "img");
    origin.setAttribute("aria-label", "本機匯入");
    origin.append(makeIcon("device"));
    meta.append(origin);
  } else if (isOnlineSong(song)) {
    const download = document.createElement("span");
    const downloadState = downloadStateFor(song);
    download.className = "song-meta-icon download-state";
    download.dataset.state = downloadState.state;
    download.title = downloadState.label;
    download.setAttribute("role", "img");
    download.setAttribute("aria-label", downloadState.label);
    download.append(makeIcon(isDownloaded(song) ? "check" : "cloud"));
    meta.append(download);
  }
  heading.append(title, meta);
  copy.append(heading, artist);
  const indicator = document.createElement("span");
  indicator.className = "current-indicator";
  indicator.hidden = song.id !== currentSongId;
  indicator.append(makeIcon(song.id === currentSongId && !elements.audio.paused ? "pause" : "play", "indicator-icon"));
  select.append(copy, indicator);
  select.addEventListener("click", () => selectSong(song.id, true, "direct"));
  info.append(select);

  const more = document.createElement("button");
  more.className = "icon-button more-button";
  more.type = "button";
  more.setAttribute("aria-label", `更多歌曲選項：${song.title}`);
  more.setAttribute("aria-haspopup", "dialog");
  more.append(makeIcon("more"));
  more.addEventListener("click", () => openTrackMenu(song.id));
  row.append(createListCover(song), info, more);
  return row;
}

function renderLibrary(focusRename = false) {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const visible = songs.filter((song) => !query || song.title.toLocaleLowerCase().includes(query));
  elements.songList.replaceChildren(...visible.map(createSongRow));
  elements.songCount.textContent = `${songs.length} 首歌曲`;
  elements.visibleCount.textContent = query ? `顯示 ${visible.length} 首` : "";
  const isEmpty = songs.length === 0;
  const showLibraryError = Boolean(libraryLoadError) && !libraryLoading;
  elements.emptyState.hidden = !isEmpty && !showLibraryError;
  elements.emptyState.classList.toggle("is-error", showLibraryError);
  if (isEmpty || showLibraryError) {
    elements.emptyStateTitle.textContent = libraryLoading && isEmpty ? "載入音樂庫…" : libraryLoadError ? "音樂庫載入不完整" : "目前沒有歌曲";
    elements.emptyStateDescription.textContent = libraryLoading
      ? "正在讀取此裝置歌曲與線上歌單。"
      : libraryLoadError || "在專案的 songs.json 加入線上歌曲，或從右上角「＋」匯入本機音訊。";
    elements.emptyRefreshButton.textContent = libraryLoading ? "載入中…" : libraryLoadError ? "重試載入" : "重新載入音樂庫";
  }
  elements.emptyRefreshButton.disabled = libraryLoading;
  elements.noResults.hidden = songs.length === 0 || visible.length > 0;
  elements.clearSearchButton.hidden = !elements.search.value;
  updatePlaybackUI();
  if (focusRename) requestAnimationFrame(() => document.querySelector(".rename-input")?.focus());
}

function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }
function closeDialog(dialog) { if (dialog.open) dialog.close(); }

function openQueueDialog(trigger) {
  if (elements.queueDialog.open) return;
  queueReturnFocus = trigger;
  queuePreviousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.classList.add("queue-open");
  renderQueue();
  try {
    elements.queueDialog.showModal();
    elements.closeQueueButton.focus({ preventScroll: true });
  } catch (error) {
    document.body.classList.remove("queue-open");
    document.body.style.overflow = queuePreviousOverflow;
    setStatus("目前瀏覽器無法開啟播放佇列。", "error");
  }
}

function restoreQueueFocus() {
  document.body.classList.remove("queue-open");
  document.body.style.overflow = queuePreviousOverflow;
  const trigger = queueReturnFocus;
  queueReturnFocus = null;
  if (trigger?.isConnected) requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
}

function addMenuAction({ label, icon, onClick, disabled = false, danger = false, note = "" }) {
  const button = document.createElement("button");
  button.className = `action-item${danger ? " action-delete" : ""}`;
  button.type = "button";
  button.disabled = disabled;
  button.append(makeIcon(icon));
  const text = document.createElement("span");
  text.textContent = label;
  button.append(text);
  if (note) {
    const hint = document.createElement("span");
    hint.className = "action-note";
    hint.textContent = note;
    button.append(hint);
  }
  button.addEventListener("click", onClick);
  elements.trackActionList.append(button);
}

function openTrackMenu(id) {
  const song = bySongId(id);
  if (!song) return;
  actionSongId = id;
  elements.trackMenuTitle.textContent = song.title;
  elements.trackMenuSource.textContent = sourceLabel(song);
  elements.trackOriginalFilename.textContent = song.originalFileName ? `原始檔名：${song.originalFileName}` : "";
  elements.trackActionList.replaceChildren();
  addMenuAction({ label: "修改歌名", icon: "edit", onClick: beginRename });
  addMenuAction({ label: "修改歌手", icon: "artist", onClick: beginArtistEdit });
  addMenuAction({ label: "播放下一首", icon: "next", onClick: () => { closeDialog(elements.trackMenuDialog); addToManualQueue(id, true); } });
  addMenuAction({ label: "加入播放佇列", icon: "queue", onClick: () => { closeDialog(elements.trackMenuDialog); addToManualQueue(id); } });
  addMenuAction({ label: "更換封面", icon: "image", onClick: beginCoverChange });
  if (song.customCoverBlob instanceof Blob) addMenuAction({ label: "移除自訂封面", icon: "close", onClick: () => removeCustomCover(id) });
  if (isOnlineSong(song)) {
    const status = downloadStateFor(song);
    addMenuAction({
      label: isDownloaded(song) ? "更新離線檔案" : "下載供離線收聽",
      icon: "download",
      disabled: status.state === "downloading" || isCurrentDownload(song),
      note: isCurrentDownload(song) ? "已是最新" : "",
      onClick: () => { closeDialog(elements.trackMenuDialog); downloadSong(id); }
    });
    if (isDownloaded(song)) addMenuAction({ label: "移除離線檔案", icon: "trash", danger: true, onClick: () => removeOfflineAudio(id) });
    addMenuAction({ label: "從此裝置的音樂庫移除", icon: "trash", danger: true, onClick: () => removeOnlineSong(id) });
  } else {
    addMenuAction({ label: "刪除本機歌曲", icon: "trash", danger: true, onClick: () => deleteLocalSong(id) });
  }
  openDialog(elements.trackMenuDialog);
}

async function beginArtistEdit() {
  const id = actionSongId;
  closeDialog(elements.trackMenuDialog);
  const song = bySongId(id);
  if (!song) return;
  const value = window.prompt(`修改「${song.title}」的歌手`, song.artist || "");
  if (value === null) return;
  const artist = value.trim().slice(0, MAX_TITLE_LENGTH);
  const changed = isOnlineSong(song) ? { ...song, artist, customArtist: artist } : { ...song, artist };
  try {
    await writeRecord(changed);
    replaceSong(changed);
    renderLibrary();
    setStatus("歌手資訊已保存。", "success");
  } catch (error) { setStatus(storageErrorMessage(error), "error"); }
}

function beginRename() {
  const id = actionSongId;
  closeDialog(elements.trackMenuDialog);
  const song = bySongId(id);
  if (!song) return;
  const row = [...elements.songList.querySelectorAll(".song-row")].find((item) => item.dataset.songId === id);
  if (!row) { elements.search.value = ""; renderLibrary(); return beginRenameFor(id); }
  beginRenameFor(id);
}

function beginRenameFor(id) {
  const song = bySongId(id);
  const row = [...elements.songList.querySelectorAll(".song-row")].find((item) => item.dataset.songId === id);
  if (!song || !row) return;
  const info = row.querySelector(".song-info");
  info.replaceChildren();
  const form = document.createElement("form");
  form.className = "rename-form";
  const input = document.createElement("input");
  input.className = "rename-input";
  input.type = "text";
  input.maxLength = MAX_TITLE_LENGTH;
  input.value = song.title;
  input.setAttribute("aria-label", `修改歌名：${song.title}`);
  const save = document.createElement("button");
  save.className = "text-button rename-save";
  save.type = "submit";
  save.textContent = "儲存";
  const cancel = document.createElement("button");
  cancel.className = "text-button";
  cancel.type = "button";
  cancel.textContent = "取消";
  cancel.addEventListener("click", renderLibrary);
  form.append(input, save, cancel);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) { setStatus("歌名不能留白。", "error"); input.focus(); return; }
    const changed = isOnlineSong(song) ? { ...song, title, userTitle: title } : { ...song, title, source: "local" };
    try {
      await writeRecord(changed);
      replaceSong(changed);
      if (isOnlineSong(changed)) remoteRecords.set(changed.remoteId, changed);
      renderLibrary();
      setStatus("歌名已保存。", "success");
    } catch (error) { setStatus(storageErrorMessage(error), "error"); }
  });
  form.addEventListener("keydown", (event) => { if (event.key === "Escape") renderLibrary(); });
  info.append(form);
  input.focus();
  input.select();
}

function replaceSong(updated) {
  songs = songs.map((song) => song.id === updated.id ? updated : song);
  localSongs = localSongs.map((song) => song.id === updated.id ? updated : song);
  if (isOnlineSong(updated)) remoteRecords.set(updated.remoteId, updated);
  catalogSongs = catalogSongs.map((song) => song.id === updated.id ? updated : song);
}

function removeQueueReferences(id) {
  manualQueue = manualQueue.filter((item) => item !== id);
  playbackHistory = playbackHistory.filter((item) => item !== id);
  shuffleUpcoming = shuffleUpcoming.filter((item) => item !== id);
  shuffleHistory = shuffleHistory.filter((item) => item !== id);
  persistManualQueue();
}

function selectFollowingSong(index, shouldPlay) {
  if (nextManualSong(shouldPlay)) return true;
  if (shuffleEnabled && !shuffleUpcoming.length && loopMode === "all" && songs.length > 1) shuffleUpcoming = shuffled(songIds());
  const candidates = shuffleEnabled
    ? [...shuffleUpcoming]
    : [...songs.slice(Math.max(0, index)), ...(loopMode === "all" ? songs.slice(0, Math.max(0, index)) : [])].map((song) => song.id);
  let skippedOffline = false;
  for (const id of candidates) {
    const candidate = bySongId(id);
    if (!candidate || !isPlayableNow(candidate, true)) { skippedOffline = true; continue; }
    if (shuffleEnabled) shuffleUpcoming = shuffleUpcoming.filter((queuedId) => queuedId !== id);
    selectSong(id, shouldPlay, "auto");
    if (skippedOffline) setStatus("部分歌曲尚未下載，已略過並繼續播放。", "error");
    return true;
  }
  clearCurrentPlayback();
  if (skippedOffline) setStatus("佇列中的歌曲尚未下載，已停止播放。", "error");
  return false;
}

async function deleteLocalSong(id) {
  const song = bySongId(id);
  closeDialog(elements.trackMenuDialog);
  if (!song || !window.confirm(`確定要刪除本機歌曲「${song.title}」嗎？這會刪除音訊、專屬封面和歌曲資料，且無法復原。`)) return;
  const oldIndex = songs.findIndex((item) => item.id === id);
  const wasCurrent = currentSongId === id;
  const shouldPlay = wasCurrent && !elements.audio.paused;
  try {
    await deleteRecord(id);
    removeQueueReferences(id);
    const cover = coverObjectUrls.get(id);
    if (cover) URL.revokeObjectURL(cover.url);
    coverObjectUrls.delete(id);
    localSongs = localSongs.filter((item) => item.id !== id);
    songs = songs.filter((item) => item.id !== id);
    if (wasCurrent) clearCurrentPlayback();
    reconcileShuffleQueue();
    renderLibrary();
    if (wasCurrent) selectFollowingSong(Math.min(oldIndex, songs.length), shouldPlay);
    setStatus(`已刪除「${song.title}」。`, "success");
  } catch (error) { setStatus(storageErrorMessage(error), "error"); }
}

async function removeOnlineSong(id) {
  const song = bySongId(id);
  closeDialog(elements.trackMenuDialog);
  if (!song || !isOnlineSong(song)) return;
  if (!window.confirm(`確定要從此裝置的音樂庫移除「${song.title}」嗎？這會清除本機下載並隱藏此歌曲；GitHub 原始檔仍會保留。`)) return;
  const oldIndex = songs.findIndex((item) => item.id === id);
  const wasCurrent = currentSongId === id;
  const shouldPlay = wasCurrent && !elements.audio.paused;
  const updated = { ...song, hiddenFromLibrary: true, userRestored: false, audioBlob: null, downloadVersion: null, downloadedAt: null, downloadedTitle: null, downloadedAudioUrl: null, downloadedCoverBlob: null, downloadedCoverUrl: null };
  try {
    await writeRecord(updated);
    removeQueueReferences(id);
    remoteRecords.set(updated.remoteId, updated);
    catalogSongs = catalogSongs.map((item) => item.id === id ? updated : item);
    songs = songs.filter((item) => item.id !== id);
    downloadStates.delete(id);
    if (wasCurrent) clearCurrentPlayback();
    composeSongs();
    renderLibrary();
    if (wasCurrent) selectFollowingSong(Math.min(oldIndex, songs.length), shouldPlay);
    setStatus(`已從此裝置移除「${song.title}」；GitHub 原始檔仍保留。`, "success");
  } catch (error) { setStatus(storageErrorMessage(error), "error"); }
}

function renderRemovedSongs() {
  const removed = [...remoteRecords.values()].filter((song) => song.hiddenFromLibrary).sort((a, b) => a.title.localeCompare(b.title));
  elements.removedSongList.replaceChildren();
  if (!removed.length) {
    const empty = document.createElement("p");
    empty.className = "queue-empty";
    empty.textContent = "沒有已移除的歌曲";
    elements.removedSongList.append(empty);
    return;
  }
  for (const song of removed) {
    const row = document.createElement("div");
    row.className = "removed-song-row";
    const title = document.createElement("span");
    title.className = "queue-song-title";
    title.textContent = song.title;
    const restore = document.createElement("button");
    restore.className = "button button-secondary";
    restore.type = "button";
    restore.append(makeIcon("restore"), document.createTextNode("還原"));
    restore.addEventListener("click", async () => {
      const updated = { ...song, hiddenFromLibrary: false, userRestored: true };
      try {
        await writeRecord(updated);
        remoteRecords.set(updated.remoteId, updated);
        if (catalogSongs.some((item) => item.id === updated.id)) {
          catalogSongs = catalogSongs.map((item) => item.id === updated.id ? { ...item, ...updated, sourceRemoved: false } : item);
        } else catalogSongs.push({ ...updated, sourceRemoved: true });
        composeSongs();
        renderLibrary();
        renderRemovedSongs();
        setStatus(`已還原「${updated.title}」；需要離線播放時請重新下載。`, "success");
      } catch (error) { setStatus(storageErrorMessage(error), "error"); }
    });
    row.append(title, restore);
    elements.removedSongList.append(row);
  }
}

function beginCoverChange() {
  const id = actionSongId;
  closeDialog(elements.trackMenuDialog);
  pendingCoverSongId = id;
  elements.coverFileInput.value = "";
  elements.coverFileInput.click();
}

function decodeImage(blob) {
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("圖片無法解碼。")); };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function cropCoverImage(file) {
  if (!(file instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("封面只支援 JPEG、PNG 或 WebP 圖片。請確認檔案格式。 ");
  }
  const image = await decodeImage(file);
  try {
    const width = image.width || image.naturalWidth;
    const height = image.height || image.naturalHeight;
    if (!width || !height) throw new Error("圖片尺寸無效，無法製作封面。");
    const scale = Math.min(1, COVER_LIMIT / Math.max(width, height));
    const scaledWidth = Math.max(1, Math.round(width * scale));
    const scaledHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("瀏覽器無法建立圖片預覽。");
    context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    let result = await canvasToBlob(canvas, "image/webp", .88);
    if (!result) result = await canvasToBlob(canvas, "image/jpeg", .9);
    if (!result) throw new Error("圖片縮放失敗，請改用其他圖片。");
    return result;
  } finally {
    if (typeof image.close === "function") image.close();
  }
}

function cleanCoverPreview() {
  if (previewCoverUrl) URL.revokeObjectURL(previewCoverUrl);
  previewCoverUrl = null;
  pendingCoverBlob = null;
  pendingCoverSongId = null;
  elements.coverPreviewImage.removeAttribute("src");
  elements.confirmCoverButton.disabled = true;
  elements.confirmCoverButton.textContent = "保存封面";
}

async function prepareCoverPreview(file) {
  elements.coverPreviewError.textContent = "";
  elements.confirmCoverButton.disabled = true;
  if (!file) return;
  try {
    const blob = await cropCoverImage(file);
    pendingCoverBlob = blob;
    if (previewCoverUrl) URL.revokeObjectURL(previewCoverUrl);
    previewCoverUrl = URL.createObjectURL(blob);
    elements.coverPreviewImage.src = previewCoverUrl;
    elements.confirmCoverButton.disabled = false;
    openDialog(elements.coverPreviewDialog);
  } catch (error) {
    elements.coverPreviewError.textContent = error.message || "圖片無法解碼，請選擇其他圖片。";
    openDialog(elements.coverPreviewDialog);
  }
}

async function confirmCoverChange() {
  const song = bySongId(pendingCoverSongId);
  if (!song || !pendingCoverBlob) return;
  elements.confirmCoverButton.disabled = true;
  elements.confirmCoverButton.textContent = "保存中…";
  try {
    const updated = { ...song, customCoverBlob: pendingCoverBlob, customCoverType: pendingCoverBlob.type || "image/webp" };
    await writeRecord(updated);
    replaceSong(updated);
    renderLibrary();
    closeDialog(elements.coverPreviewDialog);
    setStatus("自訂封面已保存到此裝置。", "success");
  } catch (error) {
    elements.confirmCoverButton.disabled = false;
    elements.confirmCoverButton.textContent = "保存封面";
    elements.coverPreviewError.textContent = storageErrorMessage(error);
  }
}

async function removeCustomCover(id) {
  closeDialog(elements.trackMenuDialog);
  const song = bySongId(id);
  if (!song || !(song.customCoverBlob instanceof Blob)) return;
  try {
    const updated = { ...song, customCoverBlob: null, customCoverType: null };
    await writeRecord(updated);
    replaceSong(updated);
    renderLibrary();
    setStatus("已移除自訂封面。", "success");
  } catch (error) { setStatus(storageErrorMessage(error), "error"); }
}

function responseMime(response, blob) {
  return (response.headers.get("content-type") || blob.type || "").split(";")[0].trim().toLowerCase();
}

async function fetchRemoteAudio(song) {
  const response = await fetch(song.audioUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`音訊下載失敗（HTTP ${response.status}）。`);
  const blob = await response.blob();
  const type = responseMime(response, blob);
  if (!type.startsWith("audio/")) throw new Error(`伺服器回傳 ${type || "未知內容"}，不是音訊檔。`);
  if (!blob.size) throw new Error("下載到的音訊是空檔案。");
  return blob.type === type ? blob : blob.slice(0, blob.size, type);
}

async function fetchRemoteCover(song) {
  if (!song.coverUrl) return null;
  const response = await fetch(song.coverUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`封面下載失敗（HTTP ${response.status}）。`);
  const blob = await response.blob();
  const type = responseMime(response, blob);
  if (!["image/jpeg", "image/png", "image/webp"].includes(type) || !blob.size) throw new Error("線上封面不是可用的 JPEG、PNG 或 WebP 圖片。");
  const decoded = await decodeImage(blob);
  if (typeof decoded.close === "function") decoded.close();
  return blob.type === type ? blob : blob.slice(0, blob.size, type);
}

async function downloadSong(id) {
  const song = bySongId(id);
  if (!isOnlineSong(song)) return false;
  if (isCurrentDownload(song)) {
    setStatus(`「${song.title}」已是目前版本，不需重複下載。`, "success");
    return true;
  }
  if (downloadStates.get(id)?.state === "downloading") return false;
  downloadStates.set(id, { state: "downloading" });
  renderLibrary();
  setStatus(`正在下載「${song.title}」…`, "working");
  try {
    const [audioBlob, downloadedCoverBlob] = await Promise.all([fetchRemoteAudio(song), fetchRemoteCover(song)]);
    const latestSong = bySongId(id);
    if (!latestSong || !isOnlineSong(latestSong) || latestSong.hiddenFromLibrary) {
      downloadStates.delete(id);
      return false;
    }
    // The old record (including its audio Blob) is replaced only after the
    // entire new payload has been fetched and this transaction commits.
    const updated = {
      ...latestSong,
      audioBlob,
      downloadVersion: song.version,
      downloadedAt: new Date().toISOString(),
      downloadedTitle: song.manifestTitle,
      downloadedAudioUrl: song.audioUrl,
      downloadedCoverBlob,
      downloadedCoverUrl: song.coverUrl || null
    };
    await writeRecord(updated);
    replaceSong(updated);
    downloadStates.delete(id);
    renderLibrary();
    setStatus(`「${song.title}」已保存供離線收聽。`, "success");
    return true;
  } catch (error) {
    downloadStates.set(id, { state: "failed", message: error.message || storageErrorMessage(error) });
    renderLibrary();
    const reason = error?.name === "QuotaExceededError" ? storageErrorMessage(error) : (error.message || "網路或儲存失敗。");
    setStatus(`「${song.title}」下載失敗：${reason}`, "error");
    return false;
  }
}

async function removeOfflineAudio(id) {
  closeDialog(elements.trackMenuDialog);
  const song = bySongId(id);
  if (!isDownloaded(song) || !window.confirm(`確定要移除「${song.title}」的離線檔案嗎？歌曲仍會保留在音樂庫。`)) return;
  try {
    const updated = { ...song, audioBlob: null, downloadVersion: null, downloadedAt: null, downloadedTitle: null, downloadedAudioUrl: null, downloadedCoverBlob: null, downloadedCoverUrl: null };
    await writeRecord(updated);
    replaceSong(updated);
    downloadStates.delete(id);
    renderLibrary();
    setStatus(`已移除「${song.title}」的離線音訊；線上歌單與自訂資訊仍保留。`, "success");
  } catch (error) { setStatus(storageErrorMessage(error), "error"); }
}

async function downloadAllSongs() {
  if (downloadingAll) return;
  const candidates = catalogSongs.filter((song) => !song.hiddenFromLibrary && !isCurrentDownload(song));
  if (!candidates.length) { setStatus("線上歌單中的歌曲都已下載至目前版本。", "success"); return; }
  downloadingAll = true;
  elements.downloadAllButton.disabled = true;
  elements.downloadProgress.hidden = false;
  elements.downloadProgressBar.max = candidates.length;
  elements.downloadProgressBar.value = 0;
  let completed = 0;
  let failed = 0;
  for (const song of candidates) {
    elements.progressLabel.textContent = `正在下載：${song.title}`;
    elements.progressCount.textContent = `${completed}/${candidates.length}`;
    setStatus(`全部下載 ${completed + 1}/${candidates.length}：${song.title}`, "working");
    if (!await downloadSong(song.id)) failed += 1;
    completed += 1;
    elements.progressCount.textContent = `${completed}/${candidates.length}`;
    elements.downloadProgressBar.value = completed;
  }
  elements.progressLabel.textContent = failed ? `完成 ${completed - failed} 首，${failed} 首失敗` : `已完成 ${completed} 首`;
  elements.downloadAllButton.disabled = false;
  downloadingAll = false;
  setStatus(failed ? `全部下載完成：${completed - failed} 首成功、${failed} 首失敗。` : `全部下載完成，共 ${completed} 首。`, failed ? "error" : "success");
}

function extensionFor(name) { return (/\.([^.]+)$/.exec(name)?.[1] || "").toLowerCase(); }

function parseMpegFrameHeader(bytes, offset) {
  if (offset + 4 > bytes.length) return null;
  const header = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
  if ((header >>> 21) !== 0x7ff) return null;
  const version = (header >>> 19) & 0b11;
  const layer = (header >>> 17) & 0b11;
  const bitrateIndex = (header >>> 12) & 0b1111;
  const sampleIndex = (header >>> 10) & 0b11;
  if (version === 0b01 || layer === 0 || bitrateIndex === 0 || bitrateIndex === 0b1111 || sampleIndex === 0b11) return null;
  const mpeg1Bitrates = {
    1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0],
    3: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0]
  };
  const mpeg2Bitrates = {
    1: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
    2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
    3: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0]
  };
  const bitrate = (version === 0b11 ? mpeg1Bitrates : mpeg2Bitrates)[layer][bitrateIndex] * 1000;
  const sampleRate = [44100, 48000, 32000][sampleIndex] / (version === 0b11 ? 1 : version === 0b10 ? 2 : 4);
  const padding = (header >>> 9) & 1;
  const frameLength = layer === 3
    ? Math.floor((12 * bitrate / sampleRate + padding) * 4)
    : Math.floor((version === 0b11 || layer !== 1 ? 144 : 72) * bitrate / sampleRate + padding);
  return frameLength > 4 ? { version, layer, sampleRate, frameLength } : null;
}

async function validateMp3File(file) {
  const tagHeader = new Uint8Array(await file.slice(0, 10).arrayBuffer());
  let scanStart = 0;
  if (tagHeader[0] === 0x49 && tagHeader[1] === 0x44 && tagHeader[2] === 0x33 && tagHeader.length >= 10) {
    const tagSize = ((tagHeader[6] & 0x7f) << 21) | ((tagHeader[7] & 0x7f) << 14) | ((tagHeader[8] & 0x7f) << 7) | (tagHeader[9] & 0x7f);
    scanStart = 10 + tagSize + ((tagHeader[5] & 0x10) ? 10 : 0);
  }
  const payload = new Uint8Array(await file.slice(scanStart, Math.min(file.size, scanStart + 128 * 1024)).arrayBuffer());
  let validFramePair = false;
  for (let offset = 0; offset + 4 < payload.length; offset += 1) {
    const frame = parseMpegFrameHeader(payload, offset);
    if (!frame || offset + frame.frameLength + 4 > payload.length) continue;
    const nextFrame = parseMpegFrameHeader(payload, offset + frame.frameLength);
    if (nextFrame?.version === frame.version && nextFrame.layer === frame.layer && nextFrame.sampleRate === frame.sampleRate) {
      validFramePair = true;
      break;
    }
  }
  if (!validFramePair || !elements.audio.canPlayType("audio/mpeg")) {
    throw new Error("MP3 格式無效、找不到可辨識的音訊串流，或此瀏覽器不支援播放。");
  }
}

function containsAscii(bytes, text) {
  const expected = Array.from(text, (character) => character.charCodeAt(0));
  for (let offset = 0; offset <= bytes.length - expected.length; offset += 1) {
    let match = true;
    for (let index = 0; index < expected.length; index += 1) {
      if (bytes[offset + index] !== expected[index]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

async function validateM4aFile(file) {
  let offset = 0;
  let foundFileType = false;
  let foundAudioData = false;
  let movieHeader = null;
  while (offset + 8 <= file.size) {
    const header = new DataView(await file.slice(offset, Math.min(file.size, offset + 16)).arrayBuffer());
    let boxSize = header.getUint32(0);
    const boxType = String.fromCharCode(header.getUint8(4), header.getUint8(5), header.getUint8(6), header.getUint8(7));
    let headerSize = 8;
    if (boxSize === 1) {
      if (header.byteLength < 16) break;
      const largeSize = header.getBigUint64(8);
      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
      boxSize = Number(largeSize);
      headerSize = 16;
    } else if (boxSize === 0) {
      boxSize = file.size - offset;
    }
    if (boxSize < headerSize || offset + boxSize > file.size) break;
    if (boxType === "ftyp") foundFileType = boxSize >= headerSize + 4;
    if (boxType === "mdat") foundAudioData = boxSize > headerSize;
    if (boxType === "moov") {
      if (boxSize > 32 * 1024 * 1024) break;
      movieHeader = new Uint8Array(await file.slice(offset + headerSize, offset + boxSize).arrayBuffer());
    }
    offset += boxSize;
  }
  const hasAudioTrack = movieHeader && containsAscii(movieHeader, "soun");
  const hasSupportedCodec = movieHeader && (containsAscii(movieHeader, "mp4a") || containsAscii(movieHeader, "alac"));
  if (!foundFileType || !foundAudioData || !hasAudioTrack || !hasSupportedCodec || !elements.audio.canPlayType("audio/mp4")) {
    throw new Error("M4A 格式無效、找不到可辨識的音訊串流，或此瀏覽器不支援播放。");
  }
}

async function validateAudioFile(file, extension) {
  if (extension === "mp3") await validateMp3File(file);
  else await validateM4aFile(file);
}

async function importOneFile(file) {
  if (!["mp3", "m4a"].includes(extensionFor(file.name))) throw new Error("不支援的檔案格式，請選擇 MP3 或 M4A。");
  if (!file.size) throw new Error("檔案是空的，無法匯入。");
  const song = {
    id: makeId(),
    source: "local",
    title: file.name.replace(/\.(mp3|m4a)$/i, "").trim() || "未命名歌曲",
    originalFileName: file.name,
    importedAt: new Date().toISOString(),
    audioBlob: file,
    customCoverBlob: null
  };
  await validateAudioFile(file, extensionFor(file.name));
  await writeRecord(song);
  localSongs.push(song);
  songs.push(song);
  if (shuffleEnabled) insertAtRandomPosition(shuffleUpcoming, song.id);
  renderLibrary();
  return song;
}

async function importSelectedFiles(fileList) {
  if (importing || !database) return;
  const files = Array.from(fileList || []);
  if (!files.length) return;
  importing = true;
  elements.importButton.disabled = true;
  elements.importButton.querySelector("span").textContent = "匯入中…";
  let saved = 0;
  const errors = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    setStatus(`正在保存 ${file.name}（${index + 1}/${files.length}）…`, "working");
    try { await importOneFile(file); saved += 1; }
    catch (error) { errors.push(`${file.name}：${error?.name === "QuotaExceededError" ? storageErrorMessage(error) : (error.message || storageErrorMessage(error))}`); }
  }
  importing = false;
  elements.importButton.disabled = false;
  elements.importButton.querySelector("span").textContent = "匯入本機音訊";
  elements.audioFiles.value = "";
  const summary = errors.length ? ` ${errors.slice(0, 2).join("；")}${errors.length > 2 ? `；另有 ${errors.length - 2} 個檔案失敗。` : ""}` : "";
  setStatus(`${saved ? `已保存 ${saved} 首本機歌曲。` : "沒有歌曲匯入。"}${summary}`, errors.length ? "error" : "success");
}

function updateSearchControls() { elements.clearSearchButton.hidden = elements.search.value.length === 0; }

function updateCoverPreviewClose() {
  if (!elements.coverPreviewDialog.open) cleanCoverPreview();
}

function updateOfflineUI() {
  if (!navigator.onLine) elements.offlineSupportNote.textContent = "目前離線：已下載歌曲可播放；尚未下載的線上歌曲會略過。離線啟動需先由 Service Worker 快取介面。";
  else elements.offlineSupportNote.textContent = "離線播放只適用於已下載並保存到此裝置的歌曲。尚未下載的線上音訊不會加入 Service Worker 快取。";
  renderLibrary();
}

async function initializeServiceWorker() {
  if (serviceWorkerInitialized) return;
  serviceWorkerInitialized = true;
  if (!("serviceWorker" in navigator)) {
    elements.offlineSupportNote.textContent += " 此瀏覽器不支援 Service Worker。";
    return;
  }
  try {
    const script = new URL("./sw.js", document.baseURI);
    const scope = new URL("./", document.baseURI).pathname;
    serviceWorkerRegistration = await navigator.serviceWorker.register(script.href, { scope });
    const showWaiting = () => {
      if (!serviceWorkerRegistration?.waiting) return;
      elements.applyUpdateButton.hidden = false;
      elements.updateState.textContent = "播放器有可套用的更新。";
    };
    showWaiting();
    serviceWorkerRegistration.addEventListener("updatefound", () => {
      const worker = serviceWorkerRegistration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) showWaiting();
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      elements.updateState.textContent = "播放器更新已啟用；目前頁面不會強制重新載入，重新開啟時使用新版本。";
      elements.applyUpdateButton.hidden = true;
    });
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "UPDATE_READY") showWaiting();
    });
  } catch (error) {
    elements.updateState.textContent = "Service Worker 未啟用；在線播放仍可使用，離線重新開啟不保證可用。";
    console.warn("Service Worker registration failed:", error);
  }
}

function applyWaitingUpdate() {
  const waiting = serviceWorkerRegistration?.waiting;
  if (!waiting) return;
  waiting.postMessage({ type: "SKIP_WAITING" });
  elements.applyUpdateButton.disabled = true;
  elements.updateState.textContent = "正在套用更新；目前播放不會中斷或強制重新載入。";
}

async function initialize() {
  if (libraryLoading) return;
  libraryLoading = true;
  libraryLoadError = "";
  updateModeControls();
  updatePlaybackUI();
  renderLibrary();
  initializeServiceWorker();

  try {
    await openDatabase();
    const records = await readAllRecords();
    localSongs = records.map(normalizeStoredRecord).filter((song) => song && isLocalSong(song)).sort((a, b) => {
      const aTime = Date.parse(a.importedAt || "");
      const bTime = Date.parse(b.importedAt || "");
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
      return String(a.id).localeCompare(String(b.id));
    });
    remoteRecords = new Map(records.map(normalizeStoredRecord).filter((song) => song && isOnlineSong(song)).map((song) => [song.remoteId, song]));
    const cache = records.find((record) => record?.id === CATALOG_CACHE_ID && record.recordType === "catalog-cache");
    composeSongs();
    renderLibrary();
    if (cache?.entries) {
      try {
        const entries = validateCatalog({ songs: cache.entries }, catalogManifestUrl());
        await applyCatalog(entries, { persist: false });
        setStatus(`已載入上次保存的歌單（${entries.length} 首），正在檢查更新…`, "info");
      } catch (error) {
        setStatus(`上次保存的歌單格式無效：${error.message}`, "error");
      }
    } else {
      setStatus(localSongs.length ? `已載入 ${localSongs.length} 首本機歌曲，正在讀取線上歌單…` : "正在讀取線上歌單…", "info");
    }
  } catch (error) {
    database = null;
    const message = `無法讀取此裝置的音樂庫：${error.message || storageErrorMessage(error)} 線上播放仍可嘗試；下載與本機保存暫不可用。`;
    libraryLoadError = message;
    setStatus(message, "error");
  }
  const catalogLoaded = await refreshCatalog({ quiet: true });
  if (!catalogLoaded && !songs.length && !libraryLoadError) {
    libraryLoadError = "線上歌曲清單載入失敗。請檢查網路連線後重試。";
  }
  libraryLoading = false;
  renderLibrary();
}

async function retryLibraryLoad() {
  if (libraryLoading) return;
  elements.emptyRefreshButton.disabled = true;
  try { await initialize(); }
  finally { elements.emptyRefreshButton.disabled = libraryLoading; }
}

function handleAudioError() {
  if (!currentSongId || !elements.audio.error) return;
  const song = currentSong();
  const errorText = !navigator.onLine && isOnlineSong(song) && !isDownloaded(song)
    ? offlineReason(song)
    : "音訊載入失敗。請檢查音訊網址、伺服器回應、格式或網路連線。";
  setStatus(errorText, "error");
  updatePlaybackUI();
  handleAutomaticLoadFailure();
}

function updateAudioPlayState() {
  updatePlaybackUI();
}

function onAudioPlaying() {
  autoFailedIds.clear();
  currentPlaybackWasAutomatic = false;
  updatePlaybackUI();
  setPlaybackStatus("正在播放");
}

function setPlaybackStatus(message) { elements.playbackStatus.textContent = message; }

function setupEventListeners() {
  elements.quickMenuButton.addEventListener("click", () => openDialog(elements.quickActionsDialog));
  elements.closeQuickActionsButton.addEventListener("click", () => closeDialog(elements.quickActionsDialog));
  elements.removedSongsButton.addEventListener("click", () => { closeDialog(elements.quickActionsDialog); renderRemovedSongs(); openDialog(elements.removedSongsDialog); });
  elements.closeRemovedSongsButton.addEventListener("click", () => closeDialog(elements.removedSongsDialog));
  elements.importButton.addEventListener("click", () => { closeDialog(elements.quickActionsDialog); elements.audioFiles.click(); });
  elements.audioFiles.addEventListener("change", (event) => importSelectedFiles(event.target.files));
  elements.downloadAllButton.addEventListener("click", () => { closeDialog(elements.quickActionsDialog); downloadAllSongs(); });
  elements.refreshPlaylistButton.addEventListener("click", () => { closeDialog(elements.quickActionsDialog); refreshCatalog(); });
  elements.emptyRefreshButton.addEventListener("click", retryLibraryLoad);
  elements.search.addEventListener("input", () => { updateSearchControls(); renderLibrary(); });
  elements.searchForm.addEventListener("submit", (event) => event.preventDefault());
  elements.clearSearchButton.addEventListener("click", () => { elements.search.value = ""; updateSearchControls(); renderLibrary(); elements.search.focus(); });
  elements.resetSearchButton.addEventListener("click", () => { elements.search.value = ""; updateSearchControls(); renderLibrary(); elements.search.focus(); });
  elements.miniTrack.addEventListener("click", () => openDialog(elements.playerDialog));
  elements.miniPlayButton.addEventListener("click", togglePlayback);
  elements.desktopShuffleButton.addEventListener("click", () => elements.shuffleButton.click());
  elements.desktopRepeatButton.addEventListener("click", () => elements.repeatButton.click());
  elements.desktopPreviousButton.addEventListener("click", playPrevious);
  elements.desktopPlayButton.addEventListener("click", togglePlayback);
  elements.desktopNextButton.addEventListener("click", playNext);
  elements.queueButton.addEventListener("click", () => openQueueDialog(elements.queueButton));
  elements.fullQueueButton.addEventListener("click", () => {
    if (window.matchMedia?.("(min-width: 900px)").matches) {
      closeDialog(elements.playerDialog);
      openQueueDialog(elements.queueButton);
    } else openQueueDialog(elements.fullQueueButton);
  });
  elements.closeQueueButton.addEventListener("click", () => closeDialog(elements.queueDialog));
  elements.queueDialog.addEventListener("close", restoreQueueFocus);
  elements.queueContent.addEventListener("pointermove", updateQueueDrag);
  elements.queueContent.addEventListener("pointerup", (event) => finishQueueDrag(event));
  elements.queueContent.addEventListener("pointercancel", (event) => finishQueueDrag(event, false));
  elements.closePlayerButton.addEventListener("click", () => closeDialog(elements.playerDialog));
  elements.playButton.addEventListener("click", togglePlayback);
  elements.previousButton.addEventListener("click", playPrevious);
  elements.nextButton.addEventListener("click", playNext);
  elements.shuffleButton.addEventListener("click", () => {
    shuffleEnabled = !shuffleEnabled;
    persistShuffleSetting();
    shuffleHistory = [];
    shuffleUpcoming = shuffleEnabled ? shuffled(songIds().filter((id) => id !== currentSongId)) : [];
    updatePlaybackUI();
    setPlaybackStatus(shuffleEnabled ? "隨機播放已開啟" : "隨機播放已關閉");
  });
  elements.repeatButton.addEventListener("click", () => {
    loopMode = LOOP_MODES[(LOOP_MODES.indexOf(loopMode) + 1) % LOOP_MODES.length];
    persistLoopMode();
    updateModeControls();
    setPlaybackStatus(`循環模式：${loopModeLabel()}`);
  });
  elements.seekBar.addEventListener("input", () => {
    const time = Number(elements.seekBar.value);
    elements.elapsedTime.textContent = formatTime(time);
    if (Number.isFinite(elements.audio.duration)) elements.audio.currentTime = time;
  });
  elements.desktopSeekBar.addEventListener("input", () => {
    const time = Number(elements.desktopSeekBar.value);
    elements.desktopElapsed.textContent = formatTime(time);
    if (Number.isFinite(elements.audio.duration)) elements.audio.currentTime = time;
  });
  elements.infoButton.addEventListener("click", () => openDialog(elements.infoDialog));
  elements.closeInfoButton.addEventListener("click", () => closeDialog(elements.infoDialog));
  elements.infoDoneButton.addEventListener("click", () => closeDialog(elements.infoDialog));
  elements.applyUpdateButton.addEventListener("click", applyWaitingUpdate);
  elements.closeTrackMenuButton.addEventListener("click", () => closeDialog(elements.trackMenuDialog));
  elements.coverFileInput.addEventListener("change", (event) => prepareCoverPreview(event.target.files?.[0]));
  elements.confirmCoverButton.addEventListener("click", confirmCoverChange);
  elements.cancelCoverButton.addEventListener("click", () => closeDialog(elements.coverPreviewDialog));
  elements.closeCoverPreviewButton.addEventListener("click", () => closeDialog(elements.coverPreviewDialog));
  elements.coverPreviewDialog.addEventListener("close", updateCoverPreviewClose);
  elements.audio.addEventListener("timeupdate", updateTimeline);
  elements.audio.addEventListener("durationchange", updateTimeline);
  elements.audio.addEventListener("loadedmetadata", updateTimeline);
  elements.audio.addEventListener("play", updateAudioPlayState);
  elements.audio.addEventListener("playing", onAudioPlaying);
  elements.audio.addEventListener("pause", () => {
    updatePlaybackUI();
    if (!elements.audio.ended && currentSongId) setPlaybackStatus("已暫停");
  });
  elements.audio.addEventListener("ended", handleNaturalEnd);
  elements.audio.addEventListener("seeked", updateMediaPosition);
  elements.audio.addEventListener("error", handleAudioError);
  window.addEventListener("online", () => { updateOfflineUI(); refreshCatalog({ quiet: true }); });
  window.addEventListener("offline", updateOfflineUI);
  window.addEventListener("beforeunload", () => {
    releaseAudioUrl();
    for (const item of coverObjectUrls.values()) URL.revokeObjectURL(item.url);
    if (previewCoverUrl) URL.revokeObjectURL(previewCoverUrl);
    database?.close();
  });
}

setupEventListeners();
updateOfflineUI();
setupMediaSession();
initialize();
