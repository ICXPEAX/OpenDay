import { useEffect, useState, useCallback, useRef } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const TypeText = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [taskStarted, setTaskStarted] = useState(false);
    const [result, setResult] = useState('');
    const [timer, setTimer] = useState(35);
    const [timeInterval, setTimeInterval] = useState(null);
    const [buttonText, setButtonText] = useState("Старт");
    const { updateQuestStatus } = useQuest();

    const allText = [
        ["1) Включите IP forwarding.", "sysctl -w net.ipv4.ip_forward=1"],
        ["2) Добавьте статический маршрут.", "ip route add 192.168.2.0/24 via 192.168.1.1 dev eth1"],
        ["3) Для добавления NAT.", "iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE"],
        ["4) Сохраните введённые правила.", "service iptables save"],
        ["5) Проверьте результат.", "ip route show, traceroute 192.168.2.10"]
    ];

    const initialText = [
        "Пакет попал не к тому адресату! Нужно срочно настроить новый маршрут, пока никто не заметил. У вас есть 35 секунд для перенастройки маршрутизации!",
        "Нажмите кнопку старта для начала настройки и введите нужную команду."
    ];

    const [textToType, setTextToType] = useState(initialText);

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (timeInterval) {
                clearInterval(timeInterval);
            }
        };
    }, [timeInterval]);

    // Обработка таймера
    useEffect(() => {
        if (timer === 0 && taskStarted) {
            clearInterval(timeInterval);
            setTimeInterval(null);

            // Проверка ответа при истечении времени
            if (text.trim() === textToType[1].trim()) {
                if (currentTaskIndex === allText.length - 1) {
                    setResult("Ура! Все задания выполнены! Пакет нашёл новый путь и продолжает движение");
                    setButtonText("Задание выполнено!");
                    updateQuestStatus('typeText', true);
                } else {
                    setResult("Отлично! Переходим к следующему заданию");
                    setButtonText("Следующее задание");
                }
            } else {
                setResult("Неверно. Пакет застрял в пути и придётся начать всё заново...");
                resetToBeginning();
            }
        }
    }, [timer, timeInterval, taskStarted, text, textToType, currentTaskIndex, allText.length, updateQuestStatus]);

    const resetToBeginning = useCallback(() => {
        setCurrentTaskIndex(0);
        setTextToType(initialText);
        setTaskStarted(false);
        setText('');
        setTimer(35);
        setButtonText("Начать снова");
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }
    }, [initialText, timeInterval]);

    const startTask = useCallback(() => {
        if (timeInterval) {
            clearInterval(timeInterval);
        }

        setText('');
        
        if (currentTaskIndex < allText.length) {
            setTextToType(allText[currentTaskIndex]);
            setTaskStarted(true);
            setTimer(35);
            setResult('');

            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            setTimeInterval(interval);
        }
    }, [currentTaskIndex, allText, timeInterval]);

    const handleSubmit = useCallback(() => {
        if (!taskStarted) return;

        if (text.trim() === textToType[1].trim()) {
            // Правильный ответ
            if (currentTaskIndex === allText.length - 1) {
                // Все задания выполнены
                setResult("Ура! Все задания выполнены! Пакет нашёл новый путь и продолжает движение");
                setButtonText("Задание выполнено!");
                setTaskStarted(false);
                updateQuestStatus('typeText', true);
                if (timeInterval) {
                    clearInterval(timeInterval);
                    setTimeInterval(null);
                }
            } else {
                // Переход к следующему заданию
                setResult("Отлично! Переходим к следующему заданию");
                setCurrentTaskIndex(prev => prev + 1);
                setTaskStarted(false);
                setText('');
                setButtonText("Следующее задание");
                if (timeInterval) {
                    clearInterval(timeInterval);
                    setTimeInterval(null);
                }
            }
        } else {
            setResult("Неверная команда. Попробуйте снова!");
        }
    }, [taskStarted, text, textToType, currentTaskIndex, allText.length, timeInterval, updateQuestStatus]);

    const handleClose = () => {
        if (timeInterval) {
            clearInterval(timeInterval);
            setTimeInterval(null);
        }
        setCurrentTaskIndex(0);
        setTimer(35);
        setText('');
        setTextToType(initialText);
        setResult('');
        setTaskStarted(false);
        setButtonText("Старт");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Настройка маршрута</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>{textToType[0]}</p>
                    {taskStarted && (
                        <p><strong>Команда для ввода:</strong> {textToType[1]}</p>
                    )}
                </div>

                <section>
                    {taskStarted ? (
                        <>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={3}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    fontFamily: 'monospace',
                                    marginBottom: '10px'
                                }}
                                placeholder="Введите команду..."
                            />
                            <button
                                className="submit-button"
                                onClick={handleSubmit}
                                style={{ marginBottom: '10px' }}
                            >
                                Проверить
                            </button>
                        </>
                    ) : (
                        result && <p className="info-message">{result}</p>
                    )}
                </section>

                {taskStarted && (
                    <div className="info-message" style={{ marginTop: '10px' }}>
                        Оставшееся время: {timer} сек
                    </div>
                )}

                <button
                    className="submit-button"
                    onClick={startTask}
                    disabled={taskStarted && currentTaskIndex < allText.length}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default TypeText;