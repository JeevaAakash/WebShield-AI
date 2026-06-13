/**
 * WebShield AI - Mock Reports Module
 * Stores security profiles for popular sites and generates dynamic scanner reports for custom inputs.
 */

const PRESET_REPORTS = {
  "google.com": {
    domain: "google.com",
    score: 98,
    badge: "Exceptional",
    badgeClass: "safe",
    sslStatus: "Secure",
    sslIssuer: "Google Trust Services",
    sslExpiry: "92 days remaining",
    dnssec: true,
    headers: {
      hsts: true,
      xframe: true,
      xcontent: true,
      csp: true
    },
    findings: [
      { id: "h1", severity: "low", category: "Headers", title: "Strict-Transport-Security (HSTS) Preload Check", desc: "The domain is fully HSTS preloaded, enforcing secure HTTPS connections across all modern browsers. Zero configuration issues found.", remediation: "No action required." },
      { id: "h2", severity: "low", category: "SSL/TLS", title: "TLS 1.3 Cryptography Active", desc: "Modern cryptographic cipher suites configured. Legacy TLS 1.0/1.1 are correctly deactivated to prevent POODLE or BEAST exploit models.", remediation: "No action required." }
    ],
    aiSummary: "Google.com demonstrates exceptional security configurations. All essential HTTP security headers are correctly implemented, SSL parameters utilize modern TLS 1.3 ciphers, and DNSSEC protects against spoofing attempts. No immediate remediation is recommended."
  },
  
  "github.com": {
    domain: "github.com",
    score: 95,
    badge: "Highly Secure",
    badgeClass: "safe",
    sslStatus: "Secure",
    sslIssuer: "DigiCert SHA2 Extended Validation",
    sslExpiry: "184 days remaining",
    dnssec: false,
    headers: {
      hsts: true,
      xframe: true,
      xcontent: true,
      csp: true
    },
    findings: [
      { id: "gt1", severity: "medium", category: "DNS SEC", title: "DNSSEC Cryptographic Keys Missing", desc: "Domain Name System Security Extensions (DNSSEC) is not enabled on this domain. This leaves a small potential window for DNS cache poisoning or spoofing in unsecured networks.", remediation: "Configure DNSSEC records (DS and DNSKEY) at your registrar and DNS host to sign zone data cryptographically." }
    ],
    aiSummary: "Github.com operates with very high security parameters. Security headers (CSP, HSTS, X-Content-Type) are fully active. Enabling DNSSEC is recommended to mitigate minor spoofing risks in hostile transit paths."
  },

  "vulnweb.com": {
    domain: "vulnweb.com",
    score: 38,
    badge: "Critical Threat",
    badgeClass: "danger",
    sslStatus: "Insecure",
    sslIssuer: "Let's Encrypt Authority X3 (Outdated Cipher)",
    sslExpiry: "Expired 14 days ago",
    dnssec: false,
    headers: {
      hsts: false,
      xframe: false,
      xcontent: false,
      csp: false
    },
    findings: [
      { id: "vw1", severity: "critical", category: "SSL/TLS", title: "SSL Certificate Has Expired", desc: "The SSL/TLS certificate registered for this domain has expired, which prompts security warnings in client browsers and exposes user payloads to interception.", remediation: "Renew the SSL certificate immediately via ACME/Let's Encrypt or your certificate authority." },
      { id: "vw2", severity: "high", category: "Headers", title: "Content Security Policy (CSP) Header Missing", desc: "No CSP header is detected. Attackers can inject and execute external malicious scripts (Cross-Site Scripting) or hijack user sessions.", remediation: "Add a Content-Security-Policy HTTP header restricting script-src to 'self' and whitelisted origins." },
      { id: "vw3", severity: "high", category: "Headers", title: "Missing X-Frame-Options Protection", desc: "The website lacks X-Frame-Options or frame-ancestors directives, rendering it susceptible to Clickjacking frame overlays.", remediation: "Configure your server to send 'X-Frame-Options: DENY' or 'SAMEORIGIN' headers." },
      { id: "vw4", severity: "medium", category: "Server Settings", title: "Directory Indexing Enabled on /backup", desc: "A backup directory listing was found accessible, which could leak system logs, environment keys, or source repositories.", remediation: "Configure Nginx 'autoindex off;' or Apache 'Options -Indexes' on all public directories." }
    ],
    aiSummary: "Warning: vulnweb.com demonstrates critical infrastructure exposure. The expired SSL certificate and complete absence of server security headers leave users and payloads vulnerable to interception and XSS injection. Immediate action is required to resolve expired certificates and deploy security headers."
  }
};

/**
 * Normalizes input URL to extract the bare domain.
 * e.g., "https://www.google.com/search?q=123" -> "google.com"
 */
function cleanDomain(url) {
  if (!url) return "";
  let domain = url.trim().toLowerCase();
  
  // Remove protocol
  if (domain.startsWith("http://")) domain = domain.substring(7);
  if (domain.startsWith("https://")) domain = domain.substring(8);
  
  // Remove path and queries
  const slashIdx = domain.indexOf("/");
  if (slashIdx !== -1) {
    domain = domain.substring(0, slashIdx);
  }
  
  // Remove query if slash wasn't present
  const queryIdx = domain.indexOf("?");
  if (queryIdx !== -1) {
    domain = domain.substring(0, queryIdx);
  }
  
  // Remove www. prefix
  if (domain.startsWith("www.")) {
    domain = domain.substring(4);
  }
  
  return domain;
}

/**
 * Dynamic Report Generator
 * Generates a consistent, realistic security report for any custom domain by hashing the domain name.
 */
