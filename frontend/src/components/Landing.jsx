import React, { useState } from 'react';

const Landing = ({ onStart }) => {
    const [gender, setGender] = useState('male');

    const handleStart = () => {
        onStart(gender);
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
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    backgroundColor: gender === 'female' ? '#e83e8c' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                진단 시작하기
            </button>
        </div>
    );
};

export default Landing;
