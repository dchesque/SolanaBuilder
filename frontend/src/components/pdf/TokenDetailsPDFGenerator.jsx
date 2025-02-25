import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

const TokenDetailsPDFGenerator = ({ tokenData, buttonClassName }) => {
  const {
    name = 'Token Name',
    symbol = 'TICK',
    supply = 0,
    mintAddress = '',
    createdAt
  } = tokenData || {};

  const generatePDF = () => {
    // 1) Cria o documento
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 2) Fundo (roxo escuro)
    doc.setFillColor(20, 0, 30);
    doc.rect(0, 0, 210, 297, 'F');

    // 3) Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('SolanaMint - Token Details', 105, 20, { align: 'center' });

    // 4) Data de criação (caso exista) ou data/hora atual
    const creationDate = createdAt
      ? new Date(createdAt).toLocaleString()
      : new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 255);
    // Ajuste o valor de Y (16, 28, etc.) para posicionar melhor
    doc.text(`Created: ${creationDate}`, 200, 16, { align: 'right' });

    // 5) Linha de sublinhado do título
    doc.setDrawColor(138, 79, 255);
    doc.setLineWidth(0.5);
    doc.line(60, 23, 150, 23);

    // 6) Card de Informações do Token
    const cardX = 15;
    const cardY = 35;
    const cardW = 180;
    const cardH = 70;

    // Sombra do card (simulada)
    doc.setFillColor(10, 0, 20);
    doc.roundedRect(cardX + 2, cardY + 2, cardW, cardH, 5, 5, 'F');

    // Fundo do card
    doc.setFillColor(45, 20, 82);
    doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'F');

    // Borda do card
    doc.setDrawColor(138, 79, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'D');

    // Cabeçalho do card
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Information', cardX + 5, cardY + 10);
    doc.line(cardX + 5, cardY + 12, cardX + cardW - 5, cardY + 12);

    // Nome do Token
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Name', cardX + 5, cardY + 22);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(name, cardX + 5, cardY + 29);

    // Ticker
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Ticker', cardX + 70, cardY + 22);
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

    // Token Address
    doc.setFontSize(10);
    doc.setTextColor(167, 139, 250);
    doc.text('Token Address', cardX + 70, cardY + 38);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    const shortAddress = mintAddress
      ? `${mintAddress.slice(0, 6)}...${mintAddress.slice(-6)}`
      : 'N/A';
    doc.text(shortAddress, cardX + 70, cardY + 45);

    // Botão "View on Solscan"
    const btnX = cardX + 5;
    const btnY = cardY + 55;
    const btnW = 60;
    const btnH = 8;
    doc.setFillColor(138, 79, 255);
    doc.roundedRect(btnX, btnY, btnW, btnH, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.textWithLink('View on Solscan', btnX + btnW / 2, btnY + btnH - 2, {
      align: 'center',
      url: `https://solscan.io/token/${mintAddress}`
    });

    // 7) Seção "Token Possibilities"
    const possY = cardY + cardH + 20;
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Token Possibilities', 105, possY, { align: 'center' });
    doc.line(40, possY + 2, 170, possY + 2);

    const bulletX = 25;
    let lineY = possY + 12;
    const possibilities = [
      'Token Transfers: Send tokens to other wallets or dApps.',
      'Create Liquidity Pool: Increase accessibility on DEXs (Raydium, Orca).',
      'Create Staking Program: Incentivize holding via staking.',
      'Customize Metadata: Add logo, social links, description, etc.'
    ];
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 255);
    possibilities.forEach((p) => {
      doc.text(`• ${p}`, bulletX, lineY);
      lineY += 7;
    });

    // 8) Rodapé
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 255);
    doc.line(10, 285, 200, 285);
    doc.text('© 2025 SolanaMint. All rights reserved.', 105, 292, {
      align: 'center'
    });

    // 9) Metadados do PDF
    doc.setProperties({
      title: 'SolanaMint - Token Details',
      author: 'SolanaMint',
      subject: 'Token Creation Details',
      keywords: 'solana, token, pdf, solanamint'
    });

    // 10) Nome de arquivo dinâmico
    // Formato: "YYYY-MM-DD_HH-mm-ss_Nome_Ticker - SolanaMint.pdf"
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA'); // yyyy-mm-dd
    const timeStr = now
      .toLocaleTimeString('en-CA', { hour12: false })
      .replace(/:/g, '-'); // HH-mm-ss
    const fileName = `${dateStr}_${timeStr}_${name}_${symbol} - SolanaMint.pdf`;

    // Salva o PDF
    doc.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      className={
        buttonClassName ||
        'w-full bg-green-900/20 backdrop-blur-md rounded-xl border border-green-500/20 p-4 flex items-center justify-center gap-2 hover:bg-green-900/30 transition-all'
      }
    >
      <Download className="w-5 h-5 text-green-400" />
      <span className="text-purple-200">Download Token PDF</span>
    </button>
  );
};

export default TokenDetailsPDFGenerator;
