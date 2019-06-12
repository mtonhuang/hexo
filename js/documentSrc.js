// copy
(() => {
    const { author } = window.AD_CONFIG;
  
    document.addEventListener('copy', e => {
      let clipboardData = e.clipboardData || window.clipboardData;
      if(!clipboardData) {
        return;
      }
  
      e.preventDefault();
      
      const selection = window.getSelection().toString();
  
      const textData = selection + '\n\n'
        + (author ? `作者: ${author}\n` : '')
        + '链接: ' + window.location.href + '\n'
        + '来源: ' + window.location.host + '\n'
        + '著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。\n\n';
  
      const htmlData = selection + '<br/><br/>'
        + (author ? `<b>作者</b>: ${author}<br/>` : '')
        + `<b>链接</b>: <a href="${window.location.href}">${window.location.href}</a><br/>`
        + `<b>来源</b>: <a href="${window.location.origin}">${window.location.host}</a><br/>`
        + '著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。<br/>';
  
        clipboardData.setData('text/html', htmlData);
        clipboardData.setData('text/plain', textData);
    });
  })();

// layer
  (() => {
    const layerDOM = document.querySelector('#site-layer');
    const { layer } = window.AD_CONFIG;
  
    layerDOM.addEventListener('click', (e) => {
      if(!e.target.matches('#site-layer-close') && !e.target.matches('#site-layer')) {
        return;
      }
  
      layer.trigger();
      layerDOM.style.display = 'none';
    });
  })();

//   scroll
  (() => {
    const handleScoll = (() => {
      const process = document.querySelector('#site-process');
      let isRunning = false;
      
      return () => {
        if (isRunning) return;
        isRunning = true;
  
        window.requestAnimationFrame(ts => {
          let scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight,
            clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
  
          isRunning = false;
  
          let percent = 100 * scrollTop / (scrollHeight - clientHeight);
          if(percent > 99) {
            percent = 100;
          } else if (percent < 1) {
            percent = 0;
          }
  
          process.style.width = `${percent}%`;
        });
      };
    })();
  
    // Refresh Page
    handleScoll();
  
    document.addEventListener('scroll', handleScoll, false);
  })();

//   backTop
  (() => {
    const backTopBtn = document.querySelector('#back-top-btn');
  
    const backTop = () => {
      const delay = 10, 
        time = 200;
      let running = false;
  
      return () => {
        if(running) return;
        running = true;
  
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
        if(scrollTop <= 10) {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          running = false;
          return;
        }
    
        let step = Math.ceil(scrollTop * delay / time);
    
        let timer = setInterval(() => {
          scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  
          if(scrollTop <= step) {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            running = false;
            clearInterval(timer);
          } else {
            document.documentElement.scrollTop = scrollTop - step;
            document.body.scrollTop = scrollTop - step;
          }
        }, delay);
      };
    };
  
    backTopBtn.addEventListener('click', backTop(), false);
    
  })();

//   time
  (() => {
    function update(id = '', start = {}) {
      const dom = document.querySelector(id);
      const ts = new Date(start.year, start.month - 1, start.day).getTime();
  
      return () => {
        let offset = parseInt((new Date().getTime() - ts) / 1000, 10),
          day = Math.floor(offset / 86400),
          hour = Math.floor((offset % 86400) / 3600),
          minute = Math.floor(((offset % 86400) % 3600) / 60),
          second = Math.floor(((offset % 86400) % 3600) % 60);
  
        dom.innerHTML = day + "天" + hour + "时" + minute + "分" + second + "秒";
      };
    }
  
    const { start_time } = window.AD_CONFIG;
    const [startYear, startMonth, startDay] = start_time.split('-');
    const startTime = {
      year: parseInt(startYear, 10),
      month: parseInt(startMonth, 10),
      day: parseInt(startDay, 10)
    };
  
    isNaN(startTime.year) && (startTime.year = 2018);
    isNaN(startTime.month) && (startTime.month = 2);
    isNaN(startTime.day) && (startTime.day = 10);
  
    const timeUpdate = update('#site-time', startTime);
    timeUpdate();
    setInterval(timeUpdate, 1000);
  })();

//   search
  (() => {
    function openGoogle(keywords) {
      keywords = `site:${window.location.hostname} ${decodeURIComponent(keywords)}`;
      let href = `https://www.google.com/search?q=${keywords}`;
      window.open(href);
    }
  
    const searchBtn = document.querySelector('#site-search'),
      nav = document.querySelector('#site-nav'),
      navBtn = document.querySelector('#site-nav-btn'),
      layer = document.querySelector('#site-layer'),
      layerContent = layer.querySelector('.site-layer-content'),
      title = document.querySelector('#site-layer-title'),
      searchDOM = document.querySelector('#site-layer-search');
  
    const inputDOM = searchDOM.querySelector('input'),
      iconDOM = searchDOM.querySelector('i');
  
    searchBtn.addEventListener('click', (e) => {
      layer.style.display = 'block';
      searchDOM.style.display = 'flex';
      inputDOM.focus();
      title.innerHTML = '搜索';
  
      window.AD_CONFIG.layer.add(() => {
        title.innerHTML = '';
        inputDOM.blur();
        searchDOM.style.display = 'none';
      });
    });
  
    inputDOM.addEventListener('keypress', (e) => {
      let key = e.which || e.keyCode,
        value = inputDOM.value.trim();
  
      if(key === 13 && value.length > 0) {
        openGoogle(value);
      }
    });
  
    iconDOM.addEventListener('click', (e) => {
      inputDOM.focus();
      let value = inputDOM.value.trim();
      if(value.length > 0) {
        openGoogle(value);
      }
    });
  
    navBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      layer.style.display = 'block';
      layerContent.style.display = 'none';
      nav.style.right = '0';
  
      window.AD_CONFIG.layer.add(() => {
        nav.style.right = '';
        layer.style.display = 'none';
        layerContent.style.display = '';
      });
    });
    
  })();

//   passage
  (() => {
    function handleImgClick(event) {
      window.open(event.target.getAttribute('src'), '_blank');
    }
  
    const { is_post, page_type } = window.AD_CONFIG;
  
    document
      .querySelectorAll('.passage-article')
      .forEach(
        passage => 
          passage
            .querySelectorAll('img')
            .forEach(image => image.addEventListener('click', handleImgClick))
      );
  
    if(!is_post && ['about', 'friends'].includes(page_type) === false) {
      return;
    }
  
    const layer = document.querySelector('#site-layer'),
      layerContent = layer.querySelector('.site-layer-content'),
      toc = document.querySelector('#site-toc'),
      tocShowBtn = document.querySelector('#site-toc-show-btn'),
      tocHideBtn = document.querySelector('#site-toc-hide-btn');
  
    tocShowBtn && tocShowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      layer.style.display = 'block';
      layerContent.style.display = 'none';
      toc.style.right = '0';
       
      window.AD_CONFIG.layer.add(() => {
        toc.style.right = '';
        layer.style.display = 'none';
        layerContent.style.display = '';
      });
    });
    
    tocHideBtn && tocHideBtn.addEventListener('click', window.AD_CONFIG.layer.trigger);
  })();
  