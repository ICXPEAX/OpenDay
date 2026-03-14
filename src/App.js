// App.js (исправленная версия)
import './App.css';
import { useState, useEffect, useMemo } from 'react';
import { QuestProvider, useQuest } from './context/QuestContext';
import QuestionModal from './modals/question';
import TypeText from './modals/exec1';
import Boss from './modals/boss';
import FindSecretModal from './modals/exec2';
import CenterDivModal from './modals/exec3';
import FindBug from './modals/exec4';
import FindBug2 from './modals/exec5';
import FindBug3 from './modals/exec6';
import FindBug4 from './modals/exec7';

function MapWithQuest() {
  const { completedQuests, updateQuestStatus, resetProgress } = useQuest(); // Добавляем updateQuestStatus
  
  // Состояния для модалок
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isTest2Open, setIsTest2Open] = useState(false);
  const [isTest3Open, setIsTest3Open] = useState(false);
  const [isTest4Open, setIsTest4Open] = useState(false);
  const [isTest5Open, setIsTest5Open] = useState(false);
  const [isTest6Open, setIsTest6Open] = useState(false);
  const [isTest7Open, setIsTest7Open] = useState(false);
  const [isBossOpen, setIsBossOpen] = useState(false);
  
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0); // 0 - стартовая позиция

  // Начальная точка А
  const startPoint = useMemo(() => ({ top: '75px', left: '1000px' }), []);
  
  // Позиции кнопок на карте
  const buttonPositions = useMemo(() => [
    { top: '295px', left: '1055px' },  // question1 (индекс 0)
    { top: '448px', left: '1055px' },  // typeText (индекс 1)
    { top: '595px', left: '1055px' },  // findSecret (индекс 2)
    { top: '745px', left: '1055px' },  // centerDiv (индекс 3)
    { top: '890px', left: '960px' },   // boss (индекс 4)
    { top: '390px', left: '888px' },   // findBug1 (индекс 5)
    { top: '520px', left: '1175px' },   // findBug2 (индекс 6)
    { top: '665px', left: '1225px' },   // findBug3 (индекс 7)
    { top: '927px', left: '1150px' }    // findBug4 (индекс 8)
  ], []);

  // Определяем пути
  const paths = useMemo(() => ({
    path1: [5, 6, 7, 8, 4], // Путь разработчика
    path2: [0, 1, 2, 3, 4]  // Основной путь
  }), []);

  // Маппинг индексов на названия квестов
  const questNames = useMemo(() => [
    'question1',    // индекс 0
    'typeText',     // индекс 1
    'findSecret',   // индекс 2
    'centerDiv',    // индекс 3
    'boss',         // индекс 4
    'findBug1',     // индекс 5
    'findBug2',     // индекс 6
    'findBug3',     // индекс 7
    'findBug4'      // индекс 8
  ], []);

  // Маппинг для открытия модалок
  const openModalByIndex = (index) => {
    switch(index) {
      case 0: setIsModalOpen(true); break;
      case 1: setIsTestOpen(true); break;
      case 2: setIsTest2Open(true); break;
      case 3: setIsTest3Open(true); break;
      case 4: setIsBossOpen(true); break;
      case 5: setIsTest4Open(true); break;
      case 6: setIsTest5Open(true); break;
      case 7: setIsTest6Open(true); break;
      case 8: setIsTest7Open(true); break;
      default: break;
    }
  };

  // При выборе пути
  const handlePathSelect = (path) => {
    console.log('🟢 Выбран путь:', path);
    setSelectedPath(path);
    setShowPathSelection(false);
    
    const firstQuestIndex = paths[path][0];
    console.log('🎯 Первое задание пути:', firstQuestIndex);
    setCurrentPosition(firstQuestIndex);
  };

  // Обновление позиции при выполнении заданий
  useEffect(() => {
    if (!selectedPath) {
      if (currentPosition !== 0) {
        setCurrentPosition(0);
      }
      return;
    }

    const currentPath = paths[selectedPath];
    let nextPosition = null;
    let foundIncomplete = false;

    // Ищем первое невыполненное задание
    for (let i = 0; i < currentPath.length; i++) {
      const questIndex = currentPath[i];
      const questName = questNames[questIndex];
      
      if (!completedQuests[questName]) {
        nextPosition = questIndex;
        foundIncomplete = true;
        break;
      }
    }
    
    if (!foundIncomplete && currentPath.length > 0) {
      nextPosition = currentPath[currentPath.length - 1];
    }

    if (nextPosition === null) {
      nextPosition = currentPath[0];
    }

    if (nextPosition !== currentPosition) {
      console.log('🚀 Перемещение на:', nextPosition);
      setCurrentPosition(nextPosition);
    }
  }, [completedQuests, selectedPath, paths, questNames, currentPosition]);

  const resetPath = () => {
    setSelectedPath(null);
    setCurrentPosition(0);
    console.log('🔄 Путь сброшен');
  };

  // Получение текущей позиции
  const getDisplayPosition = () => {
    if (currentPosition === 0) return startPoint;
    return buttonPositions[currentPosition] || startPoint;
  };

  // Проверка доступности кнопки
  const isButtonAvailable = (buttonIndex) => {
    if (!selectedPath) return false;
    
    const currentPath = paths[selectedPath];
    if (!currentPath.includes(buttonIndex)) return false;
    
    const pathIndex = currentPath.indexOf(buttonIndex);
    
    for (let i = 0; i < pathIndex; i++) {
      const prevQuestIndex = currentPath[i];
      const prevQuestName = questNames[prevQuestIndex];
      if (!completedQuests[prevQuestName]) {
        return false;
      }
    }
    
    return true;
  };

  const isCurrentTarget = (buttonIndex) => {
    return currentPosition === buttonIndex;
  };

  const questionData = useMemo(() => [{
    question: "Какой язык используется для вёрстки веб-страниц в браузере?",
    options: ["CSS", "HTML", "JavaScript", "Python"],
    correctAnswer: "HTML"
  }], []);

  const position = getDisplayPosition();

  return (
    <div className="Map">
      {/* Маркер */}
      <div
        className={`quest-marker ${currentPosition === 4 ? 'boss-position' : ''}`}
        style={{
          top: position.top,
          left: position.left,
          transition: 'all 0.8s ease-in-out'
        }}
      >
        <div className="marker-square">
          <span className="marker-text">📦</span>
        </div>
      </div>

      {/* Меню выбора пути */}
      {showPathSelection && !selectedPath && (
        <div className="path-selection-overlay">
          <div className="path-selection-modal">
            <h2>Выберите путь для пакета</h2>
            <div className="path-buttons">
              <button 
                className="path-btn path1"
                onClick={() => handlePathSelect('path1')}
              >
                <span className="path-icon">🔧</span>
                <div className="path-info">
                  <h3>Путь разработчика</h3>
                  <p>Исправление ошибок в коде (4 задания)</p>
                  <small>Для тех, кто любит дебажить</small>
                </div>
              </button>
              <button 
                className="path-btn path2"
                onClick={() => handlePathSelect('path2')}
              >
                <span className="path-icon">🎯</span>
                <div className="path-info">
                  <h3>Основной путь</h3>
                  <p>Классические задания (4 задания)</p>
                  <small>Для прохождения сюжета</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка старта */}
      {!selectedPath && (
        <button 
          className="start-btn"
          style={{
            position: 'absolute',
            top: startPoint.top,
            left: startPoint.left,
          }}
          onClick={() => setShowPathSelection(true)}
        >
          🚀
        </button>
      )}

      {/* Инструкция */}
      <div className='instructions'>
        <h1 style={{color: "rgb(235, 205, 98)"}}>Инструкция</h1>
        <p>Приветствуем тебя!</p>
        <p>Сегодня мы предлагаем сыграть в небольшую игру, которая поверхностно погружает в повседневные суету из задач и проблем разработчика.</p>
        <p>Вы знаете, что такое сетевой пакет? Это набор данных, передаваемый по сети, от одной точки в другую - от соседа к соседа и от компютера к смартфону.</p>
        <p>Для того, чтобы переача данных прошла успешно от отправителя к адресату, нужно правильно настроить для него маршрут. Перед вами карта. Сопроводите пакет от точки "А" к точке "Б", пройдя все заботы и проблемы.</p>
        {selectedPath && (
          <div className="path-info-display">
            <p>Выбран путь: {selectedPath === 'path1' ? 'Путь разработчика' : 'Основной путь'}</p>
            <p>Текущее задание: {
              currentPosition === 0 ? 'Старт' : 
              currentPosition === 4 ? 'Босс' : 
              `Задание ${currentPosition + 1}`
            }</p>
            <button className="reset-path-small" onClick={resetPath}>Сменить путь</button>
          </div>
        )}
      </div>

      {/* Кнопки заданий */}
      <button
        className={`bt-1 ${!isButtonAvailable(0) ? 'disabled' : ''} ${isCurrentTarget(0) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(0) && openModalByIndex(0)}
        style={{ position: 'absolute', ...buttonPositions[0] }}
        disabled={!isButtonAvailable(0)}
      >
        ?
        {completedQuests.question1 && <span className="button-check">✓</span>}
      </button>

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={questionData[0].question}
        options={questionData[0].options}
        correctAnswer={questionData[0].correctAnswer}
        onComplete={() => updateQuestStatus('question1', true)}
      />

      <button
        className={`bt-2 ${!isButtonAvailable(1) ? 'disabled' : ''} ${isCurrentTarget(1) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(1) && openModalByIndex(1)}
        style={{ position: 'absolute', ...buttonPositions[1] }}
        disabled={!isButtonAvailable(1)}
      >
        ?
        {completedQuests.typeText && <span className="button-check">✓</span>}
      </button>

      <TypeText
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        onComplete={() => updateQuestStatus('typeText', true)}
      />

      <button
        className={`bt-3 ${!isButtonAvailable(2) ? 'disabled' : ''} ${isCurrentTarget(2) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(2) && openModalByIndex(2)}
        style={{ position: 'absolute', ...buttonPositions[2] }}
        disabled={!isButtonAvailable(2)}
      >
        ?
        {completedQuests.findSecret && <span className="button-check">✓</span>}
      </button>

      <FindSecretModal
        isOpen={isTest2Open}
        onClose={() => setIsTest2Open(false)}
        onComplete={() => updateQuestStatus('findSecret', true)}
      />

      <button
        className={`bt-4 ${!isButtonAvailable(3) ? 'disabled' : ''} ${isCurrentTarget(3) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(3) && openModalByIndex(3)}
        style={{ position: 'absolute', ...buttonPositions[3] }}
        disabled={!isButtonAvailable(3)}
      >
        ?
        {completedQuests.centerDiv && <span className="button-check">✓</span>}
      </button>

      <CenterDivModal
        isOpen={isTest3Open}
        onClose={() => setIsTest3Open(false)}
        onComplete={() => updateQuestStatus('centerDiv', true)}
      />

      <button
        className={`bt-5 ${!isButtonAvailable(4) ? 'disabled' : ''} ${isCurrentTarget(4) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(4) && openModalByIndex(4)}
        style={{ position: 'absolute', ...buttonPositions[4] }}
        disabled={!isButtonAvailable(4)}
      >
        👾
        {completedQuests.boss && <span className="button-check">✓</span>}
      </button>

      <Boss
        isOpen={isBossOpen}
        onClose={() => setIsBossOpen(false)}
        onComplete={() => updateQuestStatus('boss', true)}
      />

      <button
        className={`bt-6 ${!isButtonAvailable(5) ? 'disabled' : ''} ${isCurrentTarget(5) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(5) && openModalByIndex(5)}
        style={{ position: 'absolute', ...buttonPositions[5] }}
        disabled={!isButtonAvailable(5)}
      >
        🐛
        {completedQuests.findBug1 && <span className="button-check">✓</span>}
      </button>

      <FindBug
        isOpen={isTest4Open}
        onClose={() => setIsTest4Open(false)}
        onComplete={() => updateQuestStatus('findBug1', true)}
      />

      <button
        className={`bt-7 ${!isButtonAvailable(6) ? 'disabled' : ''} ${isCurrentTarget(6) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(6) && openModalByIndex(6)}
        style={{ position: 'absolute', ...buttonPositions[6] }}
        disabled={!isButtonAvailable(6)}
      >
        🐛
        {completedQuests.findBug2 && <span className="button-check">✓</span>}
      </button>

      <FindBug2
        isOpen={isTest5Open}
        onClose={() => setIsTest5Open(false)}
        onComplete={() => updateQuestStatus('findBug2', true)}
      />

      <button
        className={`bt-8 ${!isButtonAvailable(7) ? 'disabled' : ''} ${isCurrentTarget(7) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(7) && openModalByIndex(7)}
        style={{ position: 'absolute', ...buttonPositions[7] }}
        disabled={!isButtonAvailable(7)}
      >
        🐛
        {completedQuests.findBug3 && <span className="button-check">✓</span>}
      </button>

      <FindBug3
        isOpen={isTest6Open}
        onClose={() => setIsTest6Open(false)}
        onComplete={() => updateQuestStatus('findBug3', true)}
      />

      <button
        className={`bt-9 ${!isButtonAvailable(8) ? 'disabled' : ''} ${isCurrentTarget(8) ? 'current-target' : ''}`}
        onClick={() => isButtonAvailable(8) && openModalByIndex(8)}
        style={{ position: 'absolute', ...buttonPositions[8] }}
        disabled={!isButtonAvailable(8)}
      >
        🐛
        {completedQuests.findBug4 && <span className="button-check">✓</span>}
      </button>

      <FindBug4
        isOpen={isTest7Open}
        onClose={() => setIsTest7Open(false)}
        onComplete={() => updateQuestStatus('findBug4', true)}
      />

      {/* Кнопка сброса */}
      <button 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 3000,
          fontSize: '16px',
          fontWeight: 'bold'
        }}
        onClick={() => {
          if (window.confirm('Сбросить весь прогресс и начать заново?')) {
            setIsModalOpen(false);
            setIsTestOpen(false);
            setIsTest2Open(false);
            setIsTest3Open(false);
            setIsTest4Open(false);
            setIsTest5Open(false);
            setIsTest6Open(false);
            setIsTest7Open(false);
            setIsBossOpen(false);
            setSelectedPath(null);
            setCurrentPosition(0);
            resetProgress();
          }
        }}
      >
        🔄 Сбросить прогресс
      </button>
    </div>
  );
}

function App() {
  return (
    <QuestProvider>
      <div className="App">
        <MapWithQuest />
      </div>
    </QuestProvider>
  );
}

export default App;