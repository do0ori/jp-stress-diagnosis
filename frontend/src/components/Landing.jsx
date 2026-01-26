import React, { useState } from 'react';
import { checkHealth } from '../api';

const Landing = ({ onStart }) => {
    const [gender, setGender] = useState('male');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleStart = async () => {
        setIsLoading(true);
        setStatusMessage('서버 상태를 확인 중입니다...');

        try {
            let attempts = 0;
            const maxAttempts = 20; // Try for ~1 minute

            while (attempts < maxAttempts) {
                try {
                    await checkHealth();
                    onStart(gender);
                    return;
                } catch (e) {
                    console.log("Health check failed, retrying...", e);
                    attempts++;
                    // If first attempt fails (or subsequent), show wake-up message
                    setStatusMessage('서버가 수면 모드에서 깨어나고 있습니다. (약 30초 소요)');

                    // Wait 3 seconds before next retry
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            setStatusMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setStatusMessage('알 수 없는 오류가 발생했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>직무 스트레스 자가 진단</h1>
            <p>현재 직장에서의 스트레스 수준을 분석해보세요.</p>

            <div style={{ margin: '2rem 0' }}>
                <h3>성별 선택</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    성별에 따라 진단 기준이 달라집니다.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1rem', border: gender === 'male' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '8px', backgroundColor: gender === 'male' ? '#e6f2ff' : 'transparent' }}>
                        <div style={{ position: 'relative', marginRight: '0.5rem', width: '20px', height: '20px' }}>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === 'male'}
                                onChange={(e) => setGender(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    margin: 0
                                }}
                            />
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: `2px solid ${gender === 'male' ? '#007bff' : '#ccc'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white'
                            }}>
                                {gender === 'male' && (
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: '#007bff'
                                    }} />
                                )}
                            </div>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: gender === 'male' ? 'bold' : 'normal' }}>남성</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1rem', border: gender === 'female' ? '2px solid #e83e8c' : '1px solid #ccc', borderRadius: '8px', backgroundColor: gender === 'female' ? '#ffeef7' : 'transparent' }}>
                        <div style={{ position: 'relative', marginRight: '0.5rem', width: '20px', height: '20px' }}>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === 'female'}
                                onChange={(e) => setGender(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    margin: 0
                                }}
                            />
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: `2px solid ${gender === 'female' ? '#e83e8c' : '#ccc'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white'
                            }}>
                                {gender === 'female' && (
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e83e8c'
                                    }} />
                                )}
                            </div>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: gender === 'female' ? 'bold' : 'normal' }}>여성</span>
                    </label>
                </div>
            </div>

            <button
                onClick={handleStart}
                disabled={isLoading}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    backgroundColor: isLoading ? '#ccc' : (gender === 'female' ? '#e83e8c' : '#007bff'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? (
                    <span>
                        준비 중
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                    </span>
                ) : '진단 시작하기'}
            </button>
            {isLoading && (
                <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    {statusMessage}
                </p>
            )}
        </div>
    );
};

export default Landing;
