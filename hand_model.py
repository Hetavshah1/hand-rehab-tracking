# hand_model.py

HAND_LANDMARKS = {
    0: "wrist",

    1: "thumb_cmc",
    2: "thumb_mcp",
    3: "thumb_ip",
    4: "thumb_tip",

    5: "index_mcp",
    6: "index_pip",
    7: "index_dip",
    8: "index_tip",

    9: "middle_mcp",
    10: "middle_pip",
    11: "middle_dip",
    12: "middle_tip",

    13: "ring_mcp",
    14: "ring_pip",
    15: "ring_dip",
    16: "ring_tip",

    17: "pinky_mcp",
    18: "pinky_pip",
    19: "pinky_dip",
    20: "pinky_tip"
}

def empty_hand():
    return {i: None for i in range(21)}
