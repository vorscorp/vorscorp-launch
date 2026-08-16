/* ============================================================
   Scramble — word-level character resolution.

   Any element carrying `class="scramble"` opts in. Each element is
   independent: hovering one word never touches its neighbours.

   Behaviour on activation (hover or keyboard focus):
     1. the word's rendered width is locked, so the line never reflows
     2. every character becomes a fixed-width cell
     3. cells resolve left to right over a duration derived from length
     4. the original string is always restored, exactly

   Not enabled on touch devices or under prefers-reduced-motion.
   ============================================================ */

(function () {
  "use strict";

  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&$@!?*+=/<>";

  /* Deterministic timing: a word's animation always takes the same
     time, and no word runs longer than SETTLE_MAX. */
  var PER_CHAR   = 30;   /* ms added per character */
  var BASE       = 200;  /* ms floor               */
  var SETTLE_MAX = 620;  /* ms ceiling             */
  var ROLL       = 55;   /* ms between re-rolls; slower than a frame,
                            which is what keeps it from flickering   */

  var hoverQuery  = window.matchMedia("(hover: hover) and (pointer: fine)");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  var measurer = document.createElement("canvas").getContext("2d");
  var metricsCache = {};
  var elements = [];
  var enabled = false;

  /* Substitute glyphs are chosen by width, so a random character can
     never be wider than the cell holding it. Without this, a 'W'
     landing in a cell sized for an 'i' overlaps its neighbours. */
  function metricsFor(font, tracking) {
    var key = font + "|" + tracking;
    if (metricsCache[key]) return metricsCache[key];

    measurer.font = font;
    var table = [];
    for (var i = 0; i < CHARS.length; i++) {
      var ch = CHARS.charAt(i);
      table.push({ ch: ch, w: measurer.measureText(ch).width + tracking });
    }
    table.sort(function (a, b) { return a.w - b.w; });

    var entry = { chars: [], widths: [] };
    for (var j = 0; j < table.length; j++) {
      entry.chars.push(table[j].ch);
      entry.widths.push(table[j].w);
    }
    metricsCache[key] = entry;
    return entry;
  }

  /* Narrowest-first table, so a binary search gives the count of
     glyphs that fit. Selection is biased to the widest of those: a
     substitute close to the width it replaces keeps the scrambling
     word looking like text rather than a gap-toothed row. */
  function pickChar(entry, maxWidth, avoid) {
    var lo = 0, hi = entry.widths.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (entry.widths[mid] <= maxWidth) lo = mid + 1; else hi = mid;
    }
    if (lo === 0) return entry.chars[0];

    var floorIndex = Math.floor(lo * 0.45);
    var span = lo - floorIndex;

    var pick = entry.chars[floorIndex + ((Math.random() * span) | 0)];
    if (pick === avoid && span > 1) {
      pick = entry.chars[floorIndex + ((Math.random() * span) | 0)];
    }
    return pick;
  }

  /* Per-character advance widths in the element's own computed font,
     normalised so the cells sum to the word's real rendered width.
     Normalising absorbs kerning, so nothing shifts and nothing clips. */
  function measure(el, text, targetWidth) {
    var cs = getComputedStyle(el);
    var font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;

    var tracking = parseFloat(cs.letterSpacing);
    if (isNaN(tracking)) tracking = 0;

    measurer.font = font;

    var widths = [];
    var sum = 0;
    for (var i = 0; i < text.length; i++) {
      var w = measurer.measureText(text.charAt(i)).width + tracking;
      if (!(w > 0)) w = 0;
      widths.push(w);
      sum += w;
    }

    if (sum > 0 && targetWidth > 0) {
      var scale = targetWidth / sum;
      for (var j = 0; j < widths.length; j++) widths[j] *= scale;
    }

    return { widths: widths, entry: metricsFor(font, tracking) };
  }

  function Scramble(el) {
    this.el = el;
    this.text = el.textContent;
    this.running = false;
    this.frame = 0;

    this.onEnter = this.start.bind(this);
    el.addEventListener("mouseenter", this.onEnter);
    el.addEventListener("focus", this.onEnter);
  }

  Scramble.prototype.start = function () {
    /* Repeated or rapid hovering is absorbed: a run in progress is
       allowed to finish rather than restarting mid-word. */
    if (this.running || !enabled) return;

    var el = this.el;
    var text = this.text;
    if (!text.length) return;

    var lockedWidth = el.getBoundingClientRect().width;
    var metrics = measure(el, text, lockedWidth);
    var widths = metrics.widths;
    var entry = metrics.entry;

    var cells = [];
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var cell = document.createElement("span");
      cell.className = "scramble__cell";
      cell.style.width = widths[i] + "px";
      cell.textContent = text.charAt(i);
      fragment.appendChild(cell);
      cells.push(cell);
    }

    el.style.width = lockedWidth + "px";
    el.textContent = "";
    el.appendChild(fragment);

    this.running = true;

    var duration = Math.min(SETTLE_MAX, BASE + text.length * PER_CHAR);
    var startedAt = performance.now();
    var lastRoll = -Infinity;
    var self = this;

    function step(now) {
      var progress = (now - startedAt) / duration;
      if (progress > 1) progress = 1;

      var resolved = Math.floor(progress * text.length);
      var reroll = now - lastRoll >= ROLL;
      if (reroll) lastRoll = now;

      for (var k = 0; k < cells.length; k++) {
        var original = text.charAt(k);
        if (k < resolved || original === " ") {
          if (cells[k].textContent !== original) cells[k].textContent = original;
        } else if (reroll) {
          cells[k].textContent = pickChar(entry, widths[k], cells[k].textContent);
        }
      }

      if (progress < 1) {
        self.frame = requestAnimationFrame(step);
      } else {
        self.finish();
      }
    }

    this.frame = requestAnimationFrame(step);
  };

  /* The word always returns to its exact original string and to
     natural, unlocked width. */
  Scramble.prototype.finish = function () {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.el.textContent = this.text;
    this.el.style.width = "";
    this.running = false;
  };

  function setEnabled(next) {
    if (next === enabled) return;
    enabled = next;

    for (var i = 0; i < elements.length; i++) {
      var item = elements[i];
      if (enabled) {
        /* Focusable only when the interaction actually exists, so no
           dead tab stops are introduced otherwise. */
        item.el.setAttribute("tabindex", "0");
      } else {
        item.el.removeAttribute("tabindex");
        if (item.running) item.finish();
      }
    }
  }

  function init() {
    var nodes = document.querySelectorAll(".scramble");
    for (var i = 0; i < nodes.length; i++) elements.push(new Scramble(nodes[i]));

    var reevaluate = function () {
      setEnabled(hoverQuery.matches && !motionQuery.matches);
    };
    reevaluate();

    /* addEventListener on MediaQueryList is not universal; fall back. */
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", reevaluate);
      hoverQuery.addEventListener("change", reevaluate);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(reevaluate);
      hoverQuery.addListener(reevaluate);
    }

    /* A font-size change invalidates cached glyph metrics only by
       key, so nothing stale is reused; cells are re-measured on every
       activation regardless. */
  }

  /* Character widths are measured against the loaded webfont, so wait
     for it. document.fonts is universal in supported browsers; the
     fallback simply runs immediately. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
