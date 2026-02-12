"use client";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-black overflow-hidden pt-16">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        src="https://res.cloudinary.com/dpuhecead/video/upload/v1770919135/background_qxklnd.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-b from-transparent via-black/50 to-black" />

      <div className="relative z-20 flex flex-col items-center text-center px-4 py-20 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="inline-block px-4 py-2 bg-red-950/50 border border-red-600/50 rounded mb-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <span className="text-red-500 font-semibold text-sm uppercase tracking-widest animate-flicker">[SYSTEM: AWS CLOUD CLUB LPU]</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tight mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <span className="text-red-600 animate-glitch">HORIZON</span>
          <br />
          <span className="text-5xl md:text-7xl text-white">2026</span>
        </h1>
        
        <div className="text-2xl md:text-3xl text-red-400 font-light mb-3 animate-fade-in-up font-mono" style={{animationDelay: '0.2s'}}>
          <span className="text-red-600">&gt;</span>
            Learn. Build. Compete. Overnight.
          <span className="text-red-600">&lt;</span>
        </div>
        
        <p className="text-lg md:text-xl text-white/70 font-medium mb-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <span className="text-red-500">HOSTED_BY:</span> AWS Cloud Club, Lovely Professional University
        </p>
        
        <p className="text-base md:text-lg text-white/60 mb-10 animate-fade-in-up font-mono" style={{animationDelay: '0.4s'}}>
          <i className="far fa-calendar-alt text-red-500"></i> April 2026 <span className="text-red-600 mx-2">|</span> <i className="fas fa-map-marker-alt text-red-500"></i> LPU Campus
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <a
            href="/auth/login"
            rel="noopener noreferrer"
            className="relative group overflow-hidden bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] transition-all duration-300 text-lg border border-red-500"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10">&gt; INITIATE_REGISTRATION</span>
          </a>
          <a
            href="#about"
            className="bg-black/50 backdrop-blur-sm border-2 border-red-600/50 text-white font-bold px-10 py-4 rounded-lg hover:bg-red-950/30 hover:border-red-600 transition-all duration-300 text-lg"
          >
            &lt;/&gt; EXPLORE_MORE
          </a>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-bold text-red-600 group-hover:animate-glitch">
              12+
            </div>
            <div className="text-white/50 text-sm mt-1 font-mono">[HOURS]</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-bold text-red-600 group-hover:animate-glitch">
              1K+
            </div>
            <div className="text-white/50 text-sm mt-1 font-mono">[PARTICIPANTS]</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-bold text-red-600 group-hover:animate-glitch">
              ₹50K+
              </div>
            <div className="text-white/50 text-sm mt-1 font-mono">[PRIZE POOL]</div>
          </div>
        </div>
      </div>
    </section>
  );
}
