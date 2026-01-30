const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getQuestions = async () => {
    const response = await fetch(`${API_BASE_URL}/api/questions`);
    if (!response.ok) {
        throw new Error('Failed to fetch questions');
    }
    return response.json();
};

export const postDiagnosis = async (answers, gender) => {
    const response = await fetch(`${API_BASE_URL}/api/diagnosis`, {
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

export const checkHealth = async () => {
    const response = await fetch(`${API_BASE_URL}/health-check`);
    if (!response.ok) {
        throw new Error('Health check failed');
    }
    return response.json();
};

export const postOrganizationDiagnosis = async (answersList, gender) => {
    const response = await fetch(`${API_BASE_URL}/api/diagnosis/organization`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers_list: answersList, gender }),
    });

    if (!response.ok) {
        throw new Error('Failed to submit organization diagnosis');
    }
    return response.json();
};
