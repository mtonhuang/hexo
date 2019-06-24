//share
(() => {
    function stringfy(params = {}) {
      let str = '?';
      for(let key of Reflect.ownKeys(params)) {
        let value = !!params[key] ? encodeURIComponent(params[key]) : ''; 
        str = `${str}${key}=${value}&`;
      }
      return str.slice(0, str.length - 1);
    }
  
    function toggleShareBtn() {
      let show = false;
      const shareBtnDOM = document.querySelector('#share-btn');
  
      return (e) => {
        e.stopPropagation();
        e.preventDefault();
        show = !show;
        shareBtnDOM.style.display = show ? 'flex' : 'none';
      };
    }
  
    const mapSocialToUrl = (() => {
      const baseUrls = {
        twitter: 'https://twitter.com/intent/tweet',
        facebook: 'https://www.facebook.com/sharer/sharer.php',
        qq: 'http://connect.qq.com/widget/shareqq/index.html',
        weibo: 'http://service.weibo.com/share/share.php'
      };
  
      const title = document.title;
      const description = document.querySelector("meta[name='description']").getAttribute('content');
      const url = `${window.location.origin}${window.location.pathname}`;
  
      const params = {
        twitter: {
          url,
          text: `${title}\n\n${description}\n\n`,
          via: window.location.origin
        },
        facebook: {
          u: url
        },
        weibo: {
          url,
          title: `${title}\n\n${description}`
        },
        qq: {
          url,
          title,
          desc: description
        },
      };
  
      return {
        twitter: `${baseUrls.twitter}${stringfy(params.twitter)}`,
        facebook: `${baseUrls.facebook}${stringfy(params.facebook)}`,
        weibo: `${baseUrls.weibo}${stringfy(params.weibo)}`,
        qq: `${baseUrls.qq}${stringfy(params.qq)}`,
      }
    })();
  
    const pfxCls = '#share-btn';
    const { share } = window.AD_CONFIG;
    const socials = Reflect.ownKeys(share).filter(social => share[social]);
  
    for(let social of socials) {
      if(social === 'wechat') {
        continue;
      }
      document
        .querySelector(`${pfxCls}-${social}`)
        .setAttribute('href', mapSocialToUrl[social]);
    }
  
    if(!socials.includes('wechat')) {
      return;
    }
  
    // wechat share by qrcode
    document.querySelector('#share-btn-wechat').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
  
      const layer = document.querySelector('#site-layer'),
        container = document.querySelector('#site-layer-container'),
        title = document.querySelector('#site-layer-title'),
        newDOM = document.createElement('div');
  
      layer.style.display = 'block';
      title.innerHTML = '微信分享';
      container.appendChild(newDOM);
  
      const qrcode = new QRCode(newDOM, {
        text: `${window.location.origin}${window.location.pathname}`,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
  
      window.AD_CONFIG.layer.add(() => {
        title.innerHTML = '';
        qrcode.clear();
        newDOM.remove();
      });
    });
  
    // control btn panel if show in mobile phone
    if(socials.length > 0) {
      document.querySelector('#site-toggle-share-btn').addEventListener('click', toggleShareBtn());
    }
  })();

//   reward

