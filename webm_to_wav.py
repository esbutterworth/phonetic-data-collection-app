# Convert all the webm files from the recorder into wav files
# that parselmouth can use. Splits into individual words.

# for ffmpeg
import os
import subprocess

# for audio manipulation
from pydub import AudioSegment
from pydub.utils import make_chunks

upload_dir = "./upload/"
tmp_dir = "./tmp/"
wav_dir = "./wave/"

# TODO this should be in a global config
word_length = 2000 #ms

# First, convert webms to wavs and add them to the tmp dir
for webm_file in os.listdir(upload_dir):
    if webm_file.endswith(".webm"): # might as well
        # Convert to .wav and save in the wave/ dir
        new_file = tmp_dir + os.path.splitext(webm_file)[0] + ".wav" 
        subprocess.run(['ffmpeg', '-i', upload_dir + webm_file, new_file])

# Now take all those wavs and split them up
for wav_file in os.listdir(tmp_dir):
    if wav_file.endswith(".wav"):
        # chunkify the file
        audio_segment = AudioSegment.from_file(tmp_dir + wav_file, "wav")
        chunks = make_chunks(audio_segment, word_length)

        # export all the chunks as wav files to the wave dir
        for i, chunk in enumerate(chunks):
            # ignore the last chunk, because it's 0 seconds long and praat doesn't like that
            if (i == (len(chunks) - 1)):
                continue
            chunk_name = wav_dir + os.path.splitext(wav_file)[0] + "-{0}.wav".format(i)
            print("exporting ", chunk_name)
            chunk.export(chunk_name, format="wav")

        # clean up
        os.remove(tmp_dir + wav_file)
