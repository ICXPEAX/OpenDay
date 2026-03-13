import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug = ({ isOpen, onClose }) => {
    const [code, setCode] = useState(`const a = 50;
const b = 150;

if (a < b) {
    console.log('Переменная a больше b');
} else {
    console.log('Переменная b больше a');
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

            // Безопасное выполнение кода
            const func = new Function(codeString);
            func();

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
            
            // Проверяем правильный вывод
            if (result.includes('Переменная b больше a')) {
                setSuccess(true);
                completeQuest('findBug1');
            } else {
                setSuccess(false);
            }
        } catch (error) {
            setOutText(`Ошибка: ${error.message}`);
            setSuccess(false);
        }
    }, [code, executeCode, completeQuest]);

    if (!isOpen) return null;

    const handleClose = () => {
        handleReset();
        setSuccess(false);
        onClose();
    };

    const handleReset = () => {
        setCode(`const a = 50;
const b = 150;

if (a < b) {
    console.log('Переменная a больше b');
} else {
    console.log('Переменная b больше a');
}`);
    };

    return (
        <div className="modal-overlay">
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Исправление ошибки в коде</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>В сетевом пакете оказалось слишком много данных. Помогите их сократить.</p>
                    <p>Вам представлен код с ошибкой. Исправьте его, чтобы в окне вывода появлялось правильное сообщение: <strong>"Переменная b больше a"</strong></p>
                    <p><strong>Подсказка:</strong> Нужно исправить условие или сообщения в console.log</p>
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

export default FindBug;