function generateReport(url) {
  const domain = cleanDomain(url);
  if (!domain) return null;
  
  // Check if we have a preset
  if (PRESET_REPORTS[domain]) {
    return PRESET_REPORTS[domain];
  }
  
  // Hash the domain to generate consistent pseudo-random values
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  
  // Calculate Score (range 45 to 94 based on hash)
  const score = 45 + (hash % 50);
  
  let badge = "Secure";
  let badgeClass = "safe";
  if (score < 60) {
    badge = "High Risk";
    badgeClass = "danger";
  } else if (score < 80) {
    badge = "Moderate Risk";
    badgeClass = "warning";
  } else if (score < 90) {
    badge = "Secure";
    badgeClass = "safe";
  } else {
    badge = "Optimized";
    badgeClass = "safe";
  }
  
  const sslStatus = score > 55 ? "Secure" : "Insecure";
  const sslIssuer = score > 80 ? "DigiCert Cloud CA-1" : (score > 55 ? "Let's Encrypt Authority R3" : "Expired self-signed");
  const sslExpiry = score > 55 ? `${30 + (hash % 150)} days remaining` : "Expired 5 days ago";
  const dnssec = hash % 3 === 0;
  
  // Determine header presence
  const headers = {
    hsts: score > 60,
    xframe: score > 65,
    xcontent: score > 70,
    csp: score > 78
  };
  
  // Compile findings dynamically
  const findings = [];
  
  if (!headers.csp) {
    findings.push({
      id: `f_csp_${hash}`,
      severity: "high",
      category: "Headers",
      title: "Content Security Policy (CSP) Header Missing",
      desc: "This website does not transmit a Content Security Policy header. Without it, clients are unprotected from XSS script injections from malicious third-party locations.",
      remediation: "Deploy CSP headers via your server config (Nginx/Apache) or application framework headers, whitelisting scripts only from trusted CDNs and 'self'."
    });
  }
  
  if (!headers.hsts) {
    findings.push({
      id: `f_hsts_${hash}`,
      severity: "medium",
      category: "Headers",
      title: "HSTS Header Not Enabled",
      desc: "Strict-Transport-Security header is missing, allowing connection downgrades from HTTPS to HTTP (SSL Stripping attacks).",
      remediation: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to server configurations."
    });
  }
  
  if (!headers.xframe) {
    findings.push({
      id: `f_xframe_${hash}`,
      severity: "medium",
      category: "Headers",
      title: "Missing Clickjacking Protection Header",
      desc: "The X-Frame-Options header (or frame-ancestors directive) is missing, permitting frame nesting exploits (Clickjacking).",
      remediation: "Configure the server to respond with 'X-Frame-Options: SAMEORIGIN' on all HTML resource responses."
    });
  }
  
  if (!dnssec) {
    findings.push({
      id: `f_dnssec_${hash}`,
      severity: "low",
      category: "DNS",
      title: "DNSSEC Cryptographic Keys Missing",
      desc: "Domain Name System Security Extensions (DNSSEC) is not configured, meaning DNS records cannot be cryptographically validated by client resolvers.",
      remediation: "Enable DNSSEC key signing inside your domain registrar settings and link your DS records to your DNS host."
    });
  }
  
  if (score < 60) {
    findings.push({
      id: `f_ports_${hash}`,
      severity: "critical",
      category: "Network",
      title: "Open Sensitive Database Port Detected",
      desc: "A public port scan detected an exposed MySQL (3306) or Redis (6379) listener. Database endpoints should never be directly accessible from the public internet.",
      remediation: "Update firewall rules (iptables/UFW) to only accept database queries from localhost or trusted internal app-server subnet IPs."
    });
  }
  
  // If score is high and no issues, add a low info finding
  if (findings.length === 0) {
    findings.push({
      id: `f_opt_${hash}`,
      severity: "low",
      category: "Optimization",
      title: "Server Signature Header Present",
      desc: "The HTTP response header leaks the specific server version (e.g. 'Server: nginx/1.18.0'). Attackers can use this to target CVE exploits for that version.",
      remediation: "Disable server tokens. In Nginx, set 'server_tokens off;' inside nginx.conf. In Apache, set 'ServerTokens Prod'."
    });
  }
  
  // Sort findings by severity (critical, high, medium, low)
  const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  findings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  
  // AI summary description
  let aiSummary = "";
  if (score >= 90) {
    aiSummary = `WebShield AI indicates that ${domain} has top-tier security compliance. Strong certificate setups, active HSTS shields, and correct content boundaries prevent modern browser vectors. We recommend periodic auditing and hiding server signature metadata.`;
  } else if (score >= 70) {
    aiSummary = `WebShield AI evaluated ${domain} with a solid trust rating, though minor exposures exist. Missing script boundaries (CSP) or DNSSEC warnings are the primary issues. Address the CSP headers to prevent modern XSS scripts.`;
  } else {
    aiSummary = `Warning: ${domain} displays multiple high-severity vulnerabilities. Network ports are exposed, and critical transport security headers (HSTS, CSP) are deactivated. Renew certificates and configure firewalls immediately to prevent data exposure.`;
  }
  
  return {
    domain,
    score,
    badge,
    badgeClass,
    sslStatus,
    sslIssuer,
    sslExpiry,
    dnssec,
    headers,
    findings,
    aiSummary
  };
}

// Export to global scope
if (typeof window !== 'undefined') {
  window.cleanDomain = cleanDomain;
  window.generateReport = generateReport;
  window.PRESET_REPORTS = PRESET_REPORTS;
}
