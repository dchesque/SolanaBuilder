import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to Launch Your Own Solana Token?</h2>
        <p className="text-xl text-purple-200 mb-8">
          Join thousands of creators who have already taken control of their digital assets with SolanaMint.
          It's time to own your token and build your future.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/token-creator"
            className="inline-flex items-center justify-center gap-2 bg-white text-purple-900 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-100 transition-colors"
          >
            Launch Token Creator
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="/docs"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Read Documentation
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;