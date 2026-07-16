(function(){
  'use strict';

  var endUtc = new Date(document.body.dataset.endUtc || '').getTime();
  if (!Number.isFinite(endUtc)) return;

  var style = document.createElement('style');
  style.textContent = `
    .farewell-2027{
      position:fixed;inset:0;z-index:200;display:grid;place-items:center;overflow:hidden;
      pointer-events:none;visibility:hidden;opacity:0;color:#fff;
      background:radial-gradient(circle at 50% 48%,rgba(255,254,249,.16) 0 18%,rgba(20,20,20,.16) 54%,rgba(20,20,20,.5) 100%);
      -webkit-backdrop-filter:saturate(.82) blur(1.5px);backdrop-filter:saturate(.82) blur(1.5px);
    }
    .farewell-2027.is-on{visibility:visible;animation:farewellBackdrop 7s both}
    .farewell-2027__flash{position:absolute;inset:0;background:#fff;opacity:0}
    .farewell-2027.is-on .farewell-2027__flash{animation:farewellFlash 1.05s ease-out both}
    .farewell-2027__sun{
      position:absolute;left:50%;top:50%;width:min(88vw,820px);aspect-ratio:1;border-radius:50%;
      transform:translate(-50%,-50%) scale(.08);opacity:0;
      border:clamp(12px,2.4vw,30px) solid #f36b21;
      box-shadow:0 0 0 2px rgba(255,255,255,.72),0 0 70px rgba(243,107,33,.72),inset 0 0 70px rgba(243,107,33,.35);
    }
    .farewell-2027.is-on .farewell-2027__sun{animation:farewellSun 6.5s cubic-bezier(.16,.88,.23,1) both}
    .farewell-2027__rays{position:absolute;left:50%;top:50%;width:0;height:0}
    .farewell-2027__rays i{
      position:absolute;left:-2px;top:-43vh;width:4px;height:36vh;border-radius:999px;
      transform-origin:2px 43vh;transform:rotate(var(--a));
      background:linear-gradient(180deg,transparent,var(--c) 42%,rgba(255,255,255,.92),transparent);
      opacity:0;
    }
    .farewell-2027.is-on .farewell-2027__rays i{animation:farewellRay 2.6s var(--delay) ease-out both}
    .farewell-2027__confetti{position:absolute;inset:0}
    .farewell-2027__confetti i{
      position:absolute;left:var(--x);top:-12vh;width:clamp(6px,1vw,12px);height:clamp(13px,2.2vw,24px);
      border-radius:2px;background:var(--c);opacity:0;transform:rotate(var(--r));
    }
    .farewell-2027.is-on .farewell-2027__confetti i{animation:farewellConfetti var(--d) var(--delay) cubic-bezier(.18,.7,.36,1) both}
    .farewell-2027__message{
      position:relative;z-index:3;width:min(94vw,1180px);padding:24px 10px;text-align:center;
      transform:scale(.28) rotate(-7deg);opacity:0;
    }
    .farewell-2027.is-on .farewell-2027__message{animation:farewellMessage 7s cubic-bezier(.17,.89,.25,1.22) both}
    .farewell-2027__eyebrow{
      display:inline-block;margin:0 0 clamp(14px,2vw,24px);padding:8px 16px;border-radius:999px;
      background:#111;color:#fffef9;font-size:clamp(11px,1.7vw,19px);font-weight:1000;
      letter-spacing:.13em;box-shadow:0 5px 0 #f36b21,0 12px 28px rgba(0,0,0,.28);
    }
    .farewell-2027__title{
      margin:0;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;
      font-size:clamp(54px,12.4vw,176px);font-weight:1000;line-height:.78;letter-spacing:-.075em;
      text-transform:uppercase;-webkit-text-stroke:clamp(1px,.22vw,3px) #111;
      text-shadow:0 .045em 0 #111,0 .085em 0 #f36b21,0 .13em 24px rgba(0,0,0,.42);
    }
    .farewell-2027__title span{display:block}
    .farewell-2027__title span:last-child{
      margin-top:.17em;color:#fffef9;background:linear-gradient(90deg,#f36b21 0 16%,#f4c430 28%,#55c3cf 43%,#68a93a 57%,#c84d80 72%,#f36b21 88%);
      background-size:240% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
    }
    .farewell-2027.is-on .farewell-2027__title span:last-child{animation:farewellColor 1.15s linear infinite}
    .farewell-2027__rule{
      width:min(78vw,720px);height:9px;margin:clamp(24px,4vw,48px) auto 0;border-radius:999px;
      background:linear-gradient(90deg,#68a93a,#8b8b8b,#f05a4a,#55c3cf,#f4a03a,#c84d80,#43b7ad,#a0a312,#356aa2);
      box-shadow:0 5px 0 #111,0 10px 24px rgba(0,0,0,.3);
    }
    @keyframes farewellBackdrop{0%{opacity:0}7%,78%{opacity:1}100%{opacity:0}}
    @keyframes farewellFlash{0%{opacity:.95}20%{opacity:.18}100%{opacity:0}}
    @keyframes farewellSun{0%{opacity:0;transform:translate(-50%,-50%) scale(.08)}13%{opacity:1}52%{opacity:.88;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}
    @keyframes farewellRay{0%{opacity:0;filter:blur(4px)}18%{opacity:.9}100%{opacity:0;filter:blur(0)}}
    @keyframes farewellMessage{0%{opacity:0;transform:scale(.28) rotate(-7deg)}9%{opacity:1;transform:scale(1.08) rotate(1.5deg)}14%,78%{opacity:1;transform:scale(1) rotate(0)}100%{opacity:0;transform:scale(1.12) rotate(0)}}
    @keyframes farewellConfetti{0%{opacity:0;transform:translate3d(0,-8vh,0) rotate(var(--r))}8%{opacity:1}100%{opacity:.95;transform:translate3d(var(--drift),124vh,0) rotate(calc(var(--r) + 820deg))}}
    @keyframes farewellColor{to{background-position:240% 0}}
    @media(max-width:680px){
      .farewell-2027__message{padding:18px 8px}
      .farewell-2027__title{font-size:clamp(52px,16vw,88px);line-height:.82;letter-spacing:-.065em}
      .farewell-2027__eyebrow{letter-spacing:.08em}
      .farewell-2027__sun{width:112vw}
    }
    @media(prefers-reduced-motion:reduce){
      .farewell-2027.is-on{animation:farewellBackdrop 5.5s both}
      .farewell-2027.is-on .farewell-2027__message{animation:farewellMessage 5.5s ease-out both}
      .farewell-2027__sun,.farewell-2027__rays,.farewell-2027__confetti{display:none}
      .farewell-2027.is-on .farewell-2027__title span:last-child{animation:none}
    }
  `;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'farewell-2027';
  overlay.id = 'farewell2027';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<div class="farewell-2027__flash" aria-hidden="true"></div>' +
    '<div class="farewell-2027__sun" aria-hidden="true"></div>' +
    '<div class="farewell-2027__rays" aria-hidden="true"></div>' +
    '<div class="farewell-2027__confetti" aria-hidden="true"></div>' +
    '<div class="farewell-2027__message">' +
      '<div class="farewell-2027__eyebrow">FUJI ROCK FESTIVAL \'26</div>' +
      '<div class="farewell-2027__title" aria-label="SEE YOU IN 2027!!">' +
        '<span aria-hidden="true">SEE YOU</span><span aria-hidden="true">IN 2027!!</span>' +
      '</div>' +
      '<div class="farewell-2027__rule" aria-hidden="true"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var colors = ['#f36b21','#68a93a','#f05a4a','#55c3cf','#f4c430','#c84d80','#43b7ad','#356aa2','#fffef9'];
  var rays = overlay.querySelector('.farewell-2027__rays');
  for (var r = 0; r < 24; r++) {
    var ray = document.createElement('i');
    ray.style.setProperty('--a', (r * 15) + 'deg');
    ray.style.setProperty('--c', colors[r % colors.length]);
    ray.style.setProperty('--delay', ((r % 5) * .035) + 's');
    rays.appendChild(ray);
  }

  var confetti = overlay.querySelector('.farewell-2027__confetti');
  for (var i = 0; i < 64; i++) {
    var piece = document.createElement('i');
    piece.style.setProperty('--x', ((i * 37) % 101) + '%');
    piece.style.setProperty('--c', colors[i % colors.length]);
    piece.style.setProperty('--r', ((i * 53) % 180) + 'deg');
    piece.style.setProperty('--d', (3.6 + (i % 8) * .28) + 's');
    piece.style.setProperty('--delay', (.2 + (i % 13) * .085) + 's');
    piece.style.setProperty('--drift', (((i * 29) % 120) - 60) + 'px');
    confetti.appendChild(piece);
  }

  var shown = false;
  var watchTimer = 0;

  function displayTime(){
    if (typeof getDisplayNow === 'function') {
      var display = getDisplayNow();
      if (display && display.date && !display.invalid) return display.date.getTime();
    }
    return Date.now();
  }

  function showFarewell(){
    if (shown) return;
    shown = true;
    if (watchTimer) window.clearInterval(watchTimer);
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-on');
    window.setTimeout(function(){
      overlay.classList.remove('is-on');
      overlay.setAttribute('aria-hidden', 'true');
    }, 7200);
  }

  function checkFarewell(){
    if (displayTime() >= endUtc) showFarewell();
  }

  watchTimer = window.setInterval(checkFarewell, 1000);
  checkFarewell();
})();
