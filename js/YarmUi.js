/* 
 * YarmUi.js
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 */

/*
 * This custom module manages the user interface, providing handlers and
 * state transitions for the button array.
 * 
 * states:
 *  enable  requests that user grant permission to use microphone
 *  ready   ready to record
 *  record  recording
 *  stop    stopped recording is complete
 *  
 */
var YarmUi = (function () {
    var yrec;   //the recorder object, constructed by 'enable' handler
    var stream; //the MediaStream to be used for the recorder
    media = {
        type: 'audio/ogg',
        ext: '.ogg'
    };

    /*
     * button state helper methods
     */
    function btnDisable(btn) {
        $('#' + btn).addClass("disabled");
    }
    function btnEnable(btn) {
        $('#' + btn).removeClass("disabled");
    }

    /*
     * state transition manager
     */
    function btnState(goToState) {
        switch (goToState) {
            case 'enable':
                $('#enable').css('display', 'inline');
                btnEnable("enable");
                $('#player').css('display', 'none');
                break;
            case 'record':
                btnDisable("record");
                btnDisable("save");
                btnDisable("upload");
                btnEnable("stop");
                $('#player').css('display', 'none');
                break;
            case 'stop':
                btnDisable("stop");
                btnEnable("record");
                btnEnable("save");
                btnEnable("upload");
                $('#player').css('display', 'block');
                break;
            case 'ready':
            case 'default':
                $('#enable').css('display', 'none');
                $('#record, #stop, #save, #upload').css('display', 'inline');
                btnEnable("record");
                $('#player').css('display', 'none');
                break;
        }
    }


    function createRecorder(strm) {
        if (strm !== undefined) {
            stream = strm;
            yrec = new YarmRecorder(strm, media, recordingStopped);
            btnState('ready');
        }
    }

    function recordingStopped(url, name) {
        $('#player audio').attr({src: url, controls: true});//apply attributes to <audio> tag
        $('#player .name').text(name);                      //display the recording name
        $('#player a').attr({href: url, download: name});   //attach url to 'save' link
    }

    /*
     * button handlers
     */
    $("#enable").click(function (e) {
        /*
         * YarmLocalMedia will either return a steam or undefined.
         * In the latter case, it will create a stream and invoke its callback
         * once the stream is created.
         * 
         * The following invokes createRecorder once if the stream exists, or
         * twice if the stream is created.
         */
        createRecorder(YarmLocalMedia.getAudioStream(function (stream) {
            createRecorder(stream);
        }));

    });
    $("#record").click(function (e) {
        yrec.start();
        btnState('record');
    });
    $("#stop").click(function (e) {
        yrec.stop();
        btnState('stop');
    });
    $("#save").click(function (e) {
        btnState('stop');
    });
    $("#upload").click(function (e) {
        btnState('stop');
    });


    /*
     * logging utility: print to console and screen 
     * @param msg: the message to be displayed
     */
    function _log(msg) {
        log.innerHTML += "\n" + msg;
        console.log(msg);
    }


    /*
     * specify the initial state
     */
    btnState('enable');

    /*
     *  expose only public methods 
     */
    return {
        log: function (txt) {
            _log(txt);
        }
    };
})();
