import React, { useState } from 'react';
import { 
  ArrowRight, 
  Wallet, 
  Coins, 
  FileEdit, 
  Rocket,
  Check, 
  PenTool,
  Settings,
  Clock
} from 'lucide-react';

const Tutorial = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: 1,
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Simply connect your Solana wallet to get started. Works with Phantom, Solflare and other popular wallets.",
      color: "purple",
      details: [
        "No registration needed",
        "Instant access to the platform",
        "Safe and secure connection"
      ],
      image: "/img/tutorial/connect-wallet.png"
    },
    {
      number: 2,
      icon: Coins,
      title: "Configure Your Token",
      description: "Name your token, set your symbol, and define your supply - all in one simple interface.",
      color: "pink",
      details: [
        "Full customization options",
        "Built-in validation",
        "Instant cost estimation"
      ],
      image: "/img/tutorial/configure-token.png"
    },
    {
      number: 3,
      icon: FileEdit,
      title: "Add Token Metadata",
      description: "Enhance your token with professional metadata like logo, description, and social links.",
      color: "blue",
      details: [
        "Upload your custom logo",
        "Add website & socials",
        "Set comprehensive description"
      ],
      image: "/img/tutorial/add-metadata.png"
    },
    {
      number: 4,
      icon: Rocket,
      title: "Launch Your Token",
      description: "With one click, your token launches on Solana blockchain, ready for the world to see.",
      color: "green",
      details: [
        "Listed on Solscan.io instantly",
        "Ready for liquidity pools",
        "Start sharing with your community"
      ],
      image: "/img/tutorial/launch-token.png"
    }
  ];

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-pink-900/5 pointer-events-none" />
      <div className="absolute inset-0" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        opacity: "0.07" 
      }} />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm text-purple-300 mb-6 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/10">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Create in less than 2 minutes</span>
          </div>
          
          <h2 className="text-4xl font-bold mt-2 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            Your Token Journey in 4 Simple Steps
          </h2>
          
          <p className="text-lg text-purple-200 mb-12 max-w-3xl mx-auto">
            From creative idea to fully deployed token on Solana - follow our simple step-by-step process to bring your token to life in minutes.
          </p>
        </div>
        
        {/* Interactive Tutorial Section */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left sidebar with step selectors */}
          <div className="lg:col-span-1">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-purple-100 mb-4 pb-2 border-b border-purple-500/20">
                Token Creation Steps
              </h3>
              
              <div className="space-y-3">
                {steps.map(step => (
                  <button
                    key={step.number}
                    onClick={() => setActiveStep(step.number)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      activeStep === step.number 
                        ? `bg-${step.color}-500/30 text-white` 
                        : "bg-purple-900/30 text-purple-300 hover:bg-purple-900/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep === step.number 
                        ? `bg-${step.color}-500/50 text-white` 
                        : "bg-purple-900/50 text-purple-300"
                    }`}>
                      {step.number}
                    </div>
                    <span className="text-sm font-medium">
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  disabled={activeStep === 1}
                  className="w-full p-2 rounded-lg bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous Step
                </button>
                
                <button
                  onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
                  disabled={activeStep === steps.length}
                  className="w-full p-2 rounded-lg bg-purple-500/80 text-white hover:bg-purple-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-4">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
              {/* Content for the active step */}
              {steps.map(step => (
                <div 
                  key={step.number}
                  className={`${activeStep === step.number ? 'block' : 'hidden'}`}
                >
                  {/* Step content */}
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${step.color}-500/30`}>
                        <step.icon className={`w-6 h-6 text-${step.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Step {step.number}: {step.title}
                        </h3>
                        <p className="text-purple-200">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Key details */}
                    <div className="mb-8">
                      <h4 className="text-purple-300 text-sm font-medium mb-3">Key Details:</h4>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {step.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-2 bg-purple-900/30 p-3 rounded-lg">
                            <Check className={`w-5 h-5 text-${step.color}-400 flex-shrink-0 mt-0.5`} />
                            <span className="text-purple-100 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Image placeholder - would be replaced with actual images */}
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-purple-900/40 border border-purple-500/30">
                      {/* In a real implementation, you would use actual images: */}
                      {/* <img src={step.image} alt={`Step ${step.number}: ${step.title}`} className="w-full h-full object-cover" /> */}
                      
                      {/* Placeholder display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <step.icon className={`w-16 h-16 text-${step.color}-400 mb-4 opacity-50`} />
                        <p className="text-white/70 text-center max-w-md px-4">
                          {step.title} - Visual representation would go here
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress indicator and navigation */}
                  <div className={`border-t border-purple-500/20 px-8 py-4 flex justify-between items-center bg-${step.color}-500/10`}>
                    <div className="flex items-center gap-2">
                      <div className="text-purple-200 text-sm">
                        Step {step.number} of {steps.length}
                      </div>
                      <div className="w-32 h-2 bg-purple-900/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${step.color}-500`}
                          style={{ width: `${(step.number / steps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                        disabled={activeStep === 1}
                        className={`p-2 rounded-lg text-purple-300 hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
                        disabled={activeStep === steps.length}
                        className={`p-2 rounded-lg ${activeStep === steps.length ? 'hidden' : 'flex'} items-center gap-1 bg-${step.color}-500/80 text-white hover:bg-${step.color}-500/90`}
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      {activeStep === steps.length && (
                        <a 
                          href="/token-creator" 
                          className={`p-2 rounded-lg flex items-center gap-1 bg-${step.color}-500/80 text-white hover:bg-${step.color}-500/90`}
                        >
                          Get Started <ArrowRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a 
            href="/token-creator" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
          >
            Start Creating Your Token <Rocket className="w-5 h-5" />
          </a>
          <p className="text-purple-300 mt-4 text-sm">
            No coding required. Get your token live on Solana in minutes.
          </p>
        </div>
      </div>
    </section>
  );
};


export default Tutorial;