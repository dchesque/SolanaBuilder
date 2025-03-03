// src/components/pdf/TokenDetailsPDFGenerator.jsx
import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

const TokenDetailsPDFGenerator = ({ tokenData, buttonClassName }) => {
  const {
    name = 'Token Name',
    symbol = 'TICK',
    supply = 0,
    mintAddress = '',
    description = '',
    createdAt = new Date().toISOString(),
    decimals = 9,
    website = '',
    twitter = '',
    telegram = '',
    github = '',
    imageUrl = ''
  } = tokenData || {};

  const generatePDF = () => {
    // 1) Create document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 2) Background (dark purple)
    doc.setFillColor(20, 0, 30);
    doc.rect(0, 0, 210, 297, 'F');

    // 3) Header with logo (text representation)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('SolanaBuilder', 105, 20, { align: 'center' });
    
    // Website URL
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('solanabuilder.com', 105, 28, { align: 'center' });

    // 4) Document title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Details Certificate', 105, 40, { align: 'center' });

    // 5) Creation date
    const creationDate = new Date(createdAt).toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 255);
    doc.text(`Created: ${creationDate}`, 200, 16, { align: 'right' });

    // 6) Underline for the title
    doc.setDrawColor(138, 79, 255);
    doc.setLineWidth(0.5);
    doc.line(40, 45, 170, 45);

    // 7) Token Information Card
    const cardX = 15;
    const cardY = 55;
    const cardW = 180;
    const cardH = 80;

    // Card shadow
    doc.setFillColor(10, 0, 20);
    doc.roundedRect(cardX + 2, cardY + 2, cardW, cardH, 5, 5, 'F');

    // Card background
    doc.setFillColor(45, 20, 82);
    doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'F');

    // Card border
    doc.setDrawColor(138, 79, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'D');

    // Card header
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Information', cardX + 5, cardY + 10);
    doc.line(cardX + 5, cardY + 12, cardX + cardW - 5, cardY + 12);

    // Token Name
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Name', cardX + 5, cardY + 22);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(name, cardX + 5, cardY + 29);

    // Token Symbol
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Symbol', cardX + 70, cardY + 22);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(symbol, cardX + 70, cardY + 29);

    // Total Supply
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Total Supply', cardX + 5, cardY + 38);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`${supply.toLocaleString()} Tokens`, cardX + 5, cardY + 45);

    // Decimals
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Decimals', cardX + 70, cardY + 38);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(decimals.toString(), cardX + 70, cardY + 45);

    // Token Address - Full, without abbreviations
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Address (Mint)', cardX + 5, cardY + 55);
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(mintAddress, cardX + 5, cardY + 62);

    // 8) Description section (if available)
    let nextY = cardY + cardH + 15;
    
    if (description) {
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('Description', 105, nextY, { align: 'center' });
      doc.setLineWidth(0.3);
      doc.line(70, nextY + 2, 140, nextY + 2);
      
      nextY += 10;
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 255);
      
      // Split description into lines
      const splitDescription = doc.splitTextToSize(description, 170);
      doc.text(splitDescription, 20, nextY);
      
      nextY += (splitDescription.length * 5) + 10;
    }

    // 9) Social Media & Links (if available)
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Social Media & Links', 105, nextY, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(70, nextY + 2, 140, nextY + 2);
    
    nextY += 10;
    let hasLinks = false;
    
    // Website
    if (website) {
      hasLinks = true;
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text('Website:', 20, nextY);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(website, 60, nextY, { url: website });
      nextY += 8;
    }
    
    // Twitter
    if (twitter) {
      hasLinks = true;
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text('Twitter:', 20, nextY);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(twitter, 60, nextY, { url: twitter });
      nextY += 8;
    }
    
    // Telegram
    if (telegram) {
      hasLinks = true;
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text('Telegram:', 20, nextY);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(telegram, 60, nextY, { url: telegram });
      nextY += 8;
    }
    
    // GitHub
    if (github) {
      hasLinks = true;
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text('GitHub:', 20, nextY);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(github, 60, nextY, { url: github });
      nextY += 8;
    }
    
    if (!hasLinks) {
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 255);
      doc.text('No social media links available.', 20, nextY);
      nextY += 8;
    }
    
    nextY += 10;

    // 10) Useful Links section
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Useful Links', 105, nextY, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(70, nextY + 2, 140, nextY + 2);
    
    nextY += 10;
    
    // Link to Solscan
    const solscanUrl = `https://solscan.io/token/${mintAddress}`;
    doc.setFontSize(11);
    doc.setTextColor(147, 51, 234);
    doc.textWithLink('View on Solscan', 20, nextY, { url: solscanUrl });
    nextY += 8;
    
    // Link to Solana Explorer
    const explorerUrl = `https://explorer.solana.com/address/${mintAddress}`;
    doc.textWithLink('View on Solana Explorer', 20, nextY, { url: explorerUrl });
    nextY += 8;
    
    // Link to Update Metadata
    const updateUrl = `https://solanabuilder.com/update-metadata?tokenAddress=${mintAddress}`;
    doc.textWithLink('Update Token Metadata', 20, nextY, { url: updateUrl });

    // 11) Footer
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.line(20, 280, 190, 280);
    doc.text('Generated by SolanaBuilder - The easiest way to launch on Solana', 105, 285, { align: 'center' });
    doc.text('solanabuilder.com', 105, 292, { align: 'center' });

    // 12) PDF metadata
    doc.setProperties({
      title: 'SolanaBuilder - Token Details',
      author: 'SolanaBuilder',
      subject: 'Token Certificate',
      keywords: 'solana, token, blockchain, solanabuilder'
    });

    // 13) Dynamic filename
    // Format: "YYYY-MM-DD_Symbol_TokenAddress.pdf"
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${dateStr}_${symbol}_${mintAddress.substring(0, 8)}.pdf`;

    // Save the PDF
    doc.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      className={
        buttonClassName ||
        'flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-all'
      }
    >
      <Download className="w-5 h-5" />
      <span>Download Token Certificate</span>
    </button>
  );
};

export default TokenDetailsPDFGenerator;