from utils.data_loader import DataLoader

class DiagnosisService:
    def __init__(self):
        self.loader = DataLoader.get_instance()
        self.factors = self.loader.get_factor_definitions()
        self.scoring_maps = self.loader.get_scoring_maps()
        self.questions = self.loader.get_questions()
        
        # Optimize question lookup
        self._question_map = {q['id']: q for q in self.questions}

    def calculate(self, answers, gender):
        """
        Calculates stress scores and determines high stress status.
        :param answers: Dict of question ID (e.g., "A1") to score (1-4)
                        IMPORTANT: The input values are expected to be the 1-based INDEX of the selected option.
                        (e.g., 1=1st option, 4=4th option).
                        We allow passing the score directly IF it matches the index context,
                        but to be safe, we should map index -> score from questions.json.
        :param gender: "male" or "female"
        :return: Dict containing results
        """
        
        # 1. Calculate Factor Scores
        # Note: Factor scoring traditionally uses the *value* associated with the option index directly 
        # OR uses weights against the *raw score* (1-4).
        # Existing logic assumes 'user_score' is the value to be weighted.
        # If 'answers' contains 1-4 indices, we might need to map them to scores FIRST if they differ.
        # However, typically Factor weights are applied to the 1-4 scale directly. 
        # Let's assume for Factor Scores (Logic 1), the input 1-4 is what's expected.
        # BUT for High Stress (Logic 2), we MUST use the "score" field from questions.json options.
        
        factor_results = {}

        for section_key in ["A", "B", "C", "D"]:
            section_factors = self.factors.get(section_key, {})
            
            for factor_id, factor_def in section_factors.items():
                raw_score = factor_def.get('base', 0)
                weights = factor_def.get('weights', {})
                
                # Calculate Raw Score for this Factor
                for q_id, weight in weights.items():
                    user_answer_idx = answers.get(q_id, 0)
                    
                    # For Factor calculation, we use the 1-based index (1-4) directly.
                    # This aligns with the group definitions (which handle reverse logic).
                    # The 'score' field in questions.json is only for the High Stress Sum check.
                    if user_answer_idx == 0:
                        pass
                    raw_score += (user_answer_idx * weight)
                
                # Map to Scale (1-5)
                scale_key = factor_def['scales'][gender]
                scale_map = self.scoring_maps.get(scale_key, {})
                
                converted_scale = self._map_score_to_scale(raw_score, scale_map)
                
                # Chart Point Conversion
                group = factor_def.get('group', 1)
                if group == 1:
                    chart_point = 6 - converted_scale
                else:
                    chart_point = converted_scale

                factor_results[factor_id] = {
                    "label": factor_def['label'],
                    "raw": raw_score,
                    "scale": converted_scale,
                    "chart_point": chart_point
                }

        # 2. Calculate High Stress Status
        # Condition 1: B Total >= 77
        # Condition 2: (A+C) >= 76 AND B >= 63
        # These totals MUST be the SUM of the "score" value from options, NOT the raw index.
        
        sum_a = self._sum_section_answers(answers, "A", 17)
        sum_b = self._sum_section_answers(answers, "B", 29)
        sum_c = self._sum_section_answers(answers, "C", 9)
        
        is_high_stress = False
        if sum_b >= 77:
            is_high_stress = True
        elif (sum_a + sum_c) >= 76 and sum_b >= 63:
            is_high_stress = True

        # 3. Format Response for Frontend (Spider Charts)
        # Groups: A (Causes), B (Responses), C&D (Support/Resources)
        
        causes_axes = []
        responses_axes = []
        support_axes = []

        # Sort keys to ensure consistent order in charts
        sorted_factor_ids = sorted(factor_results.keys())

        for fid in sorted_factor_ids:
            data = factor_results[fid]
            axis_data = {
                "id": fid,
                "label": data['label'],
                "score": data['chart_point']  # Use calculated chart point (1-5)
            }
            
            if fid.startswith("F-A"):
                causes_axes.append(axis_data)
            elif fid.startswith("F-B"):
                responses_axes.append(axis_data)
            elif fid.startswith("F-C") or fid.startswith("F-D"):
                support_axes.append(axis_data)

        return {
            "result": {
                "high_stress": is_high_stress,
                "summary_scores": {
                    "sum_a": sum_a,
                    "sum_b": sum_b,
                    "sum_c": sum_c
                }
            },
            "charts": [
                {
                    "label": "스트레스 요인 (A)",
                    "axes": causes_axes
                },
                {
                    "label": "스트레스 반응 (B)",
                    "axes": responses_axes
                },
                {
                    "label": "지원 요인 (C & D)",
                    "axes": support_axes
                }
            ]
        }

    def _map_score_to_scale(self, raw_score, scale_map):
        """
        Maps a raw score to a 1-5 scale based on the provided map.
        Map format: { "1": {"min": x, "max": y}, ... }
        """
        for scale, range_info in scale_map.items():
            if range_info is None:
                continue
            
            # JSON keys are strings, convert to int for return
            scale_val = int(scale)
            if range_info['min'] <= raw_score <= range_info['max']:
                return scale_val
                
        # Fallback
        return 3 

    def _sum_section_answers(self, answers, prefix, count):
        total = 0
        for i in range(1, count + 1):
            key = f"{prefix}{i}"
            user_answer_idx = answers.get(key, 0)
            score_val = self._get_score_for_answer(key, user_answer_idx)
            total += score_val
        return total
        
    def _get_score_for_answer(self, q_id, answer_index):
        """
        Retrieves the score for a given question ID and selected answer index (1-4).
        """
        if not answer_index or answer_index < 1 or answer_index > 4:
            return 0
            
        question = self._question_map.get(q_id)
        if not question:
            return 0
            
        # options are a list, 0-indexed. answer_index is 1-based.
        try:
            option = question['options'][answer_index - 1]
            return option['score']
        except IndexError:
            return 0
