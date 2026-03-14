import { useCallback, useEffect, useState } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const FindBug = ({ isOpen, onClose }) => {
    const [code, setCode] = useState(`const a = 50;
const b = 150;
if(a < b){
    return 'Переменная a больше b'
}
else{
   return 'Переменная b больше a'
}`);
    const [outText, setOutText] = useState('Переменная a больше b');
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
            if (outText === "Переменная b больше a") {
                setSuccess(true)
                updateQuestStatus("FindBug1", true)
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
        setCode(`const a = 50;
const b = 150;
if(a < b){
    return 'Переменная a больше b'
}
else{
   return 'Переменная b больше a'
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
                    <p>В сетевом пакете оказалось слишком много данных. Помогите их сократить.</p>
                    <p>Вам представлен код с ошибкой. Исправьте его, чтобы в окне вывода появлялось правильное сообщение.</p>
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

export default FindBug;