import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Features from '../components/landingpage/Features';
import HowItWorks from '../components/landingpage/HowItWorks';
import Tutorial from '../components/landingpage/Tutorial';
import Benefits from '../components/landingpage/Benefits';
import FAQ from '../components/landingpage/FAQ';
import CTA from '../components/landingpage/CTA';
import { 
  ArrowRight, 
  Coins, 
  X,
  HelpCircle
} from "lucide-react";


// Componente de Tooltip
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


// Componente de Loading State
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-purple-900/40 rounded mb-4"></div>
    <div className="h-32 bg-purple-900/40 rounded"></div>
  </div>
);

// Componente de Métricas
const MetricsBadge = ({ value, label }) => (
  <div className="bg-purple-900/30 px-4 py-2 rounded-lg hover:bg-purple-900/40 transition-colors">
    <div className="text-2xl font-bold text-purple-300">{value}</div>
    <div className="text-sm text-purple-400">{label}</div>
  </div>
);

// Componente Principal
export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    // Simular carregamento inicial
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0120] text-white">

      {/* Header Atualizado */}
      <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md border-b border-purple-500/20 p-4 z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SolanaMint
              </span>
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
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Create Token
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section Atualizada */}
<section className="pt-32 pb-20 px-4 relative overflow-hidden">
  {/* Background melhorado com múltiplas camadas */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-pink-900/20" />
  <div className="absolute inset-0" style={{
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
  }} />
  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0120] via-transparent to-transparent" />

  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
    <div>
      {/* Badge com animação suave */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/20">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        Now supporting Solana Program v3
      </div>

{/* Título com glow effect */}
<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
Create and Launch Your Own Solana Token in Minutes!
</h1>

<p className="text-xl text-purple-200 mb-8">
  From viral memecoins to serious project tokens, SolanaMint makes it easy to bring your vision to life on Solana. 
  Zero coding required — just connect, customize, and launch with the most affordable and user-friendly token creator.
</p>

{/* Métricas com hover effects - versão atualizada */}
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
      {"<0.05 SOL"}
    </div>
    <div className="text-sm text-purple-300">
      Avg Cost
    </div>
  </div>
</div>

      {/* CTAs com efeitos melhorados */}
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
    
    {/* Formulário com animações e validação */}
    {isLoading ? (
      <SkeletonLoader />
    ) : (
      <div className="bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm text-purple-200 mb-1">
              <Tooltip text="Choose a memorable name for your token">
                <div className="flex items-center gap-1">
                  Token Name
                  <HelpCircle className="w-4 h-4 text-purple-400 hover:text-purple-300 transition-colors" />
                </div>
              </Tooltip>
            </label>
            <input 
              type="text" 
              placeholder="My Token"
              className="w-full bg-purple-900/40 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400/60 focus:border-purple-400 transition-all focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-purple-200 mb-1">
              <Tooltip text="A short identifier for your token (2-5 characters recommended)">
                <div className="flex items-center gap-1">
                  Token Symbol
                  <HelpCircle className="w-4 h-4 text-purple-400 hover:text-purple-300 transition-colors" />
                </div>
              </Tooltip>
            </label>
            <input 
              type="text" 
              placeholder="MTK"
              className="w-full bg-purple-900/40 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400/60 focus:border-purple-400 transition-all focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-purple-200 mb-1">
              <Tooltip text="The total number of tokens that will exist">
                <div className="flex items-center gap-1">
                  Total Supply
                  <HelpCircle className="w-4 h-4 text-purple-400 hover:text-purple-300 transition-colors" />
                </div>
              </Tooltip>
            </label>
            <input 
              type="text" 
              placeholder="1,000,000"
              className="w-full bg-purple-900/40 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400/60 focus:border-purple-400 transition-all focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>
        </div>
      </div>
    )}
  </div>
</section>


{/* Seção "Como Funciona" - Editar em: components/landingpage/HowItWorks.jsx */}
<section>
      <HowItWorks />
    </section>

    {/* Seção de Tutorial com Vídeo - Editar em: components/landingpage/Tutorial.jsx */}
    <section>
      <Tutorial />
    </section>

    {/* Seção de Recursos/Características - Editar em: components/landingpage/Features.jsx */}
    <section>
      <Features />
    </section>


    {/* Seção de Benefícios do SolanaMint - Editar em: components/landingpage/Benefits.jsx */}
    <section>
      <Benefits />
    </section>

    {/* Seção de Perguntas Frequentes - Editar em: components/landingpage/FAQ.jsx */}
    <section>
      <FAQ />
    </section>

    {/* Seção Call-to-Action (CTA) - Editar em: components/landingpage/CTA.jsx */}
    <section>
      <CTA />
    </section>



    

      {/* Footer Principal */}
<footer className="bg-black/50 backdrop-blur-md border-t border-purple-500/20 py-12 px-4">
  <div className="max-w-7xl mx-auto">
    {/* Grid de 4 colunas com informações do footer */}
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      {/* Coluna 1 - Logo e Descrição */}
      <div>
        {/* Logo SolanaMint */}
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SolanaMint
          </span>
        </div>
        {/* Descrição do Produto */}
        <p className="text-purple-300 text-sm">
          The easiest way to create and launch your Solana token.
        </p>
      </div>

      {/* Coluna 2 - Links do Produto */}
      <div>
        <h4 className="font-semibold mb-4">Product</h4>
        <div className="space-y-2">
          <a href="#features" className="block text-purple-300 hover:text-white">Features</a>
          <a href="#how-it-works" className="block text-purple-300 hover:text-white">How It Works</a>
          <a href="/docs" className="block text-purple-300 hover:text-white">Documentation</a>
        </div>
      </div>

      {/* Coluna 3 - Links da Empresa */}
      <div>
        <h4 className="font-semibold mb-4">Company</h4>
        <div className="space-y-2">
          <a href="/about" className="block text-purple-300 hover:text-white">About</a>
          <a href="/blog" className="block text-purple-300 hover:text-white">Blog</a>
          <a href="/careers" className="block text-purple-300 hover:text-white">Careers</a>
        </div>
      </div>

      {/* Coluna 4 - Links de Redes Sociais */}
      <div>
        <h4 className="font-semibold mb-4">Connect</h4>
        <div className="space-y-2">
          <a href="https://twitter.com/solanamint" className="block text-purple-300 hover:text-white">Twitter</a>
          <a href="https://discord.gg/solanamint" className="block text-purple-300 hover:text-white">Discord</a>
          <a href="https://github.com/solanamint" className="block text-purple-300 hover:text-white">GitHub</a>
        </div>
      </div>
    </div>

    {/* Barra inferior com Copyright e Links Legais */}
    <div className="border-t border-purple-500/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-purple-400">
      {/* Copyright */}
      <div>© 2025 SolanaMint. All rights reserved.</div>
      {/* Links de Políticas */}
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