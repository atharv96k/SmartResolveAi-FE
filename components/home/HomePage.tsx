import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bot, 
  ShieldCheck, 
  Zap, 
  MessageSquareCode, 
  PlusCircle, 
  Search, 
  CheckCircle2,
  ArrowRight,
  Cpu,
  MousePointer2
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const journeySteps = [
    { 
      icon: <PlusCircle />, 
      title: 'Initiate Request', 
      desc: 'Navigate to your dashboard and click "Create New Ticket". Start with a clear, concise subject title.',
      alignment: 'md:flex-row-reverse',
      img: '/create-ticket.png' 
    },
    { 
      icon: <MessageSquareCode />, 
      title: 'Detail the Problem', 
      desc: 'Provide a deep-dive description. The more context you provide, the better our AI can assist.',
      alignment: 'md:flex-row',
      img: '/ticket-form.png' 
    },
    { 
      icon: <Bot />, 
      title: 'AI Transformation', 
      desc: 'Our Gemini engine instantly tags the ticket with technical skills and assigns a priority level.',
      alignment: 'md:flex-row-reverse',
      img: '/ai-analysis.png' 
    },
    { 
      icon: <CheckCircle2 />, 
      title: 'Get Results', 
      desc: 'Track progress in real-time as an expert moderator resolves your ticket using AI-backed insights.',
      alignment: 'md:flex-row',
      img: '/resolution.png' 
    }
  ];

  const features = [
    {
      title: "Skill Extraction",
      desc: "Gemini-powered scanning identifies technical keywords like React or Java to find the best expert.",
      icon: <Cpu className="text-sky-400" />,
      color: "border-sky-500/20"
    },
    {
      title: "Priority Analysis",
      desc: "Sentiment analysis detects urgency (Low to Urgent) based on description context and intent.",
      icon: <Zap className="text-amber-400" />,
      color: "border-amber-500/20"
    },
    {
      title: "Smart Suggestions",
      desc: "Admins receive automated 'AI Notes' suggesting fixes to resolve issues in record time.",
      icon: <MessageSquareCode className="text-emerald-400" />,
      color: "border-emerald-500/20"
    }
  ];

  return (
    <div className="space-y-20 pb-16"> 
      {/* 1. HERO SECTION */}
      <section className="text-center pt-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Support Ticketing <br />
          <span className="text-sky-500">Reimagined with AI</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          SmartResolve-AI streamlines issue resolution using advanced AI to categorize, 
          analyze, and route tickets to the right experts instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">Go to My Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. JOURNEY SECTION */}
      <section className="max-w-6xl mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Journey to Resolution</h2>
          <p className="text-slate-400 font-medium">Follow these simple steps to get the help you need.</p>
        </div>

        <div className="space-y-24 relative">
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-800 hidden md:block"></div>

          {journeySteps.map((step, idx) => (
            <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 relative z-10 ${step.alignment}`}>
              {/* Text Side */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 md:hidden">
                    {step.icon}
                  </div>
                  <span className="text-sky-500 font-mono font-bold">STEP 0{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>

              {/* Center Icon (Desktop Only) */}
              <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 items-center justify-center text-sky-400 z-20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                {step.icon}
              </div>

              {/* Image Side */}
              <div className="flex-1 w-full bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden group">
                <img 
                  src={step.img} 
                  alt={step.title} 
                  className="rounded-xl w-full h-auto opacity-70 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-[1.02]"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/500x300/1e293b/sky?text=Platform+Screenshot" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SYSTEM WORKFLOW SECTION */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Under the Hood</h2>
          <p className="text-slate-400">Advanced automation working behind the scenes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className={`p-8 rounded-3xl bg-slate-800/40 border ${feature.color} backdrop-blur-sm hover:bg-slate-800/60 transition-all group`}>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;