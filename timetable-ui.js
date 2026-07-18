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
    var introSource = `テレビ大陸音頭
札幌で結成された若き4人組。ポストパンクの鋭い反復、変則的なリズム、むき出しのノイズを衝動的に鳴らしながら、不意に耳に残る歌やメロディへ着地します。整いすぎていない演奏の危うさと、何が起こるか分からない緊張感が魅力。ROOKIE A GO-GOから観客の支持を得てRED MARQUEEへ進んだ、現在の日本の若手オルタナティブを象徴する存在です。
CHAPPO
福原音と細野悠太による2人組インストゥルメンタル・バンド。ギターとベースを中心に、1940年代の大衆音楽、映画音楽、ジャズ、ラウンジ音楽などの記憶を、どこか奇妙でユーモラスな現代の音楽へ作り替えます。懐かしいのに、どの国や時代の音とも言い切れない不思議な感触。知らない街を気ままに散歩するような楽しさを味わえます。
SON ROMPE PERA
メキシコのガマ兄弟を中心に活動するバンド。伝統楽器マリンバの軽やかな響きへ、クンビア、スカ、ガレージロック、パンクの荒々しい熱気を注ぎ込みます。民族音楽という言葉から想像する落ち着いた演奏とは異なり、ライブは速く、騒がしく、祝祭的。木の音色が強烈なダンスビートへ変わっていく、音源以上に現場で魅力が伝わるバンドです。
奇妙礼太郎BAND
かすれ、切なさ、温かさを同時に宿す、ひと声で誰だか分かる歌が最大の魅力。ロックンロール、ソウル、ブルース、ジャズ、歌謡曲などを行き来しながら、日常の寂しさや愛おしさを飾らない言葉で届けます。バンド編成では、奇妙礼太郎の歌を演奏全体が大きく包み込み、弾き語りとは異なる華やかさと高揚感が生まれます。
ALTIN GÜN
トルコの民謡や歌謡を、サイケデリックロック、ファンク、シンセサウンドで鮮やかに再構築するバンド。異国情緒を味わうだけの音楽ではなく、太いベースと反復するリズムによって、予備知識がなくても自然に身体が動きます。近年はアラベスク音楽を思わせるストリングスやサックスも取り入れ、懐かしさと未来感が同居する豊かなダンスミュージックへ進化しています。
TURNSTILE
ハードコアパンクの爆発力を核にしながら、ポップ、ソウル、電子音楽、ラテン的なリズムまで大胆に取り込む現代ロックの最前線。激しいギターと叫ぶような歌の合間に、開放的なメロディや夢の中のような静けさが現れます。モッシュやハードコアに縁がない人にも、身体を動かす音楽の純粋な快感を伝えられる、世界屈指のライブバンドです。
TORO Y MOI
チャズ・ベアによる、ジャンルを軽やかに横断する音楽プロジェクト。チルウェイヴを代表する存在として登場し、その後はファンク、ディスコ、サイケデリックロック、ハウス、ヒップホップ、インディーロックへと作品ごとに姿を変えてきました。柔らかな歌声と心地よいグルーヴの奥に、実験精神と少しねじれたポップ感覚が潜む、都会的で自由な音楽です。
SNAIL MAIL
リンジー・ジョーダンの率直な歌と、胸を締め付けるようなギターを中心とするインディーロック。恋愛の喜びだけでなく、執着、後悔、自尊心の揺れといった感情まで、生々しい言葉と強いメロディで描きます。近年はストリングスやカントリーの色合いを持つアレンジも加わり、繊細さを残しながら、より大きく広がるポップミュージックへ発展しています。
ARLO PARKS
詩のような言葉と柔らかな歌声で、人の孤独や心の揺れを丁寧にすくい上げる英国のシンガーソングライター。穏やかなソウルやインディーポップを基盤にしながら、近年はハウス、UKガラージ、ブレイクビーツなどのダンス音楽も取り入れています。内省的な歌詞とクラブミュージックの高揚が自然に結び付く、静けさと躍動を併せ持った現代的なポップです。
Hi-STANDARD
速いビート、覚えやすいメロディ、英語詞による大合唱。Hi-STANDARDは、日本のメロディックパンクをライブハウスから巨大フェスへ押し広げ、多くの後続バンドに道を開いた存在です。演奏技術を見せつけるというより、3人の音が一斉に走り出す爽快感と、観客との一体感が魅力。長い歴史を持ちながら、現在もライブの現場で更新を続けるパンクバンドです。
HYUKOH
韓国のインディーシーンを世界へ広げた代表的バンド。オ・ヒョクの乾いた歌声を中心に、インディーロック、ソウル、サイケデリックロック、ファンクが力まず溶け合います。静かな曲には夜の街を漂うような余白があり、激しい曲ではギターが荒々しく噴き出す。台湾のSunset Rollercoasterとの共作でも、国境を越えた洗練と温かなバンドサウンドを示しています。
The xx
ギター、ベース、ビートという最小限の音だけで、親密さと緊張感を描くロンドンの3人組。ささやくような男女の歌声と深い低音、そして音が鳴っていない沈黙までを楽曲の一部として使います。派手に音を重ねるのではなく、わずかな響きによって広い空間を支配するのが特徴。大規模なフェス会場さえ、誰かの部屋のように近く感じさせる稀有なバンドです。
maya ongaku
江の島周辺を拠点に活動する3人組。サイケデリックフォーク、アンビエント、即興演奏をゆるやかに溶かし、霧や潮風のように輪郭の淡い音楽を奏でます。柔らかなギター、フルート、管楽器、手打ちの打楽器などが静かに重なり、聴き手を時間の流れが異なる場所へ連れていくよう。轟音ではなく、小さな響きや余白に耳を澄ませたくなる音楽です。
ブランデー戦記
大阪発の3ピースロックバンド。どこか懐かしい歌謡曲の香り、オルタナティブロックのざらつき、若さならではの危うさを、耳に残るメロディへまとめ上げます。親密で初々しい演奏と、時折鋭くゆがむギターが同居するのが魅力。結成から短期間で注目を集め、現在の日本の若手ロックシーンを知るうえで見逃せない存在です。
Trueno
アルゼンチン・ブエノスアイレスのラ・ボカ地区から登場したラッパー。フリースタイル大会で頭角を現し、力強い声と抜群のリズム感でラテン・ヒップホップを世界へ広げています。90年代ヒップホップへの敬意を軸に、ラテン音楽のリズムやアルゼンチンの音楽文化、地元への誇りや社会的な視点を融合。言葉が分からなくても熱量が伝わるライブアクトです。
QUADECA
ラッパーとして注目された経歴を持ちながら、現在は実験的なアートポップの作家へと大きく変貌したアーティスト。『Vanisher, Horizon Scraper』では、バロックポップ、フラメンコ、ボサノヴァ、電子音を何層にも重ね、海を旅する物語を映画的に描きました。美しいメロディと崩れそうな音像が交差する、アルバム全体を一つの世界として味わいたい音楽です。
YUUF
ロンドンを拠点に活動する多国籍の4人組インストゥルメンタル・バンド。柔らかなギター、うねるベース、繊細な打楽器を重ね、サイケデリック、ジャズ、アフリカやタイなど世界各地の音楽を思わせる響きを、夢見るようなサウンドへ変えます。派手に盛り上げるよりも、ゆっくり身体と意識をほぐしていくタイプ。自然に囲まれた会場でこそ魅力が深まります。
THE BETHS
ニュージーランド・オークランドを代表するインディーロックバンド。明るく弾むギター、緻密なコーラス、すぐに口ずさめるメロディの中へ、不安や自己疑念、人生が思いどおりに進まない感覚を織り込みます。爽快なギターポップとして楽しめる一方、歌詞には繊細な感情が詰まっている。楽しさと切なさが同時に押し寄せるバンドです。
LA LOM
ロサンゼルスの多様な文化を、そのまま音楽へ写し取ったようなインストゥルメンタル・トリオ。クンビア、ボレロ、チーチャ、サーフロック、ソウルを、きらめくギターと弾むリズムで結び付けます。古いレコードの温かさを持ちながら、演奏は軽快で現代的。歌がなくても情景や物語が浮かび、会場全体を映画の一場面のように変える音楽です。
JOEY VALENCE & BRAE
高速の掛け合いラップと太いブレイクビーツを武器にする米国のヒップホップデュオ。オールドスクール・ヒップホップへの愛情に、パンクの勢い、ゲームやインターネット世代のユーモアを加えています。騒がしく楽しい音楽の裏側には、大人になることへの戸惑いや焦りも潜む。難しく考えずに踊れて、観客を一気に巻き込むフェス向きのライブアクトです。
KHRUANGBIN
米国ヒューストン出身の3人組。サイケデリックロック、ファンク、ソウル、サーフミュージックに、タイをはじめ世界各地の音楽から得た感覚を溶け込ませます。ギター、ベース、ドラムというシンプルな編成ながら、わずかな音の変化で深い空間を作るのが特徴。穏やかで心地よい一方、ライブでは低音と演奏の強さが際立ち、広い会場を静かなダンスフロアへ変えます。
TOMORA
The Chemical Brothersのトム・ローランズと、ノルウェーのシンガーAURORAによるプロジェクト。ローランズの重厚なビートとサイケデリックな電子音に、AURORAの透明で幻想的な歌声が重なります。ビッグビート、トリップホップ、テクノ、北欧的な音楽感覚を横断し、クラブの高揚感と人間的で繊細な感情を同時に味わわせる、新鮮なエレクトロニック・ポップです。
Aooo（アウー）
石野理子、すりぃ、やまもとひかる、ツミキという、それぞれ作詞・作曲や演奏で実績を持つ4人が集まったロックバンド。鋭いギターと力強いリズムを軸に、歌謡曲、レトロポップ、電子音まで自在に行き来します。個性の強いメンバー同士がぶつかりながら、最後は耳に残るポップソングへ着地するのが魅力。勢いと緻密さを兼ね備えたライブにも注目です。
んoon（フーン）
ボーカル、ベース、ハープ、キーボードという珍しい編成の4人組。ソウルフルな歌声を中心に、フリージャズ、ヒップホップ、ノイズ、電子音楽、変則的なリズムがゆるやかに溶け合います。複雑な演奏でありながら難解さを押しつけず、ハープの透明な響きが音楽全体を夢のように包み込む。静けさと不穏さ、繊細さと力強さが同居する独自のサウンドです。
DONAVON FRANKENREITER
プロのフリーサーファーとしても知られる米国のシンガーソングライター。アコースティックギターを中心に、フォーク、ソウル、ブルース、ファンクを、肩の力が抜けた温かな音へまとめます。ゆったりした歌声と心地よいグルーヴは、海辺の午後や長いドライブに似合う一方、ライブではバンドの力強さも際立ちます。サーフカルチャーに根ざした親しみやすいルーツロックです。
TĀL FRY
インド古典音楽と現代的な感覚を融合する6人組バンド。タブラ、ガタム、ドーラクなどの打楽器を軸に、シタール、フルート、カルナティック声楽を重ねます。複数のリズムが会話するように絡み合い、複雑でありながら身体には直感的に届くのが特徴。伝統音楽を静かに鑑賞するというより、音とリズムの渦を全身で体験するライブです。
KNEECAP
ベルファスト出身のラップトリオ。アイルランド語と英語を行き来しながら、地元の若者の生活、政治、怒り、笑いを、ヒップホップとクラブミュージックの強烈なビートへ載せます。社会的な主張の鋭さだけでなく、悪ふざけのようなユーモアとパンク的な勢いも大きな魅力。歌詞をすべて理解できなくても、観客を巻き込む熱量と反抗精神ははっきり伝わります。
岡田拓郎
ギタリスト、作曲家、プロデューサーとして、ロック、ジャズ、ブルース、アンビエント、即興演奏を独自の感覚で結び付ける音楽家。派手なメロディよりも、楽器同士の距離や響き、音が消えたあとの余韻まで丁寧に設計します。2026年作『Konoma』では、ギターを中心に音の質感と余白をさらに深く追究。細部へ耳を澄ませるほど豊かに広がる音楽です。
SOFIA ISELLA
歌、作詞、演奏、プロデュースを自ら手がける米国の若きアーティスト。ダークなオルタナティブポップに、バイオリン、電子音、ささやき、叫びを組み合わせ、女性の身体や社会から向けられる視線を鋭く描きます。美しいメロディの途中で音が突然ゆがむような、甘さと恐ろしさの共存が特徴。ライブでは身体表現や演劇的な演出も用い、短編映画のような世界を作ります。
MOGWAI
1995年にグラスゴーで結成された、ポストロックを代表するバンド。歌を中心にせず、静かなギターの反復や美しい旋律を少しずつ積み上げ、やがて会場を揺らす巨大な轟音へ変えていきます。穏やかな景色が突然嵐へ変わるような、音量と感情の落差が最大の魅力。曲を知らなくても、静寂から爆発へ向かう流れそのものを映画や自然現象のように体験できます。
GEORDIE GREEP
英国の実験的ロックバンドblack midiの中心人物として知られるギタリスト兼歌手。ソロではジャズ、プログレ、サンバ、サルサ、ディスコ、ショーチューンを猛烈な速度で衝突させます。演奏は驚くほど高度ですが、歌われるのは自信過剰で情けない男たちの妄想や孤独。豪華なショーのような音楽と皮肉な物語の落差が、おかしく、恐ろしく、時に切ない異色の作品世界を生みます。
FRIKO
シカゴから登場したインディーロックバンド。壊れそうに震える歌声、荒々しいギター、繊細なピアノやストリングスを使い、小さな個人的感情を大きなドラマへ膨らませます。静かな弾き語りから、バンド全体が一斉に爆発するような展開まで、感情の振れ幅が非常に大きい。手作りの親密さを残しながら、壮大な音楽へ広がっていく若手注目株です。
KIKI
タイ・バンコクで結成された3人組。ほろ苦く柔らかな女性ボーカルを中心に、オルタナティブポップ、ファンク、ディスコ、R&B、ヒップホップ、色鮮やかなシンセサウンドを融合します。都会的で洗練された手触りを持ちながら、リズムには少し不穏でねじれた感覚が潜む。心地よく踊れるポップとしても、細部まで作り込まれた電子音楽としても楽しめる存在です。
ANGINE DE POITRINE
巨大な仮面をかぶったカナダ・ケベックの謎めいた2人組。ドラムと微分音ギターを使い、マスロック、プログレ、パンク、ファンクを、複雑なのに踊れる反復音楽へ変えます。微分音とは、一般的な音階の間にある細かな音程のこと。高度な演奏、奇妙な見た目、ユーモア、観客との一体感が同居し、珍しさだけでは終わらない本格的なライブバンドです。
AMERICAN FOOTBALL
1990年代末の米国中西部で生まれ、その後のエモやインディーロックへ大きな影響を与えたバンド。繊細に絡み合うギター、控えめな歌声、言葉にしにくい後悔や寂しさを、ゆっくりとした演奏で描きます。活動休止中にデビュー作がインターネットを通じて再評価され、再結成後も懐古にとどまらず音楽を拡張。静かな音ほど深く胸に残るタイプのバンドです。
MASSIVE ATTACK
英国ブリストルから、ヒップホップ、ダブ、ソウル、電子音楽を重い低音で結び付け、新しい夜の音楽を作った重要グループ。美しい歌声や静かな旋律の背後に、都市の不安や緊張がゆっくり広がります。ライブでは音楽と巨大な映像、ニュースや社会的メッセージが組み合わさり、単なる名曲集ではなく、観客が現在の世界と向き合う体験になります。
MITSKI
鋭く短い言葉と、ロック、ポップ、フォーク、オーケストラを横断する楽曲で、孤独、愛情、自己否定、他者との距離を描くシンガーソングライター。感情を直接叫ぶのではなく、物語や比喩を使って静かに深く掘り下げます。ライブでは歌だけでなく、緻密な振り付けや舞台装置も用い、苦しい感情を美しい演劇へ変える表現者です。
LAUSBUB（ラウスバブ）
札幌の高校で出会った岩井莉子と髙橋芽以による、ニューウェーブ／テクノポップの2人組。無機質な電子音、機械的なリズム、淡々とした歌声を使いながら、冷たいだけではない温かさと遊び心を生み出します。1980年代の電子音楽を思わせつつ、クラブミュージックや現代のポップ感覚も自然に吸収。小さな機材から大きな風景を作り出す実験的ダンスミュージックです。
TAKKYU ISHINO（石野卓球）
電気グルーヴの中心人物であり、日本のテクノ文化を長く支えてきたDJ／プロデューサー。反復する電子音と強い四つ打ちのビートを使い、考える前に身体が動くダンスフロアを作ります。海外でのDJ活動に加え、1999年から2013年まで大型レイヴ「WIRE」を主宰し、世界のテクノを日本へ紹介してきました。深夜から朝を高揚と解放感の時間へ変える存在です。
鬼の右腕
音楽大学の打楽器科の同期を中心に結成され、2匹の“鬼”を含む6人で活動する異色のバンド。ハードなギターリフ、トライバルなビート、世界各地の音楽の要素を、混沌としていながら踊れるサウンドへまとめます。2013年の解散を経て2022年に再集結し、2026年には『VOODOO IN MAGMA』を発表。祭りの熱気と妖しさが入り交じる、予測不能なライブが魅力です。
揺らぎ
繊細な歌声とギターの響きが、静寂から身体を包む轟音へ広がっていく日本のロックバンド。シューゲイザーを軸にしながら、近作ではフォーク、プログレ、オールディーズの要素を取り入れ、音の壁だけでなく「歌」そのものを前面に押し出しています。美しい旋律、音の余白、感情があふれるような爆発が共存し、轟音系の音楽に初めて触れる人にも薦めやすい存在です。`;
    var introLines = introSource.split('\n');
    var intros = {};
    for (var introIndex=0;introIndex<introLines.length;introIndex+=2) {
      var introTitle = introLines[introIndex];
      intros[introTitle] = {title:introTitle,body:introLines[introIndex+1]};
    }
    intros.Aooo = intros['Aooo（アウー）'];
    intros['んoon'] = intros['んoon（フーン）'];
    intros.LAUSBUB = intros['LAUSBUB（ラウスバブ）'];
    intros['TAKKYU ISHINO'] = intros['TAKKYU ISHINO（石野卓球）'];
    var cells = [].slice.call(sheet.querySelectorAll('.pick-cell'));
    var targets = cells.map(function(cell){
      var name = cell.querySelector('span');
      var intro = name ? intros[name.textContent.trim()] : null;
      var titleParts = cell.title.split(' / ');
      var showDetails = titleParts.slice(-2).join(' · ').replace(/(\d{2}:\d{2})-(\d{2}:\d{2})$/,'$1–$2');
      return intro ? {cell:cell,intro:intro,meta:[dayLabel,showDetails].filter(Boolean).join(' · ')} : null;
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
    function openIntro(target){
      lastFocus = document.activeElement;
      meta.textContent = target.meta;
      title.textContent = target.intro.title;
      copy.textContent = target.intro.body;
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
          openIntro(target);
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
