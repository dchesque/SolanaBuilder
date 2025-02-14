import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Coins, FileEdit, Rocket, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-lg text-purple-300 text-center mb-16 max-w-2xl mx-auto">
          Creating and managing your Solana token has never been easier. Our all-in-one platform handles everything you need.
        </p>

        {/* Timeline Container */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-purple-500 to-purple-500/20"></div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Wallet,
                title: "Connect Wallet",
                description: "Connect your Solana wallet (Phantom, Solflare, etc.)",
                details: [
                  "Quick connection",
                  "No registration needed",
                  "Instant access"
                ]
              },
              {
                icon: Coins,
                title: "Create Token",
                description: "Define your token's initial properties",
                details: [
                  "Set token name",
                  "Choose symbol",
                  "Define supply"
                ]
              },
              {
                icon: FileEdit,
                title: "Add Metadata",
                description: "Customize your token's details for Solscan.io",
                details: [
                  "Upload logo",
                  "Add website & socials",
                  "Set description"
                ]
              },
              {
                icon: Rocket,
                title: "Ready to Trade",
                description: "Your token is ready for the Solana ecosystem",
                details: [
                  "Listed on Solscan.io",
                  "Ready for liquidity",
                  "Start trading"
                ]
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                {/* Step Number Circle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg z-10">
                  <item.icon size={32} />
                </div>

                {/* Content Card */}
                <div className="pt-24 h-full">
                  <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 h-full hover:bg-purple-900/30 transition-all">
                    <h3 className="text-xl font-semibold text-purple-100 mb-2">{item.title}</h3>
                    <p className="text-purple-300 mb-4">{item.description}</p>
                    <ul className="space-y-2">
                      {item.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-purple-400">
                          <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            to="/token-creator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all hover:scale-105"
          >
            Create Your Token Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;