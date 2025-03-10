// src/pages/LandingPage.js
// Landing Page Component
// This component renders the main landing page for the application.
// It includes header, hero section, and several sections (Features, How It Works, Tutorial, Benefits, FAQ, CTA).
// All texts and comments have been translated to English.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Features from '../components/landingpage/Features';
import HowItWorks from '../components/landingpage/HowItWorks';
import Tutorial from '../components/landingpage/Tutorial';
import Benefits from '../components/landingpage/Benefits';
import FAQ from '../components/landingpage/FAQ';
import CTA from '../components/landingpage/CTA';
import tokenPreviewImage from '../img/tokenpreview.png';
import { 
  ArrowRight, 
  Coins, 
  X,
  HelpCircle
} from "lucide-react";

// Tooltip Component
// Displays a tooltip with the provided text when hovering over the children.
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-sm bg-black/90 text-white rounded-lg -top-2 left-full ml-2">
          {text}
        </div>
      )}
    </div>
  );
};

// Loading State Component (Skeleton Loader)
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-purple-900/40 rounded mb-4"></div>
    <div className="h-32 bg-purple-900/40 rounded"></div>
  </div>
);

// Metrics Badge Component
// Displays a metric value and its label.
const MetricsBadge = ({ value, label }) => (
  <div className="bg-purple-900/30 px-4 py-2 rounded-lg hover:bg-purple-900/40 transition-colors">
    <div className="text-2xl font-bold text-purple-300">{value}</div>
    <div className="text-sm text-purple-400">{label}</div>
  </div>
);

// Main Landing Page Component
export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0120] text-white">
      
      {/* Updated Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* SOLANA BUILDER LOGO */}
            <div className="flex items-center">
              <img src="/img/logo_solanabuilder.png" alt="Solana Builder" className="h-7" />
            </div>
            <div className="hidden md:flex gap-6 ml-8">
              <a href="#features" className="text-purple-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-purple-300 hover:text-white transition-colors">How It Works</a>
              <a href="#faq" className="text-purple-300 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/token-creator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg text-lg font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
            >
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Updated Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Enhanced Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-pink-900/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0120] via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            {/* Badge with Smooth Animation */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Now supporting Solana Program v3
            </div>

            {/* Title with Glow Effect */}
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              Create and Launch Your Own Solana Token in Minutes!
            </h1>

            <p className="text-xl text-purple-200 mb-8">
              From viral memecoins to serious project tokens, SolanaMint makes it easy to bring your vision to life on Solana.
              Zero coding required — just connect, customize, and launch with the most affordable and user-friendly token creator.
            </p>

            {/* Metrics with Hover Effects */}
            <div className="flex items-center gap-6 mb-8">
              <div className="group bg-purple-900/10 px-6 py-3 rounded-xl hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  1000+
                </div>
                <div className="text-sm text-purple-300">
                  Tokens Created
                </div>
              </div>
              
              <div className="group bg-purple-900/10 px-6 py-3 rounded-xl hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  99.9%
                </div>
                <div className="text-sm text-purple-300">
                  Uptime
                </div>
              </div>
              
              <div className="group bg-purple-900/10 px-6 py-3 rounded-xl hover:bg-purple-900/20 transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  {"< 0.1 SOL"}
                </div>
                <div className="text-sm text-purple-300">
                  Avg Cost
                </div>
              </div>
            </div>

            {/* CTAs with Enhanced Effects */}
            <div className="flex items-center gap-4">
              <Link 
                to="/token-creator"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
              >
                Start Creating Tokens
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#how-it-works"
                className="text-purple-300 hover:text-white transition-colors flex items-center gap-1"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Espaço para imagem personalizada */}


          <img src={tokenPreviewImage}  alt="Token Creator Preview"  className="w-full h-auto rounded-lg opacity-55 hover:opacity-85 transition-opacity duration-500" />


        </div>
      </section>

      {/* "How It Works" Section - Edit in: components/landingpage/HowItWorks.jsx */}
      <section>
        <HowItWorks />
      </section>

      {/* Tutorial Section with Video - Edit in: components/landingpage/Tutorial.jsx */}
      <section>
        <Tutorial />
      </section>

      {/* Features Section - Edit in: components/landingpage/Features.jsx */}
      <section>
        <Features />
      </section>

      {/* Benefits Section - Edit in: components/landingpage/Benefits.jsx */}
      <section>
        <Benefits />
      </section>

      {/* FAQ Section - Edit in: components/landingpage/FAQ.jsx */}
      <section>
        <FAQ />
      </section>

      {/* Call-to-Action (CTA) Section - Edit in: components/landingpage/CTA.jsx */}
      <section>
        <CTA />
      </section>

      {/* Main Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-purple-500/20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 4-column grid with footer information */}
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1 - Logo and Description */}
            <div>
              {/* SOLANA BUILDER LOGO */}
              <div className="flex justify-start items-center w-full">
                <img src="/img/logo_solanabuilder.png" alt="Solana Builder" className="h-7" />
              </div>
              {/* Product Description */}
              <p className="text-purple-300 text-sm">
                The easiest way to create and launch your Solana token.
              </p>
            </div>

            {/* Column 2 - Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-purple-300 hover:text-white">Features</a>
                <a href="#how-it-works" className="block text-purple-300 hover:text-white">How It Works</a>
                <a href="/docs" className="block text-purple-300 hover:text-white">Documentation</a>
              </div>
            </div>

            {/* Column 3 - Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="/about" className="block text-purple-300 hover:text-white">About</a>
                <a href="/blog" className="block text-purple-300 hover:text-white">Blog</a>
                <a href="/careers" className="block text-purple-300 hover:text-white">Careers</a>
              </div>
            </div>

            {/* Column 4 - Social Links */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                <a href="https://twitter.com/solanamint" className="block text-purple-300 hover:text-white">Twitter</a>
                <a href="https://discord.gg/solanamint" className="block text-purple-300 hover:text-white">Discord</a>
                <a href="https://github.com/solanamint" className="block text-purple-300 hover:text-white">GitHub</a>
              </div>
            </div>
          </div>

          {/* Bottom bar with Copyright and Legal Links */}
          <div className="border-t border-purple-500/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-purple-400">
            {/* Copyright */}
            <div>© 2025 Solana Builder. All rights reserved.</div>
            {/* Policy Links */}
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}