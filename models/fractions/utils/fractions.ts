import type { Fraction } from '../../../types';

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

export function simplifyFraction(fraction: Fraction): Fraction {
    if (fraction.numerator === 0) return { numerator: 0, denominator: 1 };
    const commonDivisor = gcd(Math.abs(fraction.numerator), fraction.denominator);
    return {
        numerator: fraction.numerator / commonDivisor,
        denominator: fraction.denominator / commonDivisor,
    };
}

export function addFractions(f1: Fraction | null, f2: Fraction | null): Fraction {
    if (!f1) return f2 || { numerator: 0, denominator: 1 };
    if (!f2) return f1;

    const commonDen = lcm(f1.denominator, f2.denominator);
    const num1 = f1.numerator * (commonDen / f1.denominator);
    const num2 = f2.numerator * (commonDen / f2.denominator);
    
    return {
        numerator: num1 + num2,
        denominator: commonDen,
    };
}

export function subtractFractions(f1: Fraction, f2: Fraction): Fraction {
    const commonDen = lcm(f1.denominator, f2.denominator);
    const num1 = f1.numerator * (commonDen / f1.denominator);
    const num2 = f2.numerator * (commonDen / f2.denominator);
    
    return {
        numerator: num1 - num2,
        denominator: commonDen,
    };
}


export function getFractionalValue(fraction: Fraction | null): number {
    if (!fraction || fraction.denominator === 0) return 0;
    return fraction.numerator / fraction.denominator;
}

export function fractionsAreEqual(f1: Fraction | null, f2: Fraction | null): boolean {
    if (!f1 || !f2) return false;
    if(f1.numerator === 0 && f2.numerator === 0) return true;
    const simplified1 = simplifyFraction(f1);
    const simplified2 = simplifyFraction(f2);
    return simplified1.numerator === simplified2.numerator && simplified1.denominator === simplified2.denominator;
}

export function getPrimeFactorization(num: number): Record<number, number> {
    const factors: Record<number, number> = {};
    let d = 2;
    let n = num;
    while (n > 1) {
        while (n % d === 0) {
            factors[d] = (factors[d] || 0) + 1;
            n /= d;
        }
        d++;
        if (d * d > n) {
            if (n > 1) {
                factors[n] = (factors[n] || 0) + 1;
            }
            break;
        }
    }
    return factors;
}