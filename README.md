---
#YARM-LIB  Yet Another Recorder Module -- MediaRecorder Example  


---

##Summary
* provides a basic voice recorder with the ability to playback, save (to workstation), and upload (to host) an .ogg file.  
* Playback options include [html5 audio](http://www.w3schools.com/html/html5_audio.asp), or [jPlayer](http://jplayer.org/).
* [demo](http://bit.ly/2dPxlMj)

##Requirements
* desktop browser Chrome v49+ or Firefox v30+
* local microphone
* javascript/jQuery
* for Chrome, a secure origin is required: HTTPS or localhost.

##Future Plans
* provide flash fallback for unsupported browsers
* add support for mobile clients
* add recording time limit
* add VU meter and recording timer
* add upload progress indicator

##Installation
1. clone or download and unzip the files
2. place folder with files into your web root

##Operation
1. browse to URL <webroot>/yarm-lib/index.html
2. enable your microphone
3. use buttons "record", "stop" to create a recording.
4. use the player controls for playback.
5. use the "save" and "upload" buttons to save the file locally or remotely respectively.

##Library Components
###YarmLocalMedia module  
Creates a stream connected to the local microphone.

###YarmRecorder module
Takes the microphone stream as input and creates a blob that can be played by the html5 <audio> element.  Provides the capability to save the blob as a local .ogg file, or upload the file to the host.

###YarmUi module
Manages the user interface, providing handlers and state transitions for the button array

###YarmUpload.php class
Server script accepts files uploaded by the YarmUi client

###Demonstration files  
* index.html- Demonstration page containing buttons and demo elements
* catch.php- Script runs on the host, receives and saves the .ogg file

##License
Copyright (c) 2016 Joe Sulmar  
Licensed under the MIT License

