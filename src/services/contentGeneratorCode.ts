import { RSSItem } from "./rss";
import https from "https";
import http from "http";
import { URL } from "url";

/**
 * Extract main content from an article URL using basic HTML parsing.
 */
async function fetchArticleContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    client
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch article: ${response.statusCode}`));
          return;
        }

        let html = "";
        response.on("data", (chunk) => {
          html += chunk.toString();
        });

        response.on("end", () => {
          const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
          const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

          let content = articleMatch?.[1] || mainMatch?.[1] || contentMatch?.[1] || html;

          content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
          content = content.replace(/<style[\s\S]*?<\/style>/gi, "");

          const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
          const text = paragraphs
            .map((p) => p.replace(/<[^>]+>/g, " ").trim())
            .filter((t) => t.length > 50)
            .slice(0, 30)
            .join("\n\n");

          resolve(text || content.replace(/<[^>]+>/g, " ").slice(0, 5000));
        });
      })
      .on("error", reject);
  });
}

/**
 * Simple hash function for deterministic selection
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a clean definition paragraph for SEO with dynamic contextual sentence
 */
function generateDefinition(coreConcept: string, titleContext?: string): string {
  const article = /^[aeiou]/i.test(coreConcept) ? "an" : "a";
  const capitalized = coreConcept.charAt(0).toUpperCase() + coreConcept.slice(1);
  
  const definitions: Record<string, string> = {
    "ai agent": `${capitalized} is ${article} autonomous software system that can perform tasks, make decisions, and interact with users or other systems using artificial intelligence. These agents can understand natural language, process information, and execute actions based on their programming and learning capabilities. AI agent technology enables organizations to automate complex workflows and handle tasks that previously required human intervention.`,
    "startup accelerator": `${capitalized} is ${article} program designed to help early-stage companies grow rapidly through mentorship, funding, and networking opportunities. These programs provide structured support to help startups develop their products, reach customers, and scale their operations. The accelerator model has become a standard approach for supporting innovation and entrepreneurship in technology sectors.`,
    "ai software": `${capitalized} refers to applications and platforms that use artificial intelligence to automate tasks, analyze data, and provide intelligent insights. This technology enables businesses to improve efficiency, make data-driven decisions, and enhance user experiences through machine learning and automation. Organizations across industries are adopting AI software solutions to streamline operations and gain competitive advantages.`,
    "digital transformation": `${capitalized} is the process of integrating digital technology into all areas of a business to fundamentally change how it operates and delivers value to customers. This involves rethinking business models, processes, and customer engagement strategies using modern technology solutions. Successful digital transformation initiatives require strategic planning, organizational change, and investment in digital infrastructure.`,
    "workforce automation": `${capitalized} involves using technology to automate repetitive tasks and processes traditionally performed by human workers. This approach helps organizations improve efficiency, reduce errors, and allow employees to focus on more strategic and creative work. Automation technologies can handle routine operations while enabling human workers to concentrate on complex problem-solving and innovation.`,
  };
  
  const conceptLower = coreConcept.toLowerCase();
  const baseDefinition = definitions[conceptLower] || `${capitalized} is ${article} ${coreConcept} system or strategy used by organizations to improve efficiency, automate processes, and support decision-making through technology. It plays an increasingly important role in modern enterprise environments where digital transformation is accelerating.`;
  
  // Use titleContext to add topic-flavored sentence
  const context = (titleContext || "").toLowerCase();
  let contextLine = "";
  
  if (context.includes("finance") || context.includes("bank") || context.includes("insurance") || context.includes("financial")) {
    contextLine = `This is especially relevant in financial services, where automation and compliance requirements drive adoption.`;
  } else if (context.includes("health") || context.includes("hospital") || context.includes("medical")) {
    contextLine = `In healthcare, these systems are often used to reduce administrative load and improve service workflows.`;
  } else if (context.includes("retail") || context.includes("ecommerce") || context.includes("commerce")) {
    contextLine = `Retail and e-commerce organizations use these technologies to enhance customer experiences and optimize inventory management.`;
  } else if (context.includes("manufacturing") || context.includes("production") || context.includes("factory")) {
    contextLine = `Manufacturing companies leverage these systems to improve production efficiency and quality control processes.`;
  } else if (context.includes("education") || context.includes("school") || context.includes("university")) {
    contextLine = `Educational institutions are adopting these technologies to streamline administrative tasks and support learning outcomes.`;
  } else {
    contextLine = `Adoption is typically driven by the need to scale operations without scaling headcount at the same rate.`;
  }
  
  return `${baseDefinition} ${contextLine}`;
}

/**
 * Extract core concept from title/content
 */
function extractCoreConcept(title: string, content: string): string {
  const lower = (title + " " + content).toLowerCase();
  
  if (lower.includes("ai agent") || lower.includes("ai agents")) return "ai agent";
  if (lower.includes("startup accelerator") || lower.includes("accelerator")) return "startup accelerator";
  if (lower.includes("ai software")) return "ai software";
  if (lower.includes("digital transformation")) return "digital transformation";
  if (lower.includes("workforce automation") || lower.includes("workplace automation")) return "workforce automation";
  if (lower.includes("app development")) return "app development";
  
  return "technology";
}

/**
 * Classify paragraphs by meaning instead of slicing by index
 */
function groupParagraphs(paragraphs: string[]): {
  benefits: string[];
  implementation: string[];
  future: string[];
  general: string[];
} {
  const benefits: string[] = [];
  const implementation: string[] = [];
  const future: string[] = [];
  const general: string[] = [];

  paragraphs.forEach(p => {
    const lower = p.toLowerCase();

    if (lower.includes("benefit") || lower.includes("improve") || lower.includes("efficiency") || 
        lower.includes("advantage") || lower.includes("value") || lower.includes("impact")) {
      benefits.push(p);
    } else if (lower.includes("deploy") || lower.includes("implement") || lower.includes("integrat") ||
               lower.includes("adopt") || lower.includes("strategy") || lower.includes("approach")) {
      implementation.push(p);
    } else if (lower.includes("future") || lower.includes("trend") || lower.includes("outlook") ||
               lower.includes("evolve") || lower.includes("emerging")) {
      future.push(p);
    } else {
      general.push(p);
    }
  });

  return { benefits, implementation, future, general };
}

/**
 * Merge fallback content when a section is too thin
 */
function mergeIfThin(section: string[], fallback: string[]): string[] {
  const wordCount = section.join(" ").split(/\s+/).length;
  if (wordCount < 120 && fallback.length > 0) {
    return [...section, ...fallback.slice(0, 1)];
  }
  return section;
}

/**
 * Enforce minimum word count per section with multiple filler variants
 */
function ensureMinimumWords(section: string[], minWords = 150, coreConcept: string = "this technology", titleOrUrl: string = ""): string[] {
  let wordCount = section.join(" ").split(/\s+/).length;
  if (wordCount >= minWords) return section;

  // Multiple filler variants to avoid template footprint
  const fillers = [
    `Before scaling ${coreConcept}, teams should define clear success metrics and ownership for ongoing monitoring.`,
    `When adopting ${coreConcept}, integration constraints and data access rules often determine what is feasible in practice.`,
    `Scaling ${coreConcept} typically requires change management, documentation, and guardrails to prevent misuse.`,
    `For ${coreConcept} initiatives, start with one workflow, measure impact, then expand based on measurable outcomes.`,
    `Organizations evaluating ${coreConcept} should assess governance frameworks, integration complexity, and measurable operational outcomes before scaling deployment.`,
    `Successful ${coreConcept} deployment depends on aligning technology capabilities with business process requirements and user needs.`,
  ];
  
  // Deterministic selection based on title/URL hash (stable per article)
  const hash = simpleHash(titleOrUrl);
  const filler = fillers[hash % fillers.length];
  
  return section.concat(filler);
}

/**
 * Clean content: remove quotes and fix notation, but keep original structure
 */
function cleanContent(content: string): string {
  let cleaned = content;
  
  // Remove quote marks but keep content
  cleaned = cleaned.replace(/"([^"]{20,})"/g, '$1');
  cleaned = cleaned.replace(/'([^']{20,})'/g, '$1');
  
  // Remove attribution phrases
  cleaned = cleaned.replace(/\s+(said|says|according to|told|stated|quoted|in an interview|in a statement)\s*[.!?]/gi, '.');
  cleaned = cleaned.replace(/\([^)]*\b(said|says|according to|told|stated|quoted)\b[^)]*\)/gi, '');
  
  // Fix percentage notation [95) to (95%)
  cleaned = cleaned.replace(/\[(\d+)\)/g, '($1%)');
  
  // Remove incomplete sentences starting with "As" (standalone)
  cleaned = cleaned.replace(/^As\s+[^.!?]{0,60}\.\s*$/gm, '');
  
  // Remove standalone names/pronouns
  cleaned = cleaned.replace(/^\s*([A-Z][a-z]+|she|he|they|it)\s*\.\s*$/gm, '');
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  
  return cleaned;
}

/**
 * Generate SEO-friendly dynamic headings with improved H1
 */
function getDynamicHeadings(coreConcept: string): {
  h1: string;
  section1: string;
  section2: string;
  section3: string;
  section4: string;
} {
  const capitalized = coreConcept.charAt(0).toUpperCase() + coreConcept.slice(1);
  const conceptLower = coreConcept.toLowerCase();
  
  let h1: string;
  let section1: string;
  let section2: string;
  let section3: string;
  let section4: string;
  
  if (conceptLower.includes("ai agent")) {
    h1 = `${capitalized}: Definition, Benefits, Implementation, and Enterprise Applications`;
    section1 = "How AI Agents Work in Enterprise Environments";
    section2 = "Benefits and Applications of AI Agent Technology";
    section3 = "Implementation Strategies for AI Agents";
    section4 = "Future Outlook for AI Agent Adoption";
  } else if (conceptLower.includes("startup accelerator")) {
    h1 = `${capitalized}: Definition, Benefits, Implementation, and Program Structure`;
    section1 = "How Startup Accelerators Support Early-Stage Companies";
    section2 = "Key Benefits of Startup Accelerator Programs";
    section3 = "Evaluating Startup Accelerator Opportunities";
    section4 = "Impact of Accelerators on Innovation Ecosystems";
  } else if (conceptLower.includes("ai software")) {
    h1 = `${capitalized}: Definition, Benefits, Implementation, and Integration Guide`;
    section1 = "How AI Software Transforms Business Operations";
    section2 = "Key Benefits of AI Software Integration";
    section3 = "Implementation Best Practices for AI Software";
    section4 = "Future Trends in AI Software Development";
  } else {
    h1 = `${capitalized}: Definition, Benefits, Implementation, and Applications`;
    section1 = `How ${capitalized} Works`;
    section2 = `Benefits of ${capitalized}`;
    section3 = `Implementation Strategies for ${capitalized}`;
    section4 = `Future Outlook for ${capitalized}`;
  }
  
  return { h1, section1, section2, section3, section4 };
}

/**
 * Ensure paragraphs are 2-3 sentences minimum
 */
function ensureParagraphLength(paragraph: string): string {
  const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length < 2) {
    return paragraph; // Will be handled in grouping
  }
  
  if (sentences.length <= 3) {
    return sentences.join('. ') + '.';
  }
  
  return sentences.slice(0, 3).join('. ') + '.';
}

/**
 * Generate blog content from RSS item using code-based approach.
 * Creates structured industry summary with intentional SEO structure.
 */
export async function generateBlogContent(item: RSSItem): Promise<string> {
  console.log(`[Code] Generating blog for: ${item.title}`);

  try {
    const articleContent = await fetchArticleContent(item.link);
    const sourceContent = articleContent || item.contentSnippet || item.content || "";
    
    // Extract core concept for dynamic headings
    const coreConcept = extractCoreConcept(item.title, sourceContent);
    const headings = getDynamicHeadings(coreConcept);
    
    // Clean content (remove quotes, fix notation, but keep structure)
    let cleaned = cleanContent(sourceContent);
    
    // Split into paragraphs and ensure minimum length
    const paragraphs = cleaned.split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 50)
      .map(p => ensureParagraphLength(p))
      .filter(p => {
        // Remove incomplete sentences
        if (/^As\s+[^.!?]{0,60}\.\s*$/.test(p)) return false;
        if (/^([A-Z][a-z]+|she|he|they|it)\s*\.\s*$/.test(p)) return false;
        return true;
      });
    
    // Classify paragraphs by meaning (not by index)
    const grouped = groupParagraphs(paragraphs);
    
    // Generate proper definition with contextual sentence (using title)
    const definition = generateDefinition(coreConcept, item.title);
    
    // Prepare fallback content for thin sections
    const allGeneral = [...grouped.general, ...grouped.benefits.slice(3), ...grouped.implementation.slice(3), ...grouped.future.slice(2)];
    
    // Create stable hash for filler selection (use title + URL)
    const titleOrUrl = item.title + item.link;
    
    // Structure sections with minimum word count and merge if thin
    let section1Content = grouped.general.slice(0, 2).length > 0 ? grouped.general.slice(0, 2) : [];
    section1Content = mergeIfThin(section1Content, allGeneral);
    section1Content = ensureMinimumWords(section1Content, 150, coreConcept, titleOrUrl);
    
    let section2Content = grouped.benefits.slice(0, 3);
    section2Content = mergeIfThin(section2Content, allGeneral);
    section2Content = ensureMinimumWords(section2Content, 150, coreConcept, titleOrUrl);
    
    let section3Content = grouped.implementation.slice(0, 3);
    section3Content = mergeIfThin(section3Content, allGeneral);
    section3Content = ensureMinimumWords(section3Content, 150, coreConcept, titleOrUrl);
    
    let section4Content = grouped.future.length > 0 ? grouped.future.slice(0, 2) : grouped.general.slice(2, 4);
    section4Content = mergeIfThin(section4Content, allGeneral);
    section4Content = ensureMinimumWords(section4Content, 150, coreConcept, titleOrUrl);
    
    // Build blog structure - definition goes directly under H1
    const blogSections: string[] = [
      `# ${headings.h1}`,
      "",
      definition,
      "",
      `## ${headings.section1}`,
      ...section1Content.filter(p => p.length > 0),
      "",
      `## ${headings.section2}`,
      ...section2Content.filter(p => p.length > 0),
      "",
      `## ${headings.section3}`,
      ...section3Content.filter(p => p.length > 0),
      "",
      `## ${headings.section4}`,
      ...section4Content.filter(p => p.length > 0),
    ];

    const blogContent = blogSections.join("\n\n");
    const wordCount = blogContent.split(/\s+/).length;

    console.log(`[Code] Generated ${wordCount} words from source content.`);
    return blogContent;
  } catch (error: any) {
    console.warn(`[Code] Failed to fetch article content, using RSS snippet: ${error.message}`);
    
    const fallbackContent = item.contentSnippet || item.content || item.title;
    const coreConcept = extractCoreConcept(item.title, fallbackContent);
    const headings = getDynamicHeadings(coreConcept);
    const definition = generateDefinition(coreConcept, item.title);
    
    return `# ${headings.h1}\n\n${definition}\n\n## ${headings.section1}\n\nThis technology offers significant benefits for organizations seeking to improve efficiency and automate processes. Understanding these advantages is essential for businesses navigating digital transformation.\n\n## ${headings.section2}\n\nOrganizations should evaluate how these technologies can be integrated into their existing workflows and processes. Implementation requires strategic planning and careful consideration of governance and scalability.\n\n## ${headings.section3}\n\nThe future of technology continues to evolve, presenting new opportunities for businesses willing to adapt and innovate. Staying informed about emerging trends is crucial for long-term success.`;
  }
}
