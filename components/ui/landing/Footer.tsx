import { 
  siInstagram,
} from "simple-icons/icons";
import {
  MailIcon,
  Linkedin,
  PinIcon,
  Pi
} from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative w-full text-blue-100 mt-20" style={{background: 'linear-gradient(135deg, #0B1D3A 0%, #132E59 50%, #0B1D3A 100%)'}}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-12 gap-8 mb-12 border-b-2 border-cyan-400/20 pb-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <img src="/image/logo/awslpu.png" alt="AWS Cloud Club" className="h-12" />
              <div className="border-l-2 border-cyan-400/40 pl-3">
                <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">AWS Cloud Club</h3>
              </div>
            </div>
            <p className="text-blue-200/70 text-sm leading-relaxed mb-6 max-w-md font-mono">
              India's premier AWS community at LPU. Join 5,000+ students mastering cloud computing, earning certifications, and launching careers in cloud technology.
            </p>
            
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/company/awscloudclublpu" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 bg-blue-900/50 hover:bg-blue-800 border-2 border-cyan-400 flex items-center justify-center transition-all">
                <Linkedin className="inline"/>
              </a>
              <a href="https://instagram.com/awscloudclublpu" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-blue-900/50 hover:bg-blue-800 border-2 border-cyan-400 flex items-center justify-center transition-all">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d={siInstagram.path} />
                </svg>
              </a>
              <a href="mailto:club@awslpu.in" 
                 className="w-10 h-10 bg-blue-900/50 hover:bg-blue-800 border-2 border-cyan-400 flex items-center justify-center transition-all">
                <MailIcon className="text-white w-8 h-8" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-widest border-b-2 border-cyan-400/40 pb-2">QUICKLINKS</h4>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <a href="/#about" className="text-blue-200/70 hover:text-cyan-300 transition-colors">▸ About Club</a>
              </li>
              <li>
                <a href="/auth/register" className="text-blue-200/70 hover:text-cyan-300 transition-colors">▸ Join</a>
              </li>
              <li>
                <a href="/events" className="text-blue-200/70 hover:text-cyan-300 transition-colors">▸ Events</a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-widest border-b-2 border-cyan-400/40 pb-2">CONNECT</h4>
            <ul className="space-y-3 font-mono text-xs">
              <li className="flex gap-3">
                <span className="text-cyan-400 min-w-fit">
                  <MailIcon className="inline mr-2" size={18}/>
                  <a href="mailto:club@awslpu.in" className="text-cyan-300 hover:text-cyan-200">club@awslpu.in</a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 min-w-fit">
                  <PinIcon className="inline mr-2" size={16}/>
                  LPU, Jalandhar, Punjab, India
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <p className="text-blue-300/60 text-center md:text-left">
            © 2026 AWS Cloud Club LPU | Building the next generation of cloud innovators | Powered by <span className="text-cyan-300">AWS</span>
          </p>
          <div className="flex gap-6">
            <a href="/privacy" rel="noopener noreferrer" className="text-blue-300/60 hover:text-cyan-300 transition-colors">Privacy Policy</a>
            <a href="/terms" rel="noopener noreferrer" className="text-blue-300/60 hover:text-cyan-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
