"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Lock,
  Mail,
  Network,
  Shield,
  Zap,
  ChevronRight,
  LineChart,
  BarChart,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileWarning,
  User,
  Settings,
  FileText,
  Link as LinkIcon,
  Github,
  Linkedin,
  Database,
  Cpu,
  BrainCircuit,
  Eye,
  PieChart,
  RefreshCw,
  ChevronDown,
  Plus,
  Search,
  Bell,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

const features = [
  {
    title: "Real-time Threat Detection",
    description: "Advanced AI-powered system that monitors and identifies potential security threats in real-time",
    icon: Shield,
    metric: "99.9%",
    label: "Detection Rate",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30"
  },
  {
    title: "Zero-Day Vulnerability Protection",
    description: "Proactive defense against unknown vulnerabilities using behavioral analysis",
    icon: Lock,
    metric: "100+",
    label: "Threats Blocked",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30"
  },
  {
    title: "Network Traffic Analysis",
    description: "Deep packet inspection and anomaly detection for comprehensive network security",
    icon: Activity,
    metric: "24/7",
    label: "Monitoring",
    color: "bg-sky-500/10 text-sky-500 border-sky-500/30"
  },
  {
    title: "Security Intelligence",
    description: "Continuous learning system that adapts to new threat patterns",
    icon: Eye,
    metric: "500K+",
    label: "Patterns Analyzed",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30"
  }
];

const securityMetrics = [
  {
    title: "Security Score",
    value: "92%",
    change: "+5%",
    status: "positive",
    icon: Shield,
    color: "from-blue-500/20 to-blue-600/10"
  },
  {
    title: "Threats Blocked",
    value: "2,847",
    change: "+12%",
    status: "positive",
    icon: Lock,
    color: "from-indigo-500/20 to-indigo-600/10"
  },
  {
    title: "Response Time",
    value: "1.2s",
    change: "-0.3s",
    status: "positive",
    icon: Zap,
    color: "from-sky-500/20 to-sky-600/10"
  }
];

const quickTools = [
  {
    title: "Security Scanner",
    description: "Run comprehensive security analysis",
    icon: Shield,
    action: "Scan Now",
    link: "/url-scanner"
  },
  {
    title: "Threat Monitor",
    description: "View active security threats",
    icon: Activity,
    action: "View Threats",
    link: "/threat-analyzer"
  },
  {
    title: "Network Analysis",
    description: "Analyze network traffic patterns",
    icon: BarChart,
    action: "Analyze",
    link: "/network-analyzer"
  }
];

const recentActivity = [
  {
    type: "scan",
    title: "URL Scan Completed",
    description: "https://example.com was scanned and is safe",
    time: "10 min ago",
    status: "success",
    icon: LinkIcon
  },
  {
    type: "alert",
    title: "Potential Phishing Attempt",
    description: "Suspicious email detected and blocked",
    time: "1 hour ago",
    status: "warning",
    icon: Mail
  },
  {
    type: "system",
    title: "System Updated",
    description: "Security definitions updated to latest version",
    time: "3 hours ago",
    status: "info",
    icon: RefreshCw
  }
];

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const [securityTip, setSecurityTip] = useState("Enable two-factor authentication for all your accounts to enhance security.");

  // Simple auth check
  useEffect(() => {
    console.log("Dashboard auth status:", { isAuthenticated, loading });
    
    // For demo purposes, let&apos;s assume we have auth if there&apos;s a token in either place
    const hasToken = !!getCookie("auth_token") || !!localStorage.getItem("auth_token");
    console.log("Token found:", hasToken);
    
    // Redirect if we&apos;re not loading, not authenticated, and have no token
    if (!loading) {
      setAuthChecked(true);
      if (!isAuthenticated && !hasToken) {
        router.push(&apos;/login&apos;);
      }
    }

    // Safety timeout for dashboard loading specifically
    const timer = setTimeout(() => {
        if (loading) {
            console.warn("Dashboard loading timed out, forcing check");
            if (!isAuthenticated && !hasToken) {
                router.push(&apos;/login&apos;);
            } else {
                // If we have token/auth but loading stuck, show content
                setAuthChecked(true); 
            }
        }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, router]);

  // Add Loading State
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          <Shield className="h-16 w-16 text-blue-400 relative" />
        </div>
        <h2 className="text-xl text-slate-200 mt-6 font-medium">Loading Your Dashboard</h2>
        <p className="text-slate-400 mt-2">Please wait while we prepare your security overview...</p>
        <div className="mt-6 w-48">
          <Progress value={65} className="h-1.5" />
        </div>
      </div>
    );
  }

  // Only render dashboard when authentication is confirmed
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 md:mb-0"
          >
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {user?.username || user?.email?.split(&apos;@&apos;)[0] || "User"}</h1>
            <p className="text-slate-400 mt-1">Here&apos;s your security overview for today</p>
          </motion.div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="search"
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-60"
                placeholder="Search security scans..."
              />
            </div>
            <div className="relative">
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
              </button>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </div>
        </div>

        {/* Security Tip Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center"
        >
          <div className="mr-4 flex-shrink-0 bg-blue-500/20 p-2 rounded-full">
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-blue-400">Security Tip</h3>
            <p className="text-slate-300 text-sm">{securityTip}</p>
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            New Tip
          </Button>
        </motion.div>

        {/* Security Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Security Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {securityMetrics.map((metric, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <Card className="border-slate-800 bg-slate-900/50 overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`mr-3 p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                          <metric.icon className="h-5 w-5 text-slate-100" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-300">{metric.title}</h3>
                      </div>
                      <Badge
                        variant={metric.status === "positive" ? "default" : "destructive"}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-slate-100">{metric.value}</p>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: metric.value }}></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100">Platform Features</h2>
            <Button variant="outline" size="sm" className="text-slate-400 border-slate-700 hover:bg-slate-800">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <Card className="border-slate-800 bg-slate-900/50 h-full hover:shadow-lg hover:shadow-blue-900/5 hover:border-slate-700 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-xl ${feature.color} p-3`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-100">{feature.title}</h3>
                    <p className="mb-4 text-sm text-slate-400">{feature.description}</p>
                    <div className="mt-auto">
                      <div className="text-2xl font-bold text-blue-400">{feature.metric}</div>
                      <div className="text-xs text-slate-500">{feature.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Two Column Layout: Quick Tools and Recent Activity */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Quick Tools */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100">Quick Tools</h2>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                Customize
                <Settings className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickTools.map((tool, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                >
                  <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 hover:border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                          <tool.icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-slate-100">{tool.title}</h3>
                      </div>
                      <p className="mb-4 text-sm text-slate-400">{tool.description}</p>
                      <Link href={tool.link}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0">
                          {tool.action}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeInUp}
                      className="flex items-start p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <div className={`mr-3 p-2 rounded-full 
                        ${activity.status === &apos;success&apos; ? &apos;bg-green-500/10 text-green-500&apos; : 
                          activity.status === &apos;warning&apos; ? &apos;bg-yellow-500/10 text-yellow-500&apos; : 
                          &apos;bg-blue-500/10 text-blue-500&apos;}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-200">{activity.title}</h4>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-slate-800 text-slate-400 hover:bg-slate-800">
                  Load More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 