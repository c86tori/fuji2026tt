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
      display:none;position:sticky;top:0;left:var(--floating-axis-offset,4px);
      width:var(--floating-axis-width,14px);height:var(--floating-axis-viewer-height,0px);
      margin-left:var(--floating-axis-offset,4px);
      margin-bottom:calc(-1 * var(--floating-axis-viewer-height,0px));
      z-index:5;pointer-events:none
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
    .pick-cell.has-artist-intro{
      -webkit-touch-callout:none;-webkit-user-select:none;user-select:none
    }
    .artist-intro-layer{
      position:fixed;inset:0;z-index:100;visibility:hidden;pointer-events:none;
      transition:visibility 0s linear .38s
    }
    .artist-intro-layer.is-open{
      visibility:visible;pointer-events:auto;transition-delay:0s
    }
    .artist-intro-backdrop{
      position:absolute;inset:0;background:rgba(16,14,12,.48);
      -webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
      opacity:0;transition:opacity .28s ease
    }
    .artist-intro-layer.is-open .artist-intro-backdrop{opacity:1}
    .artist-intro-sheet{
      --artist-intro-accent:#f36b21;
      position:absolute;left:50%;bottom:0;width:min(100%,680px);max-height:min(78dvh,720px);
      overflow:auto;-webkit-overflow-scrolling:touch;
      box-sizing:border-box;padding:12px 22px calc(24px + env(safe-area-inset-bottom));
      border-radius:26px 26px 0 0;background:rgba(255,254,249,.97);color:#171512;
      box-shadow:0 -20px 60px rgba(16,14,12,.26);
      transform:translate3d(-50%,105%,0);
      transition:transform .38s cubic-bezier(.22,1,.36,1)
    }
    .artist-intro-layer.is-open .artist-intro-sheet{transform:translate3d(-50%,0,0)}
    .artist-intro-grip{
      width:42px;height:5px;margin:0 auto 13px;border-radius:999px;background:#d7d1c8
    }
    .artist-intro-close{
      position:absolute;top:14px;right:16px;width:38px;height:38px;padding:0;border:0;
      border-radius:50%;background:#eee9e1;color:#28231e;font:700 23px/1 system-ui,sans-serif;
      display:grid;place-items:center;cursor:pointer
    }
    .artist-intro-meta{
      margin:0 48px 7px 0;color:var(--artist-intro-accent);font:800 12px/1.35 system-ui,sans-serif;
      letter-spacing:.075em;text-transform:uppercase
    }
    .artist-intro-title{
      margin:0 48px 14px 0;font:900 clamp(25px,7.3vw,38px)/1.16 system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif;
      letter-spacing:-.035em
    }
    .artist-intro-title::after{
      content:"";display:block;width:58px;height:5px;margin-top:13px;border-radius:999px;
      background:var(--artist-intro-accent)
    }
    .artist-intro-copy{
      margin:0;color:#39342e;font:500 15px/1.88 system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif;
      letter-spacing:.015em
    }
    @media(max-height:500px){
      .artist-intro-sheet{max-height:92dvh;padding-top:9px;padding-bottom:calc(15px + env(safe-area-inset-bottom))}
      .artist-intro-grip{margin-bottom:8px}.artist-intro-title{font-size:25px;margin-bottom:10px}
      .artist-intro-title::after{height:4px;margin-top:9px}.artist-intro-copy{font-size:14px;line-height:1.72}
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
        var shellStyle = getComputedStyle(landscapeShell);
        var shellVerticalPadding = (parseFloat(shellStyle.paddingTop) || 0) + (parseFloat(shellStyle.paddingBottom) || 0);
        var nativeHeight = Math.min(viewer.clientHeight,Math.max(0,landscapeShell.clientHeight - shellVerticalPadding));
        var stickyShift = Math.max(0,landscapeShell.scrollTop - viewerTop);
        axis.style.top = '';
        axis.style.left = '';
        axis.style.marginLeft = (viewer.offsetLeft + axisOffset).toFixed(2) + 'px';
        axis.style.transform = 'none';
        axis.style.setProperty('--floating-axis-viewer-height',nativeHeight.toFixed(2)+'px');
        track.style.transform = 'translate3d(0,' + (-viewer.scrollTop - stickyShift - windowInset).toFixed(2) + 'px,0)';
        isInView = visibleHeight > windowInset * 2 + 1;
      } else {
        axis.style.top = '';
        axis.style.left = '';
        axis.style.marginLeft = '';
        axis.style.transform = 'none';
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

  function initArtistIntros(){
    var intros = {
      '\u30c6\u30ec\u30d3\u5927\u9678\u97f3\u982d': {
        title:'\u30c6\u30ec\u30d3\u5927\u9678\u97f3\u982d',
        meta:'24 FRI \u00b7 RED MARQUEE \u00b7 11:10\u201311:50',
        body:'\u672d\u5e4c\u3067\u7d50\u6210\u3055\u308c\u305f\u82e5\u304d4\u4eba\u7d44\u3002\u30dd\u30b9\u30c8\u30d1\u30f3\u30af\u306e\u92ed\u3044\u53cd\u5fa9\u3001\u5909\u5247\u7684\u306a\u30ea\u30ba\u30e0\u3001\u3080\u304d\u51fa\u3057\u306e\u30ce\u30a4\u30ba\u3092\u885d\u52d5\u7684\u306b\u9cf4\u3089\u3057\u306a\u304c\u3089\u3001\u4e0d\u610f\u306b\u8033\u306b\u6b8b\u308b\u6b4c\u3084\u30e1\u30ed\u30c7\u30a3\u3078\u7740\u5730\u3057\u307e\u3059\u3002\u6574\u3044\u3059\u304e\u3066\u3044\u306a\u3044\u6f14\u594f\u306e\u5371\u3046\u3055\u3068\u3001\u4f55\u304c\u8d77\u3053\u308b\u304b\u5206\u304b\u3089\u306a\u3044\u7dca\u5f35\u611f\u304c\u9b45\u529b\u3002ROOKIE A GO-GO\u304b\u3089\u89b3\u5ba2\u306e\u652f\u6301\u3092\u5f97\u3066RED MARQUEE\u3078\u9032\u3093\u3060\u3001\u73fe\u5728\u306e\u65e5\u672c\u306e\u82e5\u624b\u30aa\u30eb\u30bf\u30ca\u30c6\u30a3\u30d6\u3092\u8c61\u5fb4\u3059\u308b\u5b58\u5728\u3067\u3059\u3002'
      }
    };
    var cells = [].slice.call(sheet.querySelectorAll('.pick-cell'));
    var targets = cells.map(function(cell){
      var name = cell.querySelector('span');
      var intro = name ? intros[name.textContent.trim()] : null;
      return intro ? {cell:cell,intro:intro} : null;
    }).filter(Boolean);
    if (!targets.length) return;

    var layer = document.createElement('div');
    layer.className = 'artist-intro-layer';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML = '<div class="artist-intro-backdrop"></div>' +
      '<section class="artist-intro-sheet" role="dialog" aria-modal="true" aria-labelledby="artist-intro-title">' +
        '<div class="artist-intro-grip" aria-hidden="true"></div>' +
        '<button class="artist-intro-close" type="button" aria-label="\u9589\u3058\u308b">\u00d7</button>' +
        '<p class="artist-intro-meta"></p>' +
        '<h2 class="artist-intro-title" id="artist-intro-title"></h2>' +
        '<p class="artist-intro-copy"></p>' +
      '</section>';
    document.body.appendChild(layer);
    var backdrop = layer.querySelector('.artist-intro-backdrop');
    var closeButton = layer.querySelector('.artist-intro-close');
    var meta = layer.querySelector('.artist-intro-meta');
    var title = layer.querySelector('.artist-intro-title');
    var copy = layer.querySelector('.artist-intro-copy');
    var lastFocus = null;

    function isSmartphone(){
      var shortSide = Math.min(window.innerWidth,window.innerHeight);
      return shortSide <= 500 && window.matchMedia('(pointer:coarse)').matches;
    }
    function openIntro(intro){
      lastFocus = document.activeElement;
      meta.textContent = intro.meta;
      title.textContent = intro.title;
      copy.textContent = intro.body;
      layer.classList.add('is-open');
      layer.setAttribute('aria-hidden','false');
      window.setTimeout(function(){ closeButton.focus({preventScroll:true}); },220);
    }
    function closeIntro(){
      if (!layer.classList.contains('is-open')) return;
      layer.classList.remove('is-open');
      layer.setAttribute('aria-hidden','true');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({preventScroll:true});
      }
    }
    closeButton.addEventListener('click',closeIntro);
    backdrop.addEventListener('click',closeIntro);
    document.addEventListener('keydown',function(event){
      if (event.key === 'Escape') closeIntro();
    });

    targets.forEach(function(target){
      var cell = target.cell;
      var timer = 0;
      var press = null;
      var suppressClickUntil = 0;
      cell.classList.add('has-artist-intro');

      function cancelPress(){
        if (timer) window.clearTimeout(timer);
        timer = 0;
        press = null;
      }
      cell.addEventListener('pointerdown',function(event){
        if (!isSmartphone() || event.pointerType === 'mouse' || event.isPrimary === false) return;
        cancelPress();
        press = {id:event.pointerId,x:event.clientX,y:event.clientY};
        timer = window.setTimeout(function(){
          timer = 0;
          press = null;
          suppressClickUntil = Date.now() + 900;
          openIntro(target.intro);
        },2500);
      });
      cell.addEventListener('pointermove',function(event){
        if (!press || event.pointerId !== press.id) return;
        var dx = event.clientX - press.x;
        var dy = event.clientY - press.y;
        if (Math.hypot(dx,dy) > 12) cancelPress();
      },{passive:true});
      cell.addEventListener('pointerup',cancelPress);
      cell.addEventListener('pointercancel',cancelPress);
      cell.addEventListener('pointerleave',cancelPress);
      cell.addEventListener('lostpointercapture',cancelPress);
      cell.addEventListener('contextmenu',function(event){
        if (isSmartphone()) event.preventDefault();
      });
      cell.addEventListener('click',function(event){
        if (Date.now() >= suppressClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClickUntil = 0;
      },true);
      var viewer = cell.closest('.viewer');
      if (viewer) viewer.addEventListener('scroll',cancelPress,{passive:true});
      var landscapeShell = cell.closest('.landscape-shell');
      if (landscapeShell) landscapeShell.addEventListener('scroll',cancelPress,{passive:true});
    });
  }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      try { initFloatingTimeAxis(); } catch (_e) {}
      try { initArtistIntros(); } catch (_e) {}
    });
  });
})();
