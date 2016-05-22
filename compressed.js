"use strict";function walContext(){this.ctx=new AudioContext,this.destination=this.ctx.destination,this.filters=this.createFilters(),this.buffers=[],this.compositions=[],this.nbPlaying=0,this.filters.connect(this.destination),this.nodeIn=this.filters.nodeIn,delete this.filters.connect}walContext.prototype={gain:function(i){return arguments.length?(this.filter.gain(i),this):this.filter.gain()},createBuffer:function(i,e){var t=new walContext.Buffer(this,i,e);return this.buffers.push(t),t},createFilters:function(){return new walContext.Filters(this)},createComposition:function(){var i=new walContext.Composition(this);return this.compositions.push(i),i}},function(){function i(i){var e,t=null,n=0;i.wSamples.forEach(function(i){e=i.getEndTime(),e>n&&(n=e,t=i)}),i.lastSample=t,i.duration=t?t.getEndTime():0}function e(e){clearTimeout(e.playTimeoutId),i(e);var t=e.duration&&e.duration-e.currentTime();0>=t?e.onended():e.playTimeoutId=setTimeout(e.onended.bind(e),1e3*t)}function t(i,e){var t=i.when-e,n=t>=0?i.offset:i.offset-t;i.start(t,Math.max(n,0))}function n(i,n,s,o){var a=i.currentTime();n.getEndTime()>a&&"rm"!==s&&(n.load(),t(n,a)),i.lastSample===o&&"mv"!==s||e(i)}function s(i){clearTimeout(i.playTimeoutId),i.wSamples.forEach(function(i){i.stop()})}function o(i){var e=i.currentTime();i.wSamples.forEach(function(i){i.getEndTime()>e&&i.load()})}function a(i){var n=i.currentTime();i.wSamples.forEach(function(i){i.getEndTime()>n&&t(i,n)}),e(i)}walContext.Composition=function(i){this.wCtx=i,this.wSamples=[],this.lastSample=null,this.isPlaying=this.isPaused=!1,this.duration=this.startedTime=this._currentTime=0,this.fnOnended=this.fnOnpaused=function(){}},walContext.Composition.prototype={addSamples:function(i){var e=this;return i.forEach(function(i){e.wSamples.indexOf(i)<0&&(e.wSamples.push(i),i.setComposition(i),e.update(i))}),this},removeSamples:function(i){var e,t=this;return i.forEach(function(i){e=t.wSamples.indexOf(i),e>-1&&(t.wSamples.splice(e,1),i.setComposition(null),t.update(i,"rm"))}),this},update:function(e,t){var s,o=this,a=this.lastSample;return i(this),this.isPlaying&&(e.started?(s=e.fnOnended,e.onended(function(){n(o,e,t,a),s(),e.onended(s)}),e.stop()):n(this,e,t,a)),this},currentTime:function(i){return arguments.length?(this.isPlaying&&s(this),this._currentTime=Math.max(0,Math.min(i,this.duration)),this.isPlaying&&(this.startedTime=this.wCtx.ctx.currentTime,o(this),a(this)),this):this._currentTime+(this.isPlaying&&wa.wctx.ctx.currentTime-this.startedTime)},play:function(){return this.isPlaying||(this.isPlaying=!0,this.isPaused=!1,this.startedTime=wa.wctx.ctx.currentTime,o(this),a(this)),this},stop:function(){return(this.isPlaying||this.isPaused)&&(s(this),this.onended()),this},pause:function(){this.isPlaying&&(this.isPlaying=!1,this.isPaused=!0,this._currentTime+=wa.wctx.ctx.currentTime-this.startedTime,this.startedTime=0,s(this),this.fnOnpaused())},onended:function(i){return"function"==typeof i?this.fnOnended=i:(this.isPlaying=this.isPaused=!1,this.startedTime=this._currentTime=0,this.fnOnended()),this}}}(),function(){walContext.Buffer=function(i,e,t){function n(i){s.wCtx.ctx.decodeAudioData(i,function(i){s.buffer=i,s.isReady=!0,t&&t(s)})}var s=this,o=new FileReader;this.wCtx=i,this.isReady=!1,e.name?(o.addEventListener("loadend",function(){n(o.result)}),o.readAsArrayBuffer(e)):n(e)},walContext.Buffer.prototype={createSample:function(){var i=new walContext.Sample(this.wCtx,this);return i},getPeaks:function(i,e,t,n){t=t||0,n=n||this.buffer.duration;for(var s,o,a,u=0,r=new Array(e),c=this.buffer.getChannelData(i),l=(n-t)*this.buffer.sampleRate,d=t*this.buffer.sampleRate,m=l/e,h=m/10;e>u;++u){for(s=d+u*m,o=s+m,a=0;o>s;s+=h)a=Math.max(a,Math.abs(c[~~s]));r[u]=a}return r}}}(),function(){function i(i,e,t){i[e]=t[0],i[e+1]=t[1],i[e+2]=t[2],i[e+3]=t[3]}function e(e,t,n,s){var o,a,u,r=t.data,c=0,l=t.width,d=t.height,m=d/2,h=e.getPeaks(0,l),f=e.buffer.numberOfChannels>1?e.getPeaks(1,l):h;if(s){for(;c<r.length;c+=4)i(r,c,n);n=[0,0,0,0]}for(c=0;l>c;++c){for(a=~~(m*(1-h[c])),u=~~(m*(1+f[c])),o=a;u>=o;++o)i(r,4*(o*l+c),n);i(r,4*(m*l+c),n)}return t}walContext.Buffer.prototype.drawWaveform=function(i,t){return e(this,i,t)},walContext.Buffer.prototype.drawInvertedWaveform=function(i,t){return e(this,i,t,!0)}}(),walContext.Filters=function(i){this.wCtx=i,this.nodes=[],this.nodeIn=i.ctx.createGain(),this.nodeOut=i.ctx.createGain(),this.nodeIn.connect(this.nodeOut),this.connect(i)},walContext.Filters.prototype={connect:function(i){i=i.nodeIn||i,i instanceof AudioNode&&(this.connectedTo=i,this.nodeOut.connect(i))},disconnect:function(){this.nodeOut.disconnect(),this.connectedTo=null},empty:function(){this.nodes.length&&(this.nodes[this.nodes.length-1].disconnect(),this.nodeIn.disconnect(),this.nodeIn.connect(this.nodeOut),this.nodes=[])},gain:function(i){return arguments.length?void(this.nodeOut.gain.value=i):this.nodeOut.gain.value},pushBack:function(i){if(this.nodes.length){var e=this.nodes[this.nodes.length-1];e.disconnect(),e.connect(i)}else this.nodeIn.disconnect(),this.nodeIn.connect(i);i.connect(this.nodeOut),this.nodes.push(i)},pushFront:function(i){this.nodes.length?(this.nodeIn.disconnect(),this.nodeIn.connect(i),i.connect(this.nodes[0]),this.nodes.unshift(i)):this.pushBack(i)},popBack:function(){var i=this.nodes.pop();if(i)if(i.disconnect(),this.nodes.length){var e=this.nodes[this.nodes.length-1];e.disconnect(),e.connect(this.nodeOut)}else this.nodeIn.disconnect(),this.nodeIn.connect(this.nodeOut);return i},popFront:function(){var i=this.nodes.shift();return i&&(i.disconnect(),this.nodeIn.disconnect(),this.nodeIn.connect(this.nodes[0]||this.nodeOut)),i}},walContext.Sample=function(i,e,t){this.wCtx=i,this.wBuffer=e,this.connectedTo=t?t.nodeIn:i.nodeIn,this.when=this.offset=0,this.duration=e.buffer.duration,this.bufferDuration=e.buffer.duration,this.composition=null,this.fnOnended=function(){},this.loaded=this.started=this.playing=!1},walContext.Sample.prototype={connect:function(i){return i=i.nodeIn||i,i instanceof AudioNode&&(this.connectedTo=i,this.source&&this.source.connect(i)),this},disconnect:function(){return this.source&&(this.source.disconnect(),this.connectedTo=null),this},setComposition:function(i){this.composition=i},load:function(){return this.loaded||(this.loaded=!0,this.source=this.wCtx.ctx.createBufferSource(),this.source.buffer=this.wBuffer.buffer,this.source.onended=this.onended.bind(this),this.connectedTo&&this.source.connect(this.connectedTo)),this},start:function(i,e,t){function n(){++s.wCtx.nbPlaying,s.playing=!0}if(this.loaded)if(this.started)console.warn("WebAudio Library: can not start a sample twice.");else{var s=this;this.started=!0,i=void 0!==i?i:this.when,this.source.start(this.wCtx.ctx.currentTime+i,void 0!==e?e:this.offset,void 0!==t?t:this.duration),i?this.playTimeoutId=setTimeout(n,1e3*i):n()}else console.warn("WebAudio Library: can not start an unloaded sample.");return this},stop:function(){return this.started&&(this.source.onended=null,this.source.stop(0),this.onended()),this},getEndTime:function(){return this.when+Math.min(this.duration,this.bufferDuration-this.offset)},onended:function(i){return"function"==typeof i?this.fnOnended=i:this.loaded&&(this.playing&&(this.playing=!1,--this.wCtx.nbPlaying),this.started&&(this.started=!1,clearTimeout(this.playTimeoutId)),this.loaded=!1,this.source=null,this.fnOnended()),this}},function(){function i(e){for(var t,n=e.firstChild;null!==n;)i(t=n),n=n.nextSibling,1!==t.nodeType&&/^\s*$/.test(t.textContent)&&e.removeChild(t)}i(document.body)}(),window.ui={jqWindow:$(window),jqBody:$("body"),jqVisual:$("#visual"),jqVisualCanvas:$("#visual canvas"),jqClockMin:$("#visual .clock .min"),jqClockSec:$("#visual .clock .sec"),jqClockMs:$("#visual .clock .ms"),jqMenu:$("#menu"),jqPlay:$("#menu .btn.play"),jqStop:$("#menu .btn.stop"),jqBpmA:$("#menu .bpm .a-bpm"),jqBpmInt:$("#menu .bpm .int"),jqBpmDec:$("#menu .bpm .dec"),jqBpmList:$("#menu .bpm-list"),jqBtnTools:$("#menu .tools [data-tool]"),jqBtnMagnet:$("#menu .tools .magnet"),jqFiles:$("#files"),jqFilelist:$("#files .filelist"),jqGrid:$("#grid"),jqGridEm:$("#grid .emWrapper"),jqGridHeader:$("#grid .header"),jqTimeline:$("#grid .timeline"),jqTimeArrow:$("#grid .timeArrow"),jqTimeCursor:$("#grid .timeCursor"),jqTrackList:$("#grid .trackList"),jqGridCols:$("#grid .cols"),jqGridColB:$("#grid .colB"),jqTrackNames:$("#grid .trackNames"),jqTrackLines:$("#grid .trackLines"),jqTrackLinesBg:$("#grid .trackLinesBg"),jqTrackNamesExtend:$("#grid .trackNames .extend")},ui.gridEm=parseFloat(ui.jqGrid.css("fontSize")),ui.tool={},ui.files=[],ui.tracks=[],ui.nbTracksOn=0,ui.gridColsY=ui.jqGridCols.offset().top,ui.jqVisualCanvas[0].height=ui.jqVisualCanvas.height(),function(){function i(){var o=t;wa.wctx.nbPlaying&&(o=wa.analyserArray,wa.analyser.getByteTimeDomainData(o)),wa.oscilloscope(n,s,o),e=requestAnimationFrame(i)}var e,t=[],n=ui.jqVisualCanvas[0],s=n.getContext("2d");ui.analyserEnabled=!1,ui.analyserToggle=function(t){"boolean"!=typeof t&&(t=!ui.analyserEnabled),ui.analyserEnabled=t,t?e=requestAnimationFrame(i):(s.clearRect(0,0,n.width,n.height),cancelAnimationFrame(e))}}(),ui.BPMem=1,ui.bpm=function(i){var e=~~i,t=Math.min(Math.round(100*(i-e)),99);ui.BPMem=i/60,ui.jqBpmInt.text(100>e?"0"+e:e),ui.jqBpmDec.text(10>t?"0"+t:t)},function(){function i(i){i>0&&ui.jqTimeCursor.add(ui.jqTimeArrow).css("left",i*ui.BPMem+"em"),ui.jqTimeCursor[0].classList.toggle("visible",i>0),ui.jqTimeArrow[0].classList.toggle("visible",i>0)}function e(i){ui._clockTime=i,ui.jqClockMin.text(~~(i/60));var e=~~(i%60);ui.jqClockSec.text(10>e?"0"+e:e),i=Math.round(1e3*(i-~~i)),10>i?i="00"+i:100>i&&(i="0"+i),ui.jqClockMs.text(i)}ui.currentTime=function(t){e(t),i(t)}}(),ui.getGridXem=function(i){var e,t=.25,n=(i-ui.filesWidth-ui.trackNamesWidth-ui.trackLinesLeft)/ui.gridEm;return ui.isMagnetized&&(e=n%t,n-=e,e>t/2&&(n+=t)),n},ui.newFile=function(i){var e=new ui.File(i);ui.files.push(e),ui.jqFilelist.append(e.jqFile)},ui.newTrack=function(){ui.tracks.push(new ui.Track(this))},function(){var i,e=$("<div class='cursor'>");ui.playFile=function(t){i&&i.stop(),t.isLoaded&&(t.jqCanvasWaveform.after(e.css("transitionDuration",0).css("left",0)),i=t.wbuff.createSample().onended(ui.stopFile).load().start(),setTimeout(function(){e.css("transitionDuration",t.wbuff.buffer.duration+"s").css("left","100%")},20))},ui.stopFile=function(){i&&(i.stop(),e.detach())}}(),function(){function i(){ui.currentTime(wa.composition.currentTime()),e=requestAnimationFrame(i)}var e;ui.play=function(){ui.jqPlay[0].classList.remove("fa-play"),ui.jqPlay[0].classList.add("fa-pause"),i()},ui.pause=function(){cancelAnimationFrame(e),ui.jqPlay[0].classList.remove("fa-pause"),ui.jqPlay[0].classList.add("fa-play")},ui.stop=function(){ui.pause(),ui.currentTime(0)}}(),ui.resize=function(){ui.screenWidth=ui.jqWindow.width(),ui.screenHeight=ui.jqWindow.height(),ui.gridColsWidth=ui.jqGridCols.width(),ui.gridColsHeight=ui.jqTrackList.height(),ui.trackLinesWidth=ui.gridColsWidth-ui.trackNamesWidth,ui.updateTimeline(),ui.updateTrackLinesBg()},ui.CSS_sampleTrack=function(i){i.track.jqColLinesTrack.append(i.jqSample)},ui.CSS_sampleWhen=function(i){i.jqSample.css("left",i.wsample.when*ui.BPMem+"em")},ui.CSS_sampleSelect=function(i){i.jqSample.toggleClass("selected",i.selected)},ui.CSS_sampleDelete=function(i){i.jqSample.remove()},ui.CSS_sampleOffset=function(i){i.jqWaveform.css("marginLeft",-i.wsample.offset*ui.BPMem+"em")},ui.CSS_sampleWidth=function(i){i.jqSample.css("width",i.wbuff.buffer.duration*ui.BPMem+"em")},ui.selectTool=function(){var i;return function(e){var t=ui.jqBtnTools.tool[e];t!==i&&(i&&i.classList.remove("active"),i=t,ui.jqGrid[0].dataset.tool=ui.currentTool=e,t.classList.add("active"))}}(),ui.setFilesWidth=function(i){ui.jqFiles.css("width",i),ui.filesWidth=i=ui.jqFiles.outerWidth(),ui.gridColsWidth=ui.screenWidth-i,ui.trackLinesWidth=ui.gridColsWidth-ui.trackNamesWidth,ui.jqGrid.css("left",i),ui.jqVisual.css("width",i+ui.trackNamesWidth),ui.jqMenu.css("left",i+ui.trackNamesWidth),ui.jqVisualCanvas[0].width=ui.jqVisualCanvas.width(),ui.updateTimeline(),ui.updateTrackLinesBg()},ui.gridTop=0,ui.setGridTop=function(i){if(i>=0)i=0;else{var e=ui.tracks.length*ui.gridEm-ui.gridColsHeight;-e>i&&(i=-e)}ui.gridTop=i,ui.jqGridCols.css("top",i/ui.gridEm+"em")},ui.gridZoom=1,ui.setGridZoom=function(i,e,t){i=Math.min(Math.max(1,i),8);var n=i/ui.gridZoom;ui.gridZoom=i,ui.gridEm*=n,ui.jqGridEm.css("fontSize",i+"em"),ui.jqGrid.attr("data-sample-size",ui.gridEm<40?"small":ui.gridEm<80?"medium":"big"),ui.setGridTop(t-(-ui.gridTop+t)*n),ui.setTrackLinesLeft(e-(-ui.trackLinesLeft+e)*n),ui.updateTimeline(),ui.updateTrackLinesBg()},ui.setTrackLinesLeft=function(i){ui.trackLinesLeft=i=Math.min(~~i,0),ui.jqTrackLines.css("left",i/ui.gridEm+"em")},ui.trackNamesWidth=0,ui.setTrackNamesWidth=function(i){var e,t=ui.trackNamesWidth;ui.jqTrackNames.css("width",i),ui.trackNamesWidth=i=ui.jqTrackNames.outerWidth(),ui.trackLinesWidth=ui.gridColsWidth-i,e=ui.filesWidth+i,ui.jqGridColB.css("left",i),ui.jqTimeline.css("left",i),ui.jqVisual.css("width",e),ui.jqMenu.css("left",e),ui.jqVisualCanvas[0].width=e,ui.trackLinesLeft<0&&ui.setTrackLinesLeft(ui.trackLinesLeft-(i-t)),ui.updateTimeline(),ui.updateTrackLinesBg(),ui.updateGridBoxShadow()},ui.isMagnetized=!1,ui.toggleMagnetism=function(i){"boolean"!=typeof i&&(i=!ui.isMagnetized),ui.isMagnetized=i,ui.jqBtnMagnet.toggleClass("active",i)},ui.toggleTracks=function(i){for(var e,t=0,n=i.isOn&&1===ui.nbTracksOn;e=ui.tracks[t++];)e.toggle(n);i.toggle(!0)},ui.updateGridBoxShadow=function(){function i(i,e){return(i=i||e)?(i=Math.min(2-i/8,5),(e?"0px "+i:i+"px 0")+"px 2px rgba(0,0,0,.3)"):"none"}ui.jqGridHeader.css("boxShadow",i(0,ui.gridTop)),ui.jqTrackNames.css("boxShadow",i(ui.trackLinesLeft,0))},function(){function i(i){if(i>e){var n,s="",o=e;for(e=i;o++<i;)s+="<div><span></span></div>";n=$(s),ui.jqTimeline.append(n),t.length<2&&(t=t.add(n.eq(0)))}}var e=0,t=$(ui.jqTimeArrow);ui.updateTimeline=function(){var e=ui.trackLinesLeft/ui.gridEm,n=ui.trackLinesWidth/ui.gridEm;i(Math.ceil(-e+n)),t.css("marginLeft",e+"em")}}(),function(){function i(i){var n,s,o,a=i-t,u="";for(t=Math.max(i,t),n=0;a>n;++n){for(u+="<div>",s=0;4>s;++s){for(u+="<div>",o=0;4>o;++o)u+="<div></div>";u+="</div>"}u+="</div>"}ui.jqTrackLinesBg.append(u),e=e||ui.jqTrackLinesBg.children().eq(0)}var e,t=0;ui.updateTrackLinesBg=function(){i(Math.ceil(ui.trackLinesWidth/ui.gridEm/4)+2),e.css("marginLeft",ui.trackLinesLeft/ui.gridEm%8+"em")}}(),ui.File=function(i){var e=this;this.file=i,this.fullname=i.name,this.name=i.name.replace(/\.[^.]+$/,""),this.isLoaded=this.isLoading=!1,this.jqFile=$("<a class='sample to-load' draggable='true'>"),this.jqName=$("<span class='text-overflow'>").appendTo(this.jqFile).text(this.name),this.jqToLoad=$("<i class='to-load fa fa-fw fa-download'>").prependTo(this.jqName),this.jqFile.on({contextmenu:!1,dragstart:this.dragstart.bind(this),mousedown:function(i){0!==i.button&&ui.stopFile()},click:function(){e.isLoaded?ui.playFile(e):e.isLoading||e.loaded()}})},function(){var i,e;ui.jqBody.mousemove(function(t){i&&e.css({left:t.pageX,top:t.pageY})}).mouseup(function(t){if(i){var n=Math.floor((t.pageY-ui.gridColsY-ui.gridTop)/ui.gridEm),s=ui.getGridXem(t.pageX);e.remove(),n>=0&&s>=0&&gs.sampleCreate(i,n,s),i=null}}),ui.File.prototype.dragstart=function(t){if(this.isLoaded&&!i){i=this,e=this.jqCanvasWaveform.clone();var n=e[0];n.getContext("2d").drawImage(this.jqCanvasWaveform[0],0,0,n.width,n.height),e.addClass("dragging").css({left:t.pageX,top:t.pageY}).appendTo(ui.jqBody)}return!1}}(),ui.File.prototype.loaded=function(){var i=this;this.isLoading=!0,this.jqToLoad.removeClass("fa-downloads").addClass("fa-refresh fa-spin"),wa.wctx.createBuffer(this.file,function(e){var t,n,s;i.wbuff=e,i.isLoaded=!0,i.isLoading=!1,i.jqFile.removeClass("to-load"),i.jqToLoad.remove(),i.jqCanvasWaveform=$("<canvas class='waveform'>"),t=i.jqCanvasWaveform[0],n=t.getContext("2d"),t.width=400,t.height=50,s=n.createImageData(t.width,t.height),e.drawWaveform(s,[57,57,90,255]),n.putImageData(s,0,0),i.jqFile.prepend(t),ui.playFile(i)})},ui.Track=function(i,e){e=e||{},this.grid=i,this.id=ui.tracks.length,this.jqColNamesTrack=$("<div class='track'>").appendTo(ui.jqTrackNames),this.jqColLinesTrack=$("<div class='track'>").appendTo(ui.jqTrackLines),this.jqColNamesTrack[0].uitrack,this.jqColLinesTrack[0].uitrack=this,this.wfilters=wa.wctx.createFilters(),this.initToggle().initEditName().toggle(e.toggle!==!1).editName(e.name||"")},ui.Track.prototype.initEditName=function(){var i=this;return this.jqName=$("<span class='name text-overflow'>").appendTo(this.jqColNamesTrack).dblclick(this.editName.bind(this,!0)),this.jqNameInput=$("<input type='text'/>").appendTo(this.jqColNamesTrack).blur(function(){i.editName(this.value).editName(!1)}).keydown(function(e){13!==e.keyCode&&27!==e.keyCode||i.editName(13===e.keyCode?this.value:i.name).editName(!1),e.stopPropagation()}),this},ui.Track.prototype.editName=function(i){var e=this.jqNameInput[0],t="Track "+(this.id+1);return"string"==typeof i?(i=i.replace(/^\s+|\s+$/,"").replace(/\s+/g," "),i=i===t?"":i,this.jqName.toggleClass("empty",""===i).text(i||t),this.name=i):i?(this.jqColNamesTrack.addClass("editing"),e.value=this.name||t,e.focus(),e.select()):(e.blur(),this.jqColNamesTrack.removeClass("editing")),this},ui.Track.prototype.initToggle=function(){var i=this;return this.jqToggle=$("<a class='toggle'>").appendTo(this.jqColNamesTrack).on("contextmenu",!1).mousedown(function(e){0===e.button?i.toggle():2===e.button&&ui.toggleTracks(i)}),this},ui.Track.prototype.toggle=function(i){return"boolean"!=typeof i&&(i=!this.isOn),this.isOn!==i&&(this.wfilters.gain(+i),this.isOn=i,this.grid.nbTracksOn+=i?1:-1,this.jqToggle.toggleClass("on",i),this.jqColNamesTrack.add(this.jqColLinesTrack).toggleClass("off",!i)),this},window.wa={},wa.wctx=new walContext,wa.ctx=wa.wctx.ctx,wa.composition=wa.wctx.createComposition(),wa.analyser=wa.ctx.createAnalyser(),wa.analyser.fftSize=1024,wa.wctx.filters.pushBack(wa.analyser),wa.analyserArray=new Uint8Array(wa.analyser.frequencyBinCount),wa.oscilloscope=function(){var i=0,e=Math.PI/2;return function(t,n,s){var o,a=0,u=t.width,r=t.height,c=s.length,l=c/2,d=u/c;for(n.globalCompositeOperation="source-in",n.fillStyle="rgba("+Math.round(255-255*i)+","+Math.round(64*i)+","+Math.round(255*i)+","+(.95-.25*(1-Math.cos(i*e)))+")",n.fillRect(0,0,u,r),i=0,n.globalCompositeOperation="source-over",n.save(),n.translate(0,r/2),n.beginPath(),n.moveTo(0,0);c>a;++a)o=(s[a]-128)/128,i=Math.max(Math.abs(o),i),o*=.5-Math.cos((l>a?a:c-a)/l*Math.PI)/2,n.lineTo(a*d,o*r);n.lineJoin="round",n.lineWidth=1+Math.round(2*i),n.strokeStyle="rgba(200,200,255,"+Math.min(5*i,1)+")",n.stroke(),n.restore()}}(),window.gs={samples:[],selectedSamples:[]},gs.bpm=function(i){if(!arguments.length)return gs._bpm;var e=gs.currentTime()*ui.BPMem;gs._bpm=Math.max(20,Math.min(i,999)),ui.bpm(gs._bpm),gs.samples.forEach(function(i){i.wsample.when=i.xem/ui.BPMem,i.updateCSS_width(),i.updateCSS_offset()}),gs.currentTime(e/ui.BPMem)},gs.currentTime=function(i){return arguments.length?(wa.composition.currentTime(i),void ui.currentTime(wa.composition.currentTime())):wa.composition.currentTime()},gs.playToggle=function(i){"boolean"!=typeof i&&(i=!wa.composition.isPlaying),i?gs.play():gs.pause()},gs.play=function(){!wa.composition.isPlaying&&gs.samples.length&&(wa.composition.play(),wa.composition.isPlaying&&ui.play())},gs.pause=function(){wa.composition.isPlaying&&(wa.composition.pause(),ui.pause())},gs.stop=function(){wa.composition.stop(),gs.currentTime(0),ui.stop()},function(){function i(i,e){e=e.originalEvent.deltaY,gs.bpm(gs._bpm+(e>0?-i:e?i:0))}ui.jqBpmA.mousedown(function(){return ui.jqBpmA.toggleClass("clicked"),!1}),ui.jqBpmList.children().mousedown(function(){gs.bpm(+this.textContent)}),ui.jqBody.mousedown(function(){ui.jqBpmA.removeClass("clicked")}),ui.jqBpmInt.on("wheel",i.bind(null,1)),ui.jqBpmDec.on("wheel",i.bind(null,.01))}(),ui.jqTimeline.mouseup(function(i){gs.currentTime(ui.getGridXem(i.pageX)/ui.BPMem)}),function(){var i,e=!1,t={files:function(i){var e=i.pageX;ui.setFilesWidth(35>e?0:e)},trackNames:function(i){var e=i.pageX-ui.jqGrid.offset().left;ui.setTrackNamesWidth(35>e?0:e)}};$(".extend").mousedown(function(n){0===n.button&&(e=!0,ui.jqBody.addClass("cursor-ewResize"),i=t[this.dataset.mousemoveFn])}),ui.jqBody.mouseup(function(i){0===i.button&&e&&(e=!1,ui.jqBody.removeClass("cursor-ewResize"))}).mousemove(function(t){e&&i(t)})}(),ui.jqBody.on({dragover:!1,drop:function(i){i=i.originalEvent;var e=i&&i.dataTransfer;return $.each(e&&e.files,function(){ui.newFile(this)}),!1}}),function(){function i(){t&&(ui.selectTool(t),t=null),e=!1}var e,t,n,s=0,o=0;ui.jqWindow.blur(i),ui.jqTrackLines.on({contextmenu:!1,mousedown:function(i){if(!e){e=!0,n=ui.getGridXem(i.pageX),s=i.pageX,o=i.pageY,2===i.button&&(t=ui.currentTool,ui.selectTool("delete"));var a=ui.tool[ui.currentTool].mousedown;a&&a(i,i.target.gsSample)}}}),ui.jqGrid.on("wheel",function(i){i=i.originalEvent,"zoom"===ui.currentTool?ui.tool.zoom.wheel(i):ui.setGridTop(ui.gridTop+(i.deltaY<0?.9:-.9)*ui.gridEm),ui.updateGridBoxShadow()}),ui.jqBody.on({mousemove:function(i){if(e){var t=ui.tool[ui.currentTool].mousemove,a=ui.getGridXem(i.pageX);t&&t(i,i.target.gsSample,"hand"!==ui.currentTool?(a-n)*ui.gridEm:i.pageX-s,i.pageY-o),n=a,s=i.pageX,o=i.pageY}},mouseup:function(t){if(e){var n=ui.tool[ui.currentTool].mouseup;n&&n(t,t.target.gsSample),i()}},wheel:function(i){return i.ctrlKey?!1:void 0}})}(),function(){function i(){e&&(ui.selectTool(e),e=null)}var e,t={16:"select",86:"select",66:"paint",68:"delete",77:"mute",83:"slip",67:"cut",32:"hand",72:"hand",17:"zoom",90:"zoom"};ui.jqWindow.blur(i),ui.jqBody.keydown(function(i){if(i=i.keyCode,8===i)return ui.toggleMagnetism(),!1;var n=t[i];n&&n!==ui.currentTool&&(16!==i&&17!==i&&32!==i||(e=ui.currentTool),ui.selectTool(n))}).keyup(function(e){e=e.keyCode,16!==e&&17!==e&&32!==e||i()})}(),ui.jqPlay.click(gs.playToggle),ui.jqStop.click(function(){ui.stopFile(),gs.stop()}),wa.composition.onended(ui.stop),ui.jqWindow.on("resize",ui.resize),ui.jqBtnMagnet.click(ui.toggleMagnetism),ui.jqBtnTools.tool={},ui.jqBtnTools.each(function(){ui.jqBtnTools.tool[this.dataset.tool]=this}).click(function(){ui.selectTool(this.dataset.tool)}),ui.tool["delete"]={mousedown:function(i,e){gs.sampleDelete(e)},mousemove:function(i,e){gs.sampleDelete(e)}},ui.tool.hand={mousedown:function(){ui.jqBody.addClass("cursor-move")},mouseup:function(){ui.jqBody.removeClass("cursor-move")},mousemove:function(i,e,t,n){ui.setTrackLinesLeft(ui.trackLinesLeft+t),ui.setGridTop(ui.gridTop+n),ui.updateTimeline(),ui.updateTrackLinesBg(),ui.updateGridBoxShadow()}},ui.tool.mute={mousedown:function(i,e){e&&e.mute()},mousemove:function(i,e){e&&e.mute()}},function(){var i;ui.tool.paint={mousedown:function(e,t){i=t},mouseup:function(){i&&(gs.samplesForEach(i,function(i){wa.composition.update(i.wsample,"mv")}),i=null)},mousemove:function(e,t,n,s){if(i){gs.samplesMoveX(i,n/ui.gridEm),e=e.target;var o,a=1/0,u=e.uitrack||e.gsSample&&e.gsSample.track;u&&(i.selected?(o=u.id-i.track.id,0>o&&(gs.selectedSamples.forEach(function(i){a=Math.min(i.track.id,a)}),o=-Math.min(a,-o)),gs.selectedSamples.forEach(function(i){i.inTrack(i.track.id+o)})):i.inTrack(u.id))}}}}(),ui.tool.select={mousedown:function(i,e){i.shiftKey||gs.samplesUnselect(),e&&gs.sampleSelect(e,!e.selected)}},function(){var i;ui.tool.slip={mousedown:function(e,t){i=t},mouseup:function(){i&&gs.samplesForEach(i,function(i){wa.composition.update(i.wsample,"mv")}),i=null},mousemove:function(e,t,n){i&&gs.samplesSlip(i,n/ui.gridEm)}}}(),function(){function i(i,e){ui.setGridZoom(ui.gridZoom*e,i.pageX-ui.filesWidth-ui.trackNamesWidth,i.pageY-ui.gridColsY)}ui.tool.zoom={wheel:function(e){i(e,e.deltaY<0?1.1:.9)},mousedown:function(e){0===e.button&&i(e,e.altKey?.8:1.2)}}}(),gs.sampleCreate=function(i,e,t){var n=new gs.Sample(i);return n.inTrack(e),n.moveX(t),gs.samples.push(n),wa.composition.addSamples([n.wsample]),n},gs.sampleSelect=function(i,e){i&&i.selected!==e&&(i.select(e),e?gs.selectedSamples.push(i):gs.selectedSamples.splice(gs.selectedSamples.indexOf(i),1))},gs.sampleDelete=function(i){i&&(gs.sampleSelect(i,!1),gs.samples.splice(gs.samples.indexOf(i),1),i["delete"]())},gs.samplesForEach=function(i,e){i&&(i.selected?gs.selectedSamples.forEach(e):e(i))},gs.samplesMoveX=function(i,e){if(i.selected&&0>e){var t=1/0;gs.selectedSamples.forEach(function(i){t=Math.min(t,i.xem)}),e=-Math.min(t,-e)}gs.samplesForEach(i,function(i){i.moveX(Math.max(0,i.xem+e))})},gs.samplesSlip=function(i,e){e/=ui.BPMem,gs.samplesForEach(i,function(i){i.slip(i.wsample.offset-e)})},gs.samplesUnselect=function(){gs.selectedSamples.forEach(function(i){i.select(!1)}),gs.selectedSamples=[]},gs.Sample=function(i){var e,t,n;this.uifile=i,this.wbuff=i.wbuff,this.wsample=this.wbuff.createSample(),this.jqSample=$("<div class='sample'>"),this.jqWaveformWrapper=$("<div class='waveformWrapper'>").appendTo(this.jqSample),this.jqWaveform=$("<canvas class='waveform'>").appendTo(this.jqWaveformWrapper),e=this.jqWaveform[0],t=e.getContext("2d"),e.width=~~(300*this.wbuff.buffer.duration),e.height=50,n=t.createImageData(e.width,e.height),this.wbuff.drawWaveform(n,[221,221,255,255]),t.putImageData(n,0,0),this.jqName=$("<span class='text-overflow'>").text(i.name).appendTo(this.jqSample),this.jqName[0].gsSample=this.jqWaveformWrapper[0].gsSample=this.jqWaveform[0].gsSample=this,this.select(!1),ui.CSS_sampleWidth(this)},gs.Sample.prototype.when=function(i){this.wsample.when=i,ui.CSS_sampleWhen(this)},gs.Sample.prototype.slip=function(i){this.wsample.offset=Math.min(this.wbuff.buffer.duration,Math.max(i,0)),ui.CSS_sampleOffset(this)},gs.Sample.prototype.mute=function(){lg("sample muted (in development)")},gs.Sample.prototype.select=function(i){this.selected=i,ui.CSS_sampleSelect(this)},gs.Sample.prototype["delete"]=function(){this.wsample.stop(),wa.composition.removeSamples([this.wsample],"rm"),ui.CSS_sampleDelete(this)},gs.Sample.prototype.inTrack=function(i){var e=ui.tracks[i];e!==this.track&&(this.wsample.disconnect(),this.wsample.connect(e.wfilters),this.track=e,ui.CSS_sampleTrack(this))},gs.Sample.prototype.moveX=function(i){this.xem=i,this.when(i/ui.BPMem)},ui.resize(),ui.setFilesWidth(200),ui.setTrackLinesLeft(0),ui.setTrackNamesWidth(125),ui.setGridZoom(1.5,0,0),ui.analyserToggle(!0),ui.toggleMagnetism(!0),ui.updateTrackLinesBg(),gs.bpm(120),gs.currentTime(0),ui.jqBtnTools.filter("[data-tool='paint']").click();