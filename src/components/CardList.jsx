import React from 'react';
import { Link } from 'react-router-dom';

const CardList = ({ questions, onCardClick}) => {
  
  return (
    <div className="flex justify-center items-center mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {questions.map((question) => (
          <div key={question.id} className="bg-black rounded-lg shadow-lg text-white">
            <div className="h-full flex flex-col justify-between p-10">
              <div>
                <h2 className="text-3xl font-bold mb-4">{question.title}</h2>
                <p className="text-lg">{question.description}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  to="/recorder"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => onCardClick(question)}
                >
                  Answer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;