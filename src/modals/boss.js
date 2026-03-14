import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../App.css';
import { useQuest } from '../context/QuestContext';

const Boss = ({ isOpen, onClose }) => {
    const [result, setResult] = useState("");
    const [hit, setHits] = useState(0);
    const [start, setStart] = useState(false);
    const [pc, setPc] = useState([]);
    const [shots, setShots] = useState([]);
    const { updateQuestStatus } = useQuest();

    const canvasRef = useRef(null);
    const consoleRef = useRef(null);

    const fieldSize = 8;
    const cellSize = 40;

    const log = useCallback((msg) => {
        if (consoleRef.current) {
            consoleRef.current.value += new Date().toLocaleTimeString() + ": " + msg + "\n";
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, []);

    const drawField = useCallback((ctx) => {
        ctx.clearRect(0, 0, fieldSize * cellSize, fieldSize * cellSize);

        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                ctx.strokeStyle = "#333";
                ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);

                ctx.fillStyle = "#222";
                ctx.fillRect(j * cellSize + 1, i * cellSize + 1, cellSize - 2, cellSize - 2);

                ctx.fillStyle = "#666";
                ctx.font = "10px Arial";
                ctx.fillText(`${i},${j}`, j * cellSize + 5, i * cellSize + 15);
            }
        }

        // Рисуем результаты выстрелов
        shots.forEach(({ row, col, isHit }) => {
            const cellX = col * cellSize;
            const cellY = row * cellSize;

            if (isHit) {
                // Попадание - красный крестик
                ctx.strokeStyle = "#f00";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cellX + 10, cellY + 10);
                ctx.lineTo(cellX + cellSize - 10, cellY + cellSize - 10);
                ctx.moveTo(cellX + cellSize - 10, cellY + 10);
                ctx.lineTo(cellX + 10, cellY + cellSize - 10);
                ctx.stroke();

                ctx.strokeStyle = "#f00";
                ctx.lineWidth = 2;
                ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
            } else {
                // Промах
                ctx.fillStyle = "#00f";
                ctx.beginPath();
                ctx.arc(cellX + cellSize / 2, cellY + cellSize / 2, 8, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.lineWidth = 1;
    }, [fieldSize, cellSize, shots]);

    const generatePc = useCallback(() => {
        const newPc = [];
        while (newPc.length < 5) {
            const row = Math.floor(Math.random() * fieldSize);
            const col = Math.floor(Math.random() * fieldSize);
            if (!newPc.some(s => s[0] === row && s[1] === col)) {
                newPc.push([row, col]);
            }
        }
        return newPc;
    }, [fieldSize]);

    const shoot = useCallback((row, col) => {
        if (!start) {
            log("Сначала начните битву!");
            return;
        }
        if (row === undefined || col === undefined) {
            log("Используйте: shoot(ряд, колонка). Например: shoot(3, 4)");
            return;
        }

        if (row < 0 || row >= fieldSize || col < 0 || col >= fieldSize) {
            log("Ошибка: координаты вне поля!");
            return;
        }

        if (shots.some(s => s.row === row && s.col === col)) {
            log(`В клетку [${row},${col}] уже стреляли!`);
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const pcIp = pc.findIndex(s => s[0] === row && s[1] === col);
        const isHit = pcIp > -1;

        const newShots = [...shots, { row, col, isHit }];
        setShots(newShots);

        if (isHit) {
            const newHits = hit + 1;
            setHits(newHits);

            log(`ПОПАДАНИЕ в [${row},${col}]! Осталось: ${5 - newHits}`);

            const newPcs = [...pc];
            newPcs.splice(pcIp, 1);
            setPc(newPcs);

            if (newHits === 5) {
                setResult("ПОБЕДА! Все лазейки злоумышленника уничтожены!");
                log("ПОБЕДА! Все уязвимости устранены!");
                updateQuestStatus('boss');
            }
        } else {
            log(`ПРОМАХ в [${row},${col}]`);
        }

        drawField(ctx);

    }, [start, pc, hit, shots, drawField, log, fieldSize]);

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const newPc = generatePc();


        setPc(newPc);
        setHits(0);
        setResult("");
        setShots([]);

        drawField(ctx);

        if (consoleRef.current) {
            consoleRef.current.value = '';
        }

        log('Используйте: shoot(ряд, колонка) для выстрела');
        log('Координаты: ряд от 0 до 7, колонка от 0 до 7');

    }, [generatePc, drawField, log]);

    // Эффект для запуска игры
    useEffect(() => {
        if (start) {
            initGame();
        }
    }, [start]);

    useEffect(() => {
        if (start && hit > 0) {
            log(`📊 Текущий счет: ${hit} / 5`);
        }
    }, [hit, start, log]);

    useEffect(() => {
        window.shoot = shoot;

        return () => {
            delete window.shoot;
        };
    }, [shoot]);

    const handleClose = () => {
        setHits(0);
        setResult('');
        setStart(false);
        setPc([]);
        setShots([]);

        delete window.shoot;
        delete window.help;
        delete window.clear;

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>×</button>

                <h2 className="modal-title">
                    Внимание! Злоумышленник пытается перехватить пакет!
                </h2>

                {!start && (
                    <div className="modal-question">
                        <p>Сразите злоумышленника в честном бою!</p>
                        <p>Враг спрятал 5 своих IP-адресов (1-клеточные компьютеры) на поле 8x8.</p>
                        <p>Закрой дыры в системе через консоль разработчика!</p>
                        <p><strong>Инструкция:</strong> открой консоль (F12) и используй команду <code>shoot(ряд, колонка)</code></p>
                        <p>Например: <code>shoot(3, 4)</code></p>
                    </div>
                )}

                {start && (
                    <>
                        <div className="game-info" id="info">
                            Попаданий: {hit} / 5
                        </div>

                        <canvas
                            ref={canvasRef}
                            id="enemyField"
                            width={fieldSize * cellSize}
                            height={fieldSize * cellSize}
                            style={{
                                border: '2px solid #444',
                                margin: '10px 0',
                                display: 'block'
                            }}
                        />

                        <textarea
                            ref={consoleRef}
                            id="console"
                            placeholder="Вывод логов..."
                            readOnly
                            rows={5}
                            style={{
                                width: '100%',
                                backgroundColor: '#1e1e1e',
                                color: '#0f0',
                                fontFamily: 'monospace',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                marginTop: '10px'
                            }}
                        />
                    </>
                )}

                <div className="info-message">
                    {result}
                </div>

                {!start && (
                    <button
                        className="submit-button"
                        onClick={() => setStart(true)}
                    >
                        Начать игру
                    </button>
                )}
            </div>
        </div>
    );
};

export default Boss;