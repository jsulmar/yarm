/* 
 * YarmLocalMedia.js
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 */

/*
 * This module employs navigator.mediaDevices to obtain permission and
 * create a stream connected to the local microphone.
 * 
 * It supports Chrome v49+ and Firefox v30+ desktop browsers and requires
 * jQuery.
 */
var YarmLocalMedia = (function () {
    
  //expose only public methods 
  return {
    test: function () {
      dlog("YarmLocalMedia");
    }
  };
})();
