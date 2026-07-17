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
    .sticky-axis-top,.sticky-axis-left,.sticky-axis-top-frame{display:none;pointer-events:none;overflow:hidden;background:#fff}
    .sticky-axis-top{
      position:sticky;top:0;width:100%;height:var(--sticky-axis-top-height,0px);
      margin-bottom:calc(-1 * var(--sticky-axis-top-height,0px));z-index:4;
      box-shadow:0 1px 0 rgba(0,0,0,.18),0 5px 12px rgba(0,0,0,.07)
    }
    .sticky-axis-left{
      position:sticky;left:0;width:var(--sticky-axis-left-width,0px);height:var(--sticky-axis-sheet-height,0px);
      margin-bottom:calc(-1 * var(--sticky-axis-sheet-height,0px));z-index:5;
      box-shadow:1px 0 0 rgba(0,0,0,.18),5px 0 12px rgba(0,0,0,.06)
    }
    .sticky-axis-top>img{width:100%!important;height:auto!important}
    .sticky-axis-left>img{
      width:var(--sticky-axis-sheet-width,0px)!important;height:auto!important;max-width:none!important
    }
    .sticky-axis-left>.time-layer{
      inset:0 auto auto 0!important;width:var(--sticky-axis-sheet-width,0px)!important;
      height:var(--sticky-axis-sheet-height,0px)!important
    }
    .sticky-axis-top-frame{
      position:sticky;top:0;width:100%;height:var(--sticky-axis-top-height,0px);
      margin-bottom:calc(-1 * var(--sticky-axis-top-height,0px));z-index:4;
      box-shadow:0 1px 0 rgba(0,0,0,.18),0 5px 12px rgba(0,0,0,.07)
    }
    .sticky-axis-top-content{
      position:relative;width:var(--sticky-axis-sheet-width,0px);height:var(--sticky-axis-top-height,0px);
      overflow:hidden;will-change:transform
    }
    .sticky-axis-top-content>img{display:block;width:var(--sticky-axis-sheet-width,0px)!important;height:auto!important;max-width:none!important}
    .sticky-axis-top-content>img.hdr-seg{position:absolute;left:0;top:0;display:none}
    .sticky-axis-top-frame.dim-on img:not(.hdr-seg){filter:grayscale(1) opacity(.4)}
    .sticky-axis-top-frame.dim-on img.hdr-seg.on{display:block}
    @media(max-width:680px){.sheet.sticky-axes-live>.sticky-axis-top,.sheet.sticky-axes-live>.sticky-axis-left{display:block}}
    @media(max-width:820px) and (orientation:portrait){
      .sheet.sticky-axes-landscape>.sticky-axis-left,.sticky-axis-top-frame{display:block}
    }
    @media(max-width:820px) and (orientation:landscape){
      .sheet.sticky-axes-landscape>.sticky-axis-top,.sheet.sticky-axes-landscape>.sticky-axis-left{display:block}
    }
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

  function initStickyAxes(){
    if (sheet.querySelector('.sticky-axis-top')) return;
    var viewer = document.querySelector('.viewer');
    if (!viewer) return;

    var children = [].slice.call(sheet.children);
    var base = children.find(function(el){
      return el.tagName === 'IMG' && !el.classList.contains('hdr-seg');
    });
    if (!base) return;

    sheet.classList.add(document.querySelector('.landscape-shell') ? 'sticky-axes-landscape' : 'sticky-axes-live');

    function cloneImage(className){
      var image = base.cloneNode(false);
      image.removeAttribute('id');
      image.alt = '';
      image.setAttribute('aria-hidden','true');
      image.className = className;
      return image;
    }

    var topAxis = document.createElement('div');
    topAxis.className = 'sticky-axis-top';
    topAxis.setAttribute('aria-hidden','true');
    topAxis.appendChild(cloneImage('sticky-axis-image'));

    var segmentPairs = [];
    var originalSegments = children.filter(function(el){
      return el.tagName === 'IMG' && el.classList.contains('hdr-seg');
    });
    originalSegments.forEach(function(original){
      var clone = original.cloneNode(false);
      clone.removeAttribute('id');
      clone.alt = '';
      clone.setAttribute('aria-hidden','true');
      clone.classList.add('sticky-axis-segment');
      topAxis.appendChild(clone);
      segmentPairs.push({ original:original, clone:clone });
    });

    var outerTopFrame = null;
    var outerTopContent = null;
    if (document.querySelector('.landscape-shell')) {
      outerTopFrame = document.createElement('div');
      outerTopFrame.className = 'sticky-axis-top-frame';
      outerTopFrame.setAttribute('aria-hidden','true');
      outerTopContent = topAxis.cloneNode(true);
      outerTopContent.className = 'sticky-axis-top-content';
      outerTopFrame.appendChild(outerTopContent);
      viewer.parentNode.insertBefore(outerTopFrame,viewer);
      var outerSegments = [].slice.call(outerTopContent.querySelectorAll('img.hdr-seg'));
      originalSegments.forEach(function(original,index){
        if (outerSegments[index]) segmentPairs.push({original:original,clone:outerSegments[index]});
      });
    }

    var leftAxis = document.createElement('div');
    leftAxis.className = 'sticky-axis-left';
    leftAxis.setAttribute('aria-hidden','true');
    leftAxis.appendChild(cloneImage('sticky-axis-image'));
    var timeLayer = sheet.querySelector('.time-layer');
    if (timeLayer) {
      var timeClone = timeLayer.cloneNode(true);
      timeClone.removeAttribute('id');
      timeClone.setAttribute('aria-hidden','true');
      leftAxis.appendChild(timeClone);
    }

    sheet.insertBefore(topAxis, base);
    sheet.insertBefore(leftAxis, base);

    function syncSegments(){
      segmentPairs.forEach(function(pair){
        pair.clone.classList.toggle('on', pair.original.classList.contains('on'));
      });
    }
    syncSegments();
    if (segmentPairs.length) {
      var segmentObserver = new MutationObserver(syncSegments);
      segmentPairs.forEach(function(pair){
        segmentObserver.observe(pair.original, {attributes:true,attributeFilter:['class']});
      });
    }
    function syncOuterState(){
      if (outerTopFrame) outerTopFrame.classList.toggle('dim-on',sheet.classList.contains('dim-on'));
    }
    syncOuterState();
    if (outerTopFrame) new MutationObserver(syncOuterState).observe(sheet,{attributes:true,attributeFilter:['class']});

    var firstColumn = Infinity;
    [].slice.call(sheet.querySelectorAll('.pick-cell')).forEach(function(cell){
      var left = parseFloat(cell.style.left);
      if (Number.isFinite(left) && left < firstColumn) firstColumn = left;
    });
    var leftRatio = Number.isFinite(firstColumn) ? Math.max(.06,(firstColumn / 100) - .001) : .071;

    function updateAxisSize(){
      var width = base.offsetWidth || sheet.offsetWidth;
      if (!width) return;
      var ratio = base.naturalWidth && base.naturalHeight ? base.naturalHeight / base.naturalWidth : 2480 / 3508;
      var height = width * ratio;
      var stageTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stage-top'));
      if (!Number.isFinite(stageTop)) stageTop = 7.58;
      var values = {
        '--sticky-axis-sheet-width':width.toFixed(2)+'px',
        '--sticky-axis-sheet-height':height.toFixed(2)+'px',
        '--sticky-axis-top-height':(height * stageTop / 100).toFixed(2)+'px',
        '--sticky-axis-left-width':(width * leftRatio).toFixed(2)+'px'
      };
      Object.keys(values).forEach(function(name){
        sheet.style.setProperty(name,values[name]);
        if (outerTopFrame) outerTopFrame.style.setProperty(name,values[name]);
      });
    }

    function syncOuterPosition(){
      if (outerTopContent) outerTopContent.style.transform='translate3d('+(-viewer.scrollLeft).toFixed(2)+'px,0,0)';
    }
    var outerFramePending = false;
    if (outerTopContent) viewer.addEventListener('scroll',function(){
      if (outerFramePending) return;
      outerFramePending = true;
      requestAnimationFrame(function(){ outerFramePending=false; syncOuterPosition(); });
    },{passive:true});

    updateAxisSize();
    syncOuterPosition();
    if (base.complete) updateAxisSize();
    else base.addEventListener('load',updateAxisSize,{once:true});
    if ('ResizeObserver' in window) new ResizeObserver(updateAxisSize).observe(base);
    window.addEventListener('resize',updateAxisSize);
  }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      try { initStickyAxes(); } catch (_e) {}
    });
  });
})();
