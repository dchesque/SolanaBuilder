import React from 'react';
import { ArrowRight } from 'lucide-react';

// Componente Tutorial
const Tutorial = () => {
  return (
    <section className="py-5 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider">VIDEO TUTORIAL</span>
        
        <h2 className="text-4xl font-bold mt-2 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          Create Your Token in 3 Simple Steps
        </h2>

        <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
          Whether you're launching the next big memecoin or creating a serious project token, 
          our step-by-step guide shows you how to go from idea to launch in minutes, not days!
        </p>
       
        <div className="grid md:grid-cols-2 gap-16 mb-12">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/sG-HA3sm0nc"
              title="How to Create a New Token"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>

          <div className="text-left space-y-8 p-6">

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-2">Connect & Start</h4>
                  <p className="text-purple-300 text-base">
                    Just connect your Solana wallet and you're ready to go. No complex setup, no coding needed!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-2">Customize Your Token</h4>
                  <p className="text-purple-300 text-base">
                    Name your token, set your supply, add your meme magic - make it uniquely yours in seconds!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-2">Launch to the Moon 🚀</h4>
                  <p className="text-purple-300 text-base">
                    One click to deploy and your token is live on Solana! Ready for trading, listing, and mooning!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Adicionando a exportação default
export default Tutorial;