import nodemailer from 'nodemailer';

let testAccount: nodemailer.TestAccount | null = null;

const getTransporter = async () => {
    // If we have explicit SMTP credentials, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Otherwise, generate a test account (Ethereal)
    if (!testAccount) {
        testAccount = await nodemailer.createTestAccount();
        console.log('🧪 Generated Ethereal Test Account:', testAccount.user);
    }

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

export const sendQuoteEmail = async (
    to: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
    filename: string
) => {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
        from: '"QuoteDrop" <no-reply@quotedrop.com>',
        to,
        subject,
        text,
        html: `<p>${text}</p>`, // Simple HTML version
        attachments: [
            {
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    });

    console.log('📧 Email sent: %s', info.messageId);

    // Preview only available when using Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('🔗 Preview URL: %s', previewUrl);
    }

    return { messageId: info.messageId, previewUrl };
};
