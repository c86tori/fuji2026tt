(function(){
  'use strict';

  var style = document.createElement('style');
  style.textContent = `
    .now-line{
      border-top-width:1px!important;
      filter:drop-shadow(0 .25px .25px rgba(0,0,0,.14))!important;
    }
    .now-line::before{
      transform:scale(var(--now-label-scale,1));
      transform-origin:left bottom;
    }
    body[data-day-label^="24"] .mbar .focus-toggle[aria-pressed="true"]{background:#f36b21!important}
    body[data-day-label^="25"] .mbar .focus-toggle[aria-pressed="true"]{background:#2387c8!important}
    body[data-day-label^="26"] .mbar .focus-toggle[aria-pressed="true"]{background:#e83f32!important}
  `;
  document.head.appendChild(style);

  var sheet = document.querySelector('.sheet');
  if (!sheet) return;

  function syncNowLabelScale(){
    var zoom = parseFloat(getComputedStyle(sheet).getPropertyValue('--zscale'));
    var scale = Number.isFinite(zoom) && zoom <= .9005 ? Math.max(zoom, .01) : 1;
    var value = scale.toFixed(3);
    if (sheet.style.getPropertyValue('--now-label-scale') !== value) {
      sheet.style.setProperty('--now-label-scale', value);
    }
  }

  syncNowLabelScale();
  new MutationObserver(syncNowLabelScale).observe(sheet, {
    attributes:true,
    attributeFilter:['style']
  });
  window.addEventListener('resize', syncNowLabelScale);
})();
