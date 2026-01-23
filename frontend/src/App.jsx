import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Example fetch to backend (will need proxy setup or full URL)
    fetch('http://localhost:5000/health-check')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>JP Stress Diagnosis</h1>
      <p>Frontend is running!</p>
      {message && <p>Backend says: {message}</p>}
    </div>
  )
}

export default App
