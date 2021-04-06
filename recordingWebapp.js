/* 
 * Application for recording sentences for phonetic analysis.
 * Originally written in December of 2020, for LING 401.
 * Revised Spring 2021 for LING 499.
 * @author Elliot Butterworth
 */

// For now, hardcoding the words here, but using JSON so eventually I'll be
// able to use external files.
var targetData = '{ "targets": ["tack", "wack"]}';

// HTML element for displaying current target 
var targetDisplayElement;

// TODO it would be nice to have this random, but I think it's more important to have consistent indices.
var targets = JSON.parse(targetData).targets;

// The length of each target
const targetDisplayTime = 2000;
// The total length of the recording 
const recordingTime = targetDisplayTime * targets.length;

/*
 * Functions for audio recording
 */

// Create a link to download an audio file
function createAudioDownloadElement(blobUrl, wordName) {
    const downloadElement = document.createElement('a');
    downloadElement.style = 'display: block';
    downloadElement.innerHTML = 'download ' + wordName;
    downloadElement.download = wordName + '.webm';
    downloadElement.href = blobUrl;

    document.getElementById('downloadDisplay').appendChild(downloadElement);
}

// Start the trial.
function startTrial() {
    targetDisplayElement = document.getElementById('target');
    
    // Get permission to use the mic:
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        targetDisplayElement.innerHTML = 'Read the sentences as they appear.';
        
        /*
         * Start the recording.
         */
        recordSpeech(stream, blob => {
          // createAudioDownloadElement(URL.createObjectURL(blob), currentTarget);
            saveAudio(blob);
        });
       
        // Display all targets starting with the 0th
        displayTargets(0);
    }).catch(console.error);

}

/*
 * Use a promise to delay
 */
function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

/*
 * Recursively display targets in sequence
 */
function displayTargets(index) {
    target = targets[index];
    console.log("Displaying target " + target);
    targetDisplayElement.innerHTML = target;
    delay(targetDisplayTime).then(() => {
        // Once this has been displayed for long enough, display the next one  
        if (index < targets.length) {
            displayTargets(index + 1);
        } 
    });
}

// Stop the trial
function stopTrial(stream) {
    document.getElementById('target').innerHTML = 'That\'s all! Thank you for your help!';

    stream.getTracks().forEach(track => {
        track.stop();
    })
}

// Record some speech
function recordSpeech(stream, callback) {
    console.log("recording speech");
    var chunks = [];

    // TODO detect the correct mime type
    var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});

    recorder.ondataavailable = e => {
        console.log('data pushed');
        chunks.push(e.data);
    };

    recorder.onstart = e => console.log(recorder.state);

    recorder.onstop = e => {
        console.log(recorder.state);
        callback(new Blob(chunks, {type: 'audio/webm'}));
        //createAudioDownloadElement(URL.createObjectURL(blob));
    };

    recorder.onerror = e => {
        let error = e.error;
        console.log(error);
    }

    // Record for the desired amount of time
    setTimeout(() => {
        recorder.stop();
    }, recordingTime);

    // Not sure if I need to put an interval here or not, since it's such a short recording
    recorder.start();

}

function saveAudio(blob) {
    var filename = new Date().toISOString();

    console.log("sending " + filename);

    var xhr = new XMLHttpRequest();
    xhr.onload = e => {
        if (this.readyState === 4) {
            console.log("Server returned: " + e.target.responseText);
        }
    };

    var fd = new FormData();
    fd.append('audio_data', blob, filename);
    xhr.open("POST", "saveAudio.php", true);
    xhr.send(fd);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

