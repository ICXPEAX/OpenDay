import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug2 = ({ isOpen, onClose }) => {
    // ИЗНАЧАЛЬНО КОД С ОШИБКОЙ (без Number())
    const [code, setCode] = useState(`function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(6, '10');
console.log(result);`);
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
            
            console.log('🔍 FindBug2 - Результат выполнения кода:', result);
            
            // Проверяем, что результат равен 16
            if (result === '16' || result.includes('16')) {
                console.log('✅ FindBug2 - Условие выполнено! Вызываем completeQuest("findBug2")');
                setSuccess(true);
                completeQuest('findBug2');
            } else {
                console.log('❌ FindBug2 - Неправильный вывод, ждем правильного решения');
                setSuccess(false);
            }
        } catch (error) {
            console.log('💥 FindBug2 - Ошибка выполнения:', error);
            setOutText(`Ошибка: ${error.message}`);
            setSuccess(false);
        }
    }, [code, executeCode, completeQuest]);

    if (!isOpen) return null;

    const handleClose = () => {
        console.log('🚪 FindBug2 - Закрытие модалки');
        setSuccess(false);
        onClose();
    };

    const handleReset = () => {
        console.log('🔄 FindBug2 - Сброс кода к исходному состоянию');
        setCode(`function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(6, '10');
console.log(result);`);
    };

    // Правильное решение
    const correctSolution = () => {
        console.log('📝 FindBug2 - Установка правильного решения');
        setCode(`function calculateSum(a, b) {
    // Преобразуем строку в число, если нужно
    return Number(a) + Number(b);
}

const result = calculateSum(6, '10');
console.log(result);`);
    };

    return (
        <div className="modal-overlay">
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Сумма чисел</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Необходимо посчитать длину пакета в байтах, чтобы рассчитать примерное время передачи.</p>
                    <p>Вам представлен код с ошибкой. Ожидается что вернется число <strong>16</strong>, но сейчас выводится 610.</p>
                    <p><strong>Подсказка:</strong> Обратите внимание на тип данных второго аргумента - это строка! Используйте <code>Number()</code> для преобразования.</p>
                    <p><strong>Текущий вывод:</strong> "{outText}"</p>
                    {success && <p style={{color: 'green', fontWeight: 'bold'}}>✅ Задание выполнено!</p>}
                </div>

                <div className='console-line'>
                    <section>
                        <p className='console-label'>{success ? "✅ Правильный код" : "❌ Неправильный код"}</p>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={8}
                            className='consoleW'
                            style={{ fontFamily: 'monospace' }}
                        />
                    </section>

                    <section>
                        <p className='console-label'>Консоль вывода</p>
                        <textarea
                            value={outText}
                            placeholder="Вывод программы..."
                            readOnly
                            rows={8}
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

export default FindBug2;