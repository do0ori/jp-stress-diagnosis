import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const Result = ({ result, onRestart }) => {
    const { high_stress, summary_scores } = result.result;
    const { charts } = result;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ textAlign: 'center' }}>Diagnosis Results</h1>

            {high_stress ? (
                <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h2>⚠ High Stress Warning ⚠</h2>
                    <p>Your results indicate high stress levels. It is recommended to consult with a specialist.</p>
                </div>
            ) : (
                <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                    <h2>Normal Stress Level</h2>
                    <p>Your stress levels appear to be within a manageable range.</p>
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
                <h3>Summary Scores</h3>
                <p>A (Causes): {summary_scores.sum_a}</p>
                <p>B (Responses): {summary_scores.sum_b}</p>
                <p>C (Support): {summary_scores.sum_c}</p>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    onClick={onRestart}
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
                    Restart Diagnosis
                </button>
            </div>
        </div>
    );
};

export default Result;
