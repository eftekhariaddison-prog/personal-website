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
  var FLY_MS_MIN = 4600;
  var FLY_MS_MAX = 7800;
  var STAGGER_MS = 1800;
  var PREEMPT_MS = 900;
  var RETURN_MS = 1300;

  var container = document.createElement('div');
  container.className = 'windstorm';
  container.setAttribute('aria-hidden', 'true');

  function setViewportPx() {
    var vw = window.innerWidth + 'px';
    var vh = window.innerHeight + 'px';
    document.documentElement.style.setProperty('--vwpx', vw);
    document.documentElement.style.setProperty('--vhpx', vh);
  }
  setViewportPx();
  setTimeout(setViewportPx, 50);
  window.addEventListener('resize', setViewportPx, { passive: true });

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
    var wobble = 70 + Math.random() * 100;
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

  var ambientPetals = Array.prototype.slice.call(document.querySelectorAll('.petal')).map(function (petal) {
    var wrap = document.createElement('span');
    wrap.className = 'petal-wrap ' + Array.prototype.slice.call(petal.classList)
      .filter(function (c) { return c !== 'petal'; })
      .map(function (c) { return c.replace('petal--', 'petal-wrap--'); })
      .join(' ');
    petal.parentNode.insertBefore(wrap, petal);
    wrap.appendChild(petal);
    return wrap;
  });

  var idleTimer = null;
  var stormRunning = false;
  var mainStormMs = FADE_MS + STAGGER_MS + FLY_MS_MAX + FADE_MS;

  function scheduleIdleCheck() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerWindstorm, INACTIVITY_MS);
  }

  function triggerWindstorm() {
    if (stormRunning) return;
    stormRunning = true;

    // Ambient petals blow off screen first, ahead of the main storm.
    ambientPetals.forEach(function (p) {
      p.classList.remove('storm-return');
      p.classList.add('storm-exit');
    });

    setTimeout(function () {
      leaves.forEach(function (leaf) { leaf.classList.remove('windstorm-fly'); });
      container.classList.add('windstorm-active');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          leaves.forEach(function (leaf) { leaf.classList.add('windstorm-fly'); });
        });
      });

      setTimeout(function () {
        // Storm fading out: bring the ambient petals gently back at the same time.
        container.classList.remove('windstorm-active');
        ambientPetals.forEach(function (p) {
          p.classList.remove('storm-exit');
          p.classList.add('storm-return');
        });

        setTimeout(function () {
          ambientPetals.forEach(function (p) { p.classList.remove('storm-return'); });
          stormRunning = false;
          scheduleIdleCheck();
        }, Math.max(FADE_MS, RETURN_MS));
      }, mainStormMs - FADE_MS);
    }, PREEMPT_MS);
  }

  ['mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'].forEach(function (evt) {
    window.addEventListener(evt, function () {
      if (!stormRunning) scheduleIdleCheck();
    }, { passive: true });
  });

  scheduleIdleCheck();
})();
