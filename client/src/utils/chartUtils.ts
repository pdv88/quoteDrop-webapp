import type { Quote } from '../types';

export type TimeRange = '7d' | '30d' | '3m' | '1y' | 'all';

export interface ChartDataPoint {
    date: string;
    quoted: number;
    paid: number;
    fullDate: string; // For sorting/tooltip
}

export function processChartData(quotes: Quote[], timeRange: TimeRange): ChartDataPoint[] {
    if (!quotes || quotes.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    // 1. Determine start date based on range
    switch (timeRange) {
        case '7d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
        case '3m':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
        case '1y':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'all':
        default:
            startDate = new Date(0); // Beginning of time
            break;
    }

    // 2. Filter quotes
    const filteredQuotes = quotes.filter(q => new Date(q.created_at) >= startDate);

    // 3. Group by date (or month for longer ranges)
    const groupedData: Record<string, { quoted: number; paid: number; fullDate: string }> = {};

    filteredQuotes.forEach(quote => {
        const date = new Date(quote.created_at);
        let key: string;
        let fullDateStr = date.toISOString();

        if (timeRange === '1y' || timeRange === 'all') {
            // Group by month for long ranges
            key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            // Use first day of month for sorting
            const d = new Date(date.getFullYear(), date.getMonth(), 1);
            fullDateStr = d.toISOString();
        } else {
            // Group by day
            key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // Use midnight for sorting
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            fullDateStr = d.toISOString();
        }

        if (!groupedData[key]) {
            groupedData[key] = { quoted: 0, paid: 0, fullDate: fullDateStr };
        }

        groupedData[key].quoted += quote.total_amount;

        // Add to paid if status is paid or partial (using paid_amount if available)
        if (quote.status === 'paid') {
            groupedData[key].paid += quote.total_amount;
        } else if (quote.paid_amount) {
            groupedData[key].paid += quote.paid_amount;
        }
    });

    // 4. Convert to array and sort
    return Object.entries(groupedData)
        .map(([date, data]) => ({
            date,
            quoted: data.quoted,
            paid: data.paid,
            fullDate: data.fullDate
        }))
        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
}
