// context/QuestContext.js
import React, { createContext, useState, useContext, useMemo } from 'react';

const QuestContext = createContext();

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
};

export const QuestProvider = ({ children }) => {
  const [completedQuests, setCompletedQuests] = useState({
    question1: false,
    typeText: false,
    findSecret: false,
    centerDiv: false,
    boss: false,
    findBug1: false,
    findBug2: false,
    findBug3: false,
    findBug4: false
  });

  const updateQuestStatus = (questName, isCompleted) => {
    setCompletedQuests(prev => ({
      ...prev,
      [questName]: isCompleted
    }));
  };

  const resetProgress = () => {
    setCompletedQuests({
      question1: false,
      typeText: false,
      findSecret: false,
      centerDiv: false,
      boss: false,
      findBug1: false,
      findBug2: false,
      findBug3: false,
      findBug4: false
    });
  };

  const value = useMemo(() => ({
    completedQuests,
    updateQuestStatus,
    resetProgress
  }), [completedQuests]);

  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
};