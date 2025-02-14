// src/pages/LandingPage.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 flex items-center justify-between">
        <div className="text-2xl font-bold text-white">
          SolanaMint
        </div>
        <div className="flex items-center space-x-4">
          <a href="#features" className="text-gray-300 hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white">
            How It Works
          </a>
          <Link 
            to="/token-creator" 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Create Token
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center py-16">
        <div className="md:w-1/2 pr-8">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Create Your Own Solana Token in Minutes
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            With SolanaMint, anyone can easily design and deploy a custom token on the secure and affordable Solana blockchain. No coding skills needed—just simple, fast, and cost-effective token creation.
          </p>
          
          <div className="flex space-x-4">
            <Link 
              to="/token-creator" 
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center"
            >
              Start Creating Tokens
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 bg-gray-800 rounded-lg p-6 mt-8 md:mt-0">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token name</label>
              <input 
                type="text" 
                placeholder="Ethereum" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token symbol</label>
              <input 
                type="text" 
                placeholder="ETH" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Initial supply</label>
                <input 
                  type="number" 
                  placeholder="1000000" 
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Decimals</label>
                <input 
                  type="number" 
                  placeholder="18" 
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-purple-400 hover:text-purple-300"
              >
                Advanced features {showAdvanced ? '▲' : '▼'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label className="text-gray-300">Taxable</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label className="text-gray-300">Deflationary</label>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link 
                to="/token-creator" 
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center block"
              >
                Create Token
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose SolanaMint?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast & Easy",
                description: "Launch your token with just a few clicks—no technical expertise required.",
              },
              {
                title: "Secure",
                description: "Powered by Solana's robust blockchain, ensuring your token is safe and scalable.",
              },
              {
                title: "Low Fees",
                description: "Enjoy minimal transaction fees, making token creation both affordable and efficient.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 text-center"
              >
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>
          <ol className="space-y-8 max-w-2xl mx-auto">
            {[{
              step: "1",
              title: "Connect Your Wallet",
              description: "Start by connecting your Solana wallet (Phantom, Solflare, or MetaMask) to the app."
            }, {
              step: "2",
              title: "Confirm Network Connection",
              description: "Double-check that you're properly connected to the Solana network to ensure smooth operation."
            }, {
              step: "3",
              title: "Enter Token Details",
              description: "Input your token's name, symbol, and total supply. Then confirm the transaction to proceed."
            }, {
              step: "4",
              title: "Send to Blockchain",
              description: "Submit your token details to the blockchain and wait for confirmation."
            }].map(({ step, title, description }, index) => (
              <li key={index} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4 font-bold">
                    {step}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                <p className="text-gray-300 pl-14">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-bold text-white">
            SolanaMint
          </div>
          <div className="flex space-x-4 text-gray-300">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}