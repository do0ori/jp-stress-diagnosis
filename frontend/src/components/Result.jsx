import { useRef, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import stressBg from '../assets/stress_graph_bg.png';
import supportBg from '../assets/support_graph_bg.png';

const Result = ({ result, gender, onRestart }) => {
    const { high_stress, summary_scores } = result.result;
    const { charts, organization } = result;

    const [downloading, setDownloading] = useState(false);

    // Split refs for multi-page PDF
    const part1Ref = useRef(null);
    const part2Ref = useRef(null);

    const handleDownloadPDF = async () => {
        if (!part1Ref.current) return;
        setDownloading(true);
        try {
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Helper to capture a section
            const captureSection = async (element) => {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    windowWidth: 1600, // Ensure wide capture for landscape
                    onclone: (clonedDoc) => {
                        // Hide buttons if any inside
                        const buttons = clonedDoc.querySelectorAll('button');
                        buttons.forEach(btn => btn.style.display = 'none');

                        // Force Container Width for Landscape PDF
                        const contentDiv = clonedDoc.body.querySelector('[data-pdf-section]');
                        if (contentDiv) {
                            contentDiv.style.width = '1400px';
                            contentDiv.style.maxWidth = 'none';
                            contentDiv.style.padding = '20px';
                            contentDiv.style.margin = '0 auto';
                        }

                        // 1. Radar Charts Optimization (Page 1)
                        const radarContainer = clonedDoc.querySelector('.radar-charts-section > div');
                        if (radarContainer) {
                            radarContainer.style.flexDirection = 'row';
                            radarContainer.style.flexWrap = 'nowrap';
                            radarContainer.style.justifyContent = 'center';
                            radarContainer.style.gap = '40px';
                            radarContainer.style.alignItems = 'stretch';

                            Array.from(radarContainer.children).forEach(child => {
                                child.style.width = '30%';
                                child.style.maxWidth = 'none';
                                child.style.flex = '0 0 auto';
                                child.style.margin = '0';
                                child.style.padding = '1rem';

                                child.style.display = 'flex';
                                child.style.flexDirection = 'column';
                                child.style.alignItems = 'center';
                            });
                        }

                        // 2. Organization Charts Optimization (Page 2)
                        const chartRows = clonedDoc.querySelectorAll('.chart-row-section');
                        chartRows.forEach(row => {
                            row.style.flexDirection = 'row';
                            row.style.flexWrap = 'nowrap';
                            row.style.justifyContent = 'space-between';
                            row.style.gap = '3rem';
                            row.style.alignItems = 'flex-start';

                            Array.from(row.children).forEach(child => {
                                child.style.width = '48%';
                                child.style.maxWidth = 'none';
                            });
                        });

                        // 2.1 Expand Inner Bar Charts
                        const barWrappers = clonedDoc.querySelectorAll('.bar-chart-wrapper');
                        barWrappers.forEach(wrapper => {
                            wrapper.style.width = '100%';
                            // Target the inner flex container that holds the bars
                            const innerFlex = wrapper.querySelector('.bar-flex-container');
                            if (innerFlex) {
                                innerFlex.style.justifyContent = 'space-around'; // Spread bars apart
                                innerFlex.style.gap = '0';
                                innerFlex.style.width = '100%';
                            }
                        });

                        // 2.2 Expand Inner Scatter Charts
                        const scatterWrappers = clonedDoc.querySelectorAll('.scatter-chart-wrapper');
                        scatterWrappers.forEach(wrapper => {
                            wrapper.style.maxWidth = 'none';
                            wrapper.style.width = '100%';
                            wrapper.style.height = 'auto'; // Release fixed 400px
                            wrapper.style.aspectRatio = '1 / 1'; // Keep square

                            // Adjust the inner content scaling if needed
                            // The inner div with labels is relative. 
                            // We might need to ensure the graph bg fills the new size.
                            const innerGraph = wrapper.querySelector('.scatter-inner-box');
                            if (innerGraph) {
                                innerGraph.style.width = '80%'; // Relative to the new huge wrapper
                                innerGraph.style.height = '80%';
                                innerGraph.style.margin = '10% auto'; // Center it
                            }
                        });
                    }
                });
                return canvas;
            };

            // 1. Capture Part 1 (Summary + Radar)
            const canvas1 = await captureSection(part1Ref.current);
            const imgData1 = canvas1.toDataURL('image/png');
            const imgWidth1 = canvas1.width;
            const imgHeight1 = canvas1.height;
            const ratio1 = Math.min(pdfWidth / imgWidth1, pdfHeight / imgHeight1);
            const imgX1 = (pdfWidth - imgWidth1 * ratio1) / 2;

            pdf.addImage(imgData1, 'PNG', imgX1, 10, imgWidth1 * ratio1, imgHeight1 * ratio1);

            // 2. Capture Part 2 (Organization) if exists
            if (organization && part2Ref.current) {
                pdf.addPage(); // New Landscape Page
                const canvas2 = await captureSection(part2Ref.current);
                const imgData2 = canvas2.toDataURL('image/png');
                const imgWidth2 = canvas2.width;
                const imgHeight2 = canvas2.height;
                const ratio2 = Math.min(pdfWidth / imgWidth2, pdfHeight / imgHeight2);
                const imgX2 = (pdfWidth - imgWidth2 * ratio2) / 2;

                pdf.addImage(imgData2, 'PNG', imgX2, 10, imgWidth2 * ratio2, imgHeight2 * ratio2);
            }

            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            const timeString = today.toTimeString().split(' ')[0].replace(/:/g, '-');

            pdf.save(`stress-diagnosis-result-${dateString}_${timeString}.pdf`);
            toast.success('PDF 다운로드가 시작되었습니다.');
        } catch (error) {
            console.error(error);
            toast.error('PDF 생성 중 오류가 발생했습니다.');
        } finally {
            setDownloading(false);
        }
    };


    const themeColor = gender === 'female' ? '#e83e8c' : '#007bff';

    const getGradeColor = (score) => {
        if (score >= 11) return '#2b8a3e'; // Very Good
        if (score >= 9) return '#66a80f';  // Good
        if (score >= 7) return '#e67700';  // Normal
        if (score >= 5) return '#d9480f';  // Bad
        return '#e03131'; // Very Bad
    };

    const getGradeText = (score) => {
        if (score >= 11) return '매우 좋음';
        if (score >= 9) return '좋음';
        if (score >= 7) return '보통';
        if (score >= 5) return '나쁨';
        return '매우 나쁨';
    };

    // Helper for risk score color
    const getRiskColor = (score) => {
        if (score <= 100) return '#333'; // Black (Normal)
        if (score <= 130) return '#e67700'; // Orange (Warning)
        return '#e03131'; // Red (Danger)
    };

    const VerticalBar = ({ label, score }) => {
        const heightPercent = Math.max(0, ((score - 3) / 9) * 100);
        const color = getGradeColor(score);
        const gradeText = getGradeText(score);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', position: 'relative', height: '100%', justifyContent: 'flex-end', zIndex: 10 }}>
                {/* Bar */}
                <div style={{
                    width: '30px',
                    height: `${heightPercent}%`,
                    minHeight: '4px', // Ensure bar is visible even at 0%
                    backgroundColor: color,
                    borderRadius: '15px 15px 0 0',
                    transition: 'height 1s ease-in-out',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}></div>

                {/* Labels positioned BELOW the graph area */}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '10px', textAlign: 'center', width: '120px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: color }}>
                        {gradeText}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                        {score.toFixed(1)}점
                    </div>
                </div>
            </div>
        );
    };

    // Background Grid Component
    const ZebraBackground = () => (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
            {[
                { label: '매우 좋음', color: '#ebfbee', textColor: '#2b8a3e' }, // 11-12
                { label: '좋음', color: '#f4fce3', textColor: '#66a80f' },    // 9-10
                { label: '보통', color: '#fff9db', textColor: '#e67700' },    // 7-8
                { label: '나쁨', color: '#fff4e6', textColor: '#d9480f' },    // 5-6
                { label: '매우 나쁨', color: '#fff5f5', textColor: '#e03131' }, // 3-4
            ].map((level, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: level.color, display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: level.textColor }}>
                        {level.label}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="result-wrapper" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>

            {/* PART 1: Summary & Radar Charts */}
            <div ref={part1Ref} data-pdf-section className="result-container-part1" style={{ padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>진단 결과</h1>

                {/* Diagnosis Result Alert */}
                {high_stress ? (
                    <div style={{ padding: '1.5rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠ 고스트레스 주의 ⚠</h2>
                        <p style={{ fontSize: '1.1rem' }}>직무 스트레스 수준이 높게 나타났습니다. 전문가와의 상담을 권장합니다.</p>
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>정상 스트레스 수준</h2>
                        <p style={{ fontSize: '1.1rem' }}>직무 스트레스 수준이 안정적인 범위 내에 있습니다.</p>
                    </div>
                )}

                {/* Summary Scores (Simple Value Only) */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>스트레스 요인 (A)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{summary_scores.sum_a}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>스트레스 반응 (B)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{summary_scores.sum_b}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>사회적 지지 (C)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{summary_scores.sum_c}</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#666', fontSize: '1rem' }}>
                    <p>※ 차트의 중심에 가까울수록 스트레스 요인이 많거나 스트레스 반응이 높은 상태입니다.</p>
                    <p>(그래프가 바깥쪽으로 넓을수록 건강하고 긍정적인 상태를 의미)</p>
                </div>

                {/* Radar Charts Grid (Vertical Stack) */}
                <div className="radar-charts-section" style={{ marginBottom: '4rem' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', color: '#333' }}>상세 직무 스트레스 요인</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
                        {charts.map((chart, idx) => (
                            <div key={idx} style={{ width: '100%', maxWidth: '600px', border: '1px solid #ddd', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '1rem', color: '#555' }}>{chart.label}</h3>
                                <div style={{ width: '100%', height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chart.axes}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="label" fontSize={12} />
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
                </div>
            </div>

            {/* PART 2: Organization Diagnosis */}
            {organization && (
                <div ref={part2Ref} data-pdf-section className="organization-section" style={{ marginTop: '0', borderTop: '2px solid #eee', paddingTop: '3rem', padding: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '1.8rem', color: '#333', fontWeight: 'bold' }}>종합 직무 스트레스 진단 (개인 건강 리스크)</h2>

                    {/* Section 1: Job Burden */}
                    <div style={{ marginBottom: '5rem', padding: '2rem', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '3rem', color: '#007bff' }}>1. 업무 부담 요인 & 건강 리스크 판정</h3>
                        <div className="chart-row-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>

                            {/* 1-1. Bar Chart */}
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        업무 부담 요인 <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#777' }}>(점수)</span>
                                    </h4>
                                </div>
                                {/* Bar Chart Container */}
                                <div className="bar-chart-wrapper" style={{ position: 'relative', height: '400px', padding: '0 10px', borderRadius: '15px', border: '1px solid #f1f3f5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    {/* Graph Area (Fixed Height) */}
                                    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                                        <ZebraBackground />
                                        <div className="bar-flex-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '40px', paddingBottom: '0' }}>
                                            <VerticalBar label="업무 여유도" score={15 - organization.averages.quantitative_burden} />
                                            <VerticalBar label="직무 재량권" score={organization.averages.control} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 1-2. Stress Map */}
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        건강 리스크 판정
                                    </h4>
                                    <div style={{ fontSize: '1.1rem', color: '#555' }}>
                                        건강 리스크: <span style={{ fontWeight: 'bold', color: getRiskColor(organization.health_risk.work_burden_risk) }}>{organization.health_risk.work_burden_risk.toFixed(1)}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#888' }}> (기준 100)</span>
                                    </div>
                                </div>
                                <div className="scatter-chart-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '400px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '15px', padding: '10px', backgroundColor: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <div className="scatter-inner-box" style={{ position: 'relative', width: '280px', height: '280px', margin: '60px auto 10px auto' }}>
                                        {/* Y Labels */}
                                        <div style={{ position: 'absolute', top: '50%', left: '-50px', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>직무 재량권</div>
                                        <div style={{ position: 'absolute', top: '0', left: '-25px', fontSize: '0.7rem' }}>High</div>
                                        <div style={{ position: 'absolute', bottom: '0', left: '-25px', fontSize: '0.7rem' }}>Low</div>

                                        {/* Graph */}
                                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${stressBg})`, backgroundSize: '100% 100%' }}>
                                            <div style={{
                                                position: 'absolute',
                                                width: '12px', height: '12px', backgroundColor: '#007bff', borderRadius: '50%', border: '2px solid white',
                                                left: `${((organization.averages.quantitative_burden - 3) / 9) * 100}%`,
                                                top: `${((12 - organization.averages.control) / 9) * 100}%`,
                                                transform: 'translate(-50%, -50%)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }} />
                                        </div>

                                        {/* X Labels */}
                                        <div style={{ position: 'absolute', bottom: '-35px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>양적 직무 부담</div>
                                        <div style={{ position: 'absolute', bottom: '-20px', left: '0', fontSize: '0.7rem' }}>Low</div>
                                        <div style={{ position: 'absolute', bottom: '-20px', right: '0', fontSize: '0.7rem' }}>High</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2: Social Support */}
                    <div style={{ marginBottom: '5rem', padding: '2rem', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '3rem', color: '#28a745' }}>2. 사회적 지원 요인 & 건강 리스크 판정</h3>
                        <div className="chart-row-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>

                            {/* 2-1. Bar Chart */}
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        사회적 지원 요인 <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#777' }}>(점수)</span>
                                    </h4>
                                </div>
                                {/* Bar Chart Container */}
                                <div style={{ position: 'relative', height: '400px', padding: '0 10px', borderRadius: '15px', border: '1px solid #f1f3f5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    {/* Graph Area (Fixed Height) */}
                                    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                                        <ZebraBackground />
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '40px', paddingBottom: '0' }}>
                                            <VerticalBar label="상사의 지원" score={organization.averages.supervisor_support} />
                                            <VerticalBar label="동료의 지원" score={organization.averages.coworker_support} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2-2. Support Map */}
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.3rem', color: '#333', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        건강 리스크 판정
                                    </h4>
                                    <div style={{ fontSize: '1.1rem', color: '#555' }}>
                                        건강 리스크: <span style={{ fontWeight: 'bold', color: getRiskColor(organization.health_risk.support_risk) }}>{organization.health_risk.support_risk.toFixed(1)}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#888' }}> (기준 100)</span>
                                    </div>
                                </div>
                                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '400px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '15px', padding: '10px', backgroundColor: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <div style={{ position: 'relative', width: '280px', height: '280px', margin: '60px auto 10px auto' }}>
                                        {/* Y Labels */}
                                        <div style={{ position: 'absolute', top: '50%', left: '-50px', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>동료의 지원</div>
                                        <div style={{ position: 'absolute', top: '0', left: '-25px', fontSize: '0.7rem' }}>High</div>
                                        <div style={{ position: 'absolute', bottom: '0', left: '-25px', fontSize: '0.7rem' }}>Low</div>

                                        {/* Graph */}
                                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${supportBg})`, backgroundSize: '100% 100%' }}>
                                            <div style={{
                                                position: 'absolute',
                                                width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%', border: '2px solid white',
                                                left: `${((organization.averages.supervisor_support - 3) / 9) * 100}%`,
                                                top: `${((12 - organization.averages.coworker_support) / 9) * 100}%`,
                                                transform: 'translate(-50%, -50%)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }} />
                                        </div>

                                        {/* X Labels */}
                                        <div style={{ position: 'absolute', bottom: '-35px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>상사의 지원</div>
                                        <div style={{ position: 'absolute', bottom: '-20px', left: '0', fontSize: '0.7rem' }}>Low</div>
                                        <div style={{ position: 'absolute', bottom: '-20px', right: '0', fontSize: '0.7rem' }}>High</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <div style={{ textAlign: 'left', marginBottom: '4rem', color: '#666', fontSize: '0.9rem', lineHeight: '1.6', backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
                        <p style={{ marginBottom: '0.5rem' }}><strong>※ 점수 해석 가이드</strong></p>
                        <p>• <strong>요인 점수 (Bar Chart)</strong>: 12점 만점이며, 높을수록 긍정적인 상태(스트레스 적음/자원 풍부)를 의미합니다.</p>
                        <p>• <strong>건강 리스크 (Health Risk)</strong>: 평균(100)을 기준으로, 신체/정신 건강 문제 발생 가능성을 예측한 지수입니다.</p>
                        <p style={{ paddingLeft: '10px', color: '#888' }}>- 예: 리스크 지수가 <strong>100</strong>이면 평균 수준, <strong>120</strong>이면 건강 문제 발생 위험이 평균보다 <strong>20%</strong> 높을 것으로 예상됨을 의미합니다.</p>
                    </div>
                </div>
            )}

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
