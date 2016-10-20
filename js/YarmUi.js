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

    /*
     * display helper methods
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


    /*
     * button handlers
     */
    $("#enable").click(function (e) {
        btnState('ready');
    });
    $("#record").click(function (e) {
        btnState('record');
    });
    $("#stop").click(function (e) {
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

    //expose only public methods 
    return {
        log: function (txt) {
            _log(txt);
        }
    };
})();
