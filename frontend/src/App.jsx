import { useState } from 'react'
import Landing from './components/Landing'
import Questionnaire from './components/Questionnaire'
import Result from './components/Result'
import { postDiagnosis } from './api'
import { Toaster } from 'react-hot-toast'

function App() {
  const [step, setStep] = useState('landing'); // landing, questionnaire, result
  const [gender, setGender] = useState('male');
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleStart = (selectedGender) => {
    setGender(selectedGender);
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = async (answers) => {
    try {
      const result = await postDiagnosis(answers, gender);
      setDiagnosisResult(result);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert('Failed to process diagnosis. Please try again.');
    }
  };

  const handleRestart = () => {
    setStep('landing');
    setDiagnosisResult(null);
    setGender('male');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start', // Align start so it expands down
      backgroundColor: '#f5f5f5',
      paddingTop: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        minHeight: '500px',
        padding: '20px'
      }}>
        <Toaster position="top-center" />
        {step === 'landing' && <Landing onStart={handleStart} />}
        {step === 'questionnaire' && <Questionnaire onComplete={handleQuestionnaireComplete} />}
        {step === 'result' && diagnosisResult && <Result result={diagnosisResult} onRestart={handleRestart} />}
      </div>
    </div>
  )
}

export default App
