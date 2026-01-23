import pandas as pd
import json
import re

def parse_options(opt_str):
    opt_str = str(opt_str).strip()
    parts = re.split(r'[①②③④]', opt_str)
    options = [p.strip() for p in parts if p.strip()]
    return options

def extract_questions():
    input_file = '../JP 스트레스 체크 문항 설계 - 채점 기준.csv'
    output_path = '../backend/questions.json'
    
    try:
        df = pd.read_csv(input_file, header=None)
        
        questions = []
        
        for index, row in df.iterrows():
            val0 = row[0]
            
            if pd.isna(val0):
                continue
                
            section = str(val0).strip()
            
            # Filter only valid sections
            if section not in ['A', 'B', 'C', 'D']:
                continue
            
            # Ensure number is valid (skip headers that might look like sections if any, though "영역" is not A/B/C/D)
            try:
                number = int(row[1])
            except:
                continue
                
            text = str(row[2]).strip()
            
            # Scores (Cols 3,4,5,6)
            try:
                scores = [int(row[3]), int(row[4]), int(row[5]), int(row[6])]
            except:
                 # fallback or continue?
                 print(f"Error parsing scores for {section}{number}")
                 continue

            # Options (Col 7)
            opt_str = row[7]
            option_texts = parse_options(opt_str)
            
            q_obj = {
                "id": f"{section}{number}",
                "section": section,
                "number": number,
                "text": text,
                "options": []
            }
            
            for i in range(4):
                label = option_texts[i] if i < len(option_texts) else f"Option {i+1}"
                # Handle case where we might have fewer options than scores (unlikely)
                q_obj["options"].append({
                    "label": label,
                    "score": scores[i]
                })
            
            questions.append(q_obj)
            
        # Validation
        if len(questions) != 57:
            print(f"Warning: Expected 57 questions, found {len(questions)}")
        else:
            print(f"Success: Found {len(questions)} questions.")

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
            
        print(f"Saved to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_questions()
