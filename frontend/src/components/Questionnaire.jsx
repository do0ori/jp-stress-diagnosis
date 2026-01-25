import React, { useEffect, useState } from 'react';
import { getQuestions } from '../api';
import toast from 'react-hot-toast';

const SECTIONS = ['A', 'B', 'C', 'D'];
const SECTION_TITLES = {
    'A': 'Part A. 스트레스 원인',
    'B': 'Part B. 스트레스 반응',
    'C': 'Part C. 사회적 지원',
    'D': 'Part D. 직무 만족도'
};

const Questionnaire = ({ gender, onComplete }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    const themeColor = gender === 'female' ? '#e83e8c' : '#007bff';
    const bgSelected = gender === 'female' ? '#ffeef7' : '#e6f2ff';
    const [error, setError] = useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    const handleFillDebugData = () => {
        const a_scores = [1, 1, 2, 3, 3, 1, 4, 4, 3, 3, 2, 3, 2, 4, 3, 3, 4];
        const b_scores = [1, 1, 1, 2, 3, 3, 4, 4, 4, 3, 3, 4, 4, 4, 3, 3, 2, 2, 2, 2, 3, 4, 3, 4, 2, 3, 3, 3, 3];
        const c_scores = [4, 3, 3, 4, 3, 4, 4, 3, 3];
        const d_scores = [1, 1];

        const debugAnswers = {};
        a_scores.forEach((score, i) => debugAnswers[`A${i + 1}`] = score);
        b_scores.forEach((score, i) => debugAnswers[`B${i + 1}`] = score);
        c_scores.forEach((score, i) => debugAnswers[`C${i + 1}`] = score);
        d_scores.forEach((score, i) => debugAnswers[`D${i + 1}`] = score);

        setAnswers(debugAnswers);
    };

    useEffect(() => {
        getQuestions()
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: parseInt(value, 10)
        }));
    };

    const currentSection = SECTIONS[currentSectionIndex];
    const sectionQuestions = questions.filter(q => q.section === currentSection);

    const handleNext = () => {
        const unansweredQuestion = sectionQuestions.find(q => !answers[q.id]);
        if (unansweredQuestion) {
            toast.error('모든 문항에 답변해주세요.');
            // Scroll to the first unanswered question
            const element = document.getElementById(`question-${unansweredQuestion.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (currentSectionIndex < SECTIONS.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = () => {
        const unansweredQuestion = sectionQuestions.find(q => !answers[q.id]);
        if (unansweredQuestion) {
            toast.error('모든 문항에 답변해주세요.');
            const element = document.getElementById(`question-${unansweredQuestion.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Double check everything just in case
        const answeredCount = Object.keys(answers).length;
        if (answeredCount < questions.length) {
            alert('누락된 답변이 있습니다. 이전 섹션을 확인해주세요.');
            return;
        }
        onComplete(answers);
    };

    const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

    if (loading) return <div>질문을 불러오는 중입니다...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <div style={{ maxWidth: '100%', padding: '1rem' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 100,
                paddingBottom: '1rem',
                borderBottom: '1px solid #eee',
                marginBottom: '2rem'
            }}>
                <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                    <button
                        onClick={handleFillDebugData}
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: '#f8f9fa', color: '#6c757d', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        [개발용] 테스트 데이터 채우기
                    </button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <p>진행률: {progress}%</p>
                    <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: themeColor, transition: 'width 0.3s' }}></div>
                    </div>
                </div>

                <div style={{ paddingBottom: '0.5rem', borderBottom: `2px solid ${themeColor}` }}>
                    <h2>{SECTION_TITLES[currentSection]}</h2>
                    <p style={{ color: '#666', margin: 0 }}>해당 섹션의 모든 문항에 답변해 주세요.</p>
                </div>
            </div>

            {sectionQuestions.map((q) => (
                <div id={`question-${q.id}`} key={q.id} style={{ marginBottom: '2rem', padding: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>{q.number}. {q.text}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {q.options.map((opt, idx) => (
                            <label
                                key={idx}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.8rem',
                                    borderRadius: '4px',
                                    backgroundColor: answers[q.id] === (idx + 1) ? bgSelected : 'white',
                                    border: answers[q.id] === (idx + 1) ? `1px solid ${themeColor}` : '1px solid #ddd',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ position: 'relative', marginRight: '1rem', width: '20px', height: '20px' }}>
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={idx + 1}
                                        checked={answers[q.id] === (idx + 1)}
                                        onChange={(e) => handleOptionChange(q.id, e.target.value)}
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
                                        border: `2px solid ${answers[q.id] === (idx + 1) ? themeColor : '#ccc'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white'
                                    }}>
                                        {answers[q.id] === (idx + 1) && (
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: themeColor
                                            }} />
                                        )}
                                    </div>
                                </div>
                                <span style={{ fontSize: '1rem' }}>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                {currentSectionIndex > 0 ? (
                    <button
                        onClick={handlePrev}
                        style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        이전
                    </button>
                ) : (
                    <div></div>
                )}

                {currentSectionIndex < SECTIONS.length - 1 ? (
                    <button
                        onClick={handleNext}
                        style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: themeColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        다음
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: themeColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        결과 보기
                    </button>
                )}
            </div>
        </div>
    );
};

export default Questionnaire;
