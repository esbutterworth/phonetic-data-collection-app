#
# VowelOnset.Praat
#
# This script runs in the Praat speech analysis program;
# 	see  www.praat.org  for more details
# It starts with one Sound object selected.
# The purpose of the script is to find vowel onsets in the Sound,
# using a procedure similar to Cummins & Port 1998 J.Phonetics
#
# (c) Hugo QuenÃ©, May-June 2001, <Hugo.Quene@let.uu.nl>
# with thanks to Paul Boersma for useful hints and suggestions!
# Extended by /u/kayleepop 2017 to include formant analysis and an info box
#
# adjusted Sep 2001 for improved performance, hquene@indiana.edu
#
# lines starting with # are comment

# make sure that a single sound is selected
aantalselect = numberOfSelected ("Sound")
# obsolete... getnumberofselected aantalselect Sound
if 'aantalselect'!=1
   print Failure: exactly 1 Sound object should be selected!
   printline
else

selectedObj = selected()

# peak must be higher than preceding trough by 'delta' in dB, to qualify as peak
# disregard bottom and top 10% of intensity rise, in dB

# Dec.12th filtering adjusted
# comment vowel energy may be emphasised, by filtering with C=1000, B=500 Hz
# form Analysis parameters
   #  A vowel is characterised by a peak in the intensity contour.
   # You can filter the speech first, before the intensity contour is calculated. 
   # This filtering will enhance the vowel part of the spectrum. 
   filterfirst = 1
   # _
   # A relevant peak in the intensity contour must exceed 
   # a minimum intensity level, which is specified as the 
   # maximum intensity level minus a `threshold`. 
   # Intensity peaks below this minimum will be ignored. 
   # A small value (e.g. 2) will ignore most vowel onsets; a large
   # value (e.g. 18) may yield spurious vowel onsets.  
   threshold = 8
# endform
#   comment For determining the midpoint of the rise, the bottom and top parts are ignored.
#   comment This focuses on the central (and often steepest) part of the rise.
#   comment These ignored margins are defined as the bottom and top `margin` of the rise.
#   positive margin_(proportion) 0.20

# obsolete ... getnameofselected geluid1 Sound 1
name1$ = selected$ ("Sound")
# not necessary ... getidofselected geluidid1 Sound 1

# select selected Sound... not necessary... select 'geluidid1'
# copy object name to 'temp' to avoid resampling of original Sound!
Copy... temp

# downsample
## check current Fs before downsampling #
fs = Get sample rate
if fs>11025
  Resample... 11025 1
  Rename... temp
endif

finish = Get finishing time

if filterfirst
	# filter with CF=1000, B=600, hi-freq attentuation, vowel-freq boost
	# sharpen filter to discard more hi-freq components, B=500
	# Filter (one pole)... 1000 500
	# Dec.12th change of filter, for better results
	# 20050111 name of call has changed in Praat 4.2
	# De-emphasize... 50
	# Filter (de-emphasis)... 50
	Filter (one formant)... 1000 500

	# added Dec.12th
	# the filter operation leaves a longer sound, padded with zeroes
	# discard these extra zeroes
	# see manual p.629
	Extract part... 0 'finish' Rectangular 1 1
	# this leaves an extracted sound "*_part"
	Rename... temp
endif

# calculate intensity contour
# minimum F0 is set to long time window, as suggested by PB, to avoid shimmer and AM
# smooth over 80 ms time window, as suggested by Port
# smooth here over 25 ms time window, also smoothing later when taking derivative
framelength = 0.01
# To Intensity... 12.5 'framelength'
# changed for Tiffany's female voice
# To Intensity... 150 'framelength'
# 20050112 HQ
# changed for Frank Wijnen 's male voice, min pitch across words is 74.9 Hz
# but these values yield too smoothed contour
# 20101202 hq adjusted to value 40, was 100, after vowelonset.3b.praat
# 20101202 hq further adjusted to value 60, was 40, because 
# otherwise some early peaks will not be detected because of time smearing
To Intensity... 60 'framelength'
# 20050112 HQ
# higher precision, sinc70, 
# 20101202 interpolation changed back to Cubic
maxint = Get maximum... 0 0 Cubic
t1 = Get time from frame... 1

Down to Matrix
Rename... temp
endtime = Get highest x
ncol = Get number of columns
coldist = Get column distance

