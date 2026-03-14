import React, { useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';
const QuestionModal = ({ isOpen, onClose, question, options, correctAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showError, setShowError] = useState(false);
  const { updateQuestStatus } = useQuest();

  if (!isOpen) return null;

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowError(false);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      setShowError(true);
      return;
    }

    if (selectedOption === correctAnswer) {
      updateQuestStatus('question1', true);
      setSelectedOption(null);
      setShowError(false);
      onClose();
    } else {
      setShowError(true);
    }
  };

  const handleClose = () => {
    setSelectedOption(null);
    setShowError(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>

        <h2 className="modal-title">Вопрос</h2>

        <div className="modal-question">
          <p>{question}</p>
        </div>

        <div className="modal-options">
          {options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name="quiz-option"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleOptionClick(option)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>

        {showError && (
          <div className="error-message">
            {!selectedOption
              ? 'Пожалуйста, выберите вариант ответа'
              : 'Неверный ответ. Попробуйте снова!'}
          </div>
        )}

        <button
          className="submit-button"
          onClick={handleSubmit}
        >
          Ответить
        </button>
      </div>
    </div>
  );
};

export default QuestionModal;