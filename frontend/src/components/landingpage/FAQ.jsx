import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    // General Questions
    {
      question: "How easy is it to create a token with SolanaMint?",
      answer: "It's incredibly simple! Just connect your wallet, fill in basic information (name, symbol, supply), and create your token. No coding required - we handle all technical aspects automatically.",
      category: "general"
    },
    {
      question: "What can I do with my token after creation?",
      answer: "Your token will be immediately ready for use! You can create liquidity pools on Raydium, enable trading, and your token will be visible on DexScreener and other DEX aggregators. Everything is automatic and seamless.",
      category: "general"
    },
    {
      question: "What makes SolanaMint special?",
      answer: "SolanaMint is an all-in-one solution where you can create AND manage your token. Create your token, update metadata (logo, website, social links), and manage everything through one simple interface - no technical knowledge needed.",
      category: "general"
    },
    
    // Technical Questions
    {
      question: "What information can I add to my token?",
      answer: "You can add all essential metadata: token name, symbol, supply, decimals, logo, website URL, social media links, description, and more. All this information will be visible on Solscan.io and other explorers.",
      category: "technical"
    },
    {
      question: "Can I modify my token after creation?",
      answer: "Yes! You can update your token's metadata anytime through our interface. This includes changing the logo, updating the website URL, modifying social links, and editing the description - all without any technical knowledge.",
      category: "technical"
    },
    {
      question: "How does the token creation process work?",
      answer: "First, connect your Solana wallet (like Phantom). Then enter basic token details (name, symbol, supply). After creation, you can add metadata like logo and website. Finally, you can create liquidity pools and start trading - all through one simple interface.",
      category: "technical"
    },
    {
      question: "Is my token compatible with Solana platforms?",
      answer: "Absolutely! Your token will be fully compatible with the entire Solana ecosystem including Raydium, Jupiter, DexScreener, and all major DEXs and wallets. It follows all Solana token standards.",
      category: "technical"
    },

    // Pricing Questions
    {
      question: "How much does it cost to create a token?",
      answer: "Creating your token on the Solana network is extremely affordable. The network fees and service charges are minimal, ensuring that the overall cost remains very low. Additionally, the process is straightforward and requires no programming skills, making token creation accessible to everyone.",
      category: "pricing"
    },
    {
      question: "Are there any hidden or unexpected fees when creating a token?",
      answer: "No, there aren't. Every transaction is signed directly by you, and all fees are clearly displayed before you confirm them, ensuring complete transparency. You only pay the standard Solana network fee for token creation, and any future metadata updates also incur only minimal network costs.",
      category: "pricing"
    },
    {
      question: "Are there recurring costs or subscription-like fees to maintain my token?",
      answer: "There are no ongoing or recurring fees. Once your token is created, you'll only pay a small Solana network fee whenever you update its metadata or perform transactions, typically just a few cents.",
      category: "pricing"
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-black/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'general'
                ? 'bg-purple-500 text-white'
                : 'text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'technical'
                ? 'bg-purple-500 text-white'
                : 'text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pricing'
                ? 'bg-purple-500 text-white'
                : 'text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            Pricing
          </button>
        </div>
        <div className="space-y-4">
          {faqData
            .filter(item => item.category === activeTab)
            .map((item, index) => (
              <div
                key={index}
                className="bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20"
              >
                <button
                  className="w-full text-left p-6 flex items-center justify-between"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-purple-100">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transform transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-purple-300">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;