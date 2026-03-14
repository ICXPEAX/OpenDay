import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug3 = ({ isOpen, onClose }) => {
    const [code, setCode] = useState(`console.log("Загрузка началась!);`);
    const [outText, setOutText] = useState('');
    const [success, setSuccess] = useState(false);
    const { updateQuestStatus } = useQuest();

    const executeCode = useCallback((codeString) => {
        try {
            const originalLog = console.log;
            let consoleOutput = '';

            console.log = (...args) => {
                const message = args.join(' ');
                consoleOutput += message + '\n';
                originalLog(...args);
            };

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
            if (result === "Загрузка началась!") {
                setSuccess(true)
                updateQuestStatus("FindBug3", true)
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
        setCode(`console.log("Загрузка началась!);`)
        const result = executeCode(code);
        setOutText(result);
    };

    return (
        <div className="modal-overlay" >
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Задание</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Пакет начал свой путь. Нужно сообщить адресату, что загрузка началась.</p>
                    <p>Вам представлен код с ошибкой. Необходимо вывести в терминале сообщение: "Загрузка началась!".</p>
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
                        <p className='console-label'>Терминал вывода</p>
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

export default FindBug3;