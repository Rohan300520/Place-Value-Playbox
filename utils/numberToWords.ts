const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanOneThousand(num: number): string {
    const parts: string[] = [];
    if (num >= 100) {
        parts.push(ones[Math.floor(num / 100)]);
        parts.push('Hundred');
        num %= 100;
    }

    if (num >= 20) {
        parts.push(tens[Math.floor(num / 10)]);
        num %= 10;
    } else if (num >= 10) {
        parts.push(teens[num - 10]);
        num = 0;
    }

    if (num > 0) {
        parts.push(ones[num]);
    }

    return parts.join(' ');
}


export function numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    if (num < 0 || num > 99999) {
        // The app is designed for numbers up to 99,999.
        return num.toString();
    }

    const parts: string[] = [];

    if (num >= 1000) {
        parts.push(convertLessThanOneThousand(Math.floor(num / 1000)));
        parts.push('Thousand');
        num %= 1000;
    }

    if (num > 0) {
        parts.push(convertLessThanOneThousand(num));
    }

    return parts.join(' ').trim();
}
