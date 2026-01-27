# config.py

# Marker / tracking
MAX_MARKERS = 21

# Debug vs real passive mode
DEBUG_MODE = True   # later False when neon markers are used

# Optical flow parameters
WIN_SIZE = (21, 21)
MAX_LEVEL = 3
CRITERIA = (3, 30, 0.01)

# Angle smoothing
EMA_ALPHA = 0.3
