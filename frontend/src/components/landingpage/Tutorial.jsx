import React from 'react';
import { ArrowRight, Wallet, Coins, FileEdit, Rocket } from 'lucide-react';

const Tutorial = () => {
  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider">GUIA RÁPIDO</span>
        
        <h2 className="text-4xl font-bold mt-2 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          Create Your Token in 3 Simple Steps
        </h2>

        <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto">
          Whether you're launching the next big memecoin or creating a serious project token, 
          our platform makes it easy to go from idea to launch in minutes, not days!
        </p>
       
        {/* Cards de passos do tutorial */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Passo 1 */}
          <div className="group bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col h-full">
            <div className="bg-purple-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
              <Wallet className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
            <div className="bg-purple-900/30 h-1 w-16 mx-auto mb-4"></div>
            <p className="text-purple-300 text-sm flex-grow mb-4">
              Connect your Solana wallet with a single click. Works with Phantom, Solflare, and other popular wallets.
            </p>
            <ul className="text-left text-xs text-purple-300 space-y-2 mb-4">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                Quick connection
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                No registration needed
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                Instant access
              </li>
            </ul>
          </div>

          {/* Passo 2 */}
          <div className="group bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col h-full">
            <div className="bg-pink-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
              <Coins className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create Token</h3>
            <div className="bg-pink-500/30 h-1 w-16 mx-auto mb-4"></div>
            <p className="text-purple-300 text-sm flex-grow mb-4">
              Define your token's name, symbol, and supply with our simple and intuitive interface.
            </p>
            <ul className="text-left text-xs text-purple-300 space-y-2 mb-4">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2"></div>
                Set token name
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2"></div>
                Choose symbol
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2"></div>
                Define supply
              </li>
            </ul>
          </div>

          {/* Passo 3 */}
          <div className="group bg-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col h-full">
            <div className="bg-blue-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
              <Rocket className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Launch Token</h3>
            <div className="bg-blue-500/30 h-1 w-16 mx-auto mb-4"></div>
            <p className="text-purple-300 text-sm flex-grow mb-4">
              With a single click, your token is deployed on Solana and ready for trading.
            </p>
            <ul className="text-left text-xs text-purple-300 space-y-2 mb-4">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Listed on Solscan.io
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Ready for liquidity
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Start trading
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action - botão para criar token */}
        <div className="mt-8">
          <a 
            href="/token-creator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 hover:scale-105"
          >
            Create Your Token Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Tutorial;