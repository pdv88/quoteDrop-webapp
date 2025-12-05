import PDFDocument from 'pdfkit';

interface QuoteItem {
    description: string;
    quantity: number;
    unit_cost: number;
}

interface Client {
    name: string;
    email: string;
    address?: string;
    phone?: string;
}

interface UserProfile {
    full_name?: string;
    company_name?: string;
    email: string;
    phone?: string;
    address?: string; // Assuming address might be added later or used from somewhere else
    logo_url?: string;
}

interface Quote {
    quote_number: number;
    created_at: string;
    valid_until?: string;
    expiration_date?: string;
    items?: QuoteItem[];
    tax_rate?: number;
    total_amount: number;
    terms_conditions?: string;
    clients?: Client;
}

export const generateQuotePDF = async (quote: Quote, userProfile: UserProfile): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.on('error', (err) => {
            reject(err);
        });

        // --- Header ---
        if (userProfile.company_name) {
            doc.fontSize(20).text(userProfile.company_name, { align: 'left' });
            doc.fontSize(10).text(userProfile.email, { align: 'left' });
            if (userProfile.phone) doc.text(userProfile.phone, { align: 'left' });
        } else {
            doc.fontSize(20).text(userProfile.full_name || 'My Company', { align: 'left' });
            doc.fontSize(10).text(userProfile.email, { align: 'left' });
        }

        doc.moveDown();

        // --- Title ---
        doc.fontSize(25).text('QUOTE', { align: 'right' });
        doc.fontSize(10).text(`Quote #: ${quote.quote_number}`, { align: 'right' });
        doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, { align: 'right' });
        if (quote.expiration_date || quote.valid_until) {
            const validDate = quote.expiration_date || quote.valid_until;
            doc.text(`Valid Until: ${new Date(validDate!).toLocaleDateString()}`, { align: 'right' });
        }

        doc.moveDown();
        const dividerY = doc.y;
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, dividerY).lineTo(550, dividerY).stroke();
        doc.moveDown();

        // --- Client Info ---
        doc.fontSize(12).text('Bill To:', 50, doc.y + 10);
        doc.fontSize(10).font('Helvetica-Bold').text(quote.clients?.name || 'Valued Client');
        doc.font('Helvetica').text(quote.clients?.email || '');
        if (quote.clients?.address) doc.text(quote.clients?.address);
        if (quote.clients?.phone) doc.text(quote.clients?.phone);

        doc.moveDown(2);

        // --- Items Table Header ---
        const tableTop = doc.y;
        const itemX = 50;
        const quantityX = 300;
        const priceX = 370;
        const totalX = 470;

        doc.font('Helvetica-Bold');
        doc.text('Description', itemX, tableTop);
        doc.text('Qty', quantityX, tableTop);
        doc.text('Unit Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop);
        doc.font('Helvetica');

        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;

        // --- Items ---
        let subtotal = 0;
        if (quote.items) {
            quote.items.forEach(item => {
                const itemTotal = item.quantity * item.unit_cost;
                subtotal += itemTotal;

                doc.text(item.description, itemX, y, { width: 240 });
                doc.text(item.quantity.toString(), quantityX, y);
                doc.text(`$${item.unit_cost.toFixed(2)}`, priceX, y);
                doc.text(`$${itemTotal.toFixed(2)}`, totalX, y);

                y += 20; // Simple row height, could be dynamic
            });
        }

        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, y).lineTo(550, y).stroke();
        y += 10;

        // --- Totals ---
        const taxRate = quote.tax_rate || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 370, y, { width: 90, align: 'right' });
        doc.text(`$${subtotal.toFixed(2)}`, 470, y, { align: 'left' });
        y += 15;

        if (taxRate > 0) {
            doc.text(`Tax (${taxRate}%):`, 370, y, { width: 90, align: 'right' });
            doc.text(`$${taxAmount.toFixed(2)}`, 470, y, { align: 'left' });
            y += 15;
        }

        doc.fontSize(12).text('Total:', 370, y, { width: 90, align: 'right' });
        doc.text(`$${total.toFixed(2)}`, 470, y, { align: 'left' });

        // --- Terms & Conditions ---
        if (quote.terms_conditions) {
            doc.moveDown(4);
            doc.fontSize(12).font('Helvetica-Bold').text('Terms & Conditions');
            doc.fontSize(10).font('Helvetica').text(quote.terms_conditions, { width: 500 });
        }

        // --- Footer ---
        doc.fontSize(10).text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

        doc.end();
    });
};
