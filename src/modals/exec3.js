import { useState, useEffect } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const CenterDivModal = ({ isOpen, onClose }) => {
    const [justifyContent, setJustifyContent] = useState('flex-start');
    const [alignItems, setAlignItems] = useState('flex-start');
    const [flexDirection, setFlexDirection] = useState('row');
    const [isCentered, setIsCentered] = useState(false);
    const [showOffer, setShowOffer] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [hint, setHint] = useState('');
    const { updateQuestStatus } = useQuest();

    const justifyOptions = [
        { value: 'flex-start', label: 'Начало', icon: '⬅️' },
        { value: 'center', label: 'Центр', icon: '🎯' },
        { value: 'flex-end', label: 'Конец', icon: '➡️' },
        { value: 'space-between', label: 'Между', icon: '↔️' },
        { value: 'space-around', label: 'Вокруг', icon: '🔄' }
    ];

    const alignOptions = [
        { value: 'flex-start', label: 'Верх', icon: '⬆️' },
        { value: 'center', label: 'Центр', icon: '🎯' },
        { value: 'flex-end', label: 'Низ', icon: '⬇️' },
        { value: 'stretch', label: 'Растянуть', icon: '📏' }
    ];

    const directionOptions = [
        { value: 'row', label: 'Строка', icon: '➡️' },
        { value: 'column', label: 'Колонка', icon: '⬇️' }
    ];

    // Проверка центрирования
    useEffect(() => {
        const isPerfectlyCentered =
            justifyContent === 'center' &&
            alignItems === 'center' &&
            flexDirection === 'row';

        if (isPerfectlyCentered && !isCentered) {
            setIsCentered(true);
            setHint('Кривой блок на странице - самая жиза для любого фронтенд-разработчика');


            setTimeout(() => {
                setShowOffer(true);
                updateQuestStatus('centerDiv', true);
            }, 500);
        } else if (!isPerfectlyCentered && isCentered) {
            setIsCentered(false);
            setShowOffer(false);
            setHint('Центрирование сбито... Попробуйте снова!');
        }
    }, [justifyContent, alignItems, flexDirection, isCentered]);

    const handleJustifyChange = (value) => {
        if (!showOffer) {
            setJustifyContent(value);
            setAttempts(prev => prev + 1);
        }
    };

    const handleAlignChange = (value) => {
        if (!showOffer) {
            setAlignItems(value);
            setAttempts(prev => prev + 1);
        }
    };

    const handleDirectionChange = (value) => {
        if (!showOffer) {
            setFlexDirection(value);
            setAttempts(prev => prev + 1);
        }
    };

    const resetGame = () => {
        setJustifyContent('flex-start');
        setAlignItems('flex-start');
        setFlexDirection('row');
        setIsCentered(false);
        setShowOffer(false);
        setAttempts(0);
        setHint('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content center-div-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">Задание</h2>

                <div className="game-container">
                    <div className="modal-question">
                        <p>К следующей точке ведёт куча проводов. Помоги сетевому пакету протиснуться к центральному проводу.</p>
                        <p>Используй CSS Flexbox, чтобы поместить блок в центр контейнера!</p>
                        <p> Цель: <i>justify-content: center, align-items: center</i></p>
                    </div>

                    <div className="game-play-area">
                        <div className="playground-container">
                            <div className="playground-header">
                                <span>Flex Container</span>
                                <div className="flex-info">
                                    <span>display: flex;</span>
                                    <span>flex-direction: {flexDirection};</span>
                                    <span>justify-content: {justifyContent};</span>
                                    <span>align-items: {alignItems};</span>
                                </div>
                            </div>

                            <div
                                className={`flex-playground ${isCentered ? 'centered' : ''}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: flexDirection,
                                    justifyContent: justifyContent,
                                    alignItems: alignItems,
                                    minHeight: '300px'
                                }}
                            >
                                <div className={`floating-block ${showOffer ? 'transforming' : ''}`}>
                                    {!showOffer ? (
                                        <>
                                            <span className="block-icon">📦</span>
                                        </>
                                    ) : (
                                        <div className="offer-content">
                                            <span className="offer-icon">Успех!</span>

                                            <button className="accept-offer" onClick={onClose}>
                                                Вёрстка — это просто, если знать правила
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="control-panel">
                            <h2>Управление Flexbox</h2>

                            <div className="control-section">
                                <label className="control-label">
                                    <span className="label-icon">🔄</span>
                                    flex-direction
                                </label>
                                <div className="buttons">
                                    {directionOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`control-btn ${flexDirection === option.value ? 'active' : ''}`}
                                            onClick={() => handleDirectionChange(option.value)}
                                            disabled={showOffer}
                                        >
                                            <span className="btn-icon">{option.icon}</span>
                                            <span className="btn-label">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="control-section">
                                <label className="control-label">
                                    <span className="label-icon">↔️</span>
                                    justify-content
                                </label>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max={justifyOptions.length - 1}
                                        step="1"
                                        value={justifyOptions.findIndex(opt => opt.value === justifyContent)}
                                        onChange={(e) => handleJustifyChange(justifyOptions[e.target.value].value)}
                                        disabled={showOffer}
                                        className="css-slider"
                                    />
                                    <div className="slider-labels">
                                        {justifyOptions.map(opt => (
                                            <span
                                                key={opt.value}
                                                className={`slider-label ${justifyContent === opt.value ? 'active' : ''}`}
                                                onClick={() => handleJustifyChange(opt.value)}
                                            >
                                                <span className="label-icon-small">{opt.icon}</span>
                                                <span className="label-text">{opt.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="control-section">
                                <label className="control-label">
                                    <span className="label-icon">⬇️</span>
                                    align-items
                                </label>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max={alignOptions.length - 1}
                                        step="1"
                                        value={alignOptions.findIndex(opt => opt.value === alignItems)}
                                        onChange={(e) => handleAlignChange(alignOptions[e.target.value].value)}
                                        disabled={showOffer}
                                        className="css-slider"
                                    />
                                    <div className="slider-labels">
                                        {alignOptions.map(opt => (
                                            <span
                                                key={opt.value}
                                                className={`slider-label ${alignItems === opt.value ? 'active' : ''}`}
                                                onClick={() => handleAlignChange(opt.value)}
                                            >
                                                <span className="label-icon-small">{opt.icon}</span>
                                                <span className="label-text">{opt.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="progress-indicator">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${(justifyContent === 'center' ? 33.33 : 0) +
                                                (alignItems === 'center' ? 33.33 : 0) +
                                                (flexDirection === 'row' ? 33.34 : 0)
                                                }%`
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-stats">
                                    <span>Попыток: {attempts}</span>
                                    <span className={`status ${isCentered ? 'success' : ''}`}>
                                        {isCentered ? 'Центрировано!' : '⏳ В процессе'}
                                    </span>
                                </div>
                            </div>

                            {hint && (
                                <div className={`hint-message ${isCentered ? 'success' : ''}`}>
                                    {hint}
                                </div>
                            )}

                            <button
                                className="reset-btn"
                                onClick={!showOffer ? resetGame : onClose}
                            >
                                {!showOffer ? "Начать заново" : "Продолжить"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterDivModal;