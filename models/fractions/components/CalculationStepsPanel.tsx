import React from 'react';
import type { EquationState, Fraction } from '../../../types';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

function fractionsAreEqual(f1: Fraction | null | undefined, f2: Fraction | null | undefined): boolean {
    if (!f1 || !f2) return false;
    if (f1.numerator === 0 && f2.numerator === 0) return true;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

const FractionDisplay: React.FC<{ fraction: Fraction, highlight?: boolean, color?: string }> = ({ fraction, highlight, color = 'text-chalk-cyan' }) => (
    <div className={`inline-flex flex-col items-center font-sans px-2 rounded-md ${highlight ? 'bg-yellow-400/20' : ''}`}>
        <span className={`font-bold text-2xl ${color}`}>{fraction.numerator}</span>
        <div className="border-t-2 border-chalk-light w-10"></div>
        <span className={`font-bold text-2xl ${color}`}>{fraction.denominator}</span>
    </div>
);

export const CalculationStepsPanel: React.FC<{ equation: EquationState }> = ({ equation }) => {
    const { term1, term2, operator, result, unsimplifiedResult, isSolved } = equation;

    if (!isSolved || !term1 || !term2 || !operator || !result || !unsimplifiedResult) {
        return <div className="w-full min-h-[10rem] mt-4"></div>; // Return a placeholder to prevent layout shift
    }

    const needsConversion = term1.denominator !== term2.denominator;
    const commonDen = needsConversion ? lcm(term1.denominator, term2.denominator) : term1.denominator;
    
    const multiplier1 = commonDen / term1.denominator;
    const converted1 = { numerator: term1.numerator * multiplier1, denominator: commonDen };
    
    const multiplier2 = commonDen / term2.denominator;
    const converted2 = { numerator: term2.numerator * multiplier2, denominator: commonDen };

    const needsSimplifying = !fractionsAreEqual(unsimplifiedResult, result);

    let stepCounter = 1;

    return (
        <div className="w-full p-4 rounded-2xl chalk-border chalk-bg-light mt-4 animate-pop-in">
            <h3 className="text-2xl font-chalk text-chalk-yellow mb-4 border-b-2 border-chalk-border pb-2">Step-by-Step Solution</h3>
            <ol className="space-y-4 text-chalk-light text-lg">
                {needsConversion && (
                    <>
                        <li className="flex items-start gap-3">
                            <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                            <div>
                                <p>Find a common denominator (LCM) for <span className="font-bold text-chalk-yellow">{term1.denominator}</span> and <span className="font-bold text-chalk-yellow">{term2.denominator}</span>.</p>
                                <p className="bg-slate-900/50 p-2 rounded-md mt-1">The least common multiple is <span className="font-bold text-chalk-green text-xl">{commonDen}</span>.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                            <div>
                                <p>Convert the fractions to have the same denominator.</p>
                                {multiplier1 > 1 && (
                                     <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                                        <FractionDisplay fraction={term1} />
                                        <span>×</span>
                                        <FractionDisplay fraction={{ numerator: multiplier1, denominator: multiplier1 }} color="text-chalk-green" />
                                        <span>=</span>
                                        <FractionDisplay fraction={converted1} highlight={true} />
                                     </div>
                                )}
                                 {multiplier2 > 1 && (
                                     <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                                        <FractionDisplay fraction={term2} />
                                        <span>×</span>
                                        <FractionDisplay fraction={{ numerator: multiplier2, denominator: multiplier2 }} color="text-chalk-green"/>
                                        <span>=</span>
                                        <FractionDisplay fraction={converted2} highlight={true} />
                                     </div>
                                )}
                            </div>
                        </li>
                    </>
                )}
                <li className="flex items-start gap-3">
                     <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                     <div>
                        <p>Perform the calculation.</p>
                         <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                            <FractionDisplay fraction={converted1} />
                            <span className="text-3xl font-bold">{operator}</span>
                            <FractionDisplay fraction={converted2} />
                            <span>=</span>
                            <FractionDisplay fraction={unsimplifiedResult} highlight={true} />
                         </div>
                     </div>
                </li>
                {needsSimplifying && (
                    <li className="flex items-start gap-3">
                         <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                         <div>
                            <p>Simplify the result to its lowest terms.</p>
                             <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                                <FractionDisplay fraction={unsimplifiedResult} />
                                <span>=</span>
                                <FractionDisplay fraction={result} highlight={true} color="text-chalk-green"/>
                             </div>
                         </div>
                    </li>
                )}
            </ol>
        </div>
    );
};