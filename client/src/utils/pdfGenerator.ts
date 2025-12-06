import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote, User, QuoteItem } from '../types';
import { formatQuoteNumber, formatCurrency, formatDate } from './formatters';

interface PDFGeneratorOptions {
    quote: Quote;
    user: User;
    items: QuoteItem[];
}

export async function generateQuotePDF(options: PDFGeneratorOptions, returnBlob: boolean = false): Promise<string | void> {
    const { quote } = options;
    switch (quote.template) {
        case 'modern':
            return generateModernPDF(options, returnBlob);
        case 'minimal':
            return generateMinimalPDF(options, returnBlob);
        case 'standard':
        default:
            return generateStandardPDF(options, returnBlob);
    }
}

async function generateStandardPDF({ quote, user, items }: PDFGeneratorOptions, returnBlob: boolean = false): Promise<string | void> {
    const doc = new jsPDF();

    // Brand colors
    const primaryColor: [number, number, number] = [20, 184, 166]; // Teal
    const darkColor: [number, number, number] = [11, 17, 32]; // Dark Navy
    const lightGray: [number, number, number] = [156, 163, 175];

    let yPosition = 20;

    // ===== HEADER SECTION =====
    // Company name/logo
    if (user.logo_url) {
        try {
            const imgData = await getBase64ImageFromURL(user.logo_url);
            // Add logo (x, y, width, height)
            doc.addImage(imgData, 'PNG', 20, yPosition, 30, 30);

            // Move text to the right of the logo
            doc.setFontSize(24);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text(user.company_name || user.full_name || 'QuoteDrop', 60, yPosition + 10);

            yPosition += 35;
        } catch (error) {
            console.error('Error loading logo:', error);
            // Fallback to text only
            doc.setFontSize(24);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text(user.company_name || user.full_name || 'QuoteDrop', 20, yPosition);
            yPosition += 10;
        }
    } else {
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(user.company_name || user.full_name || 'QuoteDrop', 20, yPosition);
        yPosition += 10;
    }

    // Company contact info
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');

    if (user.email) {
        doc.text(`Email: ${user.email}`, 20, yPosition);
        yPosition += 5;
    }

    if (user.phone) {
        doc.text(`Phone: ${user.phone}`, 20, yPosition);
        yPosition += 5;
    }

    yPosition += 10;

    // ===== QUOTE INFO SECTION =====
    // Quote number and title
    doc.setFontSize(18);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Quote ${formatQuoteNumber(quote.quote_number)}`, 20, yPosition);

    yPosition += 10;

    // Dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);

    const createdDate = formatDate(quote.created_at);
    doc.text(`Created: ${createdDate}`, 20, yPosition);

    if (quote.expiration_date) {
        const expirationDate = formatDate(quote.expiration_date);
        doc.text(`Expires: ${expirationDate}`, 120, yPosition);
    }

    yPosition += 15;

    // ===== CLIENT INFO SECTION =====
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, yPosition);

    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (quote.clients) {
        doc.text(quote.clients.name, 20, yPosition);
        yPosition += 5;

        if (quote.clients.email) {
            doc.text(quote.clients.email, 20, yPosition);
            yPosition += 5;
        }

        if (quote.clients.phone) {
            doc.text(quote.clients.phone, 20, yPosition);
            yPosition += 5;
        }

        if (quote.clients.address) {
            doc.text(quote.clients.address, 20, yPosition);
            yPosition += 5;
        }
    }

    yPosition += 10;

    // ===== ITEMS TABLE =====
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unit_cost),
        formatCurrency(item.quantity * item.unit_cost)
    ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 9,
            textColor: darkColor
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    });

    // Get Y position after table
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // ===== TOTALS SECTION =====
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxRate = quote.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const totalsX = 140;

    // Subtotal
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(formatCurrency(subtotal), 190, yPosition, { align: 'right' });

    yPosition += 7;

    // Tax
    if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%):`, totalsX, yPosition);
        doc.text(formatCurrency(taxAmount), 190, yPosition, { align: 'right' });
        yPosition += 7;
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Total:', totalsX, yPosition);
    doc.text(formatCurrency(total), 190, yPosition, { align: 'right' });

    yPosition += 15;

    // ===== TERMS & CONDITIONS =====
    if (quote.terms_conditions) {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Terms & Conditions:', 20, yPosition);

        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...lightGray);

        // Split terms into lines to fit page width
        const splitTerms = doc.splitTextToSize(quote.terms_conditions, 170);
        doc.text(splitTerms, 20, yPosition);
    }

    // ===== FOOTER =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save or return PDF
    const fileName = `Quote_${formatQuoteNumber(quote.quote_number)}_${quote.clients?.name || 'Client'}.pdf`;

    if (returnBlob) {
        return doc.output('bloburl').toString();
    } else {
        doc.save(fileName);
    }
}

async function generateModernPDF({ quote, user, items }: PDFGeneratorOptions, returnBlob: boolean = false): Promise<string | void> {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
    const secondaryColor: [number, number, number] = [243, 244, 246]; // Light Gray
    const darkColor: [number, number, number] = [17, 24, 39]; // Gray 900

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    let yPosition = 20;

    // Company Name (White)
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(user.company_name || user.full_name || 'QuoteDrop', 20, 28);

    // Logo (if available, overlay on background)
    if (user.logo_url) {
        try {
            const imgData = await getBase64ImageFromURL(user.logo_url);
            doc.addImage(imgData, 'PNG', 160, 10, 30, 30);
        } catch (e) {
            console.error('Error loading logo', e);
        }
    }

    yPosition = 60;

    // Client & Quote Info Grid
    doc.setTextColor(...darkColor);

    // Left Column: Client
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared For:', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (quote.clients) {
        doc.text(quote.clients.name, 20, yPosition);
        yPosition += 5;
        if (quote.clients.email) doc.text(quote.clients.email, 20, yPosition += 5);
        if (quote.clients.phone) doc.text(quote.clients.phone, 20, yPosition += 5);
    }

    // Right Column: Quote Details
    yPosition = 60;
    const rightColX = 120;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Quote Details:', rightColX, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quote #: ${formatQuoteNumber(quote.quote_number)}`, rightColX, yPosition);
    doc.text(`Date: ${formatDate(quote.created_at)}`, rightColX, yPosition += 5);
    if (quote.expiration_date) {
        doc.text(`Valid Until: ${formatDate(quote.expiration_date)}`, rightColX, yPosition += 5);
    }

    yPosition = 100;

    // Items Table
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unit_cost),
        formatCurrency(item.quantity * item.unit_cost)
    ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['Description', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 10,
            cellPadding: 5,
        },
        columnStyles: {
            0: { cellWidth: 90 },
            3: { halign: 'right' }
        }
    });

    // Totals
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxRate = quote.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const totalsX = 140;
    doc.setFontSize(10);
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(formatCurrency(subtotal), 190, yPosition, { align: 'right' });

    if (taxRate > 0) {
        yPosition += 7;
        doc.text(`Tax (${taxRate}%):`, totalsX, yPosition);
        doc.text(formatCurrency(taxAmount), 190, yPosition, { align: 'right' });
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total:', totalsX, yPosition);
    doc.text(formatCurrency(total), 190, yPosition, { align: 'right' });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(...secondaryColor);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    if (returnBlob) {
        return doc.output('bloburl').toString();
    } else {
        doc.save(`Quote_${formatQuoteNumber(quote.quote_number)}_Modern.pdf`);
    }
}

async function generateMinimalPDF({ quote, user, items }: PDFGeneratorOptions, returnBlob: boolean = false): Promise<string | void> {
    const doc = new jsPDF();
    const black: [number, number, number] = [0, 0, 0];

    let yPosition = 30;

    // Minimal Header - Centered
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...black);
    doc.text('QUOTE', 105, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text(user.company_name || user.full_name || 'QuoteDrop', 105, yPosition, { align: 'center' });

    yPosition += 30;

    // Info Section - Simple lines
    doc.setLineWidth(0.1);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Quote #: ${formatQuoteNumber(quote.quote_number)}`, 20, yPosition);
    doc.text(`Date: ${formatDate(quote.created_at)}`, 190, yPosition, { align: 'right' });

    yPosition += 10;
    if (quote.clients) {
        doc.text(`To: ${quote.clients.name}`, 20, yPosition);
    }

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 20;

    // Items - Plain table
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unit_cost),
        formatCurrency(item.quantity * item.unit_cost)
    ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['ITEM', 'QTY', 'PRICE', 'AMOUNT']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            font: 'times',
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left'
        },
        bodyStyles: {
            font: 'times',
            fontSize: 10
        },
        columnStyles: {
            0: { cellWidth: 100 },
            3: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    });

    // Totals
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxRate = quote.tax_rate || 0;
    const total = subtotal * (1 + taxRate / 100);

    doc.setFont('times', 'bold');
    doc.text(`TOTAL: ${formatCurrency(total)}`, 190, yPosition, { align: 'right' });

    if (returnBlob) {
        return doc.output('bloburl').toString();
    } else {
        doc.save(`Quote_${formatQuoteNumber(quote.quote_number)}_Minimal.pdf`);
    }
}

function getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
    });
}
