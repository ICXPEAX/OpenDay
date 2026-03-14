
import { useState, useEffect, useRef, useCallback } from 'react';
import '../alchemy.css';
import { useQuest } from '../context/QuestContext';

const Alchemy = ({ isOpen, onClose }) => {
    const [recipes, setRecipes] = useState({
        "код,дизайн": "Сайт",
        "код,сервер": "Бэкенд",
        "дизайн,сервер": "Дашборд",
        "код,код": "Софт",
        "дизайн,дизайн": "Стиль",
        "сервер,сервер": "Сеть",
        "сайт,бэкенд": "Интернет-магазин",
        "сайт,стиль": "Приложение",
        "бэкенд,сеть": "Облако",
        "софт,сеть": "Синхронизация",
        "сеть,сервер": "Интернет",
        "приложение,бэкенд": "API",
        "интернет-магазин,сеть": "Маркетплейс",
        "приложение,сеть": "Игра",
        "приложение,стиль": "Илюстраторр",
        "api,бэкенд": "БазаДанных",
    });
    
    const [itemImages, setItemImages] = useState({
        "код": "/images/код.svg",
        "дизайн": "/images/дизайн.svg",
        "сервер": "/images/сервер.svg",
        "сайт": "/images/сайт.svg",
        "бэкенд": "/images/бэкенд.svg",
        "дашборд": "/images/дашборд.svg",
        "софт": "/images/софт.svg",
        "стиль": "/images/стиль.svg",
        "сеть": "/images/сеть.svg",
        "интернет-магазин": "/images/интернет-магазин.svg",
        "приложение": "/images/приложение.svg",
        "облако": "/images/облако.svg",
        "синхронизация": "/images/синхронизация.svg",
        "интернет": "/images/интернет.svg",
        "api": "/images/API.svg",
        "маркетплейс": "/images/маркетплейс.svg",
        "игра": "/images/игра.svg",
        "илюстраторр": "/images/илюстраторр.svg",
        "базаданных": "/images/базаданных.svg",
    });

    const allPossibleItems = [
        'код', 'дизайн', 'сервер', 'сайт', 'бэкенд', 'дашборд',
        'софт', 'стиль', 'сеть', 'интернет-магазин', 'приложение',
        'облако', 'синхронизация', 'интернет', 'api', 'маркетплейс','базаданных','илюстраторр','игра'
    ];

    const [availableItems, setAvailableItems] = useState(['код', 'дизайн', 'сервер']);
    const [fieldItems, setFieldItems] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);

    const fieldRef = useRef(null);
    const basketRef = useRef(null);
    const { updateQuestStatus } = useQuest();

    useEffect(() => {
        const allCollected = allPossibleItems.every(item =>
            availableItems.includes(item.toLowerCase())
        );

        if (allCollected && !showCompletionMessage) {
            setShowCompletionMessage(true);
            updateQuestStatus('alchemy', true);

            setTimeout(() => {
                setShowCompletionMessage(false);
            }, 5000);
        }
    }, [availableItems, allPossibleItems, showCompletionMessage]);

    // Функция для нормализации имени (приведение к нижнему регистру)
    const normalizeName = (name) => {
        return name.toLowerCase();
    };

    // Функция для отображения имени с правильным регистром
    const displayName = (name) => {
        const displayMap = {
            'api': 'API',
            'интернет-магазин': 'Интернет-магазин',
        };
        return displayMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Добавление нового предмета в коллекцию доступных
    const addToAvailableItems = useCallback((itemName) => {
        const normalizedName = normalizeName(itemName);
        if (!availableItems.includes(normalizedName)) {
            setAvailableItems(prev => [...prev, normalizedName]);
        }
    }, [availableItems]);

    // Создание предмета на поле
    const createFieldItem = useCallback((itemId, position = { x: 0, y: 0 }) => {
        const normalizedId = normalizeName(itemId); // Приводим к нижнему регистру
        const itemName = displayName(normalizedId); // Для отображения используем displayName

        const newItem = {
            id: Date.now() + Math.random(),
            name: itemName, // Отображаемое имя (с большой буквы)
            type: normalizedId, // Тип для поиска в itemImages (в нижнем регистре)
            position: position,
            isDragging: false
        };

        setFieldItems(prev => [...prev, newItem]);

        if (!['код', 'дизайн', 'сервер'].includes(normalizedId)) {
            addToAvailableItems(normalizedId);
        }

        return newItem;
    }, [addToAvailableItems]);

    // Получение имени предмета по ID
    const getItemNameById = (id) => {
        const item = availableItems.find(item => item === id);
        return item || id;
    };

    // Обработка комбинации предметов
    const checkCombination = useCallback((item1, item2) => {
        const name1 = item1.type.toLowerCase();
        const name2 = item2.type.toLowerCase();

        const combination1 = `${name1},${name2}`;
        const combination2 = `${name2},${name1}`;

        let result = recipes[combination1] || recipes[combination2];

        if (result) {
            console.log(`${name1} + ${name2} = ${result}`);

            setFieldItems(prev => prev.filter(item => item.id !== item1.id && item.id !== item2.id));

            createFieldItem(result, item1.position);
        }
    }, [recipes, createFieldItem]);

    // Обработка пересечения предметов
    const checkCollisions = useCallback((movedItem) => {
        if (!movedItem) return;

        fieldItems.forEach(otherItem => {
            if (otherItem.id === movedItem.id) return;

            const dx = Math.abs(movedItem.position.x - otherItem.position.x);
            const dy = Math.abs(movedItem.position.y - otherItem.position.y);

            if (dx < 50 && dy < 50) { // Порог пересечения
                checkCombination(movedItem, otherItem);
            }
        });
    }, [fieldItems, checkCombination]);

    const handleDragStart = (e, item) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const fieldRect = fieldRef.current.getBoundingClientRect();

        setDraggedItem({
            ...item,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startX: rect.left - fieldRect.left,
            startY: rect.top - fieldRect.top
        });
    };

    useEffect(() => {
        if (!draggedItem) return;

        const handleMouseMove = (e) => {
            if (!fieldRef.current) return;

            const fieldRect = fieldRef.current.getBoundingClientRect();

            // Вычисляем новую позицию
            let newX = e.clientX - fieldRect.left - draggedItem.offsetX;
            let newY = e.clientY - fieldRect.top - draggedItem.offsetY;

            // Ограничиваем движение в пределах поля
            newX = Math.max(0, Math.min(newX, fieldRect.width - 50));
            newY = Math.max(0, Math.min(newY, fieldRect.height - 50));

            setFieldItems(prev => prev.map(item =>
                item.id === draggedItem.id
                    ? { ...item, position: { x: newX, y: newY }, isDragging: true }
                    : item
            ));
        };

        const handleMouseUp = (e) => {
            // Завершаем перетаскивание
            setFieldItems(prev => prev.map(item =>
                item.id === draggedItem.id
                    ? { ...item, isDragging: false }
                    : item
            ));

            // Проверяем пересечение с корзиной (удаление)
            if (basketRef.current) {
                const basketRect = basketRef.current.getBoundingClientRect();
                const itemElement = document.getElementById(`field-item-${draggedItem.id}`);

                if (itemElement) {
                    const itemRect = itemElement.getBoundingClientRect();

                    if (!(itemRect.right < basketRect.left ||
                        itemRect.left > basketRect.right ||
                        itemRect.bottom < basketRect.top ||
                        itemRect.top > basketRect.bottom)) {
                        // Предмет попал в корзину - удаляем
                        setFieldItems(prev => prev.filter(item => item.id !== draggedItem.id));
                        setDraggedItem(null);
                        return;
                    }
                }
            }

            // Проверяем пересечения с другими предметами
            const movedItem = fieldItems.find(item => item.id === draggedItem.id);
            if (movedItem) {
                checkCollisions(movedItem);
            }

            setDraggedItem(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggedItem, fieldItems, checkCollisions]);

    // Обработка drop из списка доступных предметов
    const handleDropFromList = (e) => {
        e.preventDefault();
        if (!fieldRef.current) return;

        const itemId = e.dataTransfer.getData('text/plain');
        if (!itemId) return;

        const fieldRect = fieldRef.current.getBoundingClientRect();
        const x = e.clientX - fieldRect.left - 25; // Центрируем
        const y = e.clientY - fieldRect.top - 25;

        createFieldItem(itemId, { x, y });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Обработка начала перетаскивания из списка
    const handleListDragStart = (e, item) => {
        e.dataTransfer.setData('text/plain', item);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content find-secret-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">Задание</h2>

                <div className="modal-question">
                    <p>Для построения топологии сети, в которой движется пакет, необходимо собрать воедино все роутеры и соединить в сетку. Проведём аналогию и поалхимичим!</p>
                    <p>Используйте панель управления слева, чтобы перетаскивать предметы, соединять их и получать новые!</p>
                </div>
                <div className="progress-info">
                    <span>Прогресс: {availableItems.length} / {allPossibleItems.length}</span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${(availableItems.length / allPossibleItems.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
                {showCompletionMessage && (
                    <div className="completion-message">
                        <div className="completion-content">
                            <p>Вы собрали все необходимые элементы!</p>
                        </div>
                    </div>
                )}
                <div className="main">
                    {/* Левая панель - доступные предметы */}
                    <div className="items_list">
                        <div className="openItem">
                            {availableItems.map((item) => (
                                <div
                                    key={item}
                                    className="item open"
                                    draggable
                                    onDragStart={(e) => handleListDragStart(e, item)}
                                >
                                    <img
                                        src={itemImages[item]}
                                        alt={displayName(item)}
                                        onError={(e) => {
                                            console.log('Ошибка загрузки:', item, e.target.src);
                                            e.target.style.backgroundColor = '#ccc'; // Устанавливаем серый фон
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Центральное поле */}
                    <div
                        ref={fieldRef}
                        className="collection_field"
                        onDrop={handleDropFromList}
                        onDragOver={handleDragOver}
                    >
                        {fieldItems.map((item) => {
                            const imgSrc = itemImages[item.type]; // Поиск изображения по типу

                            return (
                                <div
                                    id={`field-item-${item.id}`}
                                    key={item.id}
                                    className="item_in_field"
                                    style={{
                                        left: `${item.position.x}px`,
                                        top: `${item.position.y}px`,
                                        position: 'absolute',
                                        zIndex: item.isDragging ? 1000 : 1,
                                        width: '140px',
                                        minWidth: '140px',
                                    }}
                                    onMouseDown={(e) => handleDragStart(e, item)}
                                >
                                    <img
                                        className="item_picture"
                                        src={imgSrc}
                                        alt={item.name}
                                        onError={(e) => {
                                            console.log('Ошибка загрузки в поле:', item.type, imgSrc, e.target.src);
                                            e.target.style.backgroundColor = '#ccc'; // Изменили стиль на случай ошибки
                                        }}
                                    />
                                    <h3 className="nameItem">{item.name}</h3>
                                </div>
                            );
                        })}

                        <img
                            ref={basketRef}
                            id="basket"
                            src="/images/корзина.svg"
                            alt="Корзина"
                            onError={(e) => {
                                console.log('Ошибка загрузки корзины');
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alchemy;