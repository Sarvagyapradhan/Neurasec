"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type ScanRow = {
  id: number;
  type: string;
  input: string;
  result: string;
  score: number;
  createdAt: string;
};

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

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const [securityTip, setSecurityTip] = useState("Enable two-factor authentication for all your accounts to enhance security.");
  const [recentScans, setRecentScans] = useState<ScanRow[]>([]);
  const [scansLoading, setScansLoading] = useState(false);

  // Simple auth check
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const load = async () => {
      if (!authChecked || !isAuthenticated) return;
      setScansLoading(true);
      try {
        const resp = await fetch("/api/scans?limit=10");
        const data = await resp.json();
        if (resp.ok) {
          setRecentScans((data?.scans ?? []) as ScanRow[]);
        }
      } finally {
        setScansLoading(false);
      }
    };
    load();
  }, [authChecked, isAuthenticated]);

  const securityMetrics = useMemo(() => {
    if (!recentScans.length) {
      return [
        {
          title: "Security Score",
          value: "—",
          change: "",
          status: "positive",
          icon: Shield,
          color: "from-blue-500/20 to-blue-600/10",
        },
        {
          title: "Scans (7 days)",
          value: "—",
          change: "",
          status: "positive",
          icon: Lock,
          color: "from-indigo-500/20 to-indigo-600/10",
        },
        {
          title: "Avg Risk",
          value: "—",
          change: "",
          status: "positive",
          icon: Zap,
          color: "from-sky-500/20 to-sky-600/10",
        },
      ];
    }

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const scans7d = recentScans.filter(s => new Date(s.createdAt).getTime() >= weekAgo);
    const avgRisk =
      scans7d.length > 0
        ? scans7d.reduce((acc, s) => acc + (Number.isFinite(s.score) ? s.score : 0), 0) / scans7d.length
        : 0;
    const securityScore = Math.max(0, Math.min(100, Math.round((1 - avgRisk) * 100)));

    return [
      {
        title: "Security Score",
        value: `${securityScore}%`,
        change: "",
        status: "positive",
        icon: Shield,
        color: "from-blue-500/20 to-blue-600/10",
      },
      {
        title: "Scans (7 days)",
        value: String(scans7d.length),
        change: "",
        status: "positive",
        icon: Lock,
        color: "from-indigo-500/20 to-indigo-600/10",
      },
      {
        title: "Avg Risk",
        value: `${Math.round(avgRisk * 100)}%`,
        change: "",
        status: "positive",
        icon: Zap,
        color: "from-sky-500/20 to-sky-600/10",
      },
    ];
  }, [recentScans]);

  const recentActivity = useMemo(() => {
    const iconForType = (t: string) => {
      const tt = (t || "").toLowerCase();
      if (tt.includes("url")) return LinkIcon;
      if (tt.includes("email")) return Mail;
      if (tt.includes("file")) return FileText;
      return RefreshCw;
    };

    const statusForScore = (score: number) => {
      if (score >= 0.7) return "warning";
      if (score >= 0.3) return "info";
      return "success";
    };

    return recentScans.map(scan => ({
      type: "scan",
      title: `${scan.type.toUpperCase()} Scan`,
      description: scan.input.length > 80 ? `${scan.input.slice(0, 80)}…` : scan.input,
      time: timeAgo(scan.createdAt),
      status: statusForScore(scan.score),
      icon: iconForType(scan.type),
    }));
  }, [recentScans]);

  // Keep sections expanded by default (no show/hide UI)

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
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {user?.username || user?.email?.split('@')[0] || "User"}</h1>
            <p className="text-slate-400 mt-1">Here&apos;s your security overview for today</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="search"
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-60"
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

        {/* Platform Features */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100">Platform Features</h2>
            <Button variant="outline" size="sm" className="text-slate-400 border-slate-700 hover:bg-slate-800 hidden sm:inline-flex">
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
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hidden sm:inline-flex">
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
                        ${activity.status === 'success' ? 'bg-green-500/10 text-green-500' : 
                          activity.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-blue-500/10 text-blue-500'}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-slate-200 truncate">{activity.title}</h4>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 break-all overflow-hidden">{activity.description}</p>
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