# calculate derivative over window of length 2h+1
# Press, Teukolsky, Vetterling & Flannery 1992 "Numerical Recipes in C" par.5.7
# interval length MUST be an odd number of frames -- otherwise timing points are not correct!
h=1
newt1 = 't1'+('h'*'framelength')
ncol = 'ncol'-(2*'h')
# obtain derivative of Intensity matrix here.
# note that frames are NOT aligned between temp and intdot matrices;
# derivative of interval temp[col-h],temp[col+h] corresponds to temp frame 'col'
# but to intdot frame 'col-h' because intdot frames "start later" and end earlier by 'h' frames ;
# hence intdot frame 'col' corresponds to temp frame 'col'+h in time
# so derivative is taken over interval (col+h-h,col+h+h)
Create Matrix... intdot 0 'endtime' 'ncol' 'coldist' 'newt1' 1 1 1 1 1 (Matrix_temp[1,col+'h'+'h']-Matrix_temp[1,col]) / (2*'h'*dx)

# to make the above work, you have to make sure that there is no speech signal
# in the initial and final portions with duration  h*framelength

# convert derivative of Intensity to Sound # hack from PB
To Sound (slice)... 1
Rename... temp_IntDot

# select this Sound
select Sound temp_IntDot
# find positive extrema, maxima, in derivative of Intensity,
# which correspond to steepest rises in Intensity;
# typically occurring just BEFORE vowel activity in oscillogram
To PointProcess (extrema)... Left yes no Sinc70
Rename... temp_rises

select Sound temp_IntDot
# find negative zero-crossings, or falling zero points, in deriv of Int,
# which correspond to peaks in Intensity;
# typically occurring at MAX vowel amplitude in oscillogram
select Sound temp_IntDot
To PointProcess (zeroes)... Left no yes
Rename... temp_peaks

# assume that true vowel onsets actually occur between moment of steepest rise
# and moment of maximum amplitude.
# 'between' is initially defined as 'halfway in time' between the points.

select PointProcess temp_peaks
Copy... temp_onsets
Remove points between... 0 'endtime'

select PointProcess temp_peaks
npeaks = Get number of points
for pindex from 1 to 'npeaks'
	select PointProcess temp_peaks
	ptime = Get time from index... 'pindex'
	select Intensity temp
	pint = Get value at time... 'ptime' Nearest
	# relative peak intensity, local peak relative to threshold relative to maximum
	# relpint = pint - (maxint-threshold)
	if pint > (maxint-threshold)
		select PointProcess temp_rises
		# the following line leads to crashes when detecting metronome beats
		# rindex = Get low index... 'ptime'
		# because the beats may occur immediately in the file
		# the derivative has no positive zerocrossing BEFORE the peak
		# so there is no detectable RISE before the PEAK
		# this leads to rindex=0 which has fatal consequences furtheron.
		# workaround added Dec.11th:
		# use rtime only if rindex>0
		rindex = Get low index... 'ptime'
		if rindex>0
			rtime = Get time from index... 'rindex'
			# onsettime is halfway in time between steepest-rise-moment and peak-moment
			otime = ('rtime'+'ptime')/2
		else
			otime = 'ptime'
		endif
		select PointProcess temp_onsets
		Add point... 'otime'
		# added code Jan.18 to calculate stress score
		# get actual rise value from temp_IntDot
		# select Sound temp_IntDot
		# rise = Get value at time... 'rtime' Cubic
		# peak = pint-(maxint-threshold)
		# printline BINGO: time='otime' peak='peak' rise='rise'
	endif
endfor

# cleanup
select Sound temp
# select Sound temp_rsm
plus Intensity temp
plus Matrix temp
plus Matrix intdot
plus Sound temp_IntDot
plus PointProcess temp_rises
plus PointProcess temp_peaks
Remove
select Sound temp
Remove

# 5 lines to remove additional objects
select Sound temp
select Sound temp_filt
Remove
select Sound temp
Remove


# Below was added by /u/kayleepop
# 
select PointProcess temp_onsets
vowelStart = Get time from index: 1
vowelEnd = vowelStart + 0.07
Remove
selectObject: selectedObj
Extract part: vowelStart, vowelEnd, "rectangular", 1, "no"
extracted = selected()

To Pitch... 0.0 75 600
	writeInfoLine: "Pitch (mean):"
	meanPitch = Get mean: 0, 0, "Hertz"
        appendInfo: "    "
	appendInfo: fixed$ (meanPitch, 2)
	appendInfoLine: " Hz"
Remove

selectObject: extracted
To Formant (burg)... 0.0 5.0 5500.0 0.025 50.0

	appendInfoLine:""
	appendInfoLine: "F1 (mean):"
	meanF1 = Get mean: 1, 0, 0, "Hertz"
        appendInfo: "    "
	appendInfo: fixed$ (meanF1, 2)
	appendInfoLine: " Hz"

	appendInfoLine:""
	appendInfoLine: "F2 (mean):"
	meanF2 = Get mean: 2, 0, 0, "Hertz"
        appendInfo: "    "
	appendInfo: fixed$ (meanF2, 2)
	appendInfoLine: " Hz"

# remove formant object
Remove
selectObject: extracted
Remove