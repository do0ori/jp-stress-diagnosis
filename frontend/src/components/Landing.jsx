import React, { useState } from 'react';

const Landing = ({ onStart }) => {
    const [gender, setGender] = useState('male');

    const handleStart = () => {
        onStart(gender);
    };

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Work Stress Self-Diagnosis</h1>
            <p>Analyze your stress level at work.</p>

            <div style={{ margin: '2rem 0' }}>
                <h3>Select Gender</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Gender affects the scoring scale.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                    <label style={{ display: 'block', cursor: 'pointer', padding: '1rem', border: gender === 'male' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '8px' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === 'male'}
                            onChange={(e) => setGender(e.target.value)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Male
                    </label>
                    <label style={{ display: 'block', cursor: 'pointer', padding: '1rem', border: gender === 'female' ? '2px solid #e83e8c' : '1px solid #ccc', borderRadius: '8px' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === 'female'}
                            onChange={(e) => setGender(e.target.value)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Female
                    </label>
                </div>
            </div>

            <button
                onClick={handleStart}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Start Diagnosis
            </button>
        </div>
    );
};

export default Landing;
