import { describe, it, expect } from 'vitest';

describe('Authoritative Quiz Scoring & Pass Evaluation', () => {
  interface QuestionItem {
    id: string;
    correctAnswer: string;
    points: number;
  }

  function scoreQuizSubmission(
    questions: QuestionItem[],
    answers: Array<{ question_id: string; user_answer: string }>,
    passingThresholdPercent = 70
  ) {
    const qMap = new Map(questions.map((q) => [q.id, q]));
    let totalMaxPoints = 0;
    let totalEarned = 0;

    const scoredAnswers = answers.map((ans) => {
      const q = qMap.get(ans.question_id);
      if (!q) {
        return { question_id: ans.question_id, is_correct: false, points: 0 };
      }

      totalMaxPoints += q.points;
      const isCorrect =
        ans.user_answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      const pointsAwarded = isCorrect ? q.points : 0;
      totalEarned += pointsAwarded;

      return {
        question_id: ans.question_id,
        is_correct: isCorrect,
        points: pointsAwarded,
      };
    });

    const percentage =
      totalMaxPoints > 0 ? Math.round((totalEarned / totalMaxPoints) * 10000) / 100 : 0.0;
    const passed = percentage >= passingThresholdPercent;

    return {
      totalEarned,
      totalMaxPoints,
      percentage,
      passed,
      scoredAnswers,
    };
  }

  const sampleQuestions: QuestionItem[] = [
    { id: 'q1', correctAnswer: 'C', points: 1 },
    { id: 'q2', correctAnswer: '10', points: 2 }, // Grid-in
    { id: 'q3', correctAnswer: 'A', points: 1 },
  ];

  it('correctly grades all correct responses with full points and passing status', () => {
    const studentAnswers = [
      { question_id: 'q1', user_answer: 'C' },
      { question_id: 'q2', user_answer: ' 10 ' }, // Whitespace trimmed
      { question_id: 'q3', user_answer: 'a' }, // Case-insensitive
    ];

    const result = scoreQuizSubmission(sampleQuestions, studentAnswers, 70);
    expect(result.totalEarned).toBe(4);
    expect(result.totalMaxPoints).toBe(4);
    expect(result.percentage).toBe(100.0);
    expect(result.passed).toBe(true);
  });

  it('correctly evaluates partial credit and fails when below threshold', () => {
    const studentAnswers = [
      { question_id: 'q1', user_answer: 'C' }, // Correct (1 pt)
      { question_id: 'q2', user_answer: '12' }, // Incorrect (0 of 2 pts)
      { question_id: 'q3', user_answer: 'B' }, // Incorrect (0 of 1 pt)
    ];

    // Earned 1 out of 4 = 25%
    const result = scoreQuizSubmission(sampleQuestions, studentAnswers, 70);
    expect(result.totalEarned).toBe(1);
    expect(result.totalMaxPoints).toBe(4);
    expect(result.percentage).toBe(25.0);
    expect(result.passed).toBe(false);
  });

  it('correctly honors configurable passing thresholds', () => {
    // 3 out of 4 = 75%
    const studentAnswers = [
      { question_id: 'q1', user_answer: 'C' }, // 1 pt
      { question_id: 'q2', user_answer: '10' }, // 2 pts
      { question_id: 'q3', user_answer: 'B' }, // 0 pt
    ];

    // Threshold 70% -> passed
    expect(scoreQuizSubmission(sampleQuestions, studentAnswers, 70).passed).toBe(true);

    // Threshold 80% -> failed
    expect(scoreQuizSubmission(sampleQuestions, studentAnswers, 80).passed).toBe(false);
  });
});
