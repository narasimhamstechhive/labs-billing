import React, { useState } from 'react';
import { X, Delete, Eraser, Calculator as CalculatorIcon } from 'lucide-react';

const Calculator = ({ isOpen, onClose }) => {
    const [display, setDisplay] = useState('');
    const [evalString, setEvalString] = useState('');

    if (!isOpen) return null;

    const handleNumber = (num) => {
        setDisplay(prev => prev + num);
        setEvalString(prev => prev + num);
    };

    const handleOperator = (op) => {
        if (!display) return;
        setDisplay(''); // Clear display for next number
        setEvalString(prev => prev + op);
    };

    const handleCalculate = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(evalString).toString();
            setDisplay(result);
            setEvalString(result);
        } catch (error) {
            setDisplay('Error');
            setEvalString('');
        }
    };

    const handleClear = () => {
        setDisplay('');
        setEvalString('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Modal Container - Enable pointer events for content */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-80 overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <CalculatorIcon className="w-5 h-5 text-yellow-400" /> Calculator
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Display */}
                <div className="bg-gray-100 p-6 text-right">
                    <div className="text-xs text-gray-400 font-mono h-4 mb-1 truncate">{evalString}</div>
                    <div className="text-4xl font-black text-gray-900 truncate tracking-tight">{display || '0'}</div>
                </div>

                {/* Keypad */}
                <div className="p-4 bg-white grid grid-cols-4 gap-3">
                    <button onClick={handleClear} className="col-span-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">AC</button>
                    <button onClick={() => setDisplay(display.slice(0, -1))} className="col-span-2 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center">
                        <Delete className="w-5 h-5" />
                    </button>

                    {['7', '8', '9', '/'].map(btn => (
                        <button
                            key={btn}
                            onClick={() => ['/'].includes(btn) ? handleOperator(btn) : handleNumber(btn)}
                            className={`py-4 rounded-xl font-bold text-lg shadow-sm border border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                ${['/'].includes(btn) ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {btn === '/' ? '÷' : btn}
                        </button>
                    ))}
                    {['4', '5', '6', '*'].map(btn => (
                        <button
                            key={btn}
                            onClick={() => ['*'].includes(btn) ? handleOperator(btn) : handleNumber(btn)}
                            className={`py-4 rounded-xl font-bold text-lg shadow-sm border border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                ${['*'].includes(btn) ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {btn === '*' ? '×' : btn}
                        </button>
                    ))}
                    {['1', '2', '3', '-'].map(btn => (
                        <button
                            key={btn}
                            onClick={() => ['-'].includes(btn) ? handleOperator(btn) : handleNumber(btn)}
                            className={`py-4 rounded-xl font-bold text-lg shadow-sm border border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                ${['-'].includes(btn) ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {btn}
                        </button>
                    ))}
                    {['0', '.', '=', '+'].map(btn => (
                        <button
                            key={btn}
                            onClick={() => {
                                if (btn === '=') handleCalculate();
                                else if (btn === '+') handleOperator(btn);
                                else handleNumber(btn);
                            }}
                            className={`py-4 rounded-xl font-bold text-lg shadow-sm border border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                ${['+', '='].includes(btn)
                                    ? (btn === '=' ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100')
                                    : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calculator;
