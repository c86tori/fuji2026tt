(function(){
  'use strict';

  var style = document.createElement('style');
  style.textContent = `
    .now-line{
      border-top-width:1px!important;
      filter:drop-shadow(0 .25px .25px rgba(0,0,0,.14))!important;
      z-index:6!important;
    }
    .now-line::before{
      transform:scale(var(--now-label-scale,1));
      transform-origin:left bottom;
    }
    body[data-day-label^="24"] .mbar .focus-toggle[aria-pressed="true"]{background:#f36b21!important}
    body[data-day-label^="25"] .mbar .focus-toggle[aria-pressed="true"]{background:#2387c8!important}
    body[data-day-label^="26"] .mbar .focus-toggle[aria-pressed="true"]{background:#e83f32!important}
    .floating-time-axis{
      display:none;position:absolute;top:0;left:var(--floating-axis-offset,4px);
      width:var(--floating-axis-width,14px);height:var(--floating-axis-viewer-height,0px);
      z-index:5;pointer-events:none;will-change:transform
    }
    .floating-time-window{
      position:absolute;inset:var(--floating-axis-inset,5px) 0;overflow:hidden;border-radius:999px;
      background:rgba(255,255,255,.7);
      -webkit-backdrop-filter:saturate(1.15) blur(10px);backdrop-filter:saturate(1.15) blur(10px);
      box-shadow:inset 0 0 0 1px rgba(35,28,20,.07),0 8px 24px rgba(35,28,20,.15);
      opacity:0;transform:translate3d(-4px,0,0) scale(.97);transform-origin:center;
      transition:opacity .2s ease,transform .28s cubic-bezier(.22,1,.36,1);will-change:opacity,transform
    }
    .floating-time-axis.is-visible .floating-time-window{opacity:1;transform:translate3d(0,0,0) scale(1)}
    .floating-time-track{
      position:absolute;left:0;top:0;width:100%;height:var(--floating-axis-sheet-height,0px);
      will-change:transform
    }
    .floating-time-label{
      position:absolute;left:0;width:100%;transform:translateY(-50%);
      display:flex;align-items:center;justify-content:center;
      color:#333;font-size:var(--floating-axis-font-size,8px);font-weight:900;line-height:1;
      letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap
    }
    @media(max-width:680px){
      .viewer>.floating-time-axis-live{display:block}
    }
    @media(max-width:820px){.viewer>.floating-time-axis-landscape{display:block}}
    @media(max-width:820px) and (orientation:portrait){
      .landscape-shell>.floating-time-axis-landscape{display:block}
    }
    @media(prefers-reduced-motion:reduce){.floating-time-window{transition:opacity .12s linear;transform:none!important}}
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

  function initFloatingTimeAxis(){
    var viewer = document.querySelector('.viewer');
    if (!viewer || document.querySelector('.floating-time-axis')) return;

    var children = [].slice.call(sheet.children);
    var base = children.find(function(el){
      return el.tagName === 'IMG' && !el.classList.contains('hdr-seg');
    });
    if (!base) return;

    var timeLayer = sheet.querySelector('.time-layer');
    var landscapeShell = document.querySelector('.landscape-shell');
    var isLandscape = !!landscapeShell;
    var axis = document.createElement('div');
    axis.className = 'floating-time-axis ' + (isLandscape ? 'floating-time-axis-landscape' : 'floating-time-axis-live');
    axis.setAttribute('aria-hidden','true');
    var axisWindow = document.createElement('div');
    axisWindow.className = 'floating-time-window';
    var track = document.createElement('div');
    track.className = 'floating-time-track';
    var sourceLabels = timeLayer ? [].slice.call(timeLayer.querySelectorAll('.time-label')) : [];
    if (sourceLabels.length) {
      sourceLabels.forEach(function(source){
        var label = document.createElement('div');
        label.className = 'floating-time-label';
        label.style.top = source.style.top;
        label.textContent = source.textContent;
        track.appendChild(label);
      });
    } else {
      for (var hour=9;hour<=29;hour++) {
        var fallbackLabel = document.createElement('div');
        fallbackLabel.className = 'floating-time-label';
        fallbackLabel.style.top = (7.58 + ((hour - 9) / 20) * (96.13 - 7.58)).toFixed(3) + '%';
        fallbackLabel.textContent = hour;
        track.appendChild(fallbackLabel);
      }
    }
    axisWindow.appendChild(track);
    axis.appendChild(axisWindow);
    viewer.insertBefore(axis,sheet);

    var firstColumn = Infinity;
    [].slice.call(sheet.querySelectorAll('.pick-cell')).forEach(function(cell){
      var left = parseFloat(cell.style.left);
      if (Number.isFinite(left) && left < firstColumn) firstColumn = left;
    });
    var leftRatio = Number.isFinite(firstColumn) ? Math.max(.06,firstColumn / 100) : .071;
    var measureContext = document.createElement('canvas').getContext('2d');
    var timeAxisWidth = 0;
    var windowInset = 4;
    var axisOffset = 4;
    var isRotatedOverlay = false;
    var isVisible = false;

    function usesRotatedOverlay(){
      return isLandscape && window.matchMedia('(max-width:820px) and (orientation:portrait)').matches;
    }

    function syncHost(){
      var shouldRotate = usesRotatedOverlay();
      var target = shouldRotate ? landscapeShell : viewer;
      if (axis.parentNode !== target) {
        if (shouldRotate) landscapeShell.insertBefore(axis,viewer);
        else viewer.insertBefore(axis,sheet);
      }
      isRotatedOverlay = shouldRotate;
      axis.classList.toggle('is-rotated-overlay',shouldRotate);
    }

    function syncPosition(){
      syncHost();
      var isInView = true;
      if (isRotatedOverlay) {
        var viewerTop = viewer.offsetTop;
        var visibleTop = Math.max(viewerTop,landscapeShell.scrollTop);
        var visibleBottom = Math.min(viewerTop + viewer.clientHeight,landscapeShell.scrollTop + landscapeShell.clientHeight);
        var visibleHeight = Math.max(0,visibleBottom - visibleTop);
        axis.style.top = visibleTop.toFixed(2) + 'px';
        axis.style.left = (viewer.offsetLeft + axisOffset).toFixed(2) + 'px';
        axis.style.transform = 'none';
        axis.style.setProperty('--floating-axis-viewer-height',visibleHeight.toFixed(2)+'px');
        track.style.transform = 'translate3d(0,' + (viewerTop - visibleTop - viewer.scrollTop - windowInset).toFixed(2) + 'px,0)';
        isInView = visibleHeight > windowInset * 2 + 1;
      } else {
        axis.style.top = '';
        axis.style.left = '';
        axis.style.transform = 'translate3d(' + viewer.scrollLeft.toFixed(2) + 'px,' + viewer.scrollTop.toFixed(2) + 'px,0)';
        axis.style.setProperty('--floating-axis-viewer-height',viewer.clientHeight.toFixed(2)+'px');
        track.style.transform = 'translate3d(0,' + (-viewer.scrollTop - windowInset).toFixed(2) + 'px,0)';
      }
      var shouldShow = isInView && timeAxisWidth > 0 && viewer.scrollLeft >= Math.ceil(timeAxisWidth);
      if (shouldShow !== isVisible) {
        isVisible = shouldShow;
        axis.classList.toggle('is-visible',isVisible);
      }
    }

    function updateAxisSize(){
      var width = base.offsetWidth || sheet.offsetWidth;
      if (!width) return;
      var ratio = base.naturalWidth && base.naturalHeight ? base.naturalHeight / base.naturalWidth : 2480 / 3508;
      var height = width * ratio;
      timeAxisWidth = width * leftRatio;
      var labelFontSize = 8;
      var labelTextWidth = 0;
      if (sourceLabels.length) {
        var sourceStyle = getComputedStyle(sourceLabels[0]);
        labelFontSize = parseFloat(sourceStyle.fontSize) || 8;
        if (measureContext) {
          measureContext.font = sourceStyle.fontStyle + ' ' + sourceStyle.fontWeight + ' ' + labelFontSize + 'px ' + sourceStyle.fontFamily;
          sourceLabels.forEach(function(label){
            labelTextWidth = Math.max(labelTextWidth,measureContext.measureText(label.textContent).width);
          });
        }
      }
      if (!labelTextWidth) labelTextWidth = labelFontSize * 1.25;
      var barWidth = Math.ceil(labelTextWidth + Math.max(3,labelFontSize * .375));
      windowInset = Math.max(4,labelFontSize * .5);
      axisOffset = Math.max(4,labelFontSize * .375);
      axis.style.setProperty('--floating-axis-sheet-height',height.toFixed(2)+'px');
      axis.style.setProperty('--floating-axis-font-size',labelFontSize.toFixed(2)+'px');
      axis.style.setProperty('--floating-axis-width',barWidth.toFixed(2)+'px');
      axis.style.setProperty('--floating-axis-inset',windowInset.toFixed(2)+'px');
      axis.style.setProperty('--floating-axis-offset',axisOffset.toFixed(2)+'px');
      syncPosition();
    }

    var scrollPending = false;
    function scheduleSync(){
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(function(){scrollPending=false;syncPosition();});
    }
    viewer.addEventListener('scroll',scheduleSync,{passive:true});
    if (landscapeShell) landscapeShell.addEventListener('scroll',scheduleSync,{passive:true});

    updateAxisSize();
    if (base.complete) updateAxisSize();
    else base.addEventListener('load',updateAxisSize,{once:true});
    if ('ResizeObserver' in window) {
      var sizeObserver = new ResizeObserver(updateAxisSize);
      sizeObserver.observe(base);
      sizeObserver.observe(viewer);
      if (landscapeShell) sizeObserver.observe(landscapeShell);
    }
    window.addEventListener('resize',updateAxisSize);
  }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      try { initFloatingTimeAxis(); } catch (_e) {}
    });
  });
})();
