import React from 'react';
import type { EquationState, Fraction } from '../../../types';
import { lcm, getPrimeFactorization } from '../utils/fractions';

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

export const CalculationStepsPanel: React.FC<{ equation: EquationState, isVisible: boolean }> = ({ equation, isVisible }) => {
    const { terms, operators, result, unsimplifiedResult, isSolved } = equation;

    if (!isVisible || !isSolved || terms.length < 2 || !result || !unsimplifiedResult) {
        return null;
    }

    const validTerms = terms.filter(t => t.fraction !== null).map(t => t.fraction!);
    if (validTerms.length < 2) return null;
    
    const uniqueDenominators: number[] = Array.from(new Set(validTerms.map(t => t.denominator)));
    const commonDen = uniqueDenominators.reduce((acc, curr) => lcm(acc, curr));

    const needsConversion = uniqueDenominators.some(den => den !== commonDen);

    const convertedTerms = validTerms.map(term => {
        const multiplier = commonDen / term.denominator;
        return {
            original: term,
            multiplier: multiplier,
            converted: { numerator: term.numerator * multiplier, denominator: commonDen }
        };
    });

    const needsSimplifying = !fractionsAreEqual(unsimplifiedResult, result);

    const renderLcmExplanation = () => {
        if (uniqueDenominators.length <= 1) {
            return null;
        }

        const factorizations = uniqueDenominators.map(den => ({
            den,
            factors: getPrimeFactorization(den),
        }));

        const highestPowers: Record<number, number> = {};
        factorizations.forEach(({ factors }) => {
            for (const prime in factors) {
                if (!highestPowers[prime] || factors[prime] > highestPowers[prime]) {
                    highestPowers[prime] = factors[prime];
                }
            }
        });

        const lcmFromFactors = Object.entries(highestPowers)
            .reduce((acc, [prime, power]) => acc * (Math.pow(Number(prime), power)), 1);

        return (
            <div className="text-sm space-y-3">
                <p className="font-bold mb-1">How to find the LCM (using Prime Factorization):</p>
                
                <div className="space-y-1">
                    <p>1. Find the prime factors of each denominator:</p>
                    {factorizations.map(({ den, factors }) => (
                        <div key={den} className="flex items-center gap-2 pl-4">
                            <span className="font-bold w-8 text-right">{den}</span>
                            <span>=</span>
                            <p className="font-mono flex-1">
                                {Object.entries(factors)
                                    .flatMap(([prime, power]) => Array(power).fill(prime))
                                    .join(' × ')}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="space-y-1">
                    <p>2. Take the highest power of each unique prime factor:</p>
                    <p className="font-mono pl-4 text-lg">
                        {Object.entries(highestPowers)
                            .map(([prime, power]) => (
                                <span key={prime} className="mr-2">
                                    {prime}
                                    <sup>{power > 1 ? power : ''}</sup>
                                </span>
                            ))
                            .reduce((prev, curr) => <>{prev} × {curr}</>)}
                    </p>
                </div>
                
                <div className="space-y-1">
                    <p>3. Multiply them together:</p>
                    <p className="font-mono pl-4">
                        {Object.entries(highestPowers)
                            .map(([prime, power]) => `${Math.pow(Number(prime), power)}`)
                            .join(' × ')}
                        <span className="font-bold"> = {lcmFromFactors}</span>
                    </p>
                </div>
            </div>
        );
    };

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
                                <p>Find a common denominator for all fractions.</p>
                                <div className="bg-slate-900/50 p-3 rounded-md mt-1">
                                    {renderLcmExplanation()}
                                    <p className={` ${uniqueDenominators.length > 1 ? 'mt-2 pt-2 border-t-2 border-chalk-border/50' : ''}`}>
                                        The least common multiple (LCM) is <span className="font-bold text-chalk-green text-xl">{commonDen}</span>.
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                            <div>
                                <p>Convert the fractions to have the same denominator.</p>
                                {convertedTerms.map((term, index) => term.multiplier > 1 && (
                                     <div key={index} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                                        <FractionDisplay fraction={term.original} />
                                        <span>×</span>
                                        <FractionDisplay fraction={{ numerator: term.multiplier, denominator: term.multiplier }} color="text-chalk-green" />
                                        <span>=</span>
                                        <FractionDisplay fraction={term.converted} highlight={true} />
                                     </div>
                                ))}
                            </div>
                        </li>
                    </>
                )}
                <li className="flex items-start gap-3">
                     <span className="font-chalk text-chalk-yellow text-xl">{stepCounter++}.</span>
                     <div>
                        <p>Perform the calculation.</p>
                         <div className="flex items-center flex-wrap gap-2 bg-slate-900/50 p-2 rounded-md mt-1">
                            {convertedTerms.map((term, index) => (
                                <React.Fragment key={index}>
                                    <FractionDisplay fraction={term.converted} />
                                    {operators[index] && <span className="text-3xl font-bold">{operators[index]}</span>}
                                </React.Fragment>
                            ))}
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