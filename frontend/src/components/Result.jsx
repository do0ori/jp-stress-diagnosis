import { useRef, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Result = ({ result, gender, onRestart }) => {
    const { high_stress, summary_scores } = result.result;
    const { charts } = result;

    const [downloading, setDownloading] = useState(false);
    const resultRef = useRef(null);

    const handleDownloadPDF = async () => {
        if (!resultRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    // 1. Hide buttons
                    const buttons = clonedDoc.querySelectorAll('button');
                    buttons.forEach(btn => btn.style.display = 'none');

                    // 2. Hide email input section
                    const emailSection = clonedDoc.querySelector('.email-section');
                    if (emailSection) emailSection.style.display = 'none';

                    // 3. Force Container Width for Horizontal Layout
                    const container = clonedDoc.querySelector('.result-container');
                    if (container) {
                        container.style.maxWidth = 'none';
                        container.style.width = '1200px';
                        container.style.padding = '2rem';
                    }

                    // 4. Handle Scrollable Chart Area
                    const chartArea = clonedDoc.querySelector('.chart-scroll-area');
                    if (chartArea) {
                        chartArea.style.overflow = 'visible';
                        chartArea.style.flexWrap = 'nowrap';
                        chartArea.style.justifyContent = 'space-between';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const today = new Date();
            const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

            pdf.save(`stress-diagnosis-result-${dateString}.pdf`);
            toast.success('PDF 다운로드가 시작되었습니다.');
        } catch (error) {
            console.error(error);
            toast.error('PDF 생성 중 오류가 발생했습니다.');
        } finally {
            setDownloading(false);
        }
    };


    const themeColor = gender === 'female' ? '#e83e8c' : '#007bff';

    return (
        <div ref={resultRef} className="result-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff' }}>
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

            <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                <p>※ 차트의 중심에 가까울수록 스트레스 요인이 많거나 스트레스 반응이 높은 상태입니다.</p>
                <p>(그래프가 바깥쪽으로 넓을수록 건강하고 긍정적인 상태를 의미)</p>
            </div>

            <div className="chart-scroll-area" style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', gap: '1rem', overflowX: 'auto' }}>
                {charts.map((chart, idx) => (
                    <div key={idx} style={{ flex: '1', minWidth: '300px', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
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

            <div className="email-section" style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid #eee' }}>          <h3>영역별 점수</h3>
                <p>A (스트레스 요인): {summary_scores.sum_a}</p>
                <p>B (스트레스 반응): {summary_scores.sum_b}</p>
                <p>C (사회적 지원): {summary_scores.sum_c}</p>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: downloading ? 'wait' : 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {downloading ? 'PDF 생성 중...' : '📄 결과지 PDF로 다운로드'}
                    </button>
                </div>
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
