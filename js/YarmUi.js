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
 * DOM:
 *  appliances (e.g. recorder, player) alone are enclosed in a container
 *  buttons alone for each appliance are enclosed in a container
 *  
 *  Recorder Buttons:
 *  approval, record, stop, save, upload
 */


var YarmUi = function () {
    var that=this;
    
    var DEFAULTS = {
        media: {type: 'audio/ogg', ext: '.ogg'},
        uploadHandlerUrl: window.location.href + '/php/catch.php',
        playerType: "YarmHtmlPlayer",
        applianceContainer: "#appliances",
        recorderButtonContainer:"#recorder .buttons"
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
     * instantiate the recorder
     */
    function createRecorder(strm) {
        if (strm !== undefined) {
            stream = strm;
            yrec = new YarmRecorder(strm, config.media, recordingStopped);
            displayState.set('ready');
        }
    }

    /*
     * note that a recording session has stopped
     */
    function recordingStopped(url, name) {
        //attach the new media URL to link that supports the 'save' button
        $('#media-save' ).attr({href: url, download: name});   

        //load the media into the player
        player.setMedia({url:url, name:name});
    }


    /*
     * 
     * manage the display (states of appliances and buttons)
     */
    var displayState={
        //request permission to use the microphone/recorder
        enable: {
            appliances: '#recorder', 
            recBtnsShow:'.approval', 
            recBtnsEn:  '.approval'},
        //recorder is ready
        ready:  {
            appliances: '#recorder', 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.record'},
        //recording is in progress
        record: {
            appliances: '#recorder', 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.stop'},
        //recording is completed
        stop:   {
            appliances: '#recorder, #player',  //show both appliances
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.record, .save, .upload'},

        //make visible  only the specified members within the specified group
        xshow: function(grp, members){
                $(grp).children().filter(members).show();
                $(grp).children().filter(':not(' + members + ')').hide();
        },

        //exclusive enable:-- enable only the specified members within the specified group
        xen: function(grp, members){
                $(grp).children().filter(members).prop('disabled', false).removeClass('disabled');
                $(grp).children().filter(':not(' + members + ')').prop('disabled', true).addClass('disabled');	
        },

        set: function(state){
            this.xshow(config.applianceContainer, this[state].appliances );
            this.xshow(config.recorderButtonContainer, this[state].recBtnsShow);
            this.xen(config.recorderButtonContainer, this[state].recBtnsEn);
        }
    }



    /*
     * button handlers
     */
    $(".approval").click(function (e) {
        /*
         * YarmLocalMedia will either return a steam or undefined.
         * In the latter case, it will create a stream and invoke its callback
         * once the stream is created.
         * 
         * The following invokes createRecorder once if the stream exists, or
         * twice if the stream must be created.
         */
        createRecorder(YarmLocalMedia.getAudioStream(function (stream) {
            createRecorder(stream);
        }));

    });
    $(".record").click(function (e) {
        yrec.start();
        displayState.set('record');
    });
    $(".stop").click(function (e) {
        yrec.stop();
        displayState.set('stop');
    });
    $(".save").click(function (e) {
        document.getElementById('media-save').click();
        displayState.set('stop');
    });
    $(".upload").click(function (e) {

        var fd = new FormData();
        fd.append("upload_file[filename]", yrec.getBlob(), yrec.getName());

        var xhr = new XMLHttpRequest();
        xhr.open("POST", config.uploadHandlerUrl, true);

        xhr.onreadystatechange = function (evt) {
            switch (this.status) {
                case 0: /* no-op*/
                    break;
                case 200:
                    if (this.readyState == 4) {
                        var response = $.parseJSON(this.responseText);
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

        displayState.set('stop');
        
    });

    function noteUploadResult(successFlg, msg) {
        if (successFlg) {
            console.log(msg);
        } else {
            console.error(msg);
        }
    }

    //prevent sticky button outline when clicking buttons
    $("#recorder .button").click(function (e) {
        this.blur();
    });


    displayState.set('enable');


    /*
     * logging utility: print to console and screen 
     * @param msg: the message to be displayed
    */
    this.log=function (msg) {
        log.innerHTML += "\n" + msg;
        console.log(msg);
    };
};

