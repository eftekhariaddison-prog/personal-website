document.querySelectorAll('[data-year]').forEach(function (node) {
  node.textContent = new Date().getFullYear();
});

(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var scriptEl = document.currentScript;
  var assetBase = scriptEl ? scriptEl.src.replace(/site\.js(\?.*)?$/, '') : 'assets/';

  var leafFiles = ['petal-poppy.svg', 'leaf-sage.svg', 'petal-poppy.svg', 'bud-lavender.svg', 'leaf-sage.svg', 'petal-poppy.svg'];
  var LEAF_COUNT = 16;
  var INACTIVITY_MS = 30000;
  var FADE_MS = 1200;
  var FLY_MS_MIN = 3200;
  var FLY_MS_MAX = 5600;
  var STAGGER_MS = 1800;

  var container = document.createElement('div');
  container.className = 'windstorm';
  container.setAttribute('aria-hidden', 'true');

  var leaves = [];
  for (var i = 0; i < LEAF_COUNT; i++) {
    var img = document.createElement('img');
    img.className = 'windstorm-leaf';
    img.src = assetBase + leafFiles[i % leafFiles.length];
    img.alt = '';
    var top = 2 + Math.random() * 92;
    var size = 20 + Math.random() * 28;
    var duration = (FLY_MS_MIN + Math.random() * (FLY_MS_MAX - FLY_MS_MIN)) / 1000;
    var delay = (Math.random() * STAGGER_MS) / 1000;
    var rotStart = Math.random() * 360;
    var wobble = 18 + Math.random() * 46;
    img.style.top = top + '%';
    img.style.width = size + 'px';
    img.style.setProperty('--duration', duration + 's');
    img.style.setProperty('--delay', delay + 's');
    img.style.setProperty('--rot', rotStart + 'deg');
    img.style.setProperty('--wobble', wobble + 'px');
    container.appendChild(img);
    leaves.push(img);
  }

  function onReady() {
    document.body.appendChild(container);
  }
  if (document.body) onReady();
  else document.addEventListener('DOMContentLoaded', onReady);

  var idleTimer = null;
  var stormRunning = false;
  var totalStormMs = FADE_MS + STAGGER_MS + FLY_MS_MAX + FADE_MS;

  function scheduleIdleCheck() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerWindstorm, INACTIVITY_MS);
  }

  function triggerWindstorm() {
    if (stormRunning) return;
    stormRunning = true;
    leaves.forEach(function (leaf) { leaf.classList.remove('windstorm-fly'); });
    container.classList.add('windstorm-active');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        leaves.forEach(function (leaf) { leaf.classList.add('windstorm-fly'); });
      });
    });
    setTimeout(function () {
      container.classList.remove('windstorm-active');
      setTimeout(function () {
        stormRunning = false;
        scheduleIdleCheck();
      }, FADE_MS);
    }, totalStormMs - FADE_MS);
  }

  ['mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'].forEach(function (evt) {
    window.addEventListener(evt, function () {
      if (!stormRunning) scheduleIdleCheck();
    }, { passive: true });
  });

  scheduleIdleCheck();
})();
