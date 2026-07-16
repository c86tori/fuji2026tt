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

  var lang = document.documentElement.lang || 'ja';
  var langCode = lang.indexOf('zh') === 0 ? 'zh-tw' : (lang.indexOf('en') === 0 ? 'en' : 'ja');
  var dayLabel = document.body.dataset.dayLabel || '';
  var dayCode = dayLabel.indexOf('24') === 0 ? '24fri' : (dayLabel.indexOf('25') === 0 ? '25sat' : '26sun');
  var viewerPrefix = langCode === 'ja' ? '' : '../';
  document.querySelectorAll('a[href$=".pdf"]').forEach(function(link){
    link.href = viewerPrefix + 'pdf-viewer.html?day=' + dayCode + '&lang=' + langCode;
    link.removeAttribute('download');
  });
  document.querySelectorAll('a[href$=".csv"]').forEach(function(link){
    link.setAttribute('download','');
  });

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
