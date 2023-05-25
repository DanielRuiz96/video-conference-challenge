import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CardList from './components/CardList';
import Recorder from './components/Recorder';
import questions from './questions/questions.json';

const App = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleCardClick = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <BrowserRouter>
      <div className="bg-gray-200 min-h-screen">
        <h1 className="text-4xl font-bold text-center pt-10">Video Interview</h1>
        <Routes>
          <Route
            path="/"
            element={<CardList questions={questions} onCardClick={handleCardClick} />}
          />
          <Route
            path="/recorder"
            element={
              selectedQuestion && (
                <Recorder
                  question={selectedQuestion}
                  questions={questions}
                  currentQuestionIndex={questions.findIndex(
                    (question) => question.id === selectedQuestion.id
                  )}
                />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;