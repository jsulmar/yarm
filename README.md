---
#YARM  Yet Another Recorder Module -- MediaRecorder API Example  
Copyright (c) 2016 Joe Sulmar  
provided under MIT License

---

##Summary
* provides a basic voice recorder with the ability to playback, save (to workstation), and upload (to host) an .ogg file.
* requires desktop browser Chrome v49+ or Firefox v30+
* requires a local microphone
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
1. browse to URL <webroot>/yarm/index.html
2. enable your microphone
3. use buttons "record", "stop" to create a recording.
4. use the player controls for playback.
5. use the "save" and "upload" buttons to save the file locally or remotely respectively.

##Components
###YarmLocalMedia module  
Creates a stream connected to the local microphone.

###YarmRecorder module
Takes the microphone stream as input and creates a blob that can be played by the html5 <audio> element.  Provides the capability to save the blob as a local .ogg file, or upload the file to the host.

###catch.php
Script runs on the host, receives and saves the .ogg file



