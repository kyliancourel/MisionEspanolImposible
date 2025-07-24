import React, { useState } from 'react';
import questions from '../data/questions_a1.json';

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (selected) => {
    if (selected === questions[current].answer) {
      setScore(score + 1);
    }
    setCurrent(current + 1);
  };

  if (current >= questions.length) {
    return <h2>¡Has terminado! Puntuación: {score}/{questions.length}</h2>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h3 className="text-xl mb-4">{questions[current].question}</h3>
      {questions[current].options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => handleAnswer(opt)}
          className="block w-full p-2 my-2 bg-yellow-100 hover:bg-yellow-300 rounded"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
