import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug4 = ({ isOpen, onClose }) => {
    const [code, setCode] = useState(`let i = 1;
while (i <= 5) {
  console.log(i);
  i=i*3
}`);
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
            if (result.includes(1)&&result.includes(2)&&result.includes(3)&&result.includes(4)&&result.includes(5)) {
                setSuccess(true)
                updateQuestStatus("FindBug4")
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
        setCode(`let i = 1;
while (i <= 5) {
  console.log(i);
  i=i*3
}`)
        const result = executeCode(code);
        setOutText(result);
    };

    return (
        <div className="modal-overlay" >
            <div className="console-content">
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">Задание</h2>

                <div className="modal-question" onCopy={(e) => e.preventDefault()}>
                    <p>Пользователь прервал загрузку и пакету нужно вернуться на начальную позицию. Посчитайте сколько промежуочных точек ему нужно пройти.</p>
                    <p>Вам представлен код с ошибкой. Ожидается что i с каждым разом будет увеличиваться на единицу.</p>
                </div>

                <p className='error-message'>Аккуратнее! Неправильное изменение данного кода приведёт к прекращению работы всей программы! Позови одного из помощников, чтобы этого не случилось!</p>

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

export default FindBug4;