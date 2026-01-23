import json
import re

def parse_range(range_str):
    if not range_str:
        return None
    
    # Handle simple integer "12"
    if range_str.isdigit():
        val = int(range_str)
        return {"min": val, "max": val}
    
    # Handle range "3-5"
    if '-' in range_str:
        parts = range_str.split('-')
        if len(parts) == 2:
            return {"min": int(parts[0]), "max": int(parts[1])}
            
    return None

import json

def reformat_maps():
    input_path = '../backend/scoring_maps_raw.json'
    output_path = '../backend/scoring_maps.json'
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    new_data = {}
    
    for scale, points in data.items():
        new_data[scale] = {}
        for point, range_str in points.items():
            if range_str is None:
                 new_data[scale][point] = None
                 continue
                 
            # convert range string to min/max
            # "3-5" -> {"min": 3, "max": 5}
            # "12" -> {"min": 12, "max": 12}
            
            result = None
            s = str(range_str).strip()
            
            if '-' in s:
                parts = s.split('-')
                result = {"min": int(parts[0]), "max": int(parts[1])}
            else:
                try:
                    val = int(s)
                    result = {"min": val, "max": val}
                except:
                    result = None # Should not happen based on review
            
            new_data[scale][point] = result
            
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=2)
        
    print("Reformatted scoring maps.")

if __name__ == "__main__":
    reformat_maps()
