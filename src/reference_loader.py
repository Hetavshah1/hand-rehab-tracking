import pandas as pd
import numpy as np

def load_reference_angles(csv_path, column_name):
    df = pd.read_csv(csv_path)

    if column_name not in df.columns:
        raise ValueError(f"Column '{column_name}' not found in CSV")

    return df[column_name].to_numpy(dtype=float)
