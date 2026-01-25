import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const Result = ({ result, gender, onRestart }) => {
    const { high_stress, summary_scores } = result.result;
    const { charts } = result;

    const themeColor = gender === 'female' ? '#e83e8c' : '#007bff';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ textAlign: 'center' }}>진단 결과</h1>

            {high_stress ? (
                <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h2>⚠ 고스트레스 주의 ⚠</h2>
                    <p>직무 스트레스 수준이 높게 나타났습니다. 전문가와의 상담을 권장합니다.</p>
                </div>
            ) : (
                <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h2>정상 스트레스 수준</h2>
                    <p>직무 스트레스 수준이 안정적인 범위 내에 있습니다.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                {charts.map((chart, idx) => (
                    <div key={idx} style={{ width: '100%', maxWidth: '400px', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                        <h3 style={{ textAlign: 'center' }}>{chart.label}</h3>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chart.axes}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="label" fontSize={10} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                    <Radar
                                        name={chart.label}
                                        dataKey="score"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <h3>영역별 점수</h3>
                <p>A (스트레스 요인): {summary_scores.sum_a}</p>
                <p>B (스트레스 반응): {summary_scores.sum_b}</p>
                <p>C (사회적 지원): {summary_scores.sum_c}</p>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    onClick={onRestart}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        backgroundColor: themeColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    다시 진단하기
                </button>
            </div>
        </div>
    );
};

export default Result;
