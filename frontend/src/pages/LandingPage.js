// src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Coins, Shield, Zap, Github } from "lucide-react";
import Button from "../components/ui/button"; // Adjust the path if needed

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-purple-500/20 p-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SolanaMint
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Internal links for scrolling */}
            <a href="#features" className="text-purple-300 hover:text-purple-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-purple-300 hover:text-purple-100 transition-colors">
              How It Works
            </a>
            
            {/* Button with gradient styling */}
            <button className="btn-gradient">
              <Link to="/token-creator" className="flex items-center gap-2">
                Launch App
              </Link>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Your Own Solana Token in Minutes
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            With SolanaMint, anyone can easily design and deploy a custom token on the secure and affordable Solana blockchain.
            No coding skills needed—just simple, fast, and cost-effective token creation.
          </p>

          <button className="btn-gradient">
            <Link to="/token-creator" className="flex items-center gap-2">
              Start Creating Tokens
              <ArrowRight className="w-5 h-5" />
            </Link>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-purple-900/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why Choose SolanaMint?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast & Easy",
                description: "Launch your token with just a few clicks—no technical expertise required.",
              },
              {
                icon: Shield,
                title: "Secure",
                description: "Powered by Solana's robust blockchain, ensuring your token is safe and scalable.",
              },
              {
                icon: Coins,
                title: "Low Fees",
                description: "Enjoy minimal transaction fees, making token creation both affordable and efficient.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-purple-800/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-purple-100">{feature.title}</h3>
                <p className="text-purple-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      How It Works
    </h2>
    <ol className="space-y-8">
      {[{
        step: "1",
        title: "Connect Your Wallet",
        description: "Start by connecting your Solana wallet (Phantom, Solflare, or MetaMask) to the app."
      }, {
        step: "2",
        title: "Confirm Network Connection",
        description: "Double-check that you’re properly connected to the Solana network to ensure smooth operation."
      }, {
        step: "3",
        title: "Step 1 - Enter Token Details",
        description: "Input your token’s name, symbol, and total supply. Then confirm the transaction to proceed."
      }, {
        step: "4",
        title: "Step 2 - Send to Blockchain",
        description: "Submit your token details to the blockchain and wait for confirmation."
      }, {
        step: "✨",
        title: "Token Ready!",
        description: "Your new token is successfully created and ready to use. Congratulations!"
      }].map(({ step, title, description }, index) => (
        <li key={index} className="flex items-start">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold mr-4">
            {step}
          </span>
          <div>
            <h3 className="text-xl font-semibold text-purple-100 mb-1">{title}</h3>
            <p className="text-purple-300">{description}</p>
          </div>
        </li>
      ))}
    </ol>
    <div className="mt-12 text-center">
      <button className="btn-gradient">
        <Link to="/token-creator" className="flex items-center gap-2">
          Start Creating Tokens Now <ArrowRight className="w-5 h-5" />
        </Link>
      </button>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Launch Your Own Solana Token?</h2>
          <p className="text-xl text-purple-200 mb-8">
            Join thousands of creators who have already taken control of their digital assets with SolanaMint.
            It's time to own your token and build your future.
          </p>
          
          <button className="btn-gradient">
            <Link to="/token-creator" className="flex items-center gap-2">
              Launch Token Creator
              <ArrowRight className="w-5 h-5" />
            </Link>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-purple-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Coins className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SolanaMint
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-purple-300">
            <a href="#" className="hover:text-purple-100 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-purple-100 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-purple-100 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
