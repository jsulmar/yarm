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


var YarmUi = function () {
    var DEFAULTS = {
        media: {type: 'audio/ogg', ext: '.ogg'},
        uploadHandlerUrl: window.location.href + '/php/catch.php',
        playerType: "YarmHtmlPlayer"
    };

    /*
     * initialize configuration to default values
     */
    var config = DEFAULTS;

    /*
     * overide DEFAULTS with args supplied to the constructor (if any)
     */
    var args = arguments[0] || {};
    for (var arg in args) {
        config[arg] = args[arg];
    }

    /*
    * instantiate a player of the specified type
    */
    var player= new YarmPlayer('#player', new window[config.playerType]() );

    var yrec;   //the recorder object, constructed by 'enable' handler
    var stream; //the MediaStream to be used for the recorder


    /*
     * button state helper methods
     */
    function btnDisable(btn) {
        jQuery('#' + btn).prop('disabled', true).addClass('disabled');
    }
    function btnEnable(btn) {
        jQuery('#' + btn).prop('disabled', false).removeClass('disabled');
    }

    /*
     * state transition manager
     */
    function btnState(goToState) {
        switch (goToState) {
            case 'enable':
                jQuery('#enable').css('display', 'inline');
                btnEnable("enable");
                jQuery('#player').css('display', 'none');
                break;
            case 'record':
                btnDisable("record");
                btnDisable("save");
                btnDisable("upload");
                btnEnable("stop");
                jQuery('#player').css('display', 'none');
                break;
            case 'stop':
                btnDisable("stop");
                btnEnable("record");
                btnEnable("save");
                btnEnable("upload");
                jQuery('#player').css('display', 'block');
                break;
            case 'ready':
            case 'default':
                jQuery('#enable').css('display', 'none');
                jQuery('#record, #stop, #save, #upload').css('display', 'inline');
                btnEnable("record");
                jQuery('#player').css('display', 'none');
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
        //attach the new media URL to link that supports the 'save' button
        jQuery('#media-save' ).attr({href: url, download: name});   

        //load the media into the player
        player.setMedia({url:url, name:name});
    }

    /*
     * button handlers
     */
    jQuery("#enable").click(function (e) {
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
    jQuery("#record").click(function (e) {
        yrec.start();
        btnState('record');
    });
    jQuery("#stop").click(function (e) {
        yrec.stop();
        btnState('stop');
    });
    jQuery("#save").click(function (e) {
        document.getElementById('media-save').click();
        btnState('stop');
    });
    jQuery("#upload").click(function (e) {

        var fd = new FormData();
        fd.append("upload_file[filename]", yrec.getBlob(), jQuery('#player .name').text());

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
    jQuery("#recorder .button").click(function (e) {
        this.blur();
    });


    btnState('enable');

    /*
     *  expose public methods 
     */
    return {
        /*
         * logging utility: print to console and screen 
         * @param msg: the message to be displayed
         */
        _log: function (msg) {
            log.innerHTML += "\n" + msg;
            console.log(msg);
        }
    };
};


