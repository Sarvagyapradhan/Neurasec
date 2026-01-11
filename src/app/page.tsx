"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Lock, Activity, BrainCircuit, ChevronRight, Check, Globe, Zap, FileText, UserCheck } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Don&apos;t render landing page content if we&apos;re authenticated or still checking auth status
  if (loading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
            <Shield className="h-16 w-16 text-blue-400 relative" />
          </div>
          <h2 className="text-slate-200 mt-6 text-xl font-medium">Preparing your secure environment</h2>
          <p className="text-slate-400 mt-2">Loading NeuraSec dashboard...</p>
        </div>
      </div>
    );
  }

  const features = [
    { 
      icon: Shield, 
      title: "AI-Powered Security", 
      description: "Advanced machine learning algorithms detect threats and vulnerabilities in real-time",
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: Lock, 
      title: "Zero-Day Protection", 
      description: "Proactive defense mechanisms against unknown and emerging security threats",
      color: "from-indigo-500 to-indigo-600" 
    },
    { 
      icon: Activity, 
      title: "Real-time Monitoring", 
      description: "Continuous analysis of security metrics with instant alerts on suspicious activity",
      color: "from-sky-500 to-sky-600" 
    },
    { 
      icon: BrainCircuit, 
      title: "Intelligent Analytics", 
      description: "Comprehensive insights and actionable data for security optimization",
      color: "from-purple-500 to-purple-600" 
    }
  ];

  const benefits = [
    "Proactive threat prevention with 99.9% accuracy",
    "Enterprise-grade security with cloud integration",
    "Automated security response and remediation",
    "Comprehensive security compliance and reporting",
    "Continuous security posture improvement",
    "User-friendly interface with minimal setup"
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] pointer-events-none"></div>
      <div className="absolute top-20 -left-64 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-64 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <AnimatedBackground className="relative z-10">
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
              <Shield className="h-20 w-20 text-blue-400 relative" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 bg-clip-text text-5xl font-bold text-transparent md:text-7xl"
            >
              NeuraSec
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-xl text-slate-400"
            >
              Enterprise-grade AI-powered cybersecurity platform for comprehensive
              threat detection and proactive protection
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 h-14 px-8 text-base rounded-xl shadow-lg shadow-blue-500/20">
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-14 px-8 text-base rounded-xl">
                  Sign In
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>99.9% Accuracy</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>24/7 Protection</span>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <div className="mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center text-3xl font-bold text-slate-100"
            >
              Enterprise-Grade Security Features
            </motion.h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="group"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-30"></div>
                    <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-100 transition-colors group-hover:text-blue-400">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <h2 className="mb-6 text-3xl font-bold text-slate-100">Why Choose NeuraSec</h2>
                  <div className="mb-8 space-y-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-start"
                      >
                        <div className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                          <Check className="h-3 w-3 text-blue-400" />
                        </div>
                        <span className="text-slate-300">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Link href="/register">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Secure Your Digital Assets
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-slate-800/50 p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100">
                      Powerful Protection
                    </h3>
                    <p className="mt-2 text-slate-400">
                      Our intelligent security platform protects against today&apos;s most sophisticated threats
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-6 border border-slate-800">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Threat Protection</span>
                      <span className="text-sm font-medium text-blue-400">99.9%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[99.9%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-8 md:p-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-slate-100">
              Ready to secure your digital presence?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-slate-400">
              Join thousands of businesses and individuals who trust NeuraSec for their cybersecurity needs
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-6">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-12 px-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </AnimatedBackground>
    </div>
  );
} 