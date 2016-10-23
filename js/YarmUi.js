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
    var DEFAULTS = {
        media: {type: 'audio/ogg', ext: '.ogg'},
        uploadHandlerUrl: window.location.href + '/php/catch.php',
        uploadDestination: window.location.href + '/uploads'
    };

    var yrec;   //the recorder object, constructed by 'enable' handler
    var stream; //the MediaStream to be used for the recorder

    //configuiration, must be set by invoking this.getConfig
    var config = DEFAULTS;

    /*
     * button state helper methods
     */
    function btnDisable(btn) {
        $('#' + btn).prop('disabled', true);
    }
    function btnEnable(btn) {
        $('#' + btn).prop('disabled', false);
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
            yrec = new YarmRecorder(strm, config.media, recordingStopped);
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
        document.getElementById('player-save').click();
        btnState('stop');
    });
    $("#upload").click(function (e) {

        var fd = new FormData();
        fd.append("upload_file[filename]", yrec.getBlob(), $('#player .name').text());

        var xhr = new XMLHttpRequest();
        xhr.open("POST", config.uploadHandlerUrl, true);

        xhr.onreadystatechange = function (evt) {
            switch (this.status) {
                case 0: /* no-op*/
                    break;
                case 200:
                    if (this.readyState == 4) {
                        var response = jQuery.parseJSON(this.responseText);
                        if (!response) {
                            noteUploadResult(false, "AJAX null response");
                        } else if (response.status != 'success') {
                            noteUploadResult(false, "Upload-- " + this.responseText);
                        } else {
                            //success
                            noteUploadResult(true, "Upload-- " + this.responseText);
                        }
                    }
                    break;
                default:
                    noteUploadResult(false, this.statusText);
            }
            ;
        };
        xhr.send(fd);

        btnState('stop');
    });

    function noteUploadResult(successFlg, msg) {
        if (successFlg) {
            console.log(msg);
        } else {
            console.error(msg);
        }
    }

    //prevent sticky button outline when clicking buttons
    $("#btns .button").click(function (e) {
        this.blur();
    });

    /*
     * specify the initial state
     */
    btnState('enable');

    /*
     *  expose public methods 
     */
    return {
        /*
         * configure the module 
         * @param arguments[0]: an object containing optional configuration parameters
         */
        setConfig: function () {
            var args = arguments[0] || {};
            for (var arg in args) {
                config[arg] = args[arg];
            }
        },

        /*
         * logging utility: print to console and screen 
         * @param msg: the message to be displayed
         */
        _log: function (msg) {
            log.innerHTML += "\n" + msg;
            console.log(msg);
        }
    };
})();

