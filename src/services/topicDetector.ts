import { RSSItem } from "./rss";

export type TopicType = 
  | "ai_agent"
  | "ai_app_development"
  | "startup_accelerator"
  | "automation_system"
  | "web3_infrastructure"
  | "ux_ui_design"
  | "enterprise_digital_transformation"
  | "workforce_automation"
  | "ai_software"
  | "general";

export interface TopicBlueprint {
  topic: TopicType;
  h1: string;
  sections: string[];
  description: string;
}

/**
 * Detect the dominant topic from RSS item
 */
export function detectTopic(item: RSSItem): TopicType {
  const text = (item.title + " " + item.contentSnippet + " " + item.content).toLowerCase();
  
  // AI Agent detection
  if (text.includes("ai agent") || text.includes("autonomous agent") || 
      text.includes("agentic ai") || text.includes("ai agents") ||
      text.includes("deploy agents") || text.includes("agent deployment")) {
    return "ai_agent";
  }
  
  // Startup Accelerator detection
  if (text.includes("startup accelerator") || text.includes("accelerator program") ||
      text.includes("incubator") || text.includes("y combinator") ||
      text.includes("seed funding") || text.includes("early-stage funding")) {
    return "startup_accelerator";
  }
  
  // Web3 Infrastructure detection
  if (text.includes("web3") || text.includes("blockchain") || text.includes("crypto") ||
      text.includes("defi") || text.includes("nft") || text.includes("token") ||
      text.includes("decentralized") || text.includes("smart contract")) {
    return "web3_infrastructure";
  }
  
  // Automation System detection
  if (text.includes("workflow automation") || text.includes("process automation") ||
      text.includes("robotic process automation") || text.includes("rpa") ||
      text.includes("automation platform") || text.includes("automate workflows")) {
    return "automation_system";
  }
  
  // Workforce Automation detection
  if (text.includes("workforce automation") || text.includes("workplace automation") ||
      text.includes("employee automation") || text.includes("staff automation")) {
    return "workforce_automation";
  }
  
  // AI App Development detection
  if (text.includes("ai app") || text.includes("ai-powered app") ||
      text.includes("ai mobile app") || text.includes("ai application development") ||
      text.includes("build ai app") || text.includes("develop ai app")) {
    return "ai_app_development";
  }
  
  // UX/UI Design detection
  if (text.includes("ux design") || text.includes("ui design") ||
      text.includes("user experience") || text.includes("user interface") ||
      text.includes("design system") || text.includes("design thinking")) {
    return "ux_ui_design";
  }
  
  // Enterprise Digital Transformation detection
  if (text.includes("digital transformation") || text.includes("digital strategy") ||
      text.includes("enterprise transformation") || text.includes("digital initiative")) {
    return "enterprise_digital_transformation";
  }
  
  // AI Software detection
  if (text.includes("ai software") || text.includes("artificial intelligence software") ||
      text.includes("ai platform") || text.includes("ai solution")) {
    return "ai_software";
  }
  
  return "general";
}

/**
 * Get topic-specific blueprint with SEO-friendly headings
 */
export function getTopicBlueprint(topic: TopicType): TopicBlueprint {
  const blueprints: Record<TopicType, TopicBlueprint> = {
    ai_agent: {
      topic: "ai_agent",
      h1: "What Is an AI Agent? Definition, Benefits, Implementation, and Enterprise Applications",
      sections: [
        "What Is an AI Agent?",
        "How AI Agents Work: Perception, Decision Logic, and Execution Architecture",
        "Implementation Strategy for AI Agents: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs for AI Agents: Mitigation Strategies",
        "Decision Framework: How to Evaluate AI Agent Platforms and Deployment Approaches"
      ],
      description: "AI agent technology, architecture layers, enterprise deployment, system integration, governance, security, and trade-offs"
    },
    ai_app_development: {
      topic: "ai_app_development",
      h1: "AI App Development: Definition, Benefits, Implementation, and Best Practices",
      sections: [
        "What Is AI App Development?",
        "How AI App Development Works: APIs, Data Flow, and System Architecture",
        "Implementation Strategy for AI Apps: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in AI App Development: Mitigation Strategies",
        "Decision Framework: How to Evaluate AI App Development Tools and Approaches"
      ],
      description: "AI app development, architecture selection, system design, inference layers, model lifecycle, governance, and trade-offs"
    },
    startup_accelerator: {
      topic: "startup_accelerator",
      h1: "What Is a Startup Accelerator? Definition, Benefits, Implementation, and Program Structure",
      sections: [
        "What Is a Startup Accelerator?",
        "How Startup Accelerators Work: Funding Mechanics, Equity Structures, and Program Components",
        "Implementation Strategy for Startup Accelerators: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs for Startup Founders: Mitigation Strategies",
        "Decision Framework: How to Evaluate Startup Accelerator Programs and Approaches"
      ],
      description: "Startup accelerators, funding mechanics, ecosystem incentives, and strategic implications"
    },
    automation_system: {
      topic: "automation_system",
      h1: "Workflow Automation: Definition, Benefits, Implementation, and Enterprise Guide",
      sections: [
        "What Is Workflow Automation?",
        "How Workflow Automation Works: Orchestration, Event-Driven Patterns, and System Components",
        "Implementation Strategy for Workflow Automation: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in Workflow Automation: Mitigation Strategies",
        "Decision Framework: How to Evaluate Workflow Automation Tools and Approaches"
      ],
      description: "Workflow automation, orchestration architecture, integration patterns, cost-benefit analysis, governance, and risk management"
    },
    web3_infrastructure: {
      topic: "web3_infrastructure",
      h1: "Web3 Infrastructure: Definition, Benefits, Implementation, and Enterprise Applications",
      sections: [
        "What Is the Web3 Model?",
        "How Web3 Infrastructure Works: Blockchain Architecture, Smart Contracts, and System Components",
        "Implementation Strategy for Web3 Infrastructure: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in Web3 Infrastructure: Mitigation Strategies",
        "Decision Framework: How to Evaluate Web3 Infrastructure Tools and Approaches"
      ],
      description: "Web3 infrastructure, technology stack, token economics, regulatory concerns, and enterprise adoption"
    },
    ux_ui_design: {
      topic: "ux_ui_design",
      h1: "UX/UI Design: Definition, Benefits, Implementation, and Best Practices",
      sections: [
        "What Is UX/UI Design?",
        "How UX/UI Design Works: Design Systems, Component Libraries, and User Research Methods",
        "Implementation Strategy for UX/UI Design Systems: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in UX/UI Design: Mitigation Strategies",
        "Decision Framework: How to Evaluate UX/UI Design Tools and Approaches"
      ],
      description: "UX/UI design, design systems, user research, implementation strategies, and design ROI"
    },
    enterprise_digital_transformation: {
      topic: "enterprise_digital_transformation",
      h1: "Enterprise Digital Transformation: Definition, Benefits, Implementation, and Strategic Guide",
      sections: [
        "What Is Enterprise Digital Transformation?",
        "How Enterprise Digital Transformation Works: Technology Stack, Integration Patterns, and System Architecture",
        "Implementation Strategy for Digital Transformation: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in Digital Transformation: Mitigation Strategies",
        "Decision Framework: How to Evaluate Digital Transformation Tools and Approaches"
      ],
      description: "Enterprise digital transformation, strategic planning, technology stack, change management, and ROI"
    },
    workforce_automation: {
      topic: "workforce_automation",
      h1: "Workforce Automation: Definition, Benefits, Implementation, and Enterprise Guide",
      sections: [
        "What Is Workforce Automation?",
        "How Workforce Automation Works: Automation Technologies, Orchestration, and System Components",
        "Implementation Strategy for Workforce Automation: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in Workforce Automation: Mitigation Strategies",
        "Decision Framework: How to Evaluate Workforce Automation Tools and Approaches"
      ],
      description: "Workforce automation, technologies, implementation strategies, cost-benefit analysis, and trade-offs"
    },
    ai_software: {
      topic: "ai_software",
      h1: "AI Software: Definition, Benefits, Implementation, and Enterprise Applications",
      sections: [
        "What Is AI Software?",
        "How AI Software Works: Architecture, APIs, Data Flow, and System Components",
        "Implementation Strategy for AI Software: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs in AI Software: Mitigation Strategies",
        "Decision Framework: How to Evaluate AI Software Tools and Approaches"
      ],
      description: "AI software, architecture, implementation strategies, integration challenges, and enterprise use cases"
    },
    general: {
      topic: "general",
      h1: "Technology Innovation: Definition, Benefits, Implementation, and Strategic Applications",
      sections: [
        "What Is This Technology?",
        "How This Technology Works: Architecture, System Components, and Data Flow",
        "Implementation Strategy: Step-by-Step Guidance and Real Constraints",
        "Risks and Trade-Offs: Mitigation Strategies",
        "Decision Framework: How to Evaluate Tools and Approaches"
      ],
      description: "Technology innovation, architecture, implementation, benefits, and industry applications"
    }
  };
  
  return blueprints[topic];
}
