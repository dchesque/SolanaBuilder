// src/components/pdf/TokenPDFGenerator.jsx
import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const TokenPDFGenerator = ({ tokenData }) => {
  const generatePDF = (e) => {
    e.preventDefault();
    e.stopPropagation(); 

    // Create a new PDF instance
    const doc = new jsPDF();
    
    // Color configuration
    const bgColor = '#0B0120';
    const primaryTextColor = '#FFFFFF';
    const secondaryTextColor = '#A78BFA';
    const accentColor = '#9333EA';
    
    // Background
    doc.setFillColor(11, 1, 32); // Dark purple
    doc.rect(0, 0, 220, 297, 'F');
    
    // Header with SolanaBuilder logo (simulated with text)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SolanaBuilder', 105, 30, { align: 'center' });
    
    // Website URL
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250); // Secondary color
    doc.text('solanabuilder.com', 105, 40, { align: 'center' });
    
    // Document title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Details Certificate', 105, 55, { align: 'center' });
    
    // Creation date
    doc.setFontSize(10);
    doc.text(`Created on: ${new Date().toLocaleDateString()}`, 105, 65, { align: 'center' });
    
    // Separator line
    doc.setDrawColor(147, 51, 234); // Accent color
    doc.setLineWidth(0.5);
    doc.line(30, 70, 180, 70);
    
    // Token Details
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Information:', 20, 85);
    
    // Apply token details
    doc.setFontSize(11);
    let yPosition = 100;
    const lineHeight = 12;
    
    // Token Name
    doc.setTextColor(167, 139, 250);
    doc.text('Token Name:', 20, yPosition);
    doc.setTextColor(255, 255, 255);
    doc.text(tokenData.name || 'N/A', 70, yPosition);
    yPosition += lineHeight;
    
    // Token Symbol
    doc.setTextColor(167, 139, 250);
    doc.text('Symbol:', 20, yPosition);
    doc.setTextColor(255, 255, 255);
    doc.text(tokenData.symbol || 'N/A', 70, yPosition);
    yPosition += lineHeight;
    
    // Token Supply
    doc.setTextColor(167, 139, 250);
    doc.text('Supply:', 20, yPosition);
    doc.setTextColor(255, 255, 255);
    doc.text(tokenData.supply ? tokenData.supply.toLocaleString() : 'N/A', 70, yPosition);
    yPosition += lineHeight;
    
    // Token Decimals
    doc.setTextColor(167, 139, 250);
    doc.text('Decimals:', 20, yPosition);
    doc.setTextColor(255, 255, 255);
    doc.text(tokenData.decimals ? tokenData.decimals.toString() : '9', 70, yPosition);
    yPosition += lineHeight;
    
    // Description (if available)
    if (tokenData.description) {
      yPosition += 5;
      doc.setTextColor(167, 139, 250);
      doc.text('Description:', 20, yPosition);
      yPosition += 7;
      doc.setTextColor(255, 255, 255);
      
      // Multi-line text for description
      const splitDescription = doc.splitTextToSize(tokenData.description || '', 170);
      doc.text(splitDescription, 20, yPosition);
      yPosition += (splitDescription.length * 7) + 5;
    }
    
    // Complete token address (without abbreviations)
    yPosition += 5;
    doc.setTextColor(167, 139, 250);
    doc.text('Token Address (Mint):', 20, yPosition);
    yPosition += 7;
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(tokenData.mintAddress || 'N/A', 20, yPosition);
    yPosition += lineHeight;
    
    // Website and social media information (if available)
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Links & Social Media:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(11);
    
    // Website
    if (tokenData.website) {
      doc.setTextColor(167, 139, 250);
      doc.text('Website:', 20, yPosition);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(tokenData.website, 70, yPosition, { url: tokenData.website });
      yPosition += lineHeight;
    }
    
    // Twitter
    if (tokenData.twitter) {
      doc.setTextColor(167, 139, 250);
      doc.text('Twitter:', 20, yPosition);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(tokenData.twitter, 70, yPosition, { url: tokenData.twitter });
      yPosition += lineHeight;
    }
    
    // Telegram
    if (tokenData.telegram) {
      doc.setTextColor(167, 139, 250);
      doc.text('Telegram:', 20, yPosition);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(tokenData.telegram, 70, yPosition, { url: tokenData.telegram });
      yPosition += lineHeight;
    }
    
    // GitHub
    if (tokenData.github) {
      doc.setTextColor(167, 139, 250);
      doc.text('GitHub:', 20, yPosition);
      doc.setTextColor(147, 51, 234);
      doc.textWithLink(tokenData.github, 70, yPosition, { url: tokenData.github });
      yPosition += lineHeight;
    }
    
    // Useful Links - Explorers and Update
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Useful Links:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(11);
    
    // Link to Solscan
    doc.setTextColor(147, 51, 234);
    const solscanUrl = `https://solscan.io/token/${tokenData.mintAddress}`;
    doc.textWithLink('View on Solscan', 20, yPosition, { url: solscanUrl });
    yPosition += lineHeight;
    
    // Link to Solana Explorer
    const explorerUrl = `https://explorer.solana.com/address/${tokenData.mintAddress}`;
    doc.textWithLink('View on Solana Explorer', 20, yPosition, { url: explorerUrl });
    yPosition += lineHeight;
    
    // Link to update metadata
    const updateUrl = `https://solanabuilder.com/update-metadata?tokenAddress=${tokenData.mintAddress}`;
    doc.textWithLink('Update Token Metadata', 20, yPosition, { url: updateUrl });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Generated with SolanaBuilder - The easiest way to launch on Solana', 105, 280, { align: 'center' });
    doc.text('solanabuilder.com', 105, 287, { align: 'center' });

    // Save the PDF with dynamic name based on token symbol and address
    const symbol = tokenData.symbol || 'TOKEN';
    const shortAddress = tokenData.mintAddress ? tokenData.mintAddress.substring(0, 8) : 'unknown';
    doc.save(`${symbol}_${shortAddress}_details.pdf`);
    
    return false;
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-all"
    >
      <Download className="w-4 h-4" />
      Download Token Details
    </button>
  );
};

export default TokenPDFGenerator;