// Application for recording sentences for phonetic analysis.
// Version 0, written in December of 2020, for LING 401.
// @author Elliot Butterworth

// So jank that these are different values
const recordingTime = 4000;
const targetVisibleTime = 3000;

// For now, hardcoding the words here, but using JSON so eventually I'll be
// able to use external files.
var targetData = '{ "words": ["button", "veto", "pantry"]}';

var targets = JSON.parse(targetData).words;

// Functions for audio recording

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
    const targetDisplayElement = document.getElementById('target');
    var i = 0;

    // Get permission to use the mic:
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        targetDisplayElement.innerHTML = 'Read the words as they appear';

        var timer = setInterval(() => {
            let currentTarget = targets[i];
            console.log('recording target ' + currentTarget);
            targetDisplayElement.innerHTML = currentTarget;
            recordSpeech(stream, blob => {
                createAudioDownloadElement(URL.createObjectURL(blob), currentTarget);
                i++;
                targetDisplayElement.innerHTML = '';
                if (i >= targets.length) {
                    clearInterval(timer);
                }
            })
        }, recordingTime);

    }).catch(console.error);

}

// Record some speech
function recordSpeech(stream, callback) {
    var chunks = [];

    // TODO detect the correct mime type
    var recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});

    recorder.ondataavailable = e => {
        console.log('data pushed');
        chunks.push(e.data);
    };

    recorder.onstart = e => console.log(recorder.state);;

    recorder.onstop = e => {
        console.log(recorder.state);
        callback(new Blob(chunks, {type: 'audio/webm'}));
        //createAudioDownloadElement(URL.createObjectURL(blob));
    };

    recorder.onerror = e => {
        let error = e.error;
        console.log(error);
    }

    setTimeout(() => {
        recorder.stop();
    }, targetVisibleTime);

    // Not sure if I need to put an interval here or not, since it's such a short recording
    recorder.start();

}
