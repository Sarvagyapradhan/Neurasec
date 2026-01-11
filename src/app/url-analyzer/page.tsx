&apos;use client&apos;;

import React, { useState } from &apos;react&apos;;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ImageOff, 
  Loader2, 
  ListChecks, 
  AlertOctagon, 
  ShieldCheck, 
  Eye, 
  Lightbulb,
  Info as InfoIcon,
  Shield
} from &apos;lucide-react&apos;; // Icons

// Update interface based on README API response
interface UrlAnalysisResult {
  url: string;
  verdict: &apos;Safe&apos; | &apos;Risky&apos; | &apos;Dangerous&apos;;
  score: number;
  sources: { [key: string]: boolean };
  domain_age_days: number | null;
  ssl_valid: boolean | null;
  suspicious_features: string[];
  suggestions: string;
  previewAvailable?: boolean; // Keep optional for now
}

const UrlAnalyzerPage = () => {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Validate and format URL
      let processedUrl = url.trim();
      
      // Add protocol if missing
      if (!processedUrl.startsWith(&apos;http://&apos;) && !processedUrl.startsWith(&apos;https://&apos;)) {
        processedUrl = &apos;https://&apos; + processedUrl;
      }
      
      // Validate URL format before sending, but allow Unicode/IDN domains
      try {
        const parsedUrl = new URL(processedUrl);
        
        // Check for valid domain structure (at least one dot and a TLD)
        const domainParts = parsedUrl.hostname.split(&apos;.&apos;);
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
          throw new Error(&apos;Invalid URL: Please enter a domain with a valid TLD (e.g., .com, .org)&apos;);
        }
        
        // Only do basic validation - Unicode characters and IDN domains are now allowed
        // This lets our backend homograph detection work properly
        if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
          throw new Error(&apos;Invalid URL: Hostname is too short or missing&apos;);
        }
        
        // The old strict validation regex is commented out - it would block homograph attacks
        // const validDomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        // if (!validDomainRegex.test(parsedUrl.hostname)) {
        //   throw new Error(&apos;Invalid URL: Domain contains invalid characters&apos;);
        // }
      } catch (e) {
        throw new Error(&apos;Invalid URL format. Please enter a valid website address (e.g., example.com)&apos;);
      }

      const response = await fetch(&apos;/api/analyze-url&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
        },
        body: JSON.stringify({ url: processedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setAnalysisResult(data);
      console.log("Analysis result:", data);

    } catch (err) {
      console.error("Analysis request failed:", err);
      setError(err instanceof Error ? err.message : &apos;An unknown error occurred&apos;);
    } finally {
      setIsLoading(false);
    }
  };

  // Default analysis result with proper types (will be replaced by API response)
  // const defaultResult: UrlAnalysisResult = {
  //   url: "",
  //   verdict: &apos;Safe&apos;,
  //   score: 0,
  //   sources: {},
  //   domain_age_days: null,
  //   ssl_valid: null,
  //   suspicious_features: [],
  //   suggestions: "",
  // };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">URL Analyzer</h1>
        <p className="text-muted-foreground">Enter a website URL to scan for malicious content and safety risks.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Website</CardTitle>
          <CardDescription>Enter a website URL to check it for potential security threats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">
              <InfoIcon className="inline-block mr-1 h-4 w-4" />
              Enter a full domain name (e.g., example.com). HTTP/HTTPS will be added automatically if missing.
              Our advanced scanner now detects homograph attacks with look-alike characters.
            </p>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Globe className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="example.com or https://example.com"
                  className="pl-9 flex-grow"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === &apos;Enter&apos; && url.trim() && handleAnalyze()}
                />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !url.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" /> 
                )}
                Analyze URL
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
            <h4 className="text-sm font-medium text-blue-400 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Common Signs of Suspicious URLs
            </h4>
            <ul className="mt-2 text-xs text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              <li>• Misspelled domain names (faceboook.com)</li>
              <li>• Unusual subdomains (login.secure-site.example.com)</li>
              <li>• Non-HTTPS connections for sensitive sites</li>
              <li>• URLs with excessive numbers or special characters</li>
              <li>• Look-alike characters (paypаl.com with Cyrillic &apos;а&apos;)</li>
              <li>• Mixed script domains (using multiple alphabets)</li>
            </ul>
            <div className="mt-3 text-xs text-slate-300 bg-slate-800/30 p-2 rounded">
              <span className="font-medium">Try scanning these domains to test homograph detection:</span>
              <ul className="mt-1 text-xs text-slate-400 space-y-1">
                <li>• payрal.com (using Cyrillic &apos;р&apos; that looks like Latin &apos;p&apos;)</li>
                <li>• аpple.com (using Cyrillic &apos;а&apos; that looks like Latin &apos;a&apos;)</li>
                <li>• microsоft.com (using Cyrillic &apos;о&apos; that looks like Latin &apos;o&apos;)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="mt-6">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-48 space-y-3">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-muted-foreground">Analyzing URL... This might take a moment.</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorDisplay message={error} onClose={() => setError(null)} />
      )}

      {/* Results Section */}
      {analysisResult && !isLoading && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analysis Results for: <span className="font-normal break-all">{analysisResult.url}</span></CardTitle>
          </CardHeader>

          {/* Homograph Attack Warning - displayed prominently when detected */}
          {analysisResult.sources.homographDetection && (
            <div className="mx-6 mb-6 p-4 border-2 border-red-600 bg-red-900/20 rounded-lg">
              <div className="flex items-start">
                <AlertOctagon className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-500">Homograph Attack Detected!</h3>
                  <p className="text-slate-300 mt-1">
                    This URL appears to be using look-alike characters to mimic a legitimate website.
                    It may be attempting to steal your login credentials or personal information.
                  </p>
                  <div className="mt-3 bg-slate-900/40 p-3 rounded border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300">Detected Issues:</h4>
                    <ul className="mt-1 text-sm text-slate-400 space-y-1">
                      {analysisResult.suspicious_features
                        .filter(feature => 
                          feature.includes(&apos;mimic&apos;) || 
                          feature.includes(&apos;similar&apos;) || 
                          feature.includes(&apos;character&apos;) || 
                          feature.includes(&apos;Punycode&apos;) ||
                          feature.includes(&apos;mix&apos;)
                        )
                        .map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Verdict and Score */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-3 p-6 border rounded-lg bg-slate-900/50">
              <VerdictIcon verdict={analysisResult.verdict} />
              <h3 className={`text-2xl font-semibold ${getVerdictColor(analysisResult.verdict)}`}>
                {analysisResult.verdict}
              </h3>
              <p className="text-slate-300">Safety Score: <span className="font-bold text-slate-100">{(analysisResult.score * 100).toFixed(0)}%</span></p>
            </div>

            {/* Domain & SSL Info */}
            <div className="lg:col-span-1 space-y-3 p-6 border rounded-lg bg-slate-900/50">
              <h4 className="text-lg font-medium flex items-center text-slate-100"><Eye className="mr-2 h-5 w-5 text-blue-400"/>Domain & Security</h4>
              <InfoItem label="Domain Age" value={analysisResult.domain_age_days !== null ? `${analysisResult.domain_age_days} days` : &apos;Not Available&apos;} />
              <InfoItem label="SSL Certificate" value={analysisResult.ssl_valid !== null ? (analysisResult.ssl_valid ? &apos;Valid&apos; : &apos;Invalid/Missing&apos;) : &apos;Not Checked&apos;} status={analysisResult.ssl_valid === null ? undefined : analysisResult.ssl_valid ? &apos;safe&apos; : &apos;dangerous&apos;} />
            </div>

            {/* Threat Sources */}
            <div className="lg:col-span-1 space-y-3 p-6 border rounded-lg bg-slate-900/50">
              <h4 className="text-lg font-medium flex items-center text-slate-100"><ListChecks className="mr-2 h-5 w-5 text-blue-400"/>Threat Intelligence</h4>
              {Object.keys(analysisResult.sources).length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {Object.entries(analysisResult.sources).map(([source, detected]) => (
                    <li key={source} className="flex justify-between">
                      <span className="text-slate-400">{formatSourceName(source)}:</span>
                      <span className={`font-medium ${detected ? &apos;text-red-400&apos; : &apos;text-green-400&apos;}`}>
                        {detected ? &apos;Detected&apos; : &apos;Clean&apos;}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No threat intelligence sources checked or available.</p>
              )}
            </div>

            {/* Suspicious Features */}
            <div className="md:col-span-2 lg:col-span-3 space-y-3 p-6 border rounded-lg bg-slate-900/50">
              <h4 className="text-lg font-medium flex items-center text-slate-100"><ListChecks className="mr-2 h-5 w-5 text-blue-400"/>Suspicious Features Detected</h4>
              {analysisResult.suspicious_features.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 columns-1 md:columns-2">
                  {analysisResult.suspicious_features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No suspicious features found.</p>
              )}
            </div>

            {/* Suggestions */}
            <div className="md:col-span-2 lg:col-span-3 space-y-3 p-6 border rounded-lg bg-slate-900/50">
              <h4 className="text-lg font-medium flex items-center text-slate-100"><Lightbulb className="mr-2 h-5 w-5 text-yellow-400"/>Suggestions</h4>
              <p className="text-sm text-slate-400">{analysisResult.suggestions || &apos;No specific suggestions at this time.&apos;}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder if no analysis yet */}
      {!analysisResult && !isLoading && !error && (
          <Card className="mt-6">
            <CardContent className="pt-6 flex flex-col items-center justify-center h-48 space-y-3">
                <Globe className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">Submit a URL to see the analysis results.</p>
            </CardContent>
          </Card>
      )}
    </div>
  );
};

// Helper components and functions
const VerdictIcon = ({ verdict }: { verdict: UrlAnalysisResult[&apos;verdict&apos;] }) => {
  const className = "h-16 w-16";
  switch (verdict) {
    case &apos;Safe&apos;: return <ShieldCheck className={`${className} text-green-500`} />;
    case &apos;Risky&apos;: return <AlertCircle className={`${className} text-yellow-500`} />;
    case &apos;Dangerous&apos;: return <XCircle className={`${className} text-red-500`} />;
    default: return null;
  }
};

const getVerdictColor = (verdict: UrlAnalysisResult[&apos;verdict&apos;]) => {
  switch (verdict) {
    case &apos;Safe&apos;: return &apos;text-green-600&apos;;
    case &apos;Risky&apos;: return &apos;text-yellow-600&apos;;
    case &apos;Dangerous&apos;: return &apos;text-red-600&apos;;
    default: return &apos;text-slate-100&apos;;
  }
};

const InfoItem = ({ label, value, status }: { label: string; value: string; status?: &apos;safe&apos; | &apos;dangerous&apos; }) => (
  <p className="text-sm text-slate-400">
    {label}: 
    <span className={`font-medium ml-1 ${status === &apos;safe&apos; ? &apos;text-green-400&apos; : status === &apos;dangerous&apos; ? &apos;text-red-400&apos; : &apos;text-slate-100&apos;}`}>
      {value}
    </span>
  </p>
);

const formatSourceName = (source: string) => {
  // Simple formatter, can be expanded
  return source.replace(/([A-Z])/g, &apos; $1&apos;).replace(/^./, (str) => str.toUpperCase());
};

// Error state UI with better formatting
const ErrorDisplay = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const formattedMessage = message.includes(&apos;Invalid URL&apos;) 
    ? message 
    : &apos;Analysis Error: &apos; + message;
    
  return (
    <Card className="mt-6 border-red-500/50">
      <CardContent className="pt-6 flex flex-col items-center justify-center h-48 space-y-3 text-red-500">
        <AlertOctagon className="h-10 w-10" />
        <p className="font-semibold">Analysis Failed</p>
        <p className="text-sm text-center px-4">{formattedMessage}</p>
        <Button variant="destructive" onClick={onClose}>Try Again</Button>
      </CardContent>
    </Card>
  );
};

export default UrlAnalyzerPage; 