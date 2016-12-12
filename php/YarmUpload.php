<?php

/*
 * YarmUpload.php
 * Copyright (c) 2016 Joe Sulmar
 * provided under MIT License
 * 
 * Notes:
 * This module resides on server and accepts files uploaded by the javascript client.
 * verify PHP settings:
 *  file_uploads = "On"
 *  post_max_size = limits the size of input submitted
 *  upload_max_filesize = can't be larger than post_max_size
 *  max_input_time = small values may cause timeouts
 *  max_execution_time = small values may cause timeouts
 *  memory_limit = small values may cause out of memory errors
 * 
 */

class YarmUpload {
    static function fileCatch($enableOutput=true, $save_folder='') {
        $err = '';
        $response= [];

        //use default folder if non provided in argument
        if (empty($save_folder)){
            $save_folder = realpath(__DIR__ . '/../uploads');
        }
        
        $key = 'filename';

        if (!array_key_exists("upload_file", $_FILES) || $_FILES["upload_file"]["error"][$key] ) {
            self::logError('<p>' . 'ajaxRecordingUpload Error from $_FILES.' . '</p>');
            self::logError('<p>' . 'ajaxRecordingUpload FILES=' . '</p> <pre> ' . print_r($_FILES, true) . ' </pre>');

            $err = 'bad request';
        }
        else {
            $tmp_name = $_FILES["upload_file"]["tmp_name"][$key];
            $upload_name = $_FILES["upload_file"]["name"][$key];
            $type = $_FILES["upload_file"]["type"][$key];
        }
        if (!$err) {
            //SAVE FILE
            //Note that $response is passed by reference so that it can be annotated
            if (!static::save_file($tmp_name, $save_folder, $upload_name, $response)) {
                $err = "failed to move $tmp_name to $save_folder/$upload_name";
            }
        }
        
        //append the status to the results array
        $response= array_merge ( 
            $err
            ? ['status' => 'fail', 'err' => $err]
            : ['status' => 'success', 'name' => $upload_name],

            $response
        );

        /*
         * generate output if enabled
         */
        if($enableOutput){
            header('Content-type: application/json');
            echo json_encode($response);
        }
        return $response;
    }
    
    //move the temporary file to destination folder
    static function save_file($tmp_name, $save_folder, $filename, &$response){
        if(!is_dir($save_folder)){
            //Directory does not exist, create it.
            mkdir($save_folder, 0755, true);
        }
        $response['url']= "$filename";
        return move_uploaded_file($tmp_name, "$save_folder/$filename");
    }

    static function logError($txt) {
        error_log("$txt \r\n", 3, "logError.txt");
    }

}
