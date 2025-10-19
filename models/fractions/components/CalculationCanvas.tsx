import React, { useState, useEffect } from 'react';
import type { EquationState, Fraction } from '../../../types';
import { FractionBlock } from './FractionBlock';

const commonDenominator = (d1 = 1, d2 = 1) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    return (d1 * d2) / gcd(d1, d2);
};

interface StepLineProps {
    term1?: Fraction | null;
    operator?: string | null;
    term2?: Fraction | null;
    result?: Fraction | null;
    isVisible: boolean;
    isFinal?: boolean;
}

const CalculationStep: React.FC<StepLineProps> = ({ term1, operator, term2, result, isVisible, isFinal }) => {
    if (!isVisible) return null;

    const animationClass = isFinal ? 'animate-merge opacity-0' : 'animate-pop-in';

    return (
        <div className={`flex items-center justify-center w-full gap-4 min-h-[4rem] ${animationClass}`}>
            {term1 && <FractionBlock fraction={term1} />}
            {operator && <span className="text-4xl font-chalk">{operator}</span>}
            {term2 && <FractionBlock fraction={term2} />}
            {result && (
                <>
                    <span className="text-4xl font-chalk">=</span>
                    <FractionBlock fraction={result} isResult={true}/>
                </>
            )}
        </div>
    );
};

export const CalculationCanvas: React.FC<{ 
    equation: EquationState,
    isChallengeMode?: boolean 
}> = ({ equation, isChallengeMode = false }) => {
    const { term1, term2, operator, result, isSolved } = equation;
    const [animationStep, setAnimationStep] = useState(0); 
    const [explanation, setExplanation] = useState<string | null>(null);
    const [convertedFractions, setConvertedFractions] = useState<{ term1: Fraction, term2: Fraction } | null>(null);

    useEffect(() => {
        if (isSolved && term1 && term2 && operator && result) {
            const cd = commonDenominator(term1.denominator, term2.denominator);
            const cTerm1 = { numerator: term1.numerator * (cd / term1.denominator), denominator: cd };
            const cTerm2 = { numerator: term2.numerator * (cd / term2.denominator), denominator: cd };

            setAnimationStep(0);
            setExplanation(null);
            setConvertedFractions(null);

            const timer1 = setTimeout(() => {
                setExplanation(`Step 1: Find a common size for the pieces. Let's change them both to ${cd}ths.`);
                setAnimationStep(1); 
                setConvertedFractions({ term1: cTerm1, term2: cTerm2 });
            }, 1000);

            const timer2 = setTimeout(() => {
                const resultNumerator = operator === '+' ? cTerm1.numerator + cTerm2.numerator : cTerm1.numerator - cTerm2.numerator;
                setExplanation(`Step 2: Now we can ${operator === '+' ? 'add' : 'subtract'} the pieces: ${cTerm1.numerator} ${operator} ${cTerm2.numerator} = ${resultNumerator}.`);
            }, 4000);

            const timer3 = setTimeout(() => {
                setAnimationStep(2); 
                setExplanation(`The final answer is ${result.numerator}/${result.denominator}!`);
            }, 7000);

            return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
        } else {
            setAnimationStep(0);
            setExplanation(null);
            setConvertedFractions(null);
        }
    }, [isSolved, term1, term2, operator, result]);

    if (isChallengeMode) {
        return (
            <div className="w-full min-h-[12rem] p-6 rounded-2xl chalk-border flex flex-col justify-center items-center relative">
                <h3 className="text-2xl font-chalk absolute top-4 text-chalk-yellow">Your Answer</h3>
                <div className="w-full h-16 flex items-center justify-center">
                    {term1 ? (
                        <FractionBlock fraction={term1} isResult={true} />
                    ) : (
                        <p className="text-xl text-chalk-light">Click fractions on the wall to build your answer.</p>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-end items-center relative">
            {explanation && (
                <div className="absolute top-4 w-full text-center px-4 animate-pop-in">
                    <p className="inline-block bg-slate-900/80 p-3 rounded-lg text-xl font-chalk text-chalk-cyan shadow-md">
                        {explanation}
                    </p>
                </div>
            )}
            <div className="w-full space-y-2">
                <CalculationStep term1={term1} operator={operator} term2={term2} isVisible={!!term1} />
                <CalculationStep term1={convertedFractions?.term1} operator={operator} term2={convertedFractions?.term2} isVisible={animationStep >= 1} />
                <CalculationStep result={result} isVisible={animationStep >= 2} isFinal={true} />
            </div>
        </div>
    );
};
