import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import {
  Bot,
  Cpu,
  Zap,
  MessageSquareCode,
  ArrowRight,
  ShieldCheck,
  MousePointer2,
} from "lucide-react";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Cpu className="text-sky-400" size={28} />,
      title: "AI Skill Detection",
      desc: "Automatically extracts technologies like React, Java, or Node from your issue description.",
    },
    {
      icon: <Zap className="text-amber-400" size={28} />,
      title: "Priority Intelligence",
      desc: "AI analyzes urgency and sentiment to automatically assign ticket priority.",
    },
    {
      icon: <MessageSquareCode className="text-emerald-400" size={28} />,
      title: "Resolution Suggestions",
      desc: "Admins receive AI-generated suggestions to resolve issues faster.",
    },
  ];

  const steps = [
    {
      icon: <MousePointer2 size={26} />,
      title: "Create Ticket",
      desc: "Submit your issue with title and description.",
    },
    {
      icon: <Bot size={26} />,
      title: "AI Processing",
      desc: "Gemini AI analyzes your request and assigns tags and priority.",
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Expert Resolution",
      desc: "Tickets are routed to the best moderator for fast resolution.",
    },
  ];

  return (
    <div className="space-y-28 pb-20">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-16 text-center">
         <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Support Ticketing <br />
          <span className="text-sky-500">Reimagined with AI</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          SmartResolve-AI streamlines issue resolution using advanced AI to categorize, 
          analyze, and route tickets to the right experts instantly.
        </p>

        <div className="flex justify-center gap-4 mt-10 flex-col sm:flex-row">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg">
                Go to Dashboard <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>

              <Link to="/login">
                <Button variant="ghost" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">
            Intelligent Automation
          </h2>
          <p className="text-slate-400 mt-2">
            Built with AI to streamline your support workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700 backdrop-blur hover:bg-slate-800/70 transition"
            >
              <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-5">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="text-slate-400 mt-2">
            A streamlined process powered by AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-sky-400 mb-4">
                {step.icon}
              </div>

              <h3 className="text-lg font-bold text-white">{step.title}</h3>

              <p className="text-slate-400 text-sm mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM BENEFITS */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Modern Support Teams
            </h2>

            <p className="text-slate-400 mb-6">
              SmartResolve combines AI and automation to reduce manual work,
              prioritize critical issues, and help teams resolve tickets
              faster.
            </p>

            <ul className="space-y-3 text-slate-300 text-sm">
              <li>✓ Automatic ticket classification</li>
              <li>✓ Smart priority detection</li>
              <li>✓ AI-generated resolution insights</li>
              <li>✓ Real-time ticket tracking</li>
            </ul>
          </div>

          <div className="rounded-2xl p-1">
            <img
              src="/step1.png"
              alt="dashboard preview"
              className="rounded-xl opacity-80 hover:opacity-100 transition"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-3xl p-12">

          <h2 className="text-3xl font-bold text-white mb-4">
            Start Resolving Tickets Faster
          </h2>

          <p className="text-slate-400 mb-8">
            Experience the power of AI-driven ticket management today.
          </p>

          {!isAuthenticated && (
            <Link to="/signup">
              <Button size="lg">
                Create Free Account
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;