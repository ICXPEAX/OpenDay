import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug3 = ({ isOpen, onClose }) => {
    // ИЗНАЧАЛЬНО КОД С ОШИБКОЙ (нет закрывающей кавычки)
    const [code, setCode] = useState(`console.log("Загрузка началась!);`);
    const [outText, setOutText] = useState('');
    const [success, setSuccess] = useState(false);
    const { completeQuest } = useQuest();

    const executeCode = useCallback((codeString) => {
        try {
            const originalLog = console.log;
            let consoleOutput = '';

            console.log = (...args) => {
                const message = args.join(' ');
                consoleOutput += message + '\n';
                originalLog(...args);
            };

            // eslint-disable-next-line no-eval
            eval(codeString);

            console.log = originalLog;
            return consoleOutput.trim();
        } catch (error) {
            return `Ошибка: ${error.message}`;
        }
    }, []);

    useEffect(() => {
        try {
            const result = executeCode(code);
            setOutText(result);
            
            console.log('🔍 FindBug3 - Результат выполнения кода:', result);
            
            // Проверяем правильный вывод
            if (result === "Загрузка началась!") {
                console.log('✅ FindBug3 - Условие выполнено! Вызываем completeQuest("findBug3")');
                setSuccess(true);
                completeQuest('findBug3');
            } else {
                console.log('❌ FindBug3 - Неправильный вывод, ждем правильного решения');
                setSuccess(false);
            }
        } catch (error) {
            console.log('💥 FindBug3 - Ошибка выполнения:', error);
            setOutText(`Ошибка: ${error.message}`);
            setSuccess(false);
        }
    }, [code, executeCode, completeQuest]);

    if (!isOpen) return null;

    const handleClose = () => {
        console.log('🚪 FindBug3 - Закрытие модалки');
        setSuccess(false);
        onClose();
    };

    const handleReset = () => {
        console.log('🔄 FindBug3 - Сброс кода к исходному состоянию');
        setCode(`console.log("Загрузка началась!);`);
    };

    // Правильное решение
    const correctSolution = () => {
        console.log('📝 FindBug3 - Установка правильного решения');
        setCode(`console.log("Загрузка началась!");`);
    };

    return (
        <div className="modal-overlay">
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Сообщение о загрузке</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Пакет начал свой путь. Нужно сообщить адресату, что загрузка началась.</p>
                    <p>Вам представлен код с ошибкой. Необходимо вывести в терминале сообщение: <strong>"Загрузка началась!"</strong></p>
                    <p><strong>Подсказка:</strong> Проверьте кавычки в строке - не хватает закрывающей кавычки</p>
                    <p><strong>Текущий вывод:</strong> "{outText}"</p>
                    {success && <p style={{color: 'green', fontWeight: 'bold'}}>✅ Задание выполнено!</p>}
                </div>

                <div className='console-line'>
                    <section>
                        <p className='console-label'>{success ? "✅ Правильный код" : "❌ Неправильный код"}</p>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={4}
                            className='consoleW'
                            style={{ fontFamily: 'monospace' }}
                        />
                    </section>

                    <section>
                        <p className='console-label'>Терминал вывода</p>
                        <textarea
                            value={outText}
                            placeholder="Вывод программы..."
                            readOnly
                            rows={4}
                            className='consoleW'
                            style={{
                                backgroundColor: '#1e1e1e',
                                color: '#0f0',
                                fontFamily: 'monospace'
                            }}
                        />
                    </section>
                </div>
                
                {/* Кнопка для показа правильного решения */}
                <button
                    className="submit-button"
                    onClick={correctSolution}
                    style={{ marginBottom: '10px', backgroundColor: '#17a2b8' }}
                >
                    📝 Показать правильное решение
                </button>

                <button
                    className="submit-button"
                    onClick={success ? handleClose : handleReset}
                >
                    {success ? "✅ Отлично! Ошибка исправлена!" : "🔄 Сбросить изменения"}
                </button>
            </div>
        </div>
    );
};

export default FindBug3;