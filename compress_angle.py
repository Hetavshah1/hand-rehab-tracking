import pandas as pd
import numpy as np

# Load your data
df = pd.read_csv("reference_angles (1).csv")

# New desired time points
new_time = np.arange(1, 8)  # [1, 2, 3, 4, 5, 6, 7]

# Create new dataframe
compressed_df = pd.DataFrame({"time_sec": new_time})

# Interpolate each angle column
for col in df.columns:
    if col != "time_sec":
        compressed_df[col] = np.interp(
            new_time,
            df["time_sec"],
            df[col]
        )

# Save result
compressed_df.to_csv("reference_angles_compressed_7points.csv", index=False)

print(compressed_df)
