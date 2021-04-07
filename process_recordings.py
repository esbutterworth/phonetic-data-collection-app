import parselmouth

import numpy
import matplotlib.pyplot as plt
import seaborn as sns
import os
import subprocess

upload_dir = "./upload"
wave_dir = "./wave"
# new filename
for filename in os.listdir(upload_dir):
    subprocess.run(['ffmpeg', '-i', filename, ])

