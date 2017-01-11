/* dev
 * YarmUi.js
 * Copyright (c) 2016-2017 Joe Sulmar
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
 *  appliances (e.g. recorder, player) are enclosed in a container
 *  buttons for each appliance are enclosed in a container
 *  
 *  Recorder Buttons:
 *  approval, record, stop, save, upload
 */


var YarmUi = function () {
    var self=this;
    
    //these defaults can be overriden by the constructor
    var DEFAULTS = {
        //the type of media to be recorded
        media: {type: 'audio/ogg', ext: '.ogg'},
        
        //URL of the recording upload habndler
        uploadHandlerUrl: window.location.href + '/php/catch.php',

        //An optional callback invoked upon successful upload of a recording.
        uploadCallback:     null,

        //select the player type (e.g. "YarmHtmlPlayer", "YarmJPlayer")
        playerType: "YarmHtmlPlayer",
        
        //The DOM must provide a container with a recorder child.
        //The recorder contains controls with buttons, and a playback element.
        applianceContainer: "#appliances",
        recorderControls: "#appliances .recorder .controls",
        playbackSelector: "#appliances .recorder .playback .player",
        
        //states and behaviors for the appliances and buttons
        displayStates:{
            //request permission to use microphone
            enable: [
                {fn:'xshow', grp:'.controls', items:'.approval'},
                {fn:'xen', grp:'.controls', items:'.approval'},
                {fn:'xshow', grp:'.playback', items:''}
            ],
            //ready to record
            ready: [
                {fn:'xshow', grp:'.controls', items:'.record, .stop, .save, .upload'},
                {fn:'xen', grp:'.controls', items:'.record'},
                {fn:'xshow', grp:'.playback', items:''}
            ],
            //recording is in progress
            record: [
                {fn:'xshow', grp:'.controls', items:'.record, .stop, .save, .upload'},
                {fn:'xen', grp:'.controls', items:'.stop'},
                {fn:'xshow', grp:'.playback', items:''}
            ],
            //recording is completed
            stop: [
                {fn:'xshow', grp:'.controls', items:'.record, .stop, .save, .upload'},
                {fn:'xen', grp:'.controls', items:'.record, .save, .upload'},
                {fn:'xshow', grp:'.playback', items:'.player'}
            ],
            //file is being uploaded
            uploading: [
                {fn:'xshow', grp:'.controls', items:'.record, .stop, .save, .upload'},
                {fn:'xen', grp:'.controls', items:''},
                {fn:'xshow', grp:'.playback', items:'.player'}
            ],
            //upload is complete
            uploaded: [
                {fn:'xshow', grp:'.controls', items:'.record, .stop, .save, .upload'},
                {fn:'xen', grp:'.controls', items:''},
                {fn:'xshow', grp:'.playback', items:'.player'}
            ]
        }
        
    };



    /*
     * logging utility: print to console and screen 
     * @param msg: the message to be displayed
     */
    this.log= function(msg) {
        window.log.innerHTML += "\n" + msg;
        return console.log(msg);
    }


    /*
     * initialize configuration to default values
     */
    self.config = DEFAULTS;

    /*
     * overide DEFAULTS with args supplied to the constructor (if any)
     */
    var args = arguments[0] || {};
    for (var arg in args) {
        self.config[arg] = args[arg];
    }

    /*
    * instantiate a player of the specified type
    */
    var player= new YarmPlayer(self.config.playbackSelector, self.config.playerType);
    var yrec;   //the recorder object, constructed by 'enable' handler
    var stream; //the MediaStream to be used for the recorder


    /*
     * instantiate the recorder
     */
    function createRecorder(strm) {
        if (strm !== undefined) {
            stream = strm;
            yrec = new YarmRecorder(strm, self.config.media, recordingStopped);
            self.displayState.set('ready');
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
    this.displayState={

        //exclusive show:-- make visible only the specified members within the specified group
        xshow: function(grp, members){
                $(grp).children().filter(members).show();
                $(grp).children().filter(':not(' + members + ')').hide();
        },

        //exclusive enable:-- enable only the specified members within the specified group
        xen: function(grp, members){
                $(grp).children().filter(members).prop('disabled', false).removeClass('disabled');
                $(grp).children().filter(':not(' + members + ')').prop('disabled', true).addClass('disabled');	
        },

        //implement the specified state and display the progressMsg if any.
        set: function(state, progressMsg){
            if(progressMsg){
                $(self.config.applianceContainer + ' .recorder .progress').html(progressMsg);
            }
            var that=this;
            
            //execute the directives (xshow, xen) associated with the requested state
            $.each(self.config.displayStates[state], function( index, directive ) {
                if ($.isFunction( that[directive.fn] )){
                    that[directive.fn](directive.grp, directive.items);
                }
            });
        }
    };



    /*
     * button handlers
     */
    this.approval_handler= function(){
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

    };
    
    this.record_handler= function(){
        yrec.start();
        self.displayState.set('record');
    };
    
    this.stop_handler= function(){
        yrec.stop();
        self.displayState.set('stop');
    };

    this.save_handler= function(){
        document.getElementById('media-save').click();
        self.displayState.set('stop');
    };
    
    this.upload_handler= function(){
        var fd = new FormData();
        fd.append("upload_file[filename]", yrec.getBlob(), yrec.getName());

        var xhr = new XMLHttpRequest();
        xhr.open("POST", self.config.uploadHandlerUrl, true);

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
                            self.displayState.set('uploaded', "Upload error: " + response.err);
                        } else {
                            //success
                            //compose default progress statement
                            var progress= response.destination ? ("Uploaded to: " + response.destination) : '';
                            
                            //invoke callback function, if any
                            if(self.config.uploadCallback && typeof self.config.uploadCallback === "function"){
                                var params= { destination:response.destination, newProgress: null};
                                self.config.uploadCallback(params);
                                if(params.newProgress !== null){
                                    progress= params.newProgress;
                                }
                            }
                            
                            //display the progress result
                            self.displayState.set('uploaded',  progress);
                        }
                    }
                    break;
                default:
                    noteUploadResult(false, this.statusText);
            }
            ;
        };
        xhr.send(fd);

        self.displayState.set('uploading', 'Uploading...');
    };

    //buttons are delegated to parent handler
    $(".controls").on( "click", "button", function( e ) {
        var handler=$(this)[0].classList[0] + '_handler';
        if ($.isFunction(self[handler])){
            self[handler]();
        }
    });
    
    //prevent sticky button outline when clicking buttons
    $(".recorder .button").click(function (e) {
        this.blur();
    });

    
    //configure initial state of the display
    this.displayState.set('enable');
    $(".recorder").show();
};