(() => {
    const rewardDOM = document.querySelector('#site-reward');
    if(!rewardDOM) {
      return;
    }
  
    const layer = document.querySelector('#site-layer'),
      title = document.querySelector('#site-layer-title'),
      rewardContainerDOM = document.querySelector('#site-layer-reward');
  
    rewardDOM.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      layer.style.display = 'block';
      title.innerHTML = '打赏赞助';
      rewardContainerDOM.style.display = 'flex';
  
      window.AD_CONFIG.layer.add(() => {
        title.innerHTML = '';
        rewardContainerDOM.style.display = 'none';
      });
    });
  })();

  //mathjax

  // (() => {
  //   const { mathjax } = window.AD_CONFIG;
  //   if(!mathjax) {
  //     return;
  //   }
  
  //   const mathjaxConfig = {
  //     showProcessingMessages: false, //关闭js加载过程信息
  //     messageStyle: "none", //不显示信息
  //     jax: ["input/TeX", "output/HTML-CSS"],
  //     tex2jax: {
  //       inlineMath: [["$", "$"], ["\\(", "\\)"]], //行内公式选择符
  //       displayMath: [["$$", "$$"], ["\\[", "\\]"]], //段内公式选择符
  //       skipTags: ["script", "noscript", "style", "textarea", "pre", "code", "a"] //避开某些标签
  //     },
  //     "HTML-CSS": {
  //       availableFonts: ["STIX", "TeX"], //可选字体
  //       showMathMenu: false //关闭右击菜单显示
  //     }
  //   };
  
  //   // window.MathJax.Hub.Config(mathjaxConfig);
  //   // window.MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.querySelector('main')]);
  // })();

  // leancloud

  (() => {
    const { leancloud, welcome } = window.AD_CONFIG;
    let totalVisit = 0;
    welcome.interval = Math.abs(parseInt(welcome.interval, 10)) || 30;
  
    function getPsgID(pathname) {
      if(!pathname) {
        pathname = window.location.pathname;
      }
  
      let names = pathname.split('/');
      for(let i = names.length - 1; i >= 0; --i) {
        let name = names[i].trim();
        if(name.length > 0 && name !== '/' && name !== 'index.html') {
          return name;
        }
      }
      return '/';
    }
  
    function _updateCommentNum() {
      const infoDOM = document.querySelector('#site-comment-info'),
        url = getPsgID(),
        _ts = 1000;
      let running = false;
  
      return (ts = _ts) => {
        if(running) {
          return;
        }
        setTimeout(() => {
          running = true;
          let query = new AV.Query('Comment');
          query.equalTo('url', url);
          query.count()
            .then(num => {
              infoDOM.innerHTML = `共${num}条评论`;
              running = false;
            });
        }, ts);
      }
    }
  
    function active() {
      if(leancloud.comment === false && leancloud.count === false) {
        return false;
      }
      return true;
    }
  
    function init() {
      try {
        window.AV.init(leancloud.appid, leancloud.appkey);
        return true;
      } catch(error) {
        return false;
      }
    }
  
    function log() {
      let pathname = decodeURIComponent(window.location.pathname);
      !pathname.endsWith('/') && (pathname = pathname + '/');
      let Counter = AV.Object.extend('Counter');
      let counter = new Counter();
      counter.set('visit_time', new Date().getTime().toString());
      counter.set('user_agent', window.navigator.userAgent);
      counter.set('identity_path', pathname);
      counter.set('more_info', JSON.stringify(window.location));
  
      let acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
  
      counter.setACL(acl);
      counter.save();
    }
  
    function count() {
      let query = new AV.Query('Counter');
      return new Promise(resolve => {
        query
          .count()
          .then(
            res => resolve(res + 1), 
            error => {
              void 0;
              resolve(0);
            }
          );
      });
    }
  
    // function showWelcome() {
    //   const day = 60 * 60 * 24 * 1000;
    //   const layer = document.querySelector('#site-layer'),
    //     welcomeDOM = document.querySelector('#site-layer-welcome'),
    //     title = document.querySelector('#site-layer-title');
    
    //   let visitTime = parseInt(atob(window.localStorage.getItem('visit_time')), 10),
    //     now = Date.now(),
    //     offsetDays = 0;
      
    //   window.localStorage.setItem('visit_time', btoa(now.toString()));
    
    //   if(layer.style.display !== 'none' || !totalVisit) {
    //     return;
    //   }
  
    //   offsetDays = Math.ceil((now - visitTime) / day);
    
    //   if(isNaN(offsetDays)) {
    //     layer.style.display = 'block';
    //     title.innerHTML = '欢迎到来';
    //     welcomeDOM.innerHTML = `您是本站的第${totalVisit}位访问者`;
    //     welcomeDOM.style.display = 'flex';
    //   } else if (offsetDays >= welcome.interval) {
    //     layer.style.display = 'block';
    //     title.innerHTML = '欢迎回来';
    //     welcomeDOM.innerHTML = '您很久没来小站看看啦';
    //     welcomeDOM.style.display = 'flex';
    //   } else {
    //     return;
    //   }
    
    //   window.AD_CONFIG.layer.add(() => {
    //     title.innerHTML = '';
    //     welcomeDOM.innerHTML = '';
    //     welcomeDOM.style.display = 'none';
    //   });
    // }
  
    if(!active()) {
      return;
    }
  
    if(!init()) {
      return;
    }
  
    // if(leancloud.count === true) {
    //   count().then(res => {
    //     document.querySelector('#site-count').innerHTML = res;
    //     totalVisit = res;
    //     // welcome.enable && showWelcome();
    //   });
    //   log();
    // }
  
    if(leancloud.comment === true) {
      const commentDOM = document.querySelector('#site-comment');
      if(!commentDOM) {
        return;
      }
  
      const updateCommentNum = _updateCommentNum();
      updateCommentNum(0);
  
      new Valine({
        el: '#site-comment',
        appId: leancloud.appid,
        appKey: leancloud.appkey,
        notify: false,
        verify: false,
        avatar: "robohash",
        placeholder: "正确填写邮箱, 才能及时收到回复哦♪(^∇^*)",
        path: getPsgID()
      });
  
      document.querySelector('.vsubmit.vbtn').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        updateCommentNum(1000);
      });
    }
  })();