/* 
 * YarmRecorder.js
 * Copyright (c) 2016-2017 Joe Sulmar
 * provided under MIT License
 */

/*
 * constructor for the YarmRecorder object
 * provides a wrapper for the MediaRecorder object
 */

var YarmRecorder = function (stream, media, stoppedCallback) {
    this.media = media; //media descriptors (type of recording)
    this.stoppedCallback = stoppedCallback;  //invoked at the completion of a recording

    this.buff = [];   //buffer used to accumulate recorded dataa
    this.blob = null; //recording data
    this.url = '';    //url reference to the recording
    this.name = '';   //unique name assigned to the recording


    //find a supported media type on this browser
    this.supportedMedia= function(){
        var mediaTypes= [
            "audio/ogg",    //supported by Firefox
            "audio/mp3",
            "audio/webm",   //supported by Chrome
            "audio/wav"
        ];

        var supported="none";
        mediaTypes.some(function(item){
            if (MediaRecorder.isTypeSupported(item)){
                supported=item;
                return true;    //break out of loop
            }
        });
        return supported;
    };



    /*
     * create the recorder
     */
    this.mediaRec = new MediaRecorder(stream);

    /*
     * event handler for ondataavailable
     * This handler aggregates the data into a buffer until the recorder is 
     * stopped, at which time the accumulated data is processed.
     * 
     * events are fired periodically as data is captured by the
     * recorder.  A timeslice can be specified in the 'start' method to control
     * the interval.  This event can also be programmatically triggered by  
     * MediaRecorder.requestData().
     * 
     * @param {event object} evt
     * @returns {undefined}
     */
    var self = this;
    this.mediaRec.ondataavailable = function (evt) {
        self.buff.push(evt.data);
        if (self.mediaRec.state === 'inactive') {
            //the recording has completed
            self.blob = new Blob(self.buff, {type: media.type});
            self.url = URL.createObjectURL(self.blob);
            self.name = Date.now() + media.ext;
            self.stoppedCallback && self.stoppedCallback(self.url, self.name);
        }
    };


    /*
     * Public Methods
     */


    /*
     * delete prior recording (if it exists) and commence a new recording
     */
    this.start = function () {
        this.buff = [];
        this.blob = null;
        this.url = this.name = '';
        this.mediaRec && this.mediaRec.start();
    };

    /*
     * stop recording
     */
    this.stop = function () {
        this.mediaRec && this.mediaRec.stop();
    };

    /*
     * blob getter
     */
    this.getBlob = function () {
        return this.blob;
    };
    
    /*
     * getter for current recording name
     */
    this.getName = function () {
        return this.name;
    };
    
    
};

