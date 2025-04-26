"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Activity, BrainCircuit, Zap, Server, Cloud, FileSearch, Database, Code, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fadeInUp = {
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

export default function FeaturesPage() {
  const features = [
    {
      icon: Shield,
      title: "Advanced Threat Detection",
      description: "AI-powered analysis to identify and prevent sophisticated cyber threats in real-time with industry-leading accuracy.",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30"
    },
    {
      icon: Lock,
      title: "Zero-Day Vulnerability Protection",
      description: "Proactive defense mechanisms that safeguard your systems against unknown and emerging security vulnerabilities.",
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30"
    },
    {
      icon: Activity,
      title: "Real-time Network Monitoring",
      description: "Continuous surveillance of network traffic to detect anomalies and suspicious patterns before they become threats.",
      color: "bg-sky-500/10 text-sky-500 border-sky-500/30"
    },
    {
      icon: Database,
      title: "Secure Database Protection",
      description: "Advanced safeguards for your critical data assets with encryption and access control measures.",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
    },
    {
      icon: Server,
      title: "Server Security Hardening",
      description: "Comprehensive server protection with automated security updates and configuration hardening.",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30"
    },
    {
      icon: FileSearch,
      title: "File Malware Scanner",
      description: "Deep file analysis to detect and quarantine malicious files before they can cause damage to your systems.",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/30"
    },
    {
      icon: Cloud,
      title: "Cloud Security Integration",
      description: "Seamless security integration with major cloud providers to protect your cloud-based infrastructure.",
      color: "bg-teal-500/10 text-teal-500 border-teal-500/30"
    },
    {
      icon: BrainCircuit,
      title: "Intelligent Security Analytics",
      description: "Advanced analytics powered by machine learning to provide actionable security insights and recommendations.",
      color: "bg-red-500/10 text-red-500 border-red-500/30"
    }
  ];

  const enterpriseFeatures = [
    "Dedicated security team",
    "Priority incident response",
    "Custom security policies",
    "Advanced threat intelligence",
    "Compliance reporting",
    "Executive security briefings"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="absolute top-20 -left-64 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-64 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto py-16 px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
          >
            Enterprise-Grade Security Features
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-slate-400"
          >
            Discover how NeuraSec provides comprehensive protection for your digital assets with our advanced AI-powered security platform
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Card className="border-slate-800 bg-slate-900/50 h-full hover:shadow-lg hover:shadow-blue-900/5 hover:border-slate-700 transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-xl ${feature.color} p-3`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="mb-6 text-3xl font-bold text-slate-100">Enterprise Solutions</h2>
                <p className="mb-6 text-slate-400">
                  Take your organization's security to the next level with our enterprise-grade features designed for businesses that require maximum protection.
                </p>
                <div className="mb-8 space-y-4">
                  {enterpriseFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-start"
                    >
                      <div className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                        <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                <Link href="/contact">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <div className="bg-slate-800/50 p-8 md:p-12 flex flex-col justify-center">
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-lg"></div>
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Zap className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-center text-slate-100 mb-4">
                      Tailored Security Solutions
                    </h3>
                    <p className="text-slate-400 text-center mb-6">
                      We work with your team to build custom security solutions that address your specific business needs and compliance requirements.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-300">24/7 Support</span>
                          <span className="text-xs bg-blue-500/10 text-blue-400 py-1 px-2 rounded-full">Included</span>
                        </div>
                      </div>
                      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-300">Custom Integrations</span>
                          <span className="text-xs bg-blue-500/10 text-blue-400 py-1 px-2 rounded-full">Included</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-100">
            Ready to secure your systems?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-slate-400">
            Join thousands of businesses who trust NeuraSec for their cybersecurity needs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                Get Started Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                Request Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 