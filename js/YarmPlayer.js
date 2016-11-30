/* 
 * YarmPlayer.js
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 */

/*
 * The strategy pattern is employed to select a player type  
 */

/*
 * the context YarmPlayer manages the specific player type specified in the constructor
 */
var YarmPlayer = function(id, player) {
    this.id=id;
    this.player = player;
    $(id).html(this.player.getTemplate());
    this.player.initialize();

    
};


/*
 * all player types must provide these prototype methods
 */
YarmPlayer.prototype = {
 
    /*
     * 
     * return the HTML required by the player to be dynamically placed into the DOM
     */
    getTemplate: function(){
        return this.player.getTemplate();
    },
    
    /*
     * 
     * perform the one-time initialization required for the player
     */
    initialize: function(){
        this.player.initialize(this.id);
    },
    
    /*
     * specify the media to be played
     * Note that all player controls are self contained
     */
    setMedia: function(media){
        this.player.setMedia(this.id, media);
    }
};


/*
 * 
 * this HTML5 player employs WebRTC and requires no support libraries or
 * plugins.  However it is only compatible with modern Chrome and Firefox
 * browsers.
 */
var YarmHtmlPlayer = function() {
    this.template=
    `
        <audio ></audio>  
        <span class="name"></span> 
    `;

    this.getTemplate= function(){
        return(this.template);
    };
    
    this.initialize= function(){
        //none needed
    };
    
    this.setMedia= function(id, media){
        jQuery(id + ' audio').attr({src: media.url, controls: true});//apply attributes to <audio> tag
        jQuery(id + ' .name').text(media.name);                      //display the recording name
    };
};


/*
 * 
 * YarmJPlayer requires the jPlayer library and provides better cross-browser
 * compatibility and media format support.
 */
var YarmJPlayer = function() {
    this.media = {name: null, url: null};

    this.template=
    `
        <div id="jquery_jplayer_1" class="jp-jplayer"></div>
        <div id="jp_container_1" class="jp-audio" role="application" aria-label="media player">
                <div class="jp-type-single">
                        <div class="jp-gui jp-interface">
                                <div class="jp-controls">
                                        <button class="jp-play" role="button" tabindex="0">play</button>
                                        <button class="jp-stop" role="button" tabindex="0">stop</button>
                                </div>
                                <div class="jp-progress">
                                        <div class="jp-seek-bar">
                                                <div class="jp-play-bar"></div>
                                        </div>
                                </div>
                                <div class="jp-volume-controls">
                                        <button class="jp-mute" role="button" tabindex="0">mute</button>
                                        <button class="jp-volume-max" role="button" tabindex="0">max volume</button>
                                        <div class="jp-volume-bar">
                                                <div class="jp-volume-bar-value"></div>
                                        </div>
                                </div>
                                <div class="jp-time-holder">
                                        <div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>
                                        <div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>
                                        <div class="jp-toggles">
                                                <button class="jp-repeat" role="button" tabindex="0">repeat</button>
                                        </div>
                                </div>
                        </div>
                        <div class="jp-details">
                                <div class="jp-title" aria-label="title">&nbsp;</div>
                        </div>
                        <div class="jp-no-solution">
                                <span>Update Required</span>
                                To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
                        </div>
                </div>
        </div>
    `;
    this.getTemplate= function(){
        return(this.template);
    };
   

    this.initialize= function(id, media){
        /*
         * The jPlayer plugin does not expect the html object to be dynamically
         * created, and there is an indeterminate delay after creating the template 
         * before the plugin is ready.  Poll for 'ready' before initializing.
        */
        var interval= setInterval(function(){
            if ($("#jquery_jplayer_1").jPlayer){
                //OK, jPlayer is ready
                $("#jquery_jplayer_1").jPlayer({
                        ready: function (event) {
                            //console.log(event.type);    //expect "jPlayer_ready"
                        },
                        swfPath: "../../dist/jplayer",
                        supplied: "oga",
                        wmode: "window",
                        useStateClassSkin: true,
                        autoBlur: false,
                        smoothPlayBar: true,
                        keyEnabled: true,
                        remainingDuration: true,
                        toggleDuration: true
                });
                clearInterval(interval);
            }
        }, 500);
    
    };
    
    this.setMedia = function(id, media){
        $("#jquery_jplayer_1").jPlayer("setMedia", {
                title: media.name,
                oga: media.url
        });
    };
    
};

