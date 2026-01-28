import type { Request, Response } from "express";

const depthLevelInfo = {
  surface: {
    title: "Surface",
    color: "#22c55e",
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    description: "Operating with clarity and control",
  },
  thermocline: {
    title: "Thermocline",
    color: "#eab308",
    bgGradient: "linear-gradient(135deg, #713f12 0%, #854d0e 100%)",
    description: "Pressure starting to affect decisions",
  },
  deep_water: {
    title: "Deep Water",
    color: "#f97316",
    bgGradient: "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)",
    description: "Reactive mode - clarity compromised",
  },
  crush_depth: {
    title: "Crush Depth",
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
    description: "Critical pressure levels",
  },
};

export function generateOGImageSVG(params: {
  depthLevel: keyof typeof depthLevelInfo;
  score: number;
}): string {
  const info = depthLevelInfo[params.depthLevel];

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${info.bgGradient.match(/#[0-9a-f]{6}/gi)?.[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${info.bgGradient.match(/#[0-9a-f]{6}/gi)?.[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Wave pattern overlay -->
      <path d="M0,150 Q300,100 600,150 T1200,150 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.05)"/>
      <path d="M0,200 Q300,150 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.03)"/>
      
      <!-- Content -->
      <text x="600" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="300" fill="rgba(255,255,255,0.7)" text-anchor="middle">
        My Pressure Audit Result
      </text>
      
      <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="80" font-weight="700" fill="${info.color}" text-anchor="middle">
        ${info.title}
      </text>
      
      <text x="600" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="rgba(255,255,255,0.9)" text-anchor="middle">
        ${info.description}
      </text>
      
      <text x="600" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        Score: ${params.score}/125
      </text>
      
      <!-- Footer -->
      <text x="600" y="550" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="rgba(255,255,255,0.6)" text-anchor="middle">
        The Deep Brief · Clarity Under Pressure
      </text>
    </svg>
  `.trim();
}

export async function handleOGImageRequest(req: Request, res: Response) {
  const { depthLevel, score } = req.query;

  if (!depthLevel || !score) {
    return res.status(400).send("Missing required parameters: depthLevel, score");
  }

  const validDepthLevels = ["surface", "thermocline", "deep_water", "crush_depth"];
  if (!validDepthLevels.includes(depthLevel as string)) {
    return res.status(400).send("Invalid depth level");
  }

  const scoreNum = parseInt(score as string, 10);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 125) {
    return res.status(400).send("Invalid score");
  }

  const svg = generateOGImageSVG({
    depthLevel: depthLevel as keyof typeof depthLevelInfo,
    score: scoreNum,
  });

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(svg);
}
