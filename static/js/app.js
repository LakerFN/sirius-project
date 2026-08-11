(() => {
  const MIN_YEAR = 1991;
  const MAX_YEAR = 2026;
  const SIRIUS_MIN_YEAR = 2007;
  const MS_PER_YEAR = 5000;

  const MILESTONES_LUKOIL = [
    { year: 1991, label: "1991", tag: "Старт" },
    { year: 1998, label: "1998" },
    { year: 2000, label: "2000" },
    { year: 2008, label: "2008" },
    { year: 2010, label: "2010" },
    { year: 2015, label: "2015", tag: "Сириус" },
    { year: 2020, label: "2020" },
    { year: 2026, label: "2026", tag: "Финиш" },
  ];

  const MILESTONES_SIRIUS = [
    { year: 2007, label: "2007", tag: "Парк" },
    { year: 2010, label: "2010" },
    { year: 2013, label: "2013" },
    { year: 2014, label: "2014", tag: "Олимпиада" },
    { year: 2015, label: "2015", tag: "Сириус" },
    { year: 2020, label: "2020", tag: "ФТ" },
    { year: 2024, label: "2024" },
    { year: 2026, label: "2026", tag: "Финиш" },
  ];

  const MILESTONES_COMPARE = [
    { year: 1991, label: "1991", tag: "Старт" },
    { year: 2000, label: "2000" },
    { year: 2007, label: "2007", tag: "Парк" },
    { year: 2014, label: "2014", tag: "Олимпиада" },
    { year: 2015, label: "2015", tag: "Сириус" },
    { year: 2020, label: "2020", tag: "ФТ" },
    { year: 2026, label: "2026", tag: "Финиш" },
  ];

  // Важные годы ЛУКОЙЛ = вехи на шкале (старт, IPO/рост, глобализация, партнёрства, Сириус, цифр., финиш)
  const KEY_YEARS_LUKOIL = new Set([1991, 1998, 2000, 2008, 2010, 2015, 2020, 2026]);
  const KEY_YEARS_SIRIUS = new Set([2007, 2014, 2015, 2020, 2026]);
  const KEY_YEARS_COMPARE = new Set([1991, 2000, 2007, 2010, 2014, 2015, 2020, 2026]);

  function isKeyYear(year) {
    if (currentView === "sirius") return KEY_YEARS_SIRIUS.has(year);
    if (currentView === "compare") return KEY_YEARS_COMPARE.has(year);
    return KEY_YEARS_LUKOIL.has(year);
  }

  const ECHO_LINKS = {
    2014: { lukoil: "Международные проекты", sirius: "Олимпиада в Сочи" },
    2015: { lukoil: "Технологии и партнёрства", sirius: "Открытие «Сириуса»" },
    2020: { lukoil: "Цифровая трансформация", sirius: "Федеральная территория" },
  };

  const ECHO_CHAIN = [2014, 2015, 2020];

  const MAP_POINTS = [
    {
      id: "langepas",
      label: "Лангепас",
      hint: "«Л» в ЛУКОЙЛ · добыча",
      kind: "lukoil",
      jumpYear: 1991,
      jumpView: "lukoil",
      activeFrom: 1991,
      group: "luk-founding",
    },
    {
      id: "uray",
      label: "Урай",
      hint: "«У» в ЛУКОЙЛ · добыча",
      kind: "lukoil",
      jumpYear: 1991,
      jumpView: "lukoil",
      activeFrom: 1991,
      group: "luk-founding",
    },
    {
      id: "kogalym",
      label: "Когалым",
      hint: "«К» в ЛУКОЙЛ · добыча",
      kind: "lukoil",
      jumpYear: 1991,
      jumpView: "lukoil",
      activeFrom: 1991,
      group: "luk-founding",
    },
    {
      id: "perm",
      label: "Пермь",
      hint: "НПЗ · ЛУКОЙЛ",
      kind: "lukoil",
      jumpYear: 2000,
      jumpView: "lukoil",
      activeFrom: 2000,
    },
    {
      id: "sochi",
      label: "Сочи",
      hint: "Олимпиада · Сириус",
      kind: "sirius",
      jumpYear: 2014,
      jumpView: "sirius",
      activeFrom: 2007,
    },
  ];

  const QUIZ = [
    {
      q: "В каком году создан концерн ЛУКОЙЛ?",
      options: ["1985", "1991", "1998", "2000"],
      answer: 1,
    },
    {
      q: "Когда прошла Олимпиада в Сочи?",
      options: ["2010", "2012", "2014", "2015"],
      answer: 2,
    },
    {
      q: "В каком году открыли Образовательный центр «Сириус»?",
      options: ["2013", "2014", "2015", "2020"],
      answer: 2,
    },
  ];

  const PARALLEL_YEARS = {
    2014: "Параллельно: Олимпиада и фонд «Талант и успех»",
    2015: "Параллельно: открытие «Сириуса» на олимпийском наследии",
    2020: "Параллельно: федеральная территория «Сириус»",
  };

  const ERA_META = [
    { max: 1999, era: "1990s", label: "Эпоха первых вышек" },
    { max: 2009, era: "2000s", label: "Вертикальная интеграция" },
    { max: 2014, era: "2010s", label: "Цифровизация отрасли" },
    { max: 2026, era: "sirius", label: "Сириус и новые технологии" },
  ];

  const yearDisplay = document.getElementById("year-display");
  const eraLabel = document.getElementById("era-label");
  const parallelBadge = document.getElementById("parallel-badge");
  const dualFate = document.getElementById("dual-fate");
  const dualFateLukTitle = document.getElementById("dual-fate-luk-title");
  const dualFateSiriusTitle = document.getElementById("dual-fate-sirius-title");
  const compareSwipeHint = document.getElementById("compare-swipe-hint");
  const introOverlay = document.getElementById("intro-overlay");
  const introYear = document.getElementById("intro-year");
  const introSkip = document.getElementById("intro-skip");
  const finaleModal = document.getElementById("finale-modal");
  const finaleClose = document.getElementById("finale-close");
  const finaleReplay = document.getElementById("finale-replay");
  const quizPanel = document.getElementById("quiz-panel");
  const quizProgress = document.getElementById("quiz-progress");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizResult = document.getElementById("quiz-result");
  const quizScore = document.getElementById("quiz-score");
  const quizVerdict = document.getElementById("quiz-verdict");
  const aboutCampOpen = document.getElementById("about-camp-open");
  const aboutCampModal = document.getElementById("about-camp-modal");
  const aboutCampClose = document.getElementById("about-camp-close");
  const aboutLukoilOpen = document.getElementById("about-lukoil-open");
  const aboutLukoilModal = document.getElementById("about-lukoil-modal");
  const aboutLukoilClose = document.getElementById("about-lukoil-close");
  const compareParallel = document.getElementById("compare-parallel");
  const compareParallelLukoil = document.getElementById("compare-parallel-lukoil");
  const compareParallelSirius = document.getElementById("compare-parallel-sirius");
  const compareEcho = document.getElementById("compare-echo");
  const compareEchoNote = document.getElementById("compare-echo-note");
  const geoMapCaption = document.getElementById("geo-map-caption");
  const yearJumpHint = document.getElementById("year-jump-hint");
  const themeTip = document.getElementById("theme-tip");
  const themeTipClose = document.getElementById("theme-tip-close");
  const lukoilFeed = document.getElementById("lukoil-feed");
  const siriusFeed = document.getElementById("sirius-feed");
  const barrelsCounter = document.getElementById("barrels-counter");
  const productionCounter = document.getElementById("production-counter");
  const oilChartTitle = document.getElementById("oil-chart-title");
  const oilChartSub = document.getElementById("oil-chart-sub");
  const techCounter = document.getElementById("tech-counter");
  const slider = document.getElementById("year-slider");
  const sliderMarks = document.getElementById("slider-marks");
  const tickSound = document.getElementById("tick-sound");
  const oilCanvas = document.getElementById("oil-chart");
  const techCanvas = document.getElementById("tech-chart");
  const playBtn = document.getElementById("play-btn");
  const playLabel = document.getElementById("play-label");
  const shareFrameBtn = document.getElementById("share-frame-btn");
  const playSpeedGroup = document.getElementById("play-speed");
  const shareCanvas = document.getElementById("share-canvas");
  const panelLukoil = document.getElementById("panel-lukoil");
  const panelSirius = document.getElementById("panel-sirius");
  const page = document.getElementById("page");
  const yearPhoto = document.getElementById("year-photo");
  const yearPhotoImg = document.getElementById("year-photo-img");
  const yearPhotoCap = document.getElementById("year-photo-cap");
  const siriusYearPhoto = document.getElementById("sirius-year-photo");
  const siriusYearPhotoImg = document.getElementById("sirius-year-photo-img");
  const siriusYearPhotoCap = document.getElementById("sirius-year-photo-cap");

  let fullHistory = [];
  let yearImages = new Map();
  let siriusYearImages = new Map();
  let oilChart = null;
  let techChart = null;
  let lastYear = Math.round(Number(slider.value));
  let displayedYear = lastYear;
  let playTimer = null;
  let yearAnim = null;
  let sliderAnim = null;
  let currentView = "lukoil";
  let sliderDragging = false;
  let finaleShown = false;
  let yearJumpBuffer = "";
  let yearJumpTimer = null;
  let urlSyncReady = false;
  let oilMetric = "price";
  let quizIndex = 0;
  let quizCorrect = 0;
  let audioCtx = null;
  let playSpeed = 1;
  let audioUnlocked = false;
  let tickBuffer = null;
  let tickBufferLoading = null;
  let lastTickAt = 0;

  function activeMinYear() {
    return currentView === "sirius" ? SIRIUS_MIN_YEAR : MIN_YEAR;
  }

  function activeMilestones() {
    if (currentView === "sirius") return MILESTONES_SIRIUS;
    if (currentView === "compare") return MILESTONES_COMPARE;
    return MILESTONES_LUKOIL;
  }

  function clampYear(year) {
    return Math.max(activeMinYear(), Math.min(MAX_YEAR, Math.round(Number(year))));
  }

  function bySource(source) {
    return fullHistory.filter((event) => event.source === source);
  }

  function eventsUpTo(events, year) {
    return events.filter((event) => event.year <= year);
  }

  function latestEvent(events, year) {
    const filtered = eventsUpTo(events, year);
    return filtered.length ? filtered[filtered.length - 1] : null;
  }

  function uniqueByYear(events) {
    const map = new Map();
    for (const event of events) map.set(event.year, event);
    return [...map.values()];
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function buildYearImageIndex(events, source) {
    const map = new Map();
    for (const event of events) {
      if (event.source !== source || !event.image) continue;
      const year = Number(event.year);
      if (!Number.isFinite(year) || map.has(year)) continue;
      map.set(year, {
        src: event.image,
        title: event.imageCaption || event.title || `История ${year}`,
        url: event.url || null,
      });
    }
    return map;
  }

  function applyPhoto(elFigure, elImg, elCap, photoMap, year, minYear) {
    if (!elFigure || !elImg) return;

    let photo = photoMap.get(year);
    let photoYear = year;
    if (!photo) {
      for (let y = year; y >= minYear; y -= 1) {
        if (photoMap.has(y)) {
          photo = photoMap.get(y);
          photoYear = y;
          break;
        }
      }
    }

    if (!photo) {
      elFigure.hidden = true;
      elImg.removeAttribute("src");
      elImg.alt = "";
      if (elCap) elCap.textContent = "";
      return;
    }

    elFigure.hidden = false;
    if (elImg.getAttribute("src") !== photo.src) elImg.src = photo.src;
    elImg.alt = photo.title;
    if (elCap) {
      elCap.textContent =
        photoYear === year ? photo.title : `${photo.title} (${photoYear})`;
    }
  }

  function updateYearPhoto(year) {
    applyPhoto(yearPhoto, yearPhotoImg, yearPhotoCap, yearImages, year, MIN_YEAR);
  }

  function updateSiriusYearPhoto(year) {
    applyPhoto(
      siriusYearPhoto,
      siriusYearPhotoImg,
      siriusYearPhotoCap,
      siriusYearImages,
      year,
      SIRIUS_MIN_YEAR
    );
  }

  function animateNumber({ from, to, duration = 320, onUpdate, onDone }) {
    const start = performance.now();
    const delta = to - from;
    let frameId = null;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      onUpdate(from + delta * eased);
      if (t < 1) frameId = requestAnimationFrame(tick);
      else if (onDone) onDone();
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }

  function setYearDisplay(year, { animate = true } = {}) {
    const target = Number(year);
    if (!animate || !Number.isFinite(displayedYear)) {
      displayedYear = target;
      yearDisplay.textContent = String(target);
      return;
    }
    if (yearAnim) yearAnim();
    const from = displayedYear;
    yearAnim = animateNumber({
      from,
      to: target,
      duration: Math.min(500, 120 + Math.abs(target - from) * 40),
      onUpdate: (value) => {
        displayedYear = value;
        yearDisplay.textContent = String(Math.round(value));
      },
      onDone: () => {
        displayedYear = target;
        yearDisplay.textContent = String(target);
        yearAnim = null;
      },
    });
  }

  function updateEra(year) {
    const meta = ERA_META.find((item) => year <= item.max) || ERA_META[ERA_META.length - 1];
    document.body.dataset.era = meta.era;
    if (eraLabel) eraLabel.textContent = meta.label;
  }

  function updateBackground(year) {
    const t = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
    const isLight = document.documentElement.dataset.theme === "light";
    const intensity = isLight ? 0.08 + t * 0.1 : 0.38 + t * 0.32;
    document.body.style.setProperty(
      "--glow-a",
      `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, transparent)`
    );
  }

  function newsForYear(source, year, minYear) {
    const events = bySource(source).filter((e) => e.year >= minYear);
    const exact = events.filter((event) => event.year === year);
    if (exact.length) return { items: exact, isFallback: false };
    const latest = eventsUpTo(events, year);
    if (!latest.length) return { items: [], isFallback: false };
    const fallbackYear = latest[latest.length - 1].year;
    return {
      items: events.filter((event) => event.year === fallbackYear),
      isFallback: true,
    };
  }

  function sourceLabel(url) {
    if (!url) return "Источник";
    if (url.includes("lukoil.ru")) return "Источник · lukoil.ru";
    if (url.includes("wikipedia.org")) return "Источник · Википедия";
    try {
      return `Источник · ${new URL(url).hostname.replace(/^www\./, "")}`;
    } catch (_) {
      return "Источник";
    }
  }

  function bindNewsFeed(container, items, { isFallback = false } = {}) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `
        <article class="news-item is-empty">
          <p class="news-empty">Нет новостей за выбранный год.</p>
        </article>`;
      return;
    }

    const note = isFallback
      ? `<p class="news-fallback-note">Ближайшие новости за ${items[0].year} год</p>`
      : "";

    container.innerHTML =
      note +
      items
        .map((event, index) => {
          const id = `news-${event.source}-${event.year}-${index}`;
          const link = event.url
            ? `<a class="news-link" href="${escapeHtml(event.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceLabel(event.url))}</a>`
            : "";
          return `
            <article class="news-item" data-id="${id}">
              <button type="button" class="news-toggle" aria-expanded="false" aria-controls="${id}-body">
                <span class="news-toggle-text">${escapeHtml(event.title)}</span>
                <span class="news-toggle-icon" aria-hidden="true"></span>
              </button>
              <div id="${id}-body" class="news-body" hidden>
                <p>${escapeHtml(event.desc || "")}</p>
                ${link}
              </div>
            </article>`;
        })
        .join("");

    container.querySelectorAll(".news-item").forEach((item) => {
      const btn = item.querySelector(".news-toggle");
      const body = item.querySelector(".news-body");
      if (!btn || !body) return;
      btn.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          body.removeAttribute("hidden");
          requestAnimationFrame(() => {
            const link = body.querySelector(".news-link");
            const target = link || body;
            target.scrollIntoView({ block: "nearest", behavior: "smooth" });
          });
        } else {
          body.setAttribute("hidden", "");
        }
      });
    });
  }

  function getAudioContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    return audioCtx;
  }

  function decodeAudioData(ctx, data) {
    return new Promise((resolve, reject) => {
      const copy = data.slice(0);
      let settled = false;
      const ok = (buf) => {
        if (settled) return;
        settled = true;
        resolve(buf);
      };
      const fail = (err) => {
        if (settled) return;
        settled = true;
        reject(err || new Error("decodeAudioData failed"));
      };
      try {
        const ret = ctx.decodeAudioData(copy, ok, fail);
        if (ret && typeof ret.then === "function") ret.then(ok, fail);
      } catch (err) {
        fail(err);
      }
    });
  }

  async function loadTickBuffer() {
    const ctx = getAudioContext();
    if (!ctx || tickBuffer) return tickBuffer;
    if (tickBufferLoading) return tickBufferLoading;
    tickBufferLoading = (async () => {
      const src =
        (tickSound && (tickSound.currentSrc || tickSound.getAttribute("src"))) ||
        "/static/audio/tick.wav";
      const res = await fetch(src);
      if (!res.ok) throw new Error("tick fetch failed");
      const arr = await res.arrayBuffer();
      tickBuffer = await decodeAudioData(ctx, arr);
      return tickBuffer;
    })().catch(() => {
      tickBufferLoading = null;
      return null;
    });
    return tickBufferLoading;
  }

  async function unlockAudio() {
    if (audioUnlocked) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (_) {}
      }
      return;
    }
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") await ctx.resume();
        // Silent prime — required on iOS before later BufferSource ticks work.
        const silent = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
        const src = ctx.createBufferSource();
        src.buffer = silent;
        src.connect(ctx.destination);
        src.start(0);
        loadTickBuffer();
      }
      if (tickSound) {
        const prevVol = tickSound.volume;
        tickSound.muted = true;
        tickSound.volume = 0;
        try {
          const p = tickSound.play();
          if (p) await p.catch(() => {});
        } catch (_) {}
        try {
          tickSound.pause();
          tickSound.currentTime = 0;
        } catch (_) {}
        tickSound.muted = false;
        tickSound.volume = prevVol || 0.32;
      }
      audioUnlocked = true;
    } catch (_) {
      /* keep trying on next gesture */
    }
  }

  function playTickViaWebAudio() {
    const ctx = getAudioContext();
    if (!ctx || !tickBuffer) return false;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.32;
    src.buffer = tickBuffer;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
    return true;
  }

  function playTickFallbackBeep() {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    return true;
  }

  function playKeyPulseSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        playTick();
        return;
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const tones = [392, 523.25, 659.25];
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02 + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + i * 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.045);
        osc.stop(now + 0.35 + i * 0.05);
      });
    } catch (_) {
      playTick();
    }
  }

  function flashKeyYear({ withSound = true } = {}) {
    if (!yearDisplay) return;
    yearDisplay.classList.remove("is-pulse");
    void yearDisplay.offsetWidth;
    yearDisplay.classList.add("is-pulse");
    document.body.classList.remove("is-key-flash");
    void document.body.offsetWidth;
    document.body.classList.add("is-key-flash");
    if (withSound) playKeyPulseSound();
    clearTimeout(flashKeyYear._timer);
    flashKeyYear._timer = setTimeout(() => {
      yearDisplay.classList.remove("is-pulse");
      document.body.classList.remove("is-key-flash");
    }, 1400);
  }

  function titleForYear(source, year) {
    const exact = bySource(source).find((e) => e.year === year);
    if (exact) return exact.title || "—";
    const latest = latestEvent(bySource(source), year);
    if (!latest) return source === "sirius" && year < SIRIUS_MIN_YEAR ? "ещё впереди" : "—";
    return latest.title || "—";
  }

  function updateDualFate(year) {
    if (!dualFate || !dualFateLukTitle || !dualFateSiriusTitle) return;
    dualFateLukTitle.textContent = titleForYear("lukoil", year);
    dualFateSiriusTitle.textContent = titleForYear("sirius", year);
    dualFate.classList.toggle("is-pre-sirius", year < SIRIUS_MIN_YEAR);
  }

  function updateParallelBadge(year) {
    if (!parallelBadge) return;
    const text = PARALLEL_YEARS[year];
    if (!text || currentView === "compare") {
      parallelBadge.hidden = true;
      parallelBadge.classList.remove("is-visible");
      parallelBadge.textContent = "";
      return;
    }
    parallelBadge.hidden = false;
    parallelBadge.classList.add("is-visible");
    parallelBadge.textContent = text;
  }

  function updateCompareParallel(year) {
    if (!compareParallel || !compareParallelLukoil || !compareParallelSirius) return;
    if (currentView !== "compare") {
      compareParallel.hidden = true;
      return;
    }

    const lukItems = bySource("lukoil").filter((e) => e.year === year);
    const sirItems = bySource("sirius").filter((e) => e.year === year);
    if (!lukItems.length || !sirItems.length) {
      compareParallel.hidden = true;
      compareParallelLukoil.textContent = "";
      compareParallelSirius.textContent = "";
      if (compareEcho) compareEcho.hidden = true;
      if (compareEchoNote) {
        compareEchoNote.hidden = true;
        compareEchoNote.textContent = "";
      }
      compareParallel.classList.remove("has-echo");
      return;
    }

    compareParallel.hidden = false;
    compareParallelLukoil.textContent = lukItems[0].title || "—";
    compareParallelSirius.textContent = sirItems[0].title || "—";

    const echo = ECHO_LINKS[year];
    if (echo && compareEcho && compareEchoNote) {
      compareEcho.hidden = false;
      compareEchoNote.hidden = false;
      const idx = ECHO_CHAIN.indexOf(year);
      const next = ECHO_CHAIN[(idx + 1) % ECHO_CHAIN.length];
      compareEchoNote.textContent = `${echo.lukoil} ↔ ${echo.sirius} · далее ${next}`;
      compareParallel.classList.add("has-echo");
    } else {
      if (compareEcho) compareEcho.hidden = true;
      if (compareEchoNote) {
        compareEchoNote.hidden = true;
        compareEchoNote.textContent = "";
      }
      compareParallel.classList.remove("has-echo");
    }
  }

  function jumpEchoChain() {
    const idx = ECHO_CHAIN.indexOf(lastYear);
    const next = idx >= 0 ? ECHO_CHAIN[(idx + 1) % ECHO_CHAIN.length] : ECHO_CHAIN[0];
    if (currentView !== "compare") setView("compare");
    animateSliderTo(next, { withSound: true });
  }

  function mapPointStrength(point, year) {
    const isLukCity = point.kind === "lukoil" || point.group === "luk-founding";

    // В чужом блоке точка приглушена, но кликабельна
    if (currentView === "lukoil" && point.id === "sochi") return 0;
    if (currentView === "sirius" && isLukCity) return 0;

    if (point.id === "sochi") {
      if (year < point.activeFrom) return 0;
      if (year >= 2014 && year <= 2020) return 3;
      return 2;
    }
    if (year < point.activeFrom) return 0;
    if (point.group === "luk-founding") {
      if (year <= 1998) return 3;
      if (year < 2007) return 2;
      return 2;
    }
    if (point.id === "perm") {
      if (year >= 2000 && year <= 2010) return 3;
      return 2;
    }
    return 1;
  }

  function updateGeoMap(year) {
    const points = document.querySelectorAll(".geo-point[data-point]");
    let top = null;
    let topStrength = -1;
    points.forEach((btn) => {
      const meta = MAP_POINTS.find((p) => p.id === btn.dataset.point);
      if (!meta) return;
      const strength = mapPointStrength(meta, year);
      btn.classList.toggle("is-dim", strength === 0);
      btn.classList.toggle("is-active", strength >= 2);
      btn.classList.toggle("is-peak", strength >= 3);
      btn.setAttribute("aria-pressed", strength >= 2 ? "true" : "false");
      btn.disabled = false;
      if (strength > topStrength) {
        topStrength = strength;
        top = meta;
      }
    });
    if (!geoMapCaption) return;
    if (top?.group === "luk-founding" && topStrength >= 3) {
      geoMapCaption.textContent = "Лангепас · Урай · Когалым — имя ЛУКОЙЛ";
      return;
    }
    if (top && topStrength >= 2) {
      geoMapCaption.textContent = `${top.label}: ${top.hint}`;
      return;
    }
    if (currentView === "lukoil") {
      geoMapCaption.textContent =
        year < 2000
          ? "Пермь загорится с 2000 · Сочи кликабелен"
          : "Сочи приглушён · клик откроет Сириус";
      return;
    }
    if (currentView === "sirius") {
      geoMapCaption.textContent =
        year < 2007
          ? "Сочи загорится с 2007 · города ЛУКОЙЛ кликабельны"
          : "Города ЛУКОЙЛ приглушены · клик откроет ЛУКОЙЛ";
      return;
    }
    geoMapCaption.textContent = "Точки ещё впереди на ленте";
  }

  function jumpToMapPoint(pointId) {
    const meta = MAP_POINTS.find((p) => p.id === pointId);
    if (!meta) return;
    const view = currentView === "compare" ? "compare" : meta.jumpView;
    if (currentView !== view) setView(view);
    animateSliderTo(meta.jumpYear, { withSound: true });
  }

  function resolveYearShortcut(digits) {
    if (!digits) return null;
    const n = Number(digits);
    if (!Number.isFinite(n)) return null;

    let year = null;
    if (digits.length === 4) {
      year = n;
    } else if (digits.length === 3) {
      if (n >= 991 && n <= 999) year = 1000 + n;
      else if (n <= 26) year = 2000 + n;
      else if (n >= 0 && n <= 99) year = 1900 + n;
    } else if (digits.length === 2) {
      if (n >= 91 && n <= 99) year = 1900 + n;
      else if (n >= 0 && n <= 26) year = 2000 + n;
    } else if (digits.length === 1) {
      return null;
    }

    if (year == null) return null;
    if (year < MIN_YEAR || year > MAX_YEAR) return null;
    if (currentView === "sirius" && year < SIRIUS_MIN_YEAR) return SIRIUS_MIN_YEAR;
    return year;
  }

  function showYearJumpHint(text) {
    if (!yearJumpHint) return;
    yearJumpHint.hidden = false;
    yearJumpHint.textContent = text;
  }

  function hideYearJumpHint() {
    if (!yearJumpHint) return;
    yearJumpHint.hidden = true;
    yearJumpHint.textContent = "";
  }

  function commitYearJump(force = false) {
    clearTimeout(yearJumpTimer);
    yearJumpTimer = null;
    const digits = yearJumpBuffer;
    if (!digits) {
      hideYearJumpHint();
      return;
    }
    if (!force && digits.length < 2) return;

    const year = resolveYearShortcut(digits);
    yearJumpBuffer = "";
    if (year == null) {
      showYearJumpHint(`нет года «${digits}»`);
      setTimeout(hideYearJumpHint, 900);
      return;
    }
    showYearJumpHint(`→ ${year}`);
    setTimeout(hideYearJumpHint, 700);
    stopPlay();
    animateSliderTo(year, { withSound: true });
  }

  function onDigitYearJump(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable) {
      return;
    }
    if (
      (aboutCampModal && !aboutCampModal.hidden) ||
      (aboutLukoilModal && !aboutLukoilModal.hidden) ||
      (finaleModal && !finaleModal.hidden) ||
      (introOverlay && !introOverlay.hidden)
    ) {
      return;
    }

    if (event.key === "Enter") {
      if (yearJumpBuffer) {
        event.preventDefault();
        commitYearJump(true);
      }
      return;
    }

    if (event.key === "Escape" && yearJumpBuffer) {
      yearJumpBuffer = "";
      hideYearJumpHint();
      return;
    }

    if (event.key === "Backspace" && yearJumpBuffer) {
      event.preventDefault();
      yearJumpBuffer = yearJumpBuffer.slice(0, -1);
      if (yearJumpBuffer) showYearJumpHint(`год: ${yearJumpBuffer}…`);
      else hideYearJumpHint();
      clearTimeout(yearJumpTimer);
      if (yearJumpBuffer.length >= 2) {
        yearJumpTimer = setTimeout(() => commitYearJump(false), 650);
      }
      return;
    }

    if (!/^\d$/.test(event.key)) return;
    event.preventDefault();
    yearJumpBuffer = (yearJumpBuffer + event.key).slice(-4);
    showYearJumpHint(`год: ${yearJumpBuffer}…`);
    clearTimeout(yearJumpTimer);
    if (yearJumpBuffer.length === 4) {
      commitYearJump(true);
      return;
    }
    if (yearJumpBuffer.length >= 2) {
      yearJumpTimer = setTimeout(() => commitYearJump(false), 650);
    }
  }

  function syncUrl(year, view) {
    if (!urlSyncReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set("year", String(year));
    url.searchParams.set("view", view);
    history.replaceState({ year, view }, "", url);
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const viewRaw = params.get("view");
    const view = ["lukoil", "sirius", "compare"].includes(viewRaw) ? viewRaw : "lukoil";
    const yearRaw = Number(params.get("year"));
    const year = Number.isFinite(yearRaw) ? yearRaw : null;
    return { view, year };
  }

  function renderQuizQuestion() {
    if (!quizPanel || !quizQuestion || !quizOptions || !quizProgress) return;
    const item = QUIZ[quizIndex];
    if (!item) return;
    quizPanel.hidden = false;
    if (quizResult) quizResult.hidden = true;
    quizProgress.textContent = `Вопрос ${quizIndex + 1} / ${QUIZ.length}`;
    quizQuestion.textContent = item.q;
    quizOptions.innerHTML = item.options
      .map(
        (opt, i) =>
          `<button type="button" class="quiz-option" data-index="${i}">${escapeHtml(opt)}</button>`
      )
      .join("");
    quizOptions.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => onQuizAnswer(Number(btn.dataset.index)));
    });
  }

  function onQuizAnswer(index) {
    const item = QUIZ[quizIndex];
    if (!item || !quizOptions) return;
    const buttons = [...quizOptions.querySelectorAll(".quiz-option")];
    buttons.forEach((btn) => {
      btn.disabled = true;
      const i = Number(btn.dataset.index);
      if (i === item.answer) btn.classList.add("is-correct");
      if (i === index && i !== item.answer) btn.classList.add("is-wrong");
    });
    if (index === item.answer) quizCorrect += 1;
    window.setTimeout(() => {
      quizIndex += 1;
      if (quizIndex < QUIZ.length) renderQuizQuestion();
      else showQuizResult();
    }, 650);
  }

  function showQuizResult() {
    if (quizPanel) quizPanel.hidden = true;
    if (!quizResult || !quizScore || !quizVerdict) return;
    quizResult.hidden = false;
    quizScore.textContent = `${quizCorrect} из ${QUIZ.length}`;
    const verdicts = [
      "Есть куда копать — прокрутите ленту ещё раз.",
      "Неплохо: основная линия уже на месте.",
      "Сильный результат — вы в теме ленты.",
      "Идеально: лента прочитана насквозь.",
    ];
    quizVerdict.textContent = verdicts[quizCorrect] || verdicts[0];
  }

  function resetQuiz() {
    quizIndex = 0;
    quizCorrect = 0;
    if (quizResult) quizResult.hidden = true;
    renderQuizQuestion();
  }

  function showFinale() {
    if (!finaleModal || finaleShown) return;
    finaleShown = true;
    resetQuiz();
    finaleModal.hidden = false;
  }

  function hideFinale() {
    if (finaleModal) finaleModal.hidden = true;
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }

  function downloadShareFrame() {
    if (!shareCanvas) return;
    const ctx = shareCanvas.getContext("2d");
    if (!ctx) return;
    const year = lastYear;
    const w = shareCanvas.width;
    const h = shareCanvas.height;
    const lukTitle = titleForYear("lukoil", year);
    const sirTitle = titleForYear("sirius", year);
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const bg = theme === "light" ? "#f7f4f2" : "#0a0f1a";
    const text = theme === "light" ? "#1a1214" : "#f4efe8";
    const muted = theme === "light" ? "#7a6468" : "#9aa3b5";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(225, 29, 56, 0.22)");
    grad.addColorStop(0.55, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(201, 160, 255, 0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#f4b41a";
    ctx.font = "600 36px Manrope, sans-serif";
    ctx.fillText("Машина времени-35", 72, 110);

    ctx.fillStyle = text;
    ctx.font = "700 180px \"Instrument Serif\", Georgia, serif";
    ctx.fillText(String(year), 72, 320);

    ctx.fillStyle = muted;
    ctx.font = "700 28px Manrope, sans-serif";
    ctx.fillText("Две судьбы одной точки", 72, 390);

    ctx.fillStyle = "#e11d38";
    ctx.font = "800 26px Manrope, sans-serif";
    ctx.fillText("ЛУКОЙЛ", 72, 480);
    ctx.fillStyle = text;
    ctx.font = "600 40px \"Instrument Serif\", Georgia, serif";
    wrapCanvasText(ctx, lukTitle, w - 144).forEach((line, i) => {
      ctx.fillText(line, 72, 540 + i * 52);
    });

    ctx.fillStyle = "#c9a0ff";
    ctx.font = "800 26px Manrope, sans-serif";
    ctx.fillText("СИРИУС", 72, 820);
    ctx.fillStyle = text;
    ctx.font = "600 40px \"Instrument Serif\", Georgia, serif";
    wrapCanvasText(ctx, sirTitle, w - 144).forEach((line, i) => {
      ctx.fillText(line, 72, 880 + i * 52);
    });

    ctx.fillStyle = muted;
    ctx.font = "600 22px Manrope, sans-serif";
    ctx.fillText("Нефтянка и Сириус: 35 лет технологий", 72, h - 72);

    shareCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mashina-vremeni-${year}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function updateLukoilCard(year, { animateCounters = true } = {}) {
    setYearDisplay(year, { animate: animateCounters });
    updateYearPhoto(year);
    const { items, isFallback } = newsForYear("lukoil", year, MIN_YEAR);
    bindNewsFeed(lukoilFeed, items, { isFallback });

    const latest = latestEvent(bySource("lukoil"), year);
    const price = latest?.oilPrice ?? 0;
    barrelsCounter.textContent = Number(price).toLocaleString("ru-RU", {
      maximumFractionDigits: 1,
    });

    const production = latest?.productionMt;
    if (productionCounter) {
      productionCounter.textContent =
        production != null
          ? Number(production).toLocaleString("ru-RU", { maximumFractionDigits: 1 })
          : "—";
    }
  }

  function updateOilMetricUI() {
    if (!oilChartTitle || !oilChartSub || !oilChart) return;
    const ds = oilChart.data.datasets[0];
    if (oilMetric === "production") {
      oilChartTitle.textContent = "Добыча нефти ЛУКОЙЛ";
      oilChartSub.textContent = "Добыча до выбранного года, млн т";
      ds.label = "Добыча, млн т";
      ds.borderColor = "#ff7a45";
      ds.backgroundColor = "rgba(255, 122, 69, 0.16)";
      ds.pointBackgroundColor = "#ff7a45";
      oilChart.options.scales.y.title.text = "млн т / год";
      oilChart.options.scales.y.title.color = "#ff7a45";
      oilChart.options.scales.y.ticks.color = "#ff7a45";
    } else {
      oilChartTitle.textContent = "Цена барреля нефти";
      oilChartSub.textContent = "Котировки до выбранного года, $/баррель";
      ds.label = "Цена нефти, $/баррель";
      ds.borderColor = "#e11d38";
      ds.backgroundColor = "rgba(225, 29, 56, 0.16)";
      ds.pointBackgroundColor = "#e11d38";
      oilChart.options.scales.y.title.text = "$ / баррель";
      oilChart.options.scales.y.title.color = "#e11d38";
      oilChart.options.scales.y.ticks.color = "#e11d38";
    }
  }

  function updateSiriusCard(year) {
    if (year < SIRIUS_MIN_YEAR) {
      bindNewsFeed(siriusFeed, []);
      if (siriusFeed) {
        siriusFeed.innerHTML = `
          <article class="news-item is-empty">
            <p class="news-empty">Лента Сириуса начинается с 2007 года — старта строительства Олимпийского парка.</p>
          </article>`;
      }
      if (siriusYearPhoto) {
        siriusYearPhoto.hidden = true;
        if (siriusYearPhotoImg) {
          siriusYearPhotoImg.removeAttribute("src");
          siriusYearPhotoImg.alt = "";
        }
        if (siriusYearPhotoCap) siriusYearPhotoCap.textContent = "";
      }
      techCounter.textContent = "—";
      return;
    }

    updateSiriusYearPhoto(year);
    const { items, isFallback } = newsForYear("sirius", year, SIRIUS_MIN_YEAR);
    bindNewsFeed(siriusFeed, items, { isFallback });
    const latest = latestEvent(bySource("sirius"), year);
    techCounter.textContent = latest ? String(latest.techIndex) : "—";
  }

  function updateOilChart(year) {
    if (!oilChart) return;
    const events = uniqueByYear(eventsUpTo(bySource("lukoil"), year));
    oilChart.data.labels = events.map((e) => String(e.year));
    oilChart.data.datasets[0].data = events.map((e) =>
      oilMetric === "production" ? e.productionMt ?? null : e.oilPrice
    );
    oilChart.options.plugins.yearMarker.year = year;
    updateOilMetricUI();
    oilChart.update("none");
  }

  function updateTechChart(year) {
    if (!techChart) return;
    const events = uniqueByYear(
      eventsUpTo(bySource("sirius"), year).filter((e) => e.year >= SIRIUS_MIN_YEAR)
    );
    techChart.data.labels = events.map((e) => String(e.year));
    techChart.data.datasets[0].data = events.map((e) => e.techIndex);
    techChart.options.plugins.yearMarker.year = year;
    techChart.update("none");
  }

  function playTick() {
    const now = performance.now();
    // Avoid stacking dozens of overlapping ticks while scrubbing fast on mobile.
    if (now - lastTickAt < 45) return;
    lastTickAt = now;

    try {
      if (playTickViaWebAudio()) return;
      if (tickBufferLoading) {
        // Buffer still loading after unlock — short synthetic click so phone isn't silent.
        if (playTickFallbackBeep()) return;
      }
      if (!tickSound) return;
      tickSound.volume = 0.32;
      tickSound.muted = false;
      try {
        tickSound.currentTime = 0;
      } catch (_) {}
      const playPromise = tickSound.play();
      if (playPromise) {
        playPromise.catch(() => {
          unlockAudio().then(() => {
            if (!playTickViaWebAudio()) playTickFallbackBeep();
          });
        });
      }
    } catch (_) {
      try {
        playTickFallbackBeep();
      } catch (__) {
        /* ignore autoplay block */
      }
    }
  }

  function onYearChange(year, { withSound = true, animateCounters = true, syncSlider = true } = {}) {
    const y = clampYear(year);
    const crossed = y !== lastYear;
    if (withSound && crossed && !isKeyYear(y)) playTick();
    if (crossed && isKeyYear(y)) flashKeyYear({ withSound });
    lastYear = y;
    if (syncSlider && !sliderDragging) slider.value = String(y);
    updateMilestoneActive(y);
    updateLukoilCard(y, { animateCounters });
    updateSiriusCard(y);
    updateOilChart(y);
    updateTechChart(y);
    updateBackground(y);
    updateEra(y);
    updateParallelBadge(y);
    updateDualFate(y);
    updateCompareParallel(y);
    updateGeoMap(y);
    syncUrl(y, currentView);
    if (y === MAX_YEAR && crossed) showFinale();
  }

  function stopSliderAnim() {
    if (sliderAnim) {
      sliderAnim();
      sliderAnim = null;
    }
  }

  function animateSliderTo(targetYear, { withSound = true } = {}) {
    stopPlay();
    stopSliderAnim();
    const from = Number(slider.value);
    const to = clampYear(targetYear);
    if (!Number.isFinite(from) || Math.abs(from - to) < 0.001) {
      onYearChange(to, { withSound: false, animateCounters: true });
      return;
    }

    let prevInt = lastYear;
    sliderAnim = animateNumber({
      from,
      to,
      duration: Math.min(900, Math.max(280, Math.abs(to - from) * 45)),
      onUpdate: (value) => {
        slider.value = String(value);
        const y = clampYear(value);
        if (y !== prevInt) {
          onYearChange(y, {
            withSound: withSound && y !== lastYear,
            animateCounters: false,
            syncSlider: false,
          });
          prevInt = y;
        }
      },
      onDone: () => {
        sliderAnim = null;
        onYearChange(to, { withSound: false, animateCounters: true, syncSlider: true });
      },
    });
  }

  function stopPlay() {
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    playBtn.classList.remove("is-playing");
    playBtn.setAttribute("aria-pressed", "false");
    playLabel.textContent = "Play";
  }

  function playStepMs() {
    return Math.max(200, MS_PER_YEAR / playSpeed);
  }

  function schedulePlayStep() {
    playTimer = setTimeout(() => {
      if (!playBtn.classList.contains("is-playing")) return;
      const next = lastYear + 1;
      if (next > MAX_YEAR) {
        stopPlay();
        return;
      }
      onYearChange(next, { withSound: true, animateCounters: false, syncSlider: true });
      if (next >= MAX_YEAR) {
        stopPlay();
        return;
      }
      schedulePlayStep();
    }, playStepMs());
  }

  function startPlay() {
    stopPlay();
    stopSliderAnim();
    playBtn.classList.add("is-playing");
    playBtn.setAttribute("aria-pressed", "true");
    playLabel.textContent = "Pause";

    const minY = activeMinYear();
    let year = clampYear(slider.value);
    if (year >= MAX_YEAR) {
      year = minY;
      onYearChange(year, { withSound: false, animateCounters: false });
    }

    schedulePlayStep();
  }

  function setPlaySpeed(speed) {
    const next = Number(speed);
    if (![0.1, 0.5, 1, 2, 3, 5].includes(next)) return;
    playSpeed = next;
    if (playSpeedGroup) {
      playSpeedGroup.querySelectorAll(".play-speed-btn").forEach((btn) => {
        const active = Number(btn.dataset.speed) === playSpeed;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (playBtn.classList.contains("is-playing")) {
      if (playTimer) {
        clearTimeout(playTimer);
        playTimer = null;
      }
      schedulePlayStep();
    }
  }

  function togglePlay() {
    if (playBtn.classList.contains("is-playing")) stopPlay();
    else startPlay();
  }

  function placeGeoMap() {
    const map = document.getElementById("geo-map");
    if (!map) return;
    if (currentView === "compare" && page) {
      page.appendChild(map);
      return;
    }
    const feed = currentView === "sirius" ? siriusFeed : lukoilFeed;
    if (feed) feed.insertAdjacentElement("afterend", map);
  }

  function setView(view) {
    currentView = view;
    document.body.dataset.view = view;

    document.querySelectorAll(".view-tab").forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    const showLukoil = view === "lukoil" || view === "compare";
    const showSirius = view === "sirius" || view === "compare";
    const isCompare = view === "compare";

    panelLukoil.classList.toggle("is-active", showLukoil);
    panelSirius.classList.toggle("is-active", showSirius);
    panelLukoil.hidden = !showLukoil;
    panelSirius.hidden = !showSirius;
    if (page) page.classList.toggle("is-compare", isCompare);
    if (compareSwipeHint) compareSwipeHint.hidden = !isCompare;

    panelLukoil.querySelectorAll(".compare-heading").forEach((el) => {
      el.hidden = !isCompare;
    });
    panelSirius.querySelectorAll(".compare-heading").forEach((el) => {
      el.hidden = !isCompare;
    });

    placeGeoMap();

    const minY = activeMinYear();
    slider.min = String(minY);
    if (Number(slider.value) < minY) {
      slider.value = String(minY);
      lastYear = minY;
    }

    buildMilestones();
    onYearChange(clampYear(slider.value), { withSound: false, animateCounters: false });
    syncUrl(lastYear, currentView);

    requestAnimationFrame(() => {
      if (showLukoil && oilChart) oilChart.resize();
      if (showSirius && techChart) techChart.resize();
    });
  }

  function milestoneLeftPercent(year) {
    const minY = activeMinYear();
    return ((year - minY) / (MAX_YEAR - minY)) * 100;
  }

  function updateMilestoneActive(year) {
    sliderMarks.querySelectorAll(".slider-mark").forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.year) === year);
    });
  }

  function buildMilestones() {
    const shortLabels = window.matchMedia("(max-width: 520px)").matches;
    sliderMarks.innerHTML = activeMilestones()
      .map((m) => {
        const left = milestoneLeftPercent(m.year);
        const label = shortLabels ? String(m.year).slice(-2) : m.label;
        // Tags crowd the bar on phones — years only there.
        const tag =
          !shortLabels && m.tag
            ? `<span class="slider-mark-tag">${m.tag}</span>`
            : "";
        return `
        <button
          type="button"
          class="slider-mark${m.tag && !shortLabels ? " has-tag" : ""}"
          data-year="${m.year}"
          style="left:${left}%"
          title="${m.tag ? `${m.tag} · ${m.year}` : `Перейти к ${m.year}`}"
        >
          <span class="slider-mark-label">${label}</span>
          ${tag}
        </button>`;
      })
      .join("");

    sliderMarks.querySelectorAll(".slider-mark").forEach((btn) => {
      btn.addEventListener("click", () => {
        animateSliderTo(Number(btn.dataset.year), { withSound: true });
      });
    });
    updateMilestoneActive(lastYear);
  }

  const yearMarkerPlugin = {
    id: "yearMarker",
    afterDraw(chart, _args, opts) {
      const year = opts?.year;
      if (year == null) return;
      const labels = chart.data.labels || [];
      if (!labels.length) return;
      const idx = labels.findIndex((label) => Number(label) === Number(year));
      const useIdx = idx >= 0 ? idx : labels.length - 1;
      const meta = chart.getDatasetMeta(0);
      const point = meta?.data?.[useIdx];
      if (!point) return;
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.strokeStyle = opts.color || "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(point.x, chartArea.top);
      ctx.lineTo(point.x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };

  function baseChartOptions({ yTitle, yColor, legendColor, markerColor }) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 280 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: legendColor,
            font: { family: "Manrope", size: 12, weight: "700" },
          },
        },
        tooltip: {
          backgroundColor: "rgba(10, 6, 8, 0.94)",
          borderColor: "rgba(225, 29, 56, 0.45)",
          borderWidth: 1,
          titleColor: "#e11d38",
          bodyColor: "#f2e9eb",
        },
        yearMarker: {
          year: Number(slider.value),
          color: markerColor || "rgba(255, 255, 255, 0.4)",
        },
      },
      scales: {
        x: {
          ticks: { color: "#a89096", maxRotation: 0, autoSkipPadding: 12 },
          grid: { color: "rgba(225, 29, 56, 0.1)" },
        },
        y: {
          title: { display: true, text: yTitle, color: yColor },
          ticks: { color: yColor },
          grid: { color: "rgba(225, 29, 56, 0.1)" },
        },
      },
    };
  }

  function initCharts() {
    Chart.register(yearMarkerPlugin);

    oilChart = new Chart(oilCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Цена нефти, $/баррель",
            data: [],
            borderColor: "#e11d38",
            backgroundColor: "rgba(225, 29, 56, 0.16)",
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: "#e11d38",
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: baseChartOptions({
        yTitle: "$ / баррель",
        yColor: "#e11d38",
        legendColor: "#cbb4b8",
        markerColor: "rgba(225, 29, 56, 0.75)",
      }),
    });
    oilChart.options.plugins.legend.display = false;

    const techOptions = baseChartOptions({
      yTitle: "Индекс",
      yColor: "#c9a0ff",
      legendColor: "#cbb4b8",
      markerColor: "rgba(201, 160, 255, 0.8)",
    });
    techOptions.scales.y.min = 0;
    techOptions.scales.y.max = 100;
    techOptions.scales.y.grid = { color: "rgba(201, 160, 255, 0.12)" };

    techChart = new Chart(techCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Индекс технологий",
            data: [],
            borderColor: "#c9a0ff",
            backgroundColor: "rgba(201, 160, 255, 0.14)",
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: "#c9a0ff",
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: techOptions,
    });
  }

  function bindControls() {
    buildMilestones();

    const armAudioUnlock = () => {
      unlockAudio();
    };
    ["pointerdown", "touchstart", "click"].forEach((type) => {
      document.addEventListener(type, armAudioUnlock, { capture: true, passive: true, once: true });
    });

    const endDrag = () => {
      if (!sliderDragging) return;
      sliderDragging = false;
      onYearChange(clampYear(slider.value), {
        withSound: false,
        animateCounters: true,
        syncSlider: true,
      });
    };

    slider.addEventListener("pointerdown", () => {
      unlockAudio();
      stopPlay();
      stopSliderAnim();
      sliderDragging = true;
    });
    slider.addEventListener("touchstart", () => {
      unlockAudio();
    }, { passive: true });

    slider.addEventListener("pointerup", endDrag);
    slider.addEventListener("pointercancel", endDrag);
    slider.addEventListener("change", endDrag);

    slider.addEventListener("input", () => {
      unlockAudio();
      stopPlay();
      const y = clampYear(slider.value);
      if (y !== lastYear) {
        onYearChange(y, { withSound: true, animateCounters: false, syncSlider: false });
      }
    });

    playBtn.addEventListener("click", () => {
      unlockAudio();
      togglePlay();
    });
    if (playSpeedGroup) {
      playSpeedGroup.querySelectorAll(".play-speed-btn").forEach((btn) => {
        btn.addEventListener("click", () => setPlaySpeed(btn.dataset.speed));
      });
    }
    document.querySelectorAll(".view-tab").forEach((tab) => {
      tab.addEventListener("click", () => setView(tab.dataset.view));
    });
    document.querySelectorAll(".site-header-logo-btn[data-view]").forEach((logo) => {
      logo.addEventListener("click", () => setView(logo.dataset.view));
    });
    document.querySelectorAll(".chart-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        oilMetric = btn.dataset.metric;
        document.querySelectorAll(".chart-toggle-btn").forEach((b) => {
          b.classList.toggle("is-active", b === btn);
        });
        updateOilChart(clampYear(slider.value));
      });
    });

    const milestoneMq = window.matchMedia("(max-width: 520px)");
    const onMilestoneMq = () => buildMilestones();
    if (milestoneMq.addEventListener) milestoneMq.addEventListener("change", onMilestoneMq);
    else if (milestoneMq.addListener) milestoneMq.addListener(onMilestoneMq);

    const siteHeader = document.getElementById("site-header");
    const headerToggle = document.getElementById("header-toggle");
    const headerToggleLabel = document.getElementById("header-toggle-label");
    if (siteHeader && headerToggle) {
      headerToggle.addEventListener("click", () => {
        const collapsed = siteHeader.classList.toggle("is-collapsed");
        headerToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        const label = collapsed ? "Показать шапку" : "Скрыть шапку";
        headerToggle.title = label;
        if (headerToggleLabel) headerToggleLabel.textContent = label;
      });

      let themeSwitching = false;
      siteHeader.addEventListener("click", (event) => {
        if (event.target.closest("button, a, input, label, select, textarea")) return;
        if (themeSwitching) return;
        const root = document.documentElement;
        const next = root.dataset.theme === "light" ? "dark" : "light";
        const veil = document.getElementById("theme-veil");
        themeSwitching = true;

        const applyTheme = () => {
          root.dataset.theme = next;
          try {
            localStorage.setItem("mt35-theme", next);
          } catch (err) {}
          document.body.style.removeProperty("--glow-a");
          updateBackground(lastYear);
          dismissThemeTip();
          siteHeader.title =
            next === "light"
              ? "Нажмите на шапку, чтобы включить тёмную тему"
              : "Нажмите на шапку, чтобы включить светлую тему";
        };

        if (!veil) {
          applyTheme();
          themeSwitching = false;
          return;
        }

        veil.classList.add("is-visible");
        window.setTimeout(() => {
          applyTheme();
          window.setTimeout(() => {
            veil.classList.remove("is-visible");
            themeSwitching = false;
          }, 280);
        }, 220);
      });
    }

    if (finaleClose) finaleClose.addEventListener("click", hideFinale);
    if (finaleReplay) {
      finaleReplay.addEventListener("click", () => {
        hideFinale();
        finaleShown = false;
        animateSliderTo(activeMinYear(), { withSound: false });
      });
    }
    if (finaleModal) {
      finaleModal.addEventListener("click", (event) => {
        if (event.target === finaleModal) hideFinale();
      });
    }
    if (shareFrameBtn) shareFrameBtn.addEventListener("click", downloadShareFrame);
    document.querySelectorAll(".dual-fate-card[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });
    if (compareEcho) compareEcho.addEventListener("click", jumpEchoChain);
    if (compareEchoNote) compareEchoNote.addEventListener("click", jumpEchoChain);
    document.querySelectorAll(".geo-point[data-point]").forEach((btn) => {
      btn.addEventListener("click", () => jumpToMapPoint(btn.dataset.point));
    });

    function showAboutCamp() {
      if (!aboutCampModal) return;
      if (aboutLukoilModal) aboutLukoilModal.hidden = true;
      aboutCampModal.hidden = false;
      if (aboutCampClose) aboutCampClose.focus();
    }

    function hideAboutCamp() {
      if (aboutCampModal) aboutCampModal.hidden = true;
    }

    function showAboutLukoil() {
      if (!aboutLukoilModal) return;
      if (aboutCampModal) aboutCampModal.hidden = true;
      aboutLukoilModal.hidden = false;
      if (aboutLukoilClose) aboutLukoilClose.focus();
    }

    function hideAboutLukoil() {
      if (aboutLukoilModal) aboutLukoilModal.hidden = true;
    }

    if (aboutCampOpen) aboutCampOpen.addEventListener("click", showAboutCamp);
    if (aboutCampClose) aboutCampClose.addEventListener("click", hideAboutCamp);
    if (aboutCampModal) {
      aboutCampModal.addEventListener("click", (event) => {
        if (event.target === aboutCampModal) hideAboutCamp();
      });
    }
    if (aboutLukoilOpen) aboutLukoilOpen.addEventListener("click", showAboutLukoil);
    if (aboutLukoilClose) aboutLukoilClose.addEventListener("click", hideAboutLukoil);
    if (aboutLukoilModal) {
      aboutLukoilModal.addEventListener("click", (event) => {
        if (event.target === aboutLukoilModal) hideAboutLukoil();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (aboutCampModal && !aboutCampModal.hidden) hideAboutCamp();
        else if (aboutLukoilModal && !aboutLukoilModal.hidden) hideAboutLukoil();
        else if (finaleModal && !finaleModal.hidden) hideFinale();
      }

      const tag = event.target && event.target.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (event.target && event.target.isContentEditable);
      const blocked =
        (aboutCampModal && !aboutCampModal.hidden) ||
        (aboutLukoilModal && !aboutLukoilModal.hidden) ||
        (finaleModal && !finaleModal.hidden) ||
        (introOverlay && !introOverlay.hidden);

      if (!typing && !blocked) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          animateSliderTo(lastYear - 1, { withSound: true });
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          animateSliderTo(lastYear + 1, { withSound: true });
          return;
        }
        if (event.key === " " || event.code === "Space") {
          event.preventDefault();
          togglePlay();
          return;
        }
      }

      onDigitYearJump(event);
    });
  }

  function runIntro() {
    if (!introOverlay || !introYear) return Promise.resolve();
    const params = new URLSearchParams(window.location.search);
    if (params.has("year") || params.has("view") || sessionStorage.getItem("mt35-intro") === "1") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let cancelled = false;
      introOverlay.hidden = false;
      const start = performance.now();
      const duration = 3400;

      const finish = () => {
        if (cancelled) return;
        cancelled = true;
        introOverlay.classList.add("is-done");
        sessionStorage.setItem("mt35-intro", "1");
        setTimeout(() => {
          introOverlay.hidden = true;
          introOverlay.classList.remove("is-done");
          resolve();
        }, 420);
      };

      if (introSkip) introSkip.addEventListener("click", finish, { once: true });

      function tick(now) {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        const year = Math.round(MIN_YEAR + (MAX_YEAR - MIN_YEAR) * t);
        introYear.textContent = String(year);
        if (t < 1) requestAnimationFrame(tick);
        else finish();
      }
      requestAnimationFrame(tick);
    });
  }

  function dismissThemeTip() {
    if (themeTip) themeTip.hidden = true;
  }

  function showThemeTip() {
    if (!themeTip) return;
    themeTip.hidden = false;
    if (themeTipClose) {
      themeTipClose.addEventListener("click", dismissThemeTip, { once: true });
    }
    setTimeout(() => {
      if (themeTip && !themeTip.hidden) dismissThemeTip();
    }, 10000);
  }

  async function boot() {
    const historyRes = await fetch("/api/data");
    if (!historyRes.ok) throw new Error("Не удалось загрузить /api/data");
    fullHistory = await historyRes.json();
    fullHistory.sort((a, b) => a.year - b.year);
    yearImages = buildYearImageIndex(fullHistory, "lukoil");
    siriusYearImages = buildYearImageIndex(fullHistory, "sirius");

    initCharts();
    bindControls();

    const urlState = readUrlState();
    await runIntro();

    if (urlState.year != null) {
      const minForView = urlState.view === "sirius" ? SIRIUS_MIN_YEAR : MIN_YEAR;
      const y = Math.max(minForView, Math.min(MAX_YEAR, Math.round(urlState.year)));
      slider.min = String(minForView);
      slider.value = String(y);
      lastYear = y;
      displayedYear = y;
    }

    urlSyncReady = false;
    setView(urlState.view);
    urlSyncReady = true;
    syncUrl(lastYear, currentView);
    setTimeout(showThemeTip, 600);
  }

  boot().catch((err) => {
    const message = escapeHtml(String(err.message || err));
    if (lukoilFeed) {
      lukoilFeed.innerHTML = `
        <article class="news-item is-empty">
          <p class="news-empty">Не удалось загрузить ленту: ${message}</p>
        </article>`;
    }
    if (siriusFeed) {
      siriusFeed.innerHTML = `
        <article class="news-item is-empty">
          <p class="news-empty">Ошибка загрузки: ${message}</p>
        </article>`;
    }
  });
})();
