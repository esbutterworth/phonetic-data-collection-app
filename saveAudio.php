<?php
    $upload_dir = '/srv/http/upload/';
    $input = $_FILES['audio_data']['tmp_name'];
    $output = $upload_dir.$_FILES['audio_data']['name'].'.webm';

    echo print_r($_FILES) . "\n";

    if (file_exists($input)) {
        echo "File exists. \n";
    } else {
        echo "File doesn't exist.\n";
    }

    if (is_uploaded_file($input)) {
        echo "File is uploaded. \n";
    } else {
        echo "File is not uploaded. \n";
    }

    if (move_uploaded_file($input, $output)) {
        echo "File saved successfully.\n";
    } else {
        echo "Error saving file.\n";
        echo $input . "\n";
        echo $output . "\n";
    }
?>
