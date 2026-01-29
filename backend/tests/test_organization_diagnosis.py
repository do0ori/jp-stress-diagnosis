import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.diagnosis_service import DiagnosisService

class TestOrganizationDiagnosis(unittest.TestCase):
    def setUp(self):
        self.service = DiagnosisService()

    def test_risk_100_scenario(self):
        """
        Test a scenario that should yield Health Risk approx 100.
        Graph 1 Risk 100 Point: Burden=6.5, Control=6.0 (from user data: (6.5, 6.0))
        Graph 2 Risk 100 Point: Sup=10.0, Cow=5.6 (from user data: (10.0, 5.6))
        
        Note: The input to calculation is RAW answers 1-4.
        And the logic 'get_rev' does (5 - val).
        
        Target Aggregates:
        Burden (3 items) = 6.5? No, Burden is SUM of 3 items.
        Wait, the graph axes are SUMs.
        Graph 1 X assumption: "A1+A2+A3". Range 3-12.
        
        So if Burden = 6.5 (Sum), Average Burden = 2.16. (Wait, the formula uses the SUM axis value).
        Service Logic: 
           q_burden = rev(A1)+rev(A2)+rev(A3)
           total_quantitative_burden += q_burden
           avg_burden = total / count.
           
        So avg_burden is the Average of the Sums.
        
        So let's construct answers such that:
        A1+A2+A3 (Reversed) = 6.5 approx.
        A8+A9+A10 (Reversed) = 6.0 approx.
        
        C1+C4+C7 (Reversed Sup) = 10.0 approx.
        C2+C5+C8 (Reversed Cow) = 5.6 approx.
        
        Let's try to get integers.
        Burden 6.5 -> Let's aim for 7 or 6.
        Let's use the explicit point (6.5, 6.0) from user data for Risk 100.
        If we input answers to match these, we should get Risk 100.
        
        But we can't input float answers.
        We can use multiple users to average out to these values.
        User 1: Burden=6, Control=6.
        User 2: Burden=7, Control=6.
        Average Burden = 6.5. Average Control = 6.0.
        """
        
        # User 1: Burden 6. (e.g., 2, 2, 2 reversed -> Inputs 3, 3, 3)
        # Control 6. (e.g., 2, 2, 2 reversed -> Inputs 3, 3, 3)
        u1_answers = {
            "A1": 3, "A2": 3, "A3": 3, # Rev: 2+2+2 = 6
            "A8": 3, "A9": 3, "A10": 3, # Rev: 2+2+2 = 6
            
            # Support needed: 10.0 and 5.6
            # User 1: Sup 10. (e.g., 3, 3, 4 reversed -> 2+2+1?) No.
            # Rev: 5-3=2. 5-3=2. 5-1=4. Sum=8.
            # Need Sum=10. 
            # 5-x + 5-y + 5-z = 10 => 15 - (x+y+z) = 10 => x+y+z = 5.
            # e.g., 1, 2, 2 => 5-1=4, 5-2=3, 5-2=3. Sum=10.
            "C1": 1, "C4": 2, "C7": 2, # Rev Sup = 10
            
            # Cow needed: 5.6. Let's aim for 5 and 6 roughly (avg 5.5) or 6 and 5 (avg 5.5).
            # Need Sum=5.6? Let's do 6 and 5.
            # User 1 Cow: 6. (15 - sum = 6 => sum=9). e.g., 3,3,3.
            "C2": 3, "C5": 3, "C8": 3 # Rev Cow = 6
        }
        
        # User 2: Burden 7. (15 - sum = 7 => sum=8). e.g., 2,3,3 => 2+2+3=7? No 5-2=3, 5-3=2, 5-3=2. Sum=7.
        u2_answers = {
            "A1": 2, "A2": 3, "A3": 3, # Rev: 3+2+2 = 7
            "A8": 3, "A9": 3, "A10": 3, # Rev: 2+2+2 = 6 (Control stays 6)
            
            # Sup: 10. (Same as U1)
            "C1": 1, "C4": 2, "C7": 2, # Rev Sup = 10
            
            # Cow: 5. (15-sum=5 => sum=10). e.g., 3,3,4 => 2+2+1=5.
            "C2": 3, "C5": 3, "C8": 4 # Rev Cow = 5
        }
        
        # Expected Averages:
        # Burden: (6+7)/2 = 6.5
        # Control: (6+6)/2 = 6.0
        # Sup: (10+10)/2 = 10.0
        # Cow: (6+5)/2 = 5.5 (Close to 5.6)
        
        result = self.service.calculate_organization_diagnosis([u1_answers, u2_answers])
        
        print("Diagnosis Result:", result)
        
        # Verify Averages
        self.assertAlmostEqual(result['averages']['quantitative_burden'], 6.5)
        self.assertAlmostEqual(result['averages']['control'], 6.0)
        
        # Verify Risks
        # Theoretical Risk 1: exp((6.5 - 8.25)*0.07668 + (6.0 - 7.4688)*(-0.08896)) * 100
        # Term: -1.75*0.077 + -1.47*-0.089 = -0.134 + 0.131 ~= 0.
        # Should be close to 100.
        
        # Theoretical Risk 2: exp((10 - 7.3)*-0.097 + (5.5 - 8.27)*-0.097) * 100
        # Term: 2.7*-0.097 + -2.77*-0.097 = -0.26 + 0.27 ~= 0.
        # Should be close to 100.
        
        # Let's assert roughly 95-105 range.
        self.assertTrue(90 < result['health_risk']['work_burden_risk'] < 110, f"Risk A {result['health_risk']['work_burden_risk']} not near 100")
        self.assertTrue(90 < result['health_risk']['support_risk'] < 110, f"Risk B {result['health_risk']['support_risk']} not near 100")
        self.assertTrue(90 < result['health_risk']['comprehensive_risk'] < 110)

if __name__ == '__main__':
    unittest.main()
