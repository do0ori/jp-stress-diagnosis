from utils.data_loader import DataLoader
import math

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

    def calculate_organization_diagnosis(self, answers_list, gender="male"):
        """
        Calculates organizational health risk based on a list of employee answers.
        Uses coefficients derived from standard stress diagnosis graphs (Brief Job Stress Questionnaire).
        """
        
        # Coefficients (Solved based on regression from standard graph points)
        # Graph 1 (Job Demand-Control: Burden vs Control)
        # Risk = 100 * exp((Burden - A)*alpha + (Control - B)*beta)
        COEFF_A = 8.2500
        COEFF_B = 7.4688
        COEFF_ALPHA = 0.07668
        COEFF_BETA = -0.08896

        # Graph 2 (Social Support: Supervisor vs Coworker)
        # Risk = 100 * exp((Sup - C)*gamma + (Cow - D)*delta)
        COEFF_C = 7.3000
        COEFF_D = 8.2668
        COEFF_GAMMA = -0.09711
        COEFF_DELTA = -0.09711 
        
        # Accumulators
        total_quantitative_burden = 0
        total_control = 0
        total_supervisor_support = 0
        total_coworker_support = 0
        
        valid_count = 0
        
        for answers in answers_list:
            # 1. Reverse Scoring & Item Selection
            # Items: A1-A3, A8-A10, C1, C2, C4, C5, C7, C8
            # Reverse: 1->4, 2->3, 3->2, 4->1 => (5 - val)
            
            def get_rev(qid):
                val = answers.get(qid)
                if val is None or val < 1 or val > 4:
                    return None # Invalid or missing
                return 5 - val

            try:
                # Axis 1: Quantitative Burden (A1+A2+A3)
                v_a1 = get_rev("A1")
                v_a2 = get_rev("A2")
                v_a3 = get_rev("A3")
                
                # Axis 2: Control (A8+A9+A10)
                v_a8 = get_rev("A8")
                v_a9 = get_rev("A9")
                v_a10 = get_rev("A10")
                
                # Axis 3: Supervisor Support (C1+C4+C7)
                v_c1 = get_rev("C1")
                v_c4 = get_rev("C4")
                v_c7 = get_rev("C7")
                
                # Axis 4: Coworker Support (C2+C5+C8)
                v_c2 = get_rev("C2")
                v_c5 = get_rev("C5")
                v_c8 = get_rev("C8")
                
                # Check for None (missing data)
                if None in [v_a1, v_a2, v_a3, v_a8, v_a9, v_a10, v_c1, v_c4, v_c7, v_c2, v_c5, v_c8]:
                    continue

                q_burden = v_a1 + v_a2 + v_a3
                control = v_a8 + v_a9 + v_a10
                sup_support = v_c1 + v_c4 + v_c7
                cow_support = v_c2 + v_c5 + v_c8
                
                total_quantitative_burden += q_burden
                total_control += control
                total_supervisor_support += sup_support
                total_coworker_support += cow_support
                
                valid_count += 1
                
            except TypeError:
                continue

        if valid_count == 0:
            return {"error": "No valid data provided for organizational diagnosis"}
            
        # 2. Averages
        avg_burden = total_quantitative_burden / valid_count
        avg_control = total_control / valid_count
        avg_sup_support = total_supervisor_support / valid_count
        avg_cow_support = total_coworker_support / valid_count
        
        # 3. Health Risk Calculation
        # Risk A = 100 * exp((Mean_Burden - A) * alpha + (Mean_Control - B) * beta)
        term_a = (avg_burden - COEFF_A) * COEFF_ALPHA + (avg_control - COEFF_B) * COEFF_BETA
        risk_a = 100 * math.exp(term_a)
        
        # Risk B = 100 * exp((Mean_Sup - C) * gamma + (Mean_Cow - D) * delta)
        term_b = (avg_sup_support - COEFF_C) * COEFF_GAMMA + (avg_cow_support - COEFF_D) * COEFF_DELTA
        risk_b = 100 * math.exp(term_b)
        
        # Total Risk
        total_risk = (risk_a * risk_b) / 100
        
        return {
            "count": valid_count,
            "averages": {
                "quantitative_burden": round(avg_burden, 2),
                "control": round(avg_control, 2),
                "supervisor_support": round(avg_sup_support, 2),
                "coworker_support": round(avg_cow_support, 2)
            },
            "health_risk": {
                "work_burden_risk": round(risk_a, 1),
                "support_risk": round(risk_b, 1),
                "comprehensive_risk": round(total_risk, 1)
            }
        }
