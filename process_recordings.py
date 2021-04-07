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

# extract the damn formants
for i, wave_file in enumerate(os.listdir(wave_dir)):
    print("processing sound",  i)
    sound = parselmouth.Sound(wave_dir + wave_file)
    parselmouth.praat.run_file(sound, "./vowelformant.praat")
