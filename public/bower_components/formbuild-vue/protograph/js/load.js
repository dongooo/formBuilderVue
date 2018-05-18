var isNetConnected = false;
function loadScript(src, cb) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  if (cb) {
    script.onload = script.onreadystatechange = cb;
  }
  document.getElementsByTagName('head')[0].appendChild(script);
}

loadScript('https://run.mockplus.cn/js/bundle.js?v=' + ~~(new Date() / 1e7), function () {
  isNetConnected = true;
  if (this.readyState && this.readyState !== 'loaded' && this.readyState !== 'complete') {
    loadScript('js/bundle.js');
  }
});

setTimeout(function () {
  if (!isNetConnected) {
    loadScript('js/bundle.js');
  }
}, 5 * 1e3);