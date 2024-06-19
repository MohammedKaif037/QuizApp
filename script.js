const apiUrlBase = 'https://opentdb.com/api.php?amount=10&type=multiple';

// DOM elements
const questionsList = document.getElementById('questions-list');
const resultMessage = document.getElementById('result-message');
const resultContainer = document.getElementById('result-container');
const triviaAmountInput = document.getElementById('trivia_amount');
const triviaCategorySelect = document.getElementById('trivia_category');
const triviaDifficultySelect = document.getElementById('trivia_difficulty');
const triviaTypeSelect = document.getElementById('trivia_type');
const startQuizBtn = document.getElementById('start-quiz-btn');
const submitQuizBtn = document.getElementById('submit-quiz-btn');

let questions = [];
let score = 0;
let timerInterval;

// Generate API URL based on dropdown selections
function generateApiUrl() {
    const amount = triviaAmountInput.value;
    const category = triviaCategorySelect.value !== 'any' ? `&category=${triviaCategorySelect.value}` : '';
    const difficulty = triviaDifficultySelect.value !== 'any' ? `&difficulty=${triviaDifficultySelect.value}` : '';
    const type = triviaTypeSelect.value !== 'any' ? `&type=${triviaTypeSelect.value}` : '';

    return `https://opentdb.com/api.php?amount=${amount}${category}${difficulty}${type}`;
}

// Fetch questions from the API
function fetchQuestions() {
    const apiUrl = generateApiUrl();

    // Reset the score and hide the result container
    score = 0;
    resultContainer.style.display = 'none';
    questionsList.innerHTML = '';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            questions = data.results;
            displayQuestions();
            submitQuizBtn.disabled = false; // Enable the submit button after questions are fetched
            startOverallTimer(questions.length); // Start the overall timer
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            resultMessage.textContent = 'An error occurred while fetching the questions.';
            resultContainer.style.display = 'block';
        });
}

// Display all questions on the page
function displayQuestions() {
    questionsList.innerHTML = '';
    questions.forEach((questionData, questionIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-block');
        questionDiv.innerHTML = `
            <h3>Question ${questionIndex + 1}</h3>
            <p>${questionData.question}</p>
            <div class="answers" id="answers${questionIndex}">
                ${shuffleAnswers(questionData).map((answer, index) => `
                    <label>
                        <input type="radio" name="question${questionIndex}" value="${answer}">
                        ${answer}
                    </label>
                `).join('')}
            </div>
        `;
        questionsList.appendChild(questionDiv);
    });
}

// Shuffle the answers
function shuffleAnswers(questionData) {
    const answers = [
        questionData.correct_answer,
        ...questionData.incorrect_answers
    ];

    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    return answers;
}

// Check the user's answers and update the score
function checkAnswers() {
    score = 0;
    questions.forEach((question, questionIndex) => {
        const selectedAnswer = document.querySelector(`input[name="question${questionIndex}"]:checked`);
        if (selectedAnswer && selectedAnswer.value === question.correct_answer) {
            score++;
        }
    });

    // Stop the timer
    clearInterval(timerInterval);

    // Disable all questions
    disableAllQuestions();

    // Reveal correct answers
    revealCorrectAnswers();

    // Navigate to the result page with score
    window.location.href = `result.html?score=${score}&total=${questions.length}`;
}

// Reveal the correct answers beside each question
function revealCorrectAnswers() {
    questions.forEach((question, questionIndex) => {
        const answersDiv = document.getElementById(`answers${questionIndex}`);
        const correctAnswerLabel = document.createElement('p');
        correctAnswerLabel.textContent = `Correct answer: ${question.correct_answer}`;
        correctAnswerLabel.classList.add('correct-answer');
        answersDiv.appendChild(correctAnswerLabel);
    });
}

// Start the overall timer
function startOverallTimer(numQuestions) {
    const duration = numQuestions * 30; // 30 seconds per question
    let timer = duration, minutes, seconds;
    const timerElement = document.getElementById('timer');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerElement.textContent = `${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            disableAllQuestions();
            submitQuizBtn.click();
        }
    }, 1000);
}

// Disable all questions when time is up or submitted
function disableAllQuestions() {
    const answerElements = document.querySelectorAll('.answers input');
    answerElements.forEach(input => {
        input.disabled = true;
    });
}

// Event listeners
startQuizBtn.addEventListener('click', (event) => {
    fetchQuestions();
});

submitQuizBtn.addEventListener('click', (event) => {
    checkAnswers();
});

// Load questions by default when the page loads
window.onload = fetchQuestions;
