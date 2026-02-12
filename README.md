# Mode3 Flexi Glove

## Overview

Mode 3 is a hardware-assisted rehabilitation mode intended for patients who are unable to actively perform finger or hand movements.
In this mode, joint angles are acquired directly from a sensorized rehabilitation glove via a microcontroller and compared against a pre-recorded reference movement captured from a physiotherapist.

Unlike camera-based systems, Mode 3 provides direct biomechanical measurements, ensuring stable performance independent of lighting conditions, occlusions, or camera placement. This makes it suitable for early-stage and passive rehabilitation therapy.

## Key Features
Real-time finger joint angle acquisition from hardware sensors

Serial communication with microcontroller-based glove

Reference-driven rehabilitation workflow

Quantitative similarity scoring between patient and reference motion

Reusable reference data across multiple sessions

Modular and extensible software architectur

## Configuration
SERIAL_PORT = "COM5"
BAUD_RATE = 115200

REFERENCE_CSV = "data/reference/reference_angles.csv"
REFERENCE_VIDEO = "data/reference/reference.mp4"