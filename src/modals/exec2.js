import { useState, useEffect, useCallback } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const systemIcons = {
    server: '🖥️',
    database: '🗄️',
    cloud: '☁️',
    firewall: '🔥',
    router: '🌐',
    terminal: '💻',
    secret: '🔐'
};

const FindSecretModal = ({ isOpen, onClose }) => {
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [found, setFound] = useState(false);
    const [cssProperties, setCssProperties] = useState({
        zIndex: {},
        opacity: {},
        transform: {},
        filter: {}
    });
    const [attempts, setAttempts] = useState(0);
    const [secretId, setSecretId] = useState(null);
    const { updateQuestStatus } = useQuest();

    const initializeElements = useCallback(() => {
        const newElements = [];
        const types = ['server', 'database', 'cloud', 'firewall', 'router', 'terminal'];

        for (let i = 0; i < 15; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const isSecret = i === 7;

            newElements.push({
                id: i,
                type: isSecret ? 'secret' : type,
                icon: isSecret ? systemIcons.secret : systemIcons[type],
                label: isSecret ? 'СЕКРЕТНЫЙ ФАЙЛ' : `${type.toUpperCase()} ${i + 1}`,
                initialZIndex: Math.floor(Math.random() * 10) + 1,
                initialLeft: 50 + Math.random() * 300,
                initialTop: 50 + Math.random() * 200,
                initialRotation: Math.random() * 20 - 10,
                initialOpacity: 0.7 + Math.random() * 0.3,
                isSecret
            });

            if (isSecret) {
                setSecretId(i);
            }
        }

        const shuffled = newElements.sort(() => Math.random() - 0.5);
        setElements(shuffled);

        const initialZIndex = {};
        const initialOpacity = {};
        const initialTransform = {};
        const initialFilter = {};

        shuffled.forEach(el => {
            initialZIndex[el.id] = el.initialZIndex;
            initialOpacity[el.id] = el.initialOpacity;
            initialTransform[el.id] = `rotate(${el.initialRotation}deg)`;
            initialFilter[el.id] = 'none';
        });

        setCssProperties({
            zIndex: initialZIndex,
            opacity: initialOpacity,
            transform: initialTransform,
            filter: initialFilter
        });

        setFound(false);
        setSelectedElement(null);
        setAttempts(0);
    }, []);

    useEffect(() => {
        if (isOpen) {
            initializeElements();
        }
    }, [isOpen, initializeElements]);

    useEffect(() => {
        if (secretId !== null && !found) {
            const secretZIndex = cssProperties.zIndex[secretId] || 0;
            const allOtherZIndices = elements
                .filter(el => el.id !== secretId)
                .map(el => cssProperties.zIndex[el.id] || 0);

            const isOnTop = allOtherZIndices.length === 0 ||
                secretZIndex > Math.max(...allOtherZIndices);

            if (isOnTop) {
                setFound(true);
                updateQuestStatus('findSecret', true);
            }
        }
    }, [cssProperties.zIndex, secretId, elements, found, updateQuestStatus]);

    const handleElementClick = useCallback((id) => {
        setSelectedElement(id);
        setAttempts(prev => prev + 1);
    }, []);

    const updateZIndex = useCallback((id, operation) => {
        setCssProperties(prev => {
            const newZIndex = { ...prev.zIndex };
            if (operation === 'increase') {
                newZIndex[id] = (newZIndex[id] || 1) + 1;
            } else if (operation === 'decrease') {
                newZIndex[id] = Math.max(1, (newZIndex[id] || 1) - 1);
            }
            return { ...prev, zIndex: newZIndex };
        });
    }, []);

    const updateOpacity = useCallback((id, value) => {
        setCssProperties(prev => ({
            ...prev,
            opacity: {
                ...prev.opacity,
                [id]: Math.max(0.1, Math.min(1, value))
            }
        }));
    }, []);

    const updateTransform = useCallback((id, property, value) => {
        setCssProperties(prev => {
            let newTransform;

            if (property === 'rotate') {
                newTransform = `rotate(${value}deg)`;
            } else if (property === 'scale') {
                newTransform = `scale(${value})`;
            }

            return {
                ...prev,
                transform: {
                    ...prev.transform,
                    [id]: newTransform
                }
            };
        });
    }, []);

    const updateFilter = useCallback((id, type, value) => {
        setCssProperties(prev => ({
            ...prev,
            filter: {
                ...prev.filter,
                [id]: type === 'blur' ? `blur(${value}px)` :
                    type === 'brightness' ? `brightness(${value})` : 'none'
            }
        }));
    }, []);

    const resetGame = useCallback(() => {
        initializeElements();
    }, [initializeElements]);

    const resetElement = useCallback(() => {
        if (selectedElement !== null) {
            const element = elements.find(el => el.id === selectedElement);
            if (element) {
                updateZIndex(selectedElement, 'reset');
                updateOpacity(selectedElement, element.initialOpacity);
                updateTransform(selectedElement, 'rotate', element.initialRotation);
            }
        }
    }, [selectedElement, elements, updateZIndex, updateOpacity, updateTransform]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content find-secret-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">Поиск секретного ключа</h2>

                <div className="modal-question">
                    <p>Секретный ключ для расшифровки данных потерялся. Секретный файл (🔐), который хранит все ключи, необходимо найти среди множества элементов информационной системы.</p>
                    <p>Используйте панель управления справа, чтобы изменять CSS-свойства и найти его!</p>
                    <p><strong>Подсказка:</strong> Секретный файл должен быть поверх всех остальных элементов (самый большой z-index)</p>
                </div>

                <div className="game-container">
                    <div className="game-play-area">
                        <div className="elements-container" style={{ position: 'relative', height: '400px' }}>
                            {elements.map((element) => (
                                <div
                                    key={element.id}
                                    className={`system-element ${selectedElement === element.id ? 'selected' : ''} ${element.isSecret && found ? 'found' : ''}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${element.initialLeft}px`,
                                        top: `${element.initialTop}px`,
                                        zIndex: cssProperties.zIndex[element.id] || element.initialZIndex,
                                        opacity: cssProperties.opacity[element.id] || 1,
                                        transform: cssProperties.transform[element.id] || 'none',
                                        filter: cssProperties.filter[element.id] || 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleElementClick(element.id)}
                                >
                                    <div className="element-icon">{element.icon}</div>
                                    <div className="element-label">{element.label}</div>
                                    <div className="element-zindex">z-index: {cssProperties.zIndex[element.id]}</div>
                                </div>
                            ))}
                        </div>

                        {selectedElement !== null && !found && (
                            <div className="control-panel">
                                <h3>Управление элементом</h3>

                                <div className="control-group">
                                    <label>Z-Index (приоритет отображения):</label>
                                    <div className="button-group">
                                        <button onClick={() => updateZIndex(selectedElement, 'decrease')}>-</button>
                                        <span>{cssProperties.zIndex[selectedElement]}</span>
                                        <button onClick={() => updateZIndex(selectedElement, 'increase')}>+</button>
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Прозрачность (Opacity):</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={cssProperties.opacity[selectedElement] || 1}
                                        onChange={(e) => updateOpacity(selectedElement, parseFloat(e.target.value))}
                                    />
                                    <span>{(cssProperties.opacity[selectedElement] || 1).toFixed(1)}</span>
                                </div>

                                <div className="control-group">
                                    <label>Поворот (Rotate):</label>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        value={parseInt(cssProperties.transform[selectedElement]?.match(/-?\d+/) || 0)}
                                        onChange={(e) => updateTransform(selectedElement, 'rotate', e.target.value)}
                                    />
                                    <span>{cssProperties.transform[selectedElement]?.match(/-?\d+/)?.[0] || 0}°</span>
                                </div>

                                <div className="control-group">
                                    <label>Масштаб (Scale):</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={parseFloat(cssProperties.transform[selectedElement]?.match(/scale\(([^)]+)\)/)?.[1] || 1)}
                                        onChange={(e) => updateTransform(selectedElement, 'scale', e.target.value)}
                                    />
                                </div>

                                <div className="control-group">
                                    <label>Размытие (Blur):</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.5"
                                        onChange={(e) => updateFilter(selectedElement, 'blur', e.target.value)}
                                    />
                                </div>

                                <div className="control-group">
                                    <label>Яркость (Brightness):</label>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="2"
                                        step="0.1"
                                        onChange={(e) => updateFilter(selectedElement, 'brightness', e.target.value)}
                                    />
                                </div>

                                <button
                                    className="reset-element-btn"
                                    onClick={resetElement}
                                >
                                    Сбросить для этого элемента
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="game-footer">
                        <div className="game-stats">
                            <span className="info-message">Попыток: {attempts}</span>
                            {found && <span className="victory">🎉 Ключ найден! Задание выполнено! 🎉</span>}
                        </div>

                        <div className="game-controls">
                            {!found && (
                                <button className="reset-btn" onClick={resetGame}>
                                    Новая игра
                                </button>
                            )}
                            {found && (
                                <button className="reset-btn" onClick={onClose}>
                                    Завершить задание
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindSecretModal;