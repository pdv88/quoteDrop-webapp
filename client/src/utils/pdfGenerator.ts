import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote, User, QuoteItem } from '../types';
import { formatQuoteNumber, formatCurrency, formatDate } from './formatters';

interface PDFGeneratorOptions {
    quote: Quote;
    user: User;
    items: QuoteItem[];
}

export async function generateQuotePDF({ quote, user, items }: PDFGeneratorOptions): Promise<void> {
    const doc = new jsPDF();

    // Brand colors
    const primaryColor: [number, number, number] = [20, 184, 166]; // Teal
    const darkColor: [number, number, number] = [11, 17, 32]; // Dark Navy
    const lightGray: [number, number, number] = [156, 163, 175];

    let yPosition = 20;

    // ===== HEADER SECTION =====
    // Company name/logo
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(user.company_name || user.full_name || 'QuoteDrop', 20, yPosition);

    yPosition += 10;

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

    // Save the PDF
    const fileName = `Quote_${formatQuoteNumber(quote.quote_number)}_${quote.clients?.name || 'Client'}.pdf`;
    doc.save(fileName);
}
