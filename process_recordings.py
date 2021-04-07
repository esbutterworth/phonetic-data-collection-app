import parselmouth

import numpy
import matplotlib.pyplot as plt
import seaborn as sns

# this is just a test lol

sns.set()
plt.rcParams['figure.dpi'] = 100

snd = parselmouth.Sound("/srv/http/test.webm")

plt.figure()
plt.plot(snd.xs(), snd.values.T)
plt.xlim([snd.xmin, snd.xmax])
plt.xlabel("time [s]")
plt.ylabel("amplitude")
plt.show() # or plt.savefig("sound.png"), or plt.savefig("sound.pdf")

###
###
# Gonna need shit in .wav for this to work
###
###
