/* ============================================================
   Countdown to the Vorscorp public launch.

   Target: 15 October 2026, 00:00:00 Malaysia Time (UTC+08:00).

   The target is an absolute instant. The offset is written into the
   timestamp, so the value parses to the same epoch millisecond in
   every timezone the page is read from. No local-time arithmetic,
   no hardcoded display values.
   ============================================================ */

(function () {
  "use strict";

  var TARGET_ISO = "2026-10-15T00:00:00+08:00";
  var TARGET = Date.parse(TARGET_ISO);

  var counter   = document.querySelector("[data-counter]");
  var label     = document.querySelector("[data-counter-label]");
  var note      = document.querySelector("[data-note]");
  var spoken    = document.querySelector("[data-counter-text]");
  if (!counter) return;

  var fields = {
    days:    counter.querySelector('[data-unit="days"]'),
    hours:   counter.querySelector('[data-unit="hours"]'),
    minutes: counter.querySelector('[data-unit="minutes"]'),
    seconds: counter.querySelector('[data-unit="seconds"]')
  };

  var timer = null;
  var launched = false;
  var lastSpokenMinute = null;

  function pad(value, size) {
    var out = String(value);
    while (out.length < size) out = "0" + out;
    return out;
  }

  function write(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function plural(value, word) {
    return value + " " + word + (value === 1 ? "" : "s");
  }

  /* At zero the page states the fact rather than counting past it. */
  function launch() {
    if (launched) return;
    launched = true;

    counter.classList.add("counter--launched");
    counter.innerHTML = "";
    var state = document.createElement("span");
    state.className = "counter__state";
    state.textContent = "Launched";
    counter.appendChild(state);

    if (label) label.textContent = "Status · UTC+08:00";
    if (note) note.textContent = "Vorscorp is live.";
    if (spoken) spoken.textContent = "Vorscorp launched on 15 October 2026.";

    if (timer) clearTimeout(timer);
    timer = null;
  }

  function render() {
    var remaining = TARGET - Date.now();

    if (remaining <= 0) {
      launch();
      return false;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var days    = Math.floor(totalSeconds / 86400);
    var hours   = Math.floor(totalSeconds / 3600) % 24;
    var minutes = Math.floor(totalSeconds / 60) % 60;
    var seconds = totalSeconds % 60;

    write(fields.days,    pad(days, 2));
    write(fields.hours,   pad(hours, 2));
    write(fields.minutes, pad(minutes, 2));
    write(fields.seconds, pad(seconds, 2));

    /* The digits are aria-hidden and change every second. Assistive
       technology gets a stable sentence instead, refreshed once a
       minute, and never announced unprompted. */
    if (spoken && minutes !== lastSpokenMinute) {
      lastSpokenMinute = minutes;
      spoken.textContent =
        "Vorscorp launches on 15 October 2026 at midnight Malaysia time, in " +
        plural(days, "day") + ", " + plural(hours, "hour") + " and " +
        plural(minutes, "minute") + ".";
    }

    return true;
  }

  /* Ticks are re-aimed at the next whole second every time, so the
     display cannot drift or skip after the tab has been backgrounded. */
  function tick() {
    if (!render()) return;
    timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
  }

  function restart() {
    if (launched) return;
    if (timer) clearTimeout(timer);
    tick();
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) restart();
  });

  tick();
})();
