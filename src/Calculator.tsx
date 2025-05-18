import React, { useState, useEffect, useRef } from 'react';
import './Calculator.css';

const buttonRows = [
  ['C', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

// Map display label to value for logic
const labelToValue: Record<string, string> = {
  '÷': '/',
  '×': '*',
  '−': '-',
  '+': '+',
  '=': '=',
  'C': 'C',
  '+/-': '+/-',
  '%': '%',
  '.': '.',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
};

// --- Safe math parser and percent handling ---
function safeCalculate(expr: string): string {
  try {
    // Remove spaces
    expr = expr.replace(/\s+/g, '');
    // Handle percent: replace e.g. 200+10% with 200+(200*0.1)
    expr = expr.replace(/(\d+(?:\.\d+)?)([+\-])((?:\d+(?:\.\d+)?)%)/g, (a, op, b) => {
      const base = parseFloat(a);
      const percent = parseFloat(b) / 100;
      if (op === '+') return `${base}+(${base}*${percent})`;
      if (op === '-') return `${base}-(${base}*${percent})`;
      return '';
    });
    // Handle multiply/divide with percent: 200*10% => 200*0.1
    expr = expr.replace(/(\d+(?:\.\d+)?)([*/])((?:\d+(?:\.\d+)?)%)/g, (a, op, b) => {
      const percent = parseFloat(b) / 100;
      return `${a}${op}${percent}`;
    });
    // Standalone percent: 50% => 0.5
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, (_, a) => (parseFloat(a) / 100).toString());
    // Only allow numbers and operators
    if (!/^[-+*/().\d]+$/.test(expr)) return 'Error';
    // eslint-disable-next-line no-new-func
    // Use Function constructor for safe math (no variables, no access to scope)
    // This is much safer than eval for math-only
    // @ts-ignore
    const result = Function(`'use strict'; return (${expr})`)();
    if (typeof result === 'number' && isFinite(result)) return result.toString();
    return 'Error';
  } catch {
    return 'Error';
  }
}

const Calculator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [lastWasEqual, setLastWasEqual] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.'].includes(e.key)) {
        setInput(prev => prev + e.key);
        setResult('');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleClick('=');
      } else if (e.key === 'Backspace') {
        setInput(prev => prev.slice(0, -1));
        setResult('');
      } else if (e.key === 'Escape') {
        handleClick('C');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClick = (val: string) => {
    if (val === '+/-') {
      // Negate the current input or result
      if (result && !input) {
        setInput(result.startsWith('-') ? result.slice(1) : '-' + result);
        setResult('');
        setLastWasEqual(false);
      } else if (input) {
        // Negate the last number in the input
        const match = input.match(/(.*?)([\d.]+)$/);
        if (match) {
          const [_, before, num] = match;
          if (num.startsWith('-')) {
            setInput(before + num.slice(1));
          } else {
            setInput(before + '-' + num);
          }
        } else {
          setInput('-');
        }
      }
      setResult('');
      setLastWasEqual(false);
      return;
    }
    const isOperator = ['+', '-', '*', '/', '%'].includes(val);
    if (val === '=') {
      const calcResult = safeCalculate(input);
      setResult(calcResult);
      setLastWasEqual(true);
    } else if (val === 'C') {
      setInput('');
      setResult('');
      setLastWasEqual(false);
    } else if (val === '⌫') {
      setInput(prev => prev.slice(0, -1));
      setResult('');
      setLastWasEqual(false);
    } else {
      if (lastWasEqual) {
        if (isOperator && result && result !== 'Error') {
          setInput(result + val);
        } else if (!isOperator) {
          setInput(val);
        } else {
          setInput('');
        }
        setResult('');
        setLastWasEqual(false);
      } else {
        setInput(prev => prev + val);
        setResult('');
      }
    }
  };

  return (
    <div className="calculator-glass">
      <div className="calculator-display">
        <div className="calculator-input" ref={inputRef}>{input || '0'}</div>
        <div className={`calculator-result${result ? ' calculator-result-animate' : ''}`}>{result}</div>
      </div>
      <div className="calculator-buttons better-calc-grid">
        {buttonRows.map((row, rowIdx) =>
          row.map((label, colIdx) => {
            if (label === '') {
              return <span key={rowIdx + '-' + colIdx} style={{width: '2.5rem', height: '2.5rem', display: 'inline-block'}}></span>;
            }
            const extraClass =
              label === 'C' ? 'clear-btn' :
              label === '+/-' ? 'calc-btn-negate' :
              ['÷', '×', '−', '+', '=', '%'].includes(label) ? 'calc-btn-operator' : '';
            const isWideEquals = rowIdx === 4 && colIdx === 2 && label === '=';
            return (
              <button
                key={String(label) + rowIdx + colIdx}
                className={`calculator-btn${extraClass ? ' ' + extraClass : ''}${isWideEquals ? ' calc-btn-equals-wide' : ''}`}
                style={isWideEquals ? {gridColumn: '3 / span 2'} : {}}
                onClick={() => handleClick(labelToValue[label as string])}
              >
                {label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Calculator;
