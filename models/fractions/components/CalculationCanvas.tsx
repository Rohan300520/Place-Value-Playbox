import React, { useState, useEffect } from 'react';
import type { EquationState, Fraction } from '../../../types';
import { FractionBlock } from './FractionBlock';
import { CalculationExplanationPanel } from './CalculationExplanationPanel';

const commonDenominator = (d1 = 1, d2 = 1) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    return (d1 * d2) / gcd(d1, d2);
};

function fractionsAreEqual(f1: Fraction | null | undefined, f2: Fraction | null | undefined): boolean {
    if (!f1 || !f2) return false;
    if(f1.numerator === 0 && f2.numerator === 0) return true;
    return f1.numerator * f2.denominator === f2.numerator * f1.denominator;
}

interface StepLineProps {
    term1?: Fraction | null;
    operator?: string | null;
    term2?: Fraction | null;
    result?: Fraction | null;
    isVisible: boolean;
    animationClass?: string;
    isComparison?: boolean;
    comparisonResult?: Fraction | null;
    isSubdividing?: boolean;
    subdivisionTargets?: { term1: Fraction, term2: Fraction } | null;
}

const CalculationStep: React.FC<StepLineProps> = ({ 
    term1, operator, term2, result, isVisible, animationClass, 
    isComparison, comparisonResult, isSubdividing, subdivisionTargets 
}) => {
    if (!isVisible) return null;

    return (
        <div className={`flex items-center justify-center w-full gap-4 min-h-[3rem] ${animationClass}`}>
            {term1 && <FractionBlock fraction={term1} subdivisionTarget={isSubdividing ? subdivisionTargets?.term1 : undefined} />}
            {operator && <span className="text-4xl font-chalk">{operator}</span>}
            {term2 && <FractionBlock fraction={term2} subdivisionTarget={isSubdividing ? subdivisionTargets?.term2 : undefined} />}
            {result && (
                 <>
                    <span className="text-4xl font-chalk">=</span>
                    <div className="flex flex-col items-center gap-1">
                        <FractionBlock fraction={result} isResult={true}/>
                        {isComparison && comparisonResult && (
                            <FractionBlock fraction={comparisonResult} isResult={true} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export const CalculationCanvas: React.FC<{ 
    equation: EquationState,
    isChallengeMode?: boolean 
}> = ({ equation, isChallengeMode = false }) => {
    const { term1, term2, operator, result, unsimplifiedResult, isSolved } = equation;
    const [animationStep, setAnimationStep] = useState(0); 
    const [explanation, setExplanation] = useState<string | null>(null);
    const [convertedFractions, setConvertedFractions] = useState<{ term1: Fraction, term2: Fraction } | null>(null);
    const [isSubdividing, setIsSubdividing] = useState(false);
    const [explanationPanelData, setExplanationPanelData] = useState<{ original: Fraction; target: Fraction } | null>(null);

    useEffect(() => {
        // Reset all animation state when the solve state changes.
        setAnimationStep(0);
        setExplanation(null);
        setConvertedFractions(null);
        setIsSubdividing(false);
        setExplanationPanelData(null);
        let timeouts: ReturnType<typeof setTimeout>[] = [];
        const run = (fn: () => void, delay: number) => timeouts.push(setTimeout(fn, delay));
        
        if (isSolved && term1 && term2 && operator && result && unsimplifiedResult) {
            const isAlreadyCommon = term1.denominator === term2.denominator;
            const needsSimplifying = !fractionsAreEqual(unsimplifiedResult, result);
            let currentTime = 0;

            if (!isAlreadyCommon) {
                const cd = commonDenominator(term1.denominator, term2.denominator);
                const cTerm1 = { numerator: term1.numerator * (cd / term1.denominator), denominator: cd };
                const cTerm2 = { numerator: term2.numerator * (cd / term2.denominator), denominator: cd };
                
                currentTime += 500;
                run(() => setExplanation("The pieces are different sizes. Let's make them match!"), currentTime);
                
                const term1NeedsConv = term1.denominator !== cd;
                const term2NeedsConv = term2.denominator !== cd;
                const fractionToExplain = term1NeedsConv ? term1 : (term2NeedsConv ? term2 : null);
                const targetForExplain = term1NeedsConv ? cTerm1 : (term2NeedsConv ? cTerm2 : null);

                currentTime += 2000;
                run(() => {
                    setExplanation(null);
                    if (fractionToExplain && targetForExplain) {
                        setExplanationPanelData({ original: fractionToExplain, target: targetForExplain });
                    }
                    setConvertedFractions({ term1: cTerm1, term2: cTerm2 });
                    setIsSubdividing(true);
                }, currentTime);
                
                currentTime += 5000;
                run(() => {
                    setExplanationPanelData(null);
                    setExplanation(`Great! Now the pieces are all ${cd}ths.`);
                    setAnimationStep(1);
                }, currentTime);
                
                currentTime += 2500;
            } else {
                currentTime += 1000;
            }

            run(() => {
                setExplanation(`Now we can ${operator === '+' ? 'add' : 'subtract'} the pieces.`);
                setAnimationStep(2);
            }, currentTime);
            
            currentTime += 2500;

            if (needsSimplifying) {
                run(() => {
                    setExplanation(`This can be simplified to its lowest terms!`);
                    setAnimationStep(3);
                }, currentTime);
                currentTime += 2500;
            }
            
            run(() => {
                setExplanation(null);
                setAnimationStep(4);
            }, currentTime);
    
            return () => timeouts.forEach(clearTimeout);
        }
    }, [isSolved, term1, term2, operator, result, unsimplifiedResult]);


    if (isChallengeMode) {
        return (
            <div className="w-full min-h-[12rem] p-6 rounded-2xl chalk-border flex flex-col justify-center items-center relative">
                <h3 className="text-2xl font-chalk absolute top-4 text-chalk-yellow">Your Answer</h3>
                <div className="w-full h-12 flex items-center justify-center">
                    {term1 ? (
                        <FractionBlock fraction={term1} isResult={true} />
                    ) : (
                        <p className="text-xl text-chalk-light">Click fractions on the wall to build your answer.</p>
                    )}
                </div>
            </div>
        );
    }
    
    const isAlreadyCommon = term1?.denominator === term2?.denominator;
    const needsSimplifying = !fractionsAreEqual(unsimplifiedResult, result);

    return (
        <div className="w-full min-h-[20rem] p-6 rounded-2xl chalk-border flex flex-col justify-end items-center relative">
            {explanation && (
                <div className="absolute top-4 w-full text-center px-4 animate-pop-in">
                    <p className="inline-block bg-slate-900/80 p-3 rounded-lg text-xl font-chalk text-chalk-cyan shadow-md">
                        {explanation}
                    </p>
                </div>
            )}
             {explanationPanelData && (
                <CalculationExplanationPanel 
                    original={explanationPanelData.original} 
                    target={explanationPanelData.target}
                />
            )}
            <div className="w-full space-y-2 relative">
                {/* Step 0: Initial equation & subdivision animation */}
                <CalculationStep 
                    term1={term1} 
                    operator={operator} 
                    term2={term2} 
                    isVisible={!!term1} 
                    animationClass={`transition-opacity duration-500 ${animationStep >= 1 && !isAlreadyCommon ? 'opacity-0' : 'opacity-100'}`}
                    isSubdividing={isSubdividing}
                    subdivisionTargets={convertedFractions}
                />
                
                {/* Step 1: Converted fractions fade in */}
                <CalculationStep
                    term1={convertedFractions?.term1}
                    operator={operator}
                    term2={convertedFractions?.term2}
                    isVisible={!isAlreadyCommon}
                    animationClass={`absolute inset-0 transition-opacity duration-500 ${animationStep === 1 ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Step 2 & 3: Results */}
                {animationStep < 4 ? (
                    <CalculationStep 
                        result={unsimplifiedResult} 
                        isVisible={animationStep >= 2}
                        isComparison={needsSimplifying && animationStep === 3}
                        comparisonResult={result}
                        animationClass="animate-pop-in"
                    />
                ) : (
                    <CalculationStep result={result} isVisible={true} animationClass="animate-merge"/>
                )}

            </div>
        </div>
    );
};