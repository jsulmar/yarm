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
var YarmPlayer = function (selector, player) {
    YarmPlayer.id++;
    this.player = new window[player]();
    $(selector).html(this.getTemplate());
    this.initialize();
};

// Static variable, enables instantiation of multiple players
YarmPlayer.id = 0;

/*
 * all player types must provide these prototype methods
 */
YarmPlayer.prototype = {
    /*
     * return the HTML required by the player to be dynamically placed into the DOM
     */
    getTemplate: function () {
        return this.player.getTemplate(YarmPlayer.id);
    },

    /*
     * 
     * perform the one-time initialization required for the player
     */
    initialize: function () {
        this.player.initialize(YarmPlayer.id);
    },

    /*
     * specify the media to be played
     * Note that all player controls are self contained
     */
    setMedia: function (media) {
        this.player.setMedia(YarmPlayer.id, media);
    }
};


/*
 * 
 * this HTML5 player employs WebRTC and requires no support libraries or
 * plugins.  However it is only compatible with modern Chrome and Firefox
 * browsers.
 */
var YarmHtmlPlayer = function () {
    this.template =
            `
        <div id="html_player_1">
            <audio ></audio>  
            <span class="name"></span> 
        </div>
    `;

    this.getTemplate = function (id) {
        //annotate template with the specified id suffix
        var t = this.template.replace('html_player_1', 'html_player_' + id);
        return(t);
    };

    this.initialize = function (id, media) {
        media && that.setMedia(id, media);
    };

    this.setMedia = function (id, media) {
        jQuery('#html_player_' + id + ' audio').attr({
            src: media.url, 
            controls: true,
            autoplay: ('autoplay' in media) && media.autoplay
        });//apply attributes to <audio> tag
        jQuery('#html_player_' + id + ' .name').text(media.name);   
    };
};

        
/*
 * 
 * YarmJPlayer requires the jPlayer library and provides better cross-browser
 * compatibility and media format support.
 */
var YarmJPlayer = function () {
    this.media = {name: null, url: null};

    this.template =
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
    this.getTemplate = function (id) {
        //annotate template with the specified id suffix
        var t = this.template.replace('jquery_jplayer_1', 'jquery_jplayer_' + id);
        t = t.replace('jp_container_1', 'jp_container_' + id);
        return(t);
    };


    this.initialize = function (id, media) {
        var that=this;
        /*
         * The jPlayer plugin does not expect the html object to be dynamically
         * created, and there is an indeterminate delay after creating the template 
         * before the plugin is ready.  Poll for 'ready' before initializing.
         */
        var selector = "#jquery_jplayer_" + id;
        var interval = setInterval(function () {
            if ($(selector).jPlayer) {
                //OK, jPlayer is ready
                $(selector).jPlayer({
                    ready: function (event) {
                        media && that.setMedia(id, media);
                    },
                    play: function () { // To avoid multiple jPlayers playing together.
                        $(this).jPlayer("pauseOthers");
                    },
                    swfPath: "../../dist/jplayer",
                    supplied: "oga",
                    cssSelectorAncestor: "#jp_container_" + id,
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

    this.setMedia = function (id, media) {
        $("#jquery_jplayer_" + id).jPlayer("setMedia", {
            title: media.name,
            oga: media.url
        });
        if (('autoplay' in media) && media.autoplay){
            $("#jquery_jplayer_" + id).jPlayer("play");
        }
    };

};

