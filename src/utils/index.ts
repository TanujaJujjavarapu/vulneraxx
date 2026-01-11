export function createPageUrl(pageName: string) {
  // simple mapper used by links in the mock app
  const map: Record<string, string> = {
    Home: '/',
    VulnerabilityExplorer: '/vulnerabilities',
    AssignmentWorkflow: '/assignment',
    Reports: '/reports',
    CompanyDetails: '/company',
    ThreatClassification: '/threats',
  }
  return map[pageName] || '/'
}

// Helper function to parse CSV line properly (handles quoted fields)
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

// Parse unified CSV format with both company and vulnerability data
export const parseUnifiedCsvData = (csvText: string) => {
  const lines = csvText.split("\n").filter((line: string) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file must contain headers and at least one data row");
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map((h: string) =>
    h.toLowerCase().trim()
  );

  console.log("=== CSV PARSING STARTED ===");
  console.log("Total lines:", lines.length);
  console.log("CSV Headers:", headers);

  // Main column indices - try multiple possible header names for flexibility
  const domainNameIdx = headers.indexOf("domain_name") !== -1 
    ? headers.indexOf("domain_name")
    : headers.indexOf("url") !== -1
    ? headers.indexOf("url")
    : -1;

  const riskIdIdx = headers.indexOf("risk id") !== -1
    ? headers.indexOf("risk id")
    : headers.indexOf("risk_id") !== -1
    ? headers.indexOf("risk_id")
    : headers.indexOf("vuln_id") !== -1
    ? headers.indexOf("vuln_id")
    : -1;

  const domainUrlIdx = headers.indexOf("domain_url");
  const environmentIdx = headers.indexOf("environment");
  const riskScoreIdx = headers.indexOf("risk_score") !== -1
    ? headers.indexOf("risk_score")
    : headers.indexOf("risk score") !== -1
    ? headers.indexOf("risk score")
    : -1;
  const filesAnalyzedIdx = headers.indexOf("files_analyzed");
  
  const vulnIdIdx = riskIdIdx;
  const vulnTitleIdx = headers.indexOf("vuln_title") !== -1
    ? headers.indexOf("vuln_title")
    : headers.indexOf("title") !== -1
    ? headers.indexOf("title")
    : -1;
  const categoryIdx = headers.indexOf("category") !== -1
    ? headers.indexOf("category")
    : headers.indexOf("sensitivity") !== -1
    ? headers.indexOf("sensitivity")
    : -1;
  const severityIdx = headers.indexOf("severity");
  const cvssIdx = headers.indexOf("cvss") !== -1
    ? headers.indexOf("cvss")
    : headers.indexOf("cvss score") !== -1
    ? headers.indexOf("cvss score")
    : -1;
  const statusIdx = headers.indexOf("status");
  const dateFoundIdx = headers.indexOf("date_found") !== -1
    ? headers.indexOf("date_found")
    : headers.indexOf("date") !== -1
    ? headers.indexOf("date")
    : -1;
  const slaIdx = headers.indexOf("sla_due");
  
  // Check for various email column names - find exact match or contains
  let emailIdx = -1;
  const emailVariations = ["email", "emails", "email_address", "contact", "e-mail"];
  
  for (let i = 0; i < headers.length; i++) {
    const headerLower = headers[i].toLowerCase().trim();
    if (emailVariations.some(variant => headerLower.includes(variant.toLowerCase()))) {
      emailIdx = i;
      break;
    }
  }

  // If no email column found by header name, try to detect by checking if values look like emails
  if (emailIdx === -1 && lines.length > 1) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let colIdx = 0; colIdx < parseCSVLine(lines[1]).length; colIdx++) {
      let emailCount = 0;
      // Check first 5 non-empty rows to see if they contain email addresses
      for (let row = 1; row < Math.min(lines.length, 6); row++) {
        const values = parseCSVLine(lines[row]);
        if (values.length > colIdx && emailRegex.test(values[colIdx].trim())) {
          emailCount++;
        }
      }
      // If at least 3 out of 5 rows have emails, this is likely the email column
      if (emailCount >= 3) {
        emailIdx = colIdx;
        console.log(`Auto-detected email column at index ${colIdx}`);
        break;
      }
    }
  }

  console.log("All headers found:", headers);
  console.log("Email column index:", emailIdx);
  if (emailIdx !== -1) {
    console.log("Found email column at index", emailIdx, "with header:", headers[emailIdx]);
  } else {
    console.log("WARNING: No email column found in headers!");
  }

  // If no domain_name or url found, we'll still try to parse emails if they exist
  if (domainNameIdx === -1 && emailIdx === -1) {
    throw new Error("CSV must contain either 'domain_name'/'url' column or 'email' column");
  }

  const companiesMap = new Map<string, Record<string, unknown>>();
  const vulnerabilities: Record<string, unknown>[] = [];
  const emailsMap = new Map<string, Record<string, unknown>>();

  // Parse data rows
  try {
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      // Only process if we have data and either a domain name or email
      const hasValidDomain = domainNameIdx !== -1 && values.length > domainNameIdx && values[domainNameIdx];
      const hasValidEmail = emailIdx !== -1 && values.length > emailIdx && values[emailIdx];

      if (!hasValidDomain && !hasValidEmail) {
        continue; // Skip rows with no domain and no email
      }

      let domainName = hasValidDomain ? values[domainNameIdx] : "Unknown Domain";
      
      // Extract just the domain from full URL (e.g., "https://example.com/admin" -> "example.com")
      if (domainName.includes("://")) {
        try {
          const urlObj = new URL(domainName);
          domainName = urlObj.hostname || domainName;
        } catch {
          // If URL parsing fails, use the original value
          console.warn("Could not parse URL:", domainName);
        }
      }
      
      const riskScore = riskScoreIdx !== -1 && values.length > riskScoreIdx ? parseFloat(values[riskScoreIdx]) : 0;
      const filesAnalyzed = filesAnalyzedIdx !== -1 && values.length > filesAnalyzedIdx ? parseInt(values[filesAnalyzedIdx]) : 0;

      // Add or update company in map (only if we have a valid domain)
      if (hasValidDomain && !companiesMap.has(domainName)) {
        companiesMap.set(domainName, {
          id: `c${Date.now()}_${companiesMap.size}`,
          name: domainName,
          url: domainUrlIdx !== -1 && values.length > domainUrlIdx ? values[domainUrlIdx] : undefined,
          environment: environmentIdx !== -1 && values.length > environmentIdx ? values[environmentIdx] : undefined,
          risk_score: isNaN(riskScore) ? 0 : riskScore,
          files_analyzed: isNaN(filesAnalyzed) ? 0 : filesAnalyzed,
        });
      }

      const company = companiesMap.get(domainName) || { id: `c${Date.now()}_${companiesMap.size}`, name: domainName };

      // Add vulnerability if vuln_id and vuln_title are present
      if (vulnIdIdx !== -1 && values.length > vulnIdIdx && values[vulnIdIdx]) {
        const cvssValue = cvssIdx !== -1 && values.length > cvssIdx ? parseFloat(values[cvssIdx]) : 0;
        const severityValue = severityIdx !== -1 && values.length > severityIdx ? values[severityIdx].toLowerCase() : "medium";

        vulnerabilities.push({
          id: values[vulnIdIdx],
          vuln_id: values[vulnIdIdx],
          title: vulnTitleIdx !== -1 && values.length > vulnTitleIdx ? values[vulnTitleIdx] : "",
          category: categoryIdx !== -1 && values.length > categoryIdx ? values[categoryIdx] : "vulnerability",
          severity: ["critical", "high", "medium", "low"].includes(severityValue) 
            ? severityValue 
            : "medium",
          cvss: isNaN(cvssValue) ? 0 : cvssValue,
          cvss_score: isNaN(cvssValue) ? 0 : cvssValue,
          status: statusIdx !== -1 && values.length > statusIdx ? values[statusIdx].toLowerCase() : "open",
          date_found: dateFoundIdx !== -1 && values.length > dateFoundIdx ? values[dateFoundIdx] : new Date().toISOString(),
          sla_due: slaIdx !== -1 && values.length > slaIdx ? values[slaIdx] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          company_id: company.id,
          company_name: company.name,
        });
      }

      // Add email if email column exists (independent of vulnerability or domain)
      if (hasValidEmail) {
        const emailAddress = values[emailIdx].trim();
        const emailId = `email-${i}-${emailAddress}`;
        
        console.log(`Row ${i} - Email found at index ${emailIdx}: ${emailAddress}`);
        
        if (!emailsMap.has(emailId)) {
          emailsMap.set(emailId, {
            id: emailId,
            from: emailAddress,
            subject: `${vulnTitleIdx !== -1 && values.length > vulnTitleIdx && values[vulnTitleIdx] ? values[vulnTitleIdx] : "Security Report"} - ${domainName}`,
            preview: `${categoryIdx !== -1 && values.length > categoryIdx && values[categoryIdx] ? values[categoryIdx] : "Security update"} for ${domainName}`,
            date: dateFoundIdx !== -1 && values.length > dateFoundIdx && values[dateFoundIdx] ? values[dateFoundIdx] : new Date().toISOString(),
            isRead: false,
            hasAttachment: true,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error parsing CSV rows:", error);
  }

  const parsedEmails = Array.from(emailsMap.values());
  console.log("=== CSV PARSING COMPLETED ===");
  console.log("Parsed emails:", parsedEmails);
  console.log("Total emails extracted:", emailsMap.size);
  console.log("Total vulnerabilities extracted:", vulnerabilities.length);
  console.log("Total companies extracted:", companiesMap.size);

  return {
    companies: Array.from(companiesMap.values()),
    vulnerabilities,
    emails: parsedEmails,
  };
};


