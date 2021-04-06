/* 
 * Application for recording sentences for phonetic analysis.
 * Originally written in December of 2020, for LING 401.
 * Revised Spring 2021 for LING 499.
 * 
 * This is a hot mess currently, and when I'm not in 3 other classes
 * it will be completely rewritten.
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

/*
 * Start the trial.
 */
function startTrial() {
    targetDisplayElement = document.getElementById('target');
    
    // Get permission to use the mic:
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        targetDisplayElement.innerHTML = 'Read the sentences as they appear.';
        
        /*
         * Start the recording.
         */
        recordSpeech(stream).then((blob) => {
            saveAudio(blob);
            stopTrial(stream);
        });
       
        // Display all targets starting with the 0th
        displayTargets(0);
 
    }).catch(console.error);
}

/*
 * Use a promise to delay.
 */
function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

/*
 * Recursively display targets in sequence.
 */
function displayTargets(index) {
    target = targets[index];
    console.log("Displaying target " + target);
    targetDisplayElement.innerHTML = target;
    delay(targetDisplayTime).then(() => {
        // Once this has been displayed for long enough, display the next one  
        if (index < targets.length - 1) { // TODO check this index
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

/*
 * Record all trials as one long file.
 */
function recordSpeech(stream) {
    console.log("recording speech");
    var chunks = [];

    return new Promise((resolve, reject) => {
        // TODO detect the correct mime type
        var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});

        recorder.ondataavailable = e => {
            console.log('data pushed');
            chunks.push(e.data);
        };

        recorder.onstart = e => console.log(recorder.state);

        recorder.onstop = e => {
            console.log(recorder.state);
            resolve(new Blob(chunks, {type: 'audio/webm'}));
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

        recorder.start();
    });
}

/*
 * Send audio to good old php for saving.
 */
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

