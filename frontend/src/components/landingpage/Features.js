import React from 'react';
import { Link } from "react-router-dom";
import {
  Coins,
  FileEdit,
  LayoutGrid,
  Send,
  ArrowRight
} from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* HEADLINE SECTION - Título e subtítulo principal */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            All-in-One Token Platform
          </h2>
          <p className="mt-4 text-lg text-purple-300 max-w-3xl mx-auto">
            From creation to management, SolanaMint empowers you with professional-grade tools to launch, 
            manage, and scale your Solana tokens. Everything you need in one powerful platform.
          </p>
        </div>

        {/* FEATURES GRID - Grade de recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
             {
              icon: Coins,
              title: "Token Creation",
              description: "Launch Solana tokens with built-in security, customizable parameters and professional deployment",
              gradient: "from-purple-500 to-indigo-500"
            },
            {
              icon: FileEdit,
              title: "Token Management",
              description: "Control your token's metadata, Solscan.io integration and analytics in real-time",
              gradient: "from-pink-500 to-rose-500"
            },
            {
              icon: LayoutGrid,
              title: "Token Dashboard",
              description: "Track your portfolio with real-time metrics and detailed analytics in one place",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Send,
              title: "Token Operations",
              description: "Secure transfers, liquidity pool management and institutional-grade security",
              gradient: "from-emerald-500 to-teal-500"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:bg-purple-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            >
              {/* Gradient Border on Hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl from-purple-500/40 to-pink-500/40" />
              
              {/* Feature Header with Icon and Title */}
              <div className={`mb-4 p-3 rounded-lg bg-gradient-to-r ${feature.gradient} group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                <div className="flex items-center gap-2">
                  <feature.icon className="w-5 h-5 text-white" />
                  <h3 className="text-base font-medium text-white">
                    {feature.title}
                  </h3>
                </div>
              </div>
          
              {/* Feature Description */}
              <p className="text-sm text-purple-300 group-hover:text-purple-200 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link
            to="/token-creator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;