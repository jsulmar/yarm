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
        //the type of media to be recorded
        media: {type: 'audio/ogg', ext: '.ogg'},
        
        //the script url to be invoked for uploading the recording
        uploadHandlerUrl: window.location.href + '/php/catch.php',
        
        //select the type of player to be used for reviewing the recording
        playerType: "YarmHtmlPlayer",
        
        //The DOM must provide a container with a recorder child.
        //The recorder contains controls with buttons, and a playback element.
        applianceContainer: "#appliances",
        recorderControls: "#appliances .recorder .controls",
        playbackSelector: "#appliances .recorder .playback",
        
        //An optional callback can be invoked upon successful upload of a recording.
        uploadCallback:     null
    };

    /*
     * logging utility: print to console and screen 
     * @param msg: the message to be displayed
     */
    function log(msg) {
        window.log.innerHTML += "\n" + msg;
        return console.log(msg);
    }


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
    var player= new YarmPlayer('.playback', config.playerType);
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
        player.setMedia({url:url, name:name, autoplay:false});
    }


    /*
     * 
     * manage the display (states of appliances and buttons)
     */
    var displayState={
        //request permission to use the microphone/recorder
        enable: {
            playback: false, 
            recBtnsShow:'.approval', 
            recBtnsEn:  '.approval'},
        //recorder is ready
        ready:  {
            playback: false, 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.record'},
        //recording is in progress
        record: {
            playback: false, 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.stop'},
        //recording is completed
        stop:   {
            playback: true, 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  '.record, .save, .upload'},
        //recording is completed
        uploading:   {
            playback: false, 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  ''},
        //upload is complete
        uploaded:   {
            playback: false, 
            recBtnsShow:'.record, .stop, .save, .upload', 
            recBtnsEn:  ''},

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

        set: function(state, progress){
            if(progress){
                $(config.applianceContainer + ' .recorder .progress').html(progress);
            }
            this[state].playback ? $(config.playbackSelector).show() : $(config.playbackSelector).hide(); 
            this.xshow(config.recorderControls, this[state].recBtnsShow);
            this.xen(config.recorderControls, this[state].recBtnsEn);
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
        displayState.set('uploading', 'Uploading...');
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
                            response= {"status":"fail","err":"AJAX null response"};
                        }    
                        if (response.status != 'success') {
                            displayState.set('uploaded', "Upload error: " + response.err);
                        } else {
                            //success
                            displayState.set('uploaded', "Uploaded to: " + response.url);
                            
                            //invoke callback function, if any
                            if(config.uploadCallback && typeof config.uploadCallback === "function"){
                                config.uploadCallback(response.url);
                            }
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


    //prevent sticky button outline when clicking buttons
    $(".recorder .button").click(function (e) {
        this.blur();
    });


    //configure initial state of the display
    displayState.set('enable');
    $(".recorder").show();
};

