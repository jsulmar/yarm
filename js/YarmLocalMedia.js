/* 
 * YarmLocalMedia.js
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 */

/*
 * Creates singleton streams attached to the local microphone and local
 * video camera respectively.  The singleton pattern is employed to avoid
 * the need for redundant local media permission requests during a session. 
 *  
 * constraints
 *   - compatible only with desktop browsers Chrome v49+, Firefox v30+
 *   - for Chrome, a secure origin is required: HTTPS or localhost.
 *   - jQuery is required
 * 
 */
var YarmLocalMedia = (function () {
  var streamAudio={};
  var streamVideo={};


  /*
   * create the specified stream
   * 
   * @param streamRef:      reference to the stream to be created
   * @param constraints: audio or video constraints
   * @param onCreate:    callback upon successful creation
   * @returns {undefined}
   * 
   */
  function createStreamInstance(streamRef, constraints, onCreate) {
    var timeoutSec = 15; //time limit for receiving response to getUserMedia
    var browserSupported = ((typeof MediaRecorder !== 'undefined') && (typeof navigator.mediaDevices.getUserMedia !== 'undefined'));
    var failNotice = "You must grant permission to use loal media. Please try again.";
    var supportNotice = "Your browser cannot use this recorder.  Please try a modern desktop Chrome or Firefox browser.";

    if (browserSupported) {
      /*
       * getUserMedia may generate a modal request for permission.  If user
       * closes the modal without providing an answer no event is generated.
       * Therefore, a timout is used to generate an event in this case.
       */
      var permissionTimeout = setTimeout(function () {
        console.log("Timeout waiting for permission.");
        alert(failNotice);
      }, timeoutSec * 1000);

      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
          //stream has been acquired
          clearTimeout(permissionTimeout);
          streamRef = stream;
          onCreate && onCreate(stream);
        })
        .catch(function (err) {
          clearTimeout(permissionTimeout);
          console.log(err.toString());
          alert(failNotice);
        });

    } else {
      //browser not supported
      alert(supportNotice);
    }

  }

  function createInstance(stream, constraints, onCreate) {
    createStreamInstance(stream, constraints, onCreate);
  }

  //expose only the get methods 
  return {
    //return the stream if it exists, otherwise create one
    
    /*
     *  return the audio stream if it exists.
     *  otherwise initiate creation and execute the callback.
     *  @param onCreate:    callback upon successful creation
     *  @returns:           html5 stream
     */
    getAudioStream: function (onCreate) {
      return jQuery.isEmptyObject(streamAudio) ? createInstance(streamAudio, {audio: true}, onCreate) : streamAudio;
    },

    /*
     *  return the audio/video stream if it exists.
     *  otherwise initiate creation and execute the callback.
     *  @param onCreate:    callback upon successful creation
     *  @returns:           html5 stream
     */
    getVideoStream: function (onCreate) {
      return jQuery.isEmptyObject(streamVideo) ? createInstance(streamVideo, {audio: true, video: true}, onCreate) : streamVideo;
    }
  };
})();

