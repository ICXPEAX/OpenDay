import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug2 = ({ isOpen, onClose }) => {
    const [code, setCode] = useState(`function calculateSum(a, b) {
  return a + b;
}

return(calculateSum(6, '10')); `);
    const [outText, setOutText] = useState(610);
    const [success, setSuccess] = useState(false);
        const { updateQuestStatus } = useQuest();

    const executeCode = useCallback((codeString) => {
        try {
            const func = new Function(`
                ${codeString}
                // Возвращаем результат последнего выражения
                let result;
                const lines = \`${codeString}\`.split('\\n').filter(line => line.trim() && !line.includes('if') && !line.includes('else'));
                const lastLine = lines[lines.length - 1];
                try {
                    result = eval(lastLine);
                } catch(e) {
                    result = '';
                }
                return result;
            `);

            const result = func();
            return result || '';
        } catch (error) {
            return `Ошибка: ${error.message}`;
        }
    }, []);

    useEffect(() => {
        try {
            const result = executeCode(code);
            setOutText(result);
            if (outText === 16) {
                setSuccess(true)
                updateQuestStatus("FindBug2", true)
            }
        } catch (error) {
            setOutText(`Ошибка: ${error.message}`);
            setSuccess(false);
        }
    }, [code, outText]);

    if (!isOpen) return null;

    const handleClose = () => {
        handleReset()
        setSuccess(false)
        onClose();
    };

    const handleReset = () => {
        setCode(`function calculateSum(a, b) {
  return a + b;
}

return(calculateSum(6, '10')); `)
        const result = executeCode(code);
        setOutText(result);
    };

    return (
        <div className="modal-overlay" >
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Задание</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Необходимо посчитать длину пакета в байтах, чтобы рассчитать примерное время передачи.</p>
                    <p>Вам представлен код с ошибкой. Ожидается что вернется число 16, но по какой-то причине выводится 610.</p>
                </div>

                <div className='console-line'>
                    <section>
                        <p className='console-label'>{success ? "Правильный код" : "Неправильный код"}</p>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={7}
                            className='consoleW'
                        />
                    </section>

                    <section>
                        <p className='console-label'>Консоль вывода</p>
                        <textarea
                            value={outText}
                            placeholder="Вывод логов..."
                            readOnly
                            rows={5}
                            className='consoleW'
                            style={{
                                backgroundColor: '#1e1e1e',
                                color: '#0f0'
                            }}
                        />
                    </section>
                </div>
                {<button
                    className="submit-button"
                    onClick={success ? handleClose : handleReset}
                >
                    {success ? "Отлично! Ошибка исправлена!" : "Сбросить изменения"}
                </button>}
            </div>
        </div>
    );
};

export default FindBug2;