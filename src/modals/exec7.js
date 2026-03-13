import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug4 = ({ isOpen, onClose }) => {
    // ИЗНАЧАЛЬНО КОД С ОШИБКОЙ (умножение на 3 вместо прибавления 1)
    const [code, setCode] = useState(`let i = 1;
while (i <= 5) {
    console.log(i);
    i = i * 3;
}`);
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
            
            console.log('🔍 FindBug4 - Результат выполнения кода:', result);
            
            // Проверяем, что выведены числа от 1 до 5
            const lines = result.split('\n').filter(line => line.trim() !== '');
            const numbers = lines.map(line => {
                const num = parseInt(line.trim());
                return isNaN(num) ? null : num;
            }).filter(n => n !== null);
            
            console.log('📊 FindBug4 - Числа из вывода:', numbers);
            
            // Проверяем наличие всех чисел от 1 до 5
            const hasAllNumbers = [1, 2, 3, 4, 5].every(num => numbers.includes(num));
            
            console.log('📊 FindBug4 - Все числа присутствуют:', hasAllNumbers);
            
            if (hasAllNumbers && numbers.length === 5) {
                console.log('✅ FindBug4 - Условие выполнено! Вызываем completeQuest("findBug4")');
                setSuccess(true);
                completeQuest('findBug4');
            } else {
                console.log('❌ FindBug4 - Неправильный вывод, ждем правильного решения');
                setSuccess(false);
            }
        } catch (error) {
            console.log('💥 FindBug4 - Ошибка выполнения:', error);
            setOutText(`Ошибка: ${error.message}`);
            setSuccess(false);
        }
    }, [code, executeCode, completeQuest]);

    if (!isOpen) return null;

    const handleClose = () => {
        console.log('🚪 FindBug4 - Закрытие модалки');
        setSuccess(false);
        onClose();
    };

    const handleReset = () => {
        console.log('🔄 FindBug4 - Сброс кода к исходному состоянию');
        setCode(`let i = 1;
while (i <= 5) {
    console.log(i);
    i = i * 3;
}`);
    };

    // Правильное решение
    const correctSolution = () => {
        console.log('📝 FindBug4 - Установка правильного решения');
        setCode(`let i = 1;
while (i <= 5) {
    console.log(i);
    i = i + 1;
}`);
    };

    return (
        <div className="modal-overlay">
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Цикл while</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Пользователь прервал загрузку и пакету нужно вернуться на начальную позицию. Посчитайте сколько промежуточных точек ему нужно пройти.</p>
                    <p>Вам представлен код с ошибкой. Ожидается что i с каждым разом будет увеличиваться на единицу (вывести числа от 1 до 5).</p>
                    <p><strong>Подсказка:</strong> Нужно изменить <code>i = i * 3</code> на <code>i = i + 1</code></p>
                    <p><strong>Текущий вывод:</strong> "{outText}"</p>
                    {success && <p style={{color: 'green', fontWeight: 'bold'}}>✅ Задание выполнено!</p>}
                </div>

                <p className='error-message'>⚠️ Аккуратнее! Неправильное изменение данного кода приведёт к бесконечному циклу! Убедитесь, что i увеличивается правильно!</p>

                <div className='console-line'>
                    <section>
                        <p className='console-label'>{success ? "✅ Правильный код" : "❌ Неправильный код"}</p>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={7}
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
                            rows={7}
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

export default FindBug4;