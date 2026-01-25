export const getQuestions = async () => {
    const response = await fetch('/api/questions');
    if (!response.ok) {
        throw new Error('Failed to fetch questions');
    }
    return response.json();
};

export const postDiagnosis = async (answers, gender) => {
    const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, gender }),
    });

    if (!response.ok) {
        throw new Error('Failed to submit diagnosis');
    }
    return response.json();
};

export const sendResultEmail = async (email, answers, gender) => {
    const response = await fetch('/api/send-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, answers, gender }),
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }
    return response.json();
};
