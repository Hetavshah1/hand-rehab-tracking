# Using angles from angel_conversion.py


# calculate the error between the desired angle and the actual angle
import pandas as pd
import numpy as np

class AngleErrorCalculator:
    def __init__(self, csv_path):
        """
        csv_path : CSV file with columns
                   time_sec, thumb, index, middle, ring, pinky
        """
        self.df = pd.read_csv(csv_path)

        required_cols = {"thumb", "index", "middle", "ring", "pinky"}
        if not required_cols.issubset(self.df.columns):
            raise ValueError("CSV missing required finger columns")

    def compute_error(self, measured_angles, time_index):
        """
        measured_angles : dict with keys
                          thumb, index, middle, ring, pinky

        time_index : 0-based index (0 → first time point)

        RETURNS:
        dict of errors for each finger
        """
        time_index=time_index-1
        if time_index >= len(self.df):
            raise IndexError("Time index out of range")

        ref_row = self.df.iloc[time_index]

        error = {}
        for finger in ["thumb", "index", "middle", "ring", "pinky"]:
            error[finger] = ref_row[finger] - measured_angles[finger]
            
        avg=np.mean(np.abs(list(error.values())))# Avergae of all errors
        
        similarity = (1-(avg/180))*100 # for similarity
        
        #return error
        return error,similarity



