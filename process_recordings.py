#
# Extract formant data from the converted .wav files.
#

import parselmouth
import os 

# plotting shit for testing
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

sns.set()
plt.rcParams['figure.dpi'] = 100

# directories
wave_dir = "./wave/"

# length of each word and the entire recording, in ms
# WARNING this has to manually be set to the same value as in the JS
word_length = 2000
recording_length = 4000

for wave_file in os.listdir(wave_dir):
    sound = parselmouth.Sound(wave_dir + wave_file)
    parselmouth.praat.run_file(sound, "./vowelformant.praat")
