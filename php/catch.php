<?php

/*
 * catch.php
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 * 
 * Notes:
 * This module resides on server and accepts files uploaded by the javascript client.
 * be sure php.ini sets upload_max_filesize, post_max_size appropriately.
 * 
 */

//NOTE: be sure php.ini sets upload_max_filesize appropriately.
function fileCatch() {
    $err = '';
    logError("fileCatch");

    $request = $_REQUEST;
    // TODO: authenticate request

    $save_folder = realpath(__DIR__ . '/../uploads');

    $key = 'filename';

    $err1 = (!array_key_exists("upload_file", $_FILES) || $_FILES["upload_file"]["error"][$key] );
    if ($err1) {
        logError('<p>' . 'ajaxRecordingUpload Error from $_FILES.' . '</p>');
        logError('<p>' . 'ajaxRecordingUpload REQUEST=' . '</p> <pre> ' . print_r($request, true) . ' </pre>');
        logError('<p>' . 'ajaxRecordingUpload FILES=' . '</p> <pre> ' . print_r($_FILES, true) . ' </pre>');

        $err = 'bad request';
    }
    if (!$err) {
        $tmp_name = $_FILES["upload_file"]["tmp_name"][$key];
        $upload_name = $_FILES["upload_file"]["name"][$key];
        $type = $_FILES["upload_file"]["type"][$key];
        $filename = "$save_folder/$upload_name";
    }
//        if (!$err){
//            //validate file and type
//            if ($type != "audio/{$request['encoder']}") {
//                $err= "bad mime type= $type";
//            }
//            if (!$err && !preg_match('/^[a-zA-Z0-9_\-]+\.' . $request['encoder'] . '$/', $upload_name)) {
//                $err= "bad filename or extension: $upload_name ";
//            }
//            if (!$err && $request['encoder']=='wav' && !valid_wav_file($tmp_name)) {
//                $err= "wav validation error.";
//            }
//        }
    if (!$err) {
        //SAVE FILE
        //move the temporary file to destination folder
        $saved = move_uploaded_file($tmp_name, $filename) ? 1 : 0;
        if (!$saved) {
            $err = "failed to move $tmp_name to $filename";
        }
    }
    if (!$err) {
        $response = array(
            'status' => 'success'
        );
        $json = json_encode($response);
    } else {
        //error reporting
        $response = array(
            'status' => 'fail',
            'err' => $err,
        );
        $json = json_encode($response);
    }
    logError("json= $json");
    header('Content-type: application/json');
    echo $json;
}

function logError($txt) {
    error_log("$txt \r\n", 3, "logError.txt");
}

fileCatch();


