#
# Extract formant data from the converted .wav files.
#

import parselmouth
import os 

# directories
wave_dir = "./wave/"
formant_proc_script = "./vowelformant.praat"

# extract the damn formants
for wave_file in os.listdir(wave_dir):
    print("processing sound",  wave_file)
    sound = parselmouth.Sound(wave_dir + wave_file)
   
    # extract a Formant object with a praat script
    formant = parselmouth.praat.run_file(sound, formant_proc_script)[0]
    
    # get mean F1 and F2 from praat. this feels illegal
    f1 = parselmouth.praat.call(formant, "Get mean", 1, 0, 0, "Hertz")
    f2 = parselmouth.praat.call(formant, "Get mean", 2, 0, 0, "Hertz")
    print("Mean F1:", f1)
    print("Mean F2:", f2)
    

