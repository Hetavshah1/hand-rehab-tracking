# Mode 2 – Passive Optical Sensing

This module implements **Mode 2** of the hand rehabilitation system using
**marker-based optical sensing**.

Unlike Mode 4 (MediaPipe-based inference), this mode relies on
**explicit optical markers** placed on a wearable glove to track hand motion
in a deterministic and clinically interpretable manner.

---

## Key Features

- Marker-based hand tracking (no learned model)
- MediaPipe-compatible **21-landmark hand model**
- Missing landmark handling (ignored in computation)
- Real-time joint angle computation
- Overall similarity score against a reference motion
- Debug mode using mouse-clicked virtual markers
- Designed for use with a **medical glove + neon triangular markers**

---

## Notes

- This module is developed in a separate Git branch (`mode2-optical`)
- Mode 4 (MediaPipe) remains untouched in the `main` branch
- The system is designed for rehabilitation and clinical analysis

---

## Author

Hand Rehabilitation Exoskeleton Project  
Mode 2 – Passive Optical Sensing