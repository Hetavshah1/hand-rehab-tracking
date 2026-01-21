import pickle
import pprint

file_path = "reference.pkl"  # same folder → simple name works

with open(file_path, "rb") as file:
    data = pickle.load(file)

pprint.pprint(data)
