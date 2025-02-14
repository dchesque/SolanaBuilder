import React from 'react';
import { Zap, Shield, Coins } from 'lucide-react';

const Benefits = () => {
  return (
    <section className="py-5 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider">SOLANAMINT BENEFITS</span>
          <h2 className="text-4xl font-bold mt-2 mb-4">Why should you use a token creator?</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            A token creator simplifies launching Solana tokens, offering a fast, affordable, and user-friendly solution 
            for anyone, even without technical expertise, to release tokens on the Solana blockchain.
          </p>
        </div>
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
              className="group bg-purple-900/20 hover:bg-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transition-all"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2 text-purple-100">{feature.title}</h3>
              <p className="text-purple-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;