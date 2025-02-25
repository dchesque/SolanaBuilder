// src/components/pdf/TokenPDFGenerator.jsx
import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const TokenPDFGenerator = ({ tokenData }) => {
  const generatePDF = (e) => {
    e.preventDefault();  // Previne propagação do evento
    e.stopPropagation(); // Garante que o evento não se propague

    const doc = new jsPDF();
    
    // Define colors
    const bgColor = '#0B0120';  // Dark purple background
    const primaryTextColor = '#FFFFFF';  // White text
    const secondaryTextColor = '#A78BFA';  // Purple text
    const linkColor = '#9333EA';  // Purple for links
    
    // Background
    doc.setFillColor(11, 1, 32); // Convert bgColor to RGB
    doc.rect(0, 0, 220, 297, 'F');
    
    // Header with SolanaMint branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SolanaMint', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Token Creation Certificate', 105, 45, { align: 'center' });
    
    // Creation date
    doc.setFontSize(10);
    doc.text(`Created on: ${new Date().toLocaleDateString()}`, 105, 55, { align: 'center' });
    
    // Token Details
    doc.setFontSize(14);
    doc.text('Token Details:', 20, 80);
    
    doc.setFontSize(12);
    const detailsStart = 100;
    doc.text(`Token Address: ${tokenData.mintAddress}`, 20, detailsStart);
    doc.text(`Name: ${tokenData.name}`, 20, detailsStart + 15);
    doc.text(`Symbol: ${tokenData.symbol}`, 20, detailsStart + 30);
    doc.text(`Supply: ${tokenData.supply.toLocaleString()}`, 20, detailsStart + 45);
    doc.text(`Decimals: ${tokenData.decimals}`, 20, detailsStart + 60);
    
    // Action links section
    doc.setFontSize(14);
    doc.text('Important Links:', 20, 190);
    
    // Add clickable links
    doc.setTextColor(147, 51, 234); // linkColor in RGB
    doc.setFontSize(12);
    doc.textWithLink('View on Solscan', 20, 205, { 
      url: `https://solscan.io/token/${tokenData.mintAddress}` 
    });
    
    doc.textWithLink('Update Token Metadata', 20, 220, { 
      url: `https://solanamint.com/update-metadata?tokenAddress=${tokenData.mintAddress}` 
    });
    
    // Notes section
    doc.setTextColor(167, 139, 250); // secondaryTextColor in RGB
    doc.setFontSize(10);
    doc.text([
      'Note: Token name and symbol will be registered on-chain',
      'after completing the metadata update process.'
    ], 20, 245);
    
    // Footer with website and branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Created with SolanaMint', 105, 280, { align: 'center' });
    doc.text('https://solanamint.com', 105, 287, { align: 'center' });

    // Save the PDF with token symbol in filename
    doc.save(`${tokenData.symbol}_token_details.pdf`);
    
    return false; // Previne qualquer comportamento padrão adicional
  };

  // Adicione uma função de handler separada que captura e previne a propagação
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    generatePDF(e);
    return false;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-200 transition-all"
    >
      <Download className="w-4 h-4" />
      Download Details
    </button>
  );
};

export default TokenPDFGenerator;