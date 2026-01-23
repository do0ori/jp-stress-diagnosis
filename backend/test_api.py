import requests
import json

def test_api():
    url = "http://localhost:5000/api/diagnosis"

    def send_diagnosis(name, payload):
        print(f"\n--- Sending Request for {name} ---")
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print("Success!")
                print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            else:
                print(f"Failed: {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"Error: {e}")

    # Test Case 1: High Stress Sample (Simulated)
    # Filling high scores for everything
    answers_1 = {}
    for i in range(1, 18): answers_1[f"A{i}"] = 4
    for i in range(1, 30): answers_1[f"B{i}"] = 4
    for i in range(1, 10): answers_1[f"C{i}"] = 1
    for i in range(1, 3): answers_1[f"D{i}"] = 1

    payload_1 = {
        "gender": "male",
        "answers": answers_1
    }
    send_diagnosis("Test Case 1 (High Stress)", payload_1)

    # Test Case 2: User Provided Specific Values
    answers_2 = {}
    
    a_scores = [1, 1, 2, 3, 3, 1, 4, 4, 3, 3, 2, 3, 2, 4, 3, 3, 4]
    for i, score in enumerate(a_scores, 1):
        answers_2[f"A{i}"] = score
        
    b_scores = [1, 1, 1, 2, 3, 3, 4, 4, 4, 3, 3, 4, 4, 4, 3, 3, 2, 2, 2, 2, 3, 4, 3, 4, 2, 3, 3, 3, 3]
    for i, score in enumerate(b_scores, 1):
        answers_2[f"B{i}"] = score
        
    c_scores = [4, 3, 3, 4, 3, 4, 4, 3, 3]
    for i, score in enumerate(c_scores, 1):
        answers_2[f"C{i}"] = score
        
    # D1-D2 (Arbitrary)
    for i in range(1, 3):
        answers_2[f"D{i}"] = 1 

    payload_2 = {
        "gender": "male",
        "answers": answers_2
    }
    send_diagnosis("Test Case 2 (User Values)", payload_2)

if __name__ == "__main__":
    test_api()
