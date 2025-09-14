import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Grid, Palette, Sparkles } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface KolamPath {
  points: Point[];
  color: string;
  thickness: number;
  delay: number;
  type: 'line' | 'curve' | 'dot' | 'fill';
}

interface KolamPattern {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  dotSpacing: number;
  paths: KolamPath[];
  background: string;
}

const Kolam: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [currentPath, setCurrentPath] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  
  // Enhanced helper functions for realistic kolam patterns
  function generateDotGrid(size: number, spacing: number, centerX: number, centerY: number): Point[] {
    const dots: Point[] = [];
    const startX = centerX - (size - 1) * spacing / 2;
    const startY = centerY - (size - 1) * spacing / 2;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        dots.push({
          x: startX + col * spacing,
          y: startY + row * spacing
        });
      }
    }
    return dots;
  }

  // Generate complete lotus flower with detailed petals
  function generateCompleteFlower(centerX: number, centerY: number, size: number = 1): KolamPath[] {
    const paths: KolamPath[] = [];
    const baseRadius = 25 * size;
    
    // Outer petals (8 petals)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const petalPoints: Point[] = [];
      
      // Create realistic petal shape
      for (let t = 0; t <= 1; t += 0.05) {
        const petalRadius = baseRadius * (0.8 + 0.6 * Math.sin(t * Math.PI));
        const x = centerX + petalRadius * Math.cos(angle) * t;
        const y = centerY + petalRadius * Math.sin(angle) * t;
        petalPoints.push({ x, y });
      }
      
      // Return stroke for petal
      for (let t = 1; t >= 0; t -= 0.05) {
        const petalRadius = baseRadius * (0.8 + 0.6 * Math.sin(t * Math.PI));
        const sideAngle = angle + 0.3;
        const x = centerX + petalRadius * Math.cos(sideAngle) * t;
        const y = centerY + petalRadius * Math.sin(sideAngle) * t;
        petalPoints.push({ x, y });
      }
      
      paths.push({
        points: petalPoints,
        color: i % 2 === 0 ? '#FF69B4' : '#FF1493',
        thickness: 3,
        delay: 1000 + i * 200,
        type: 'curve'
      });
    }
    
    // Inner petals (4 petals)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const petalPoints: Point[] = [];
      
      for (let t = 0; t <= 1; t += 0.1) {
        const petalRadius = baseRadius * 0.6 * (0.5 + 0.8 * Math.sin(t * Math.PI));
        const x = centerX + petalRadius * Math.cos(angle) * t;
        const y = centerY + petalRadius * Math.sin(angle) * t;
        petalPoints.push({ x, y });
      }
      
      for (let t = 1; t >= 0; t -= 0.1) {
        const petalRadius = baseRadius * 0.6 * (0.5 + 0.8 * Math.sin(t * Math.PI));
        const sideAngle = angle + 0.4;
        const x = centerX + petalRadius * Math.cos(sideAngle) * t;
        const y = centerY + petalRadius * Math.sin(sideAngle) * t;
        petalPoints.push({ x, y });
      }
      
      paths.push({
        points: petalPoints,
        color: '#FFD700',
        thickness: 2.5,
        delay: 2600 + i * 150,
        type: 'curve'
      });
    }
    
    // Center circle
    const centerPoints: Point[] = [];
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      centerPoints.push({
        x: centerX + (baseRadius * 0.3) * Math.cos(angle),
        y: centerY + (baseRadius * 0.3) * Math.sin(angle)
      });
    }
    
    paths.push({
      points: centerPoints,
      color: '#FF4500',
      thickness: 2,
      delay: 3200,
      type: 'curve'
    });
    
    return paths;
  }

  // Generate intricate vine patterns
  function generateVinePattern(startX: number, startY: number, endX: number, endY: number, complexity: number = 5): Point[] {
    const points: Point[] = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      
      // Add vine curves
      const waveX = Math.sin(t * Math.PI * complexity) * 15;
      const waveY = Math.cos(t * Math.PI * complexity * 1.5) * 10;
      
      points.push({
        x: baseX + waveX,
        y: baseY + waveY
      });
    }
    
    return points;
  }

  // Generate detailed leaf patterns
  function generateLeaf(centerX: number, centerY: number, angle: number, size: number = 1): Point[] {
    const points: Point[] = [];
    const length = 20 * size;
    const width = 12 * size;
    
    // Leaf outline
    for (let t = 0; t <= 1; t += 0.05) {
      const leafLength = length * t;
      const leafWidth = width * Math.sin(t * Math.PI) * 0.8;
      
      const x1 = centerX + leafLength * Math.cos(angle) + leafWidth * Math.cos(angle + Math.PI/2);
      const y1 = centerY + leafLength * Math.sin(angle) + leafWidth * Math.sin(angle + Math.PI/2);
      points.push({ x: x1, y: y1 });
    }
    
    // Return path
    for (let t = 1; t >= 0; t -= 0.05) {
      const leafLength = length * t;
      const leafWidth = width * Math.sin(t * Math.PI) * 0.8;
      
      const x2 = centerX + leafLength * Math.cos(angle) - leafWidth * Math.cos(angle + Math.PI/2);
      const y2 = centerY + leafLength * Math.sin(angle) - leafWidth * Math.sin(angle + Math.PI/2);
      points.push({ x: x2, y: y2 });
    }
    
    return points;
  }

  // Generate peacock with detailed feathers
  function generateDetailedPeacock(centerX: number, centerY: number): KolamPath[] {
    const paths: KolamPath[] = [];
    
    // Peacock body
    const bodyPoints: Point[] = [
      { x: centerX, y: centerY + 20 },
      { x: centerX + 12, y: centerY + 15 },
      { x: centerX + 18, y: centerY },
      { x: centerX + 15, y: centerY - 15 },
      { x: centerX + 8, y: centerY - 25 },
      { x: centerX, y: centerY - 30 },
      { x: centerX - 8, y: centerY - 25 },
      { x: centerX - 15, y: centerY - 15 },
      { x: centerX - 18, y: centerY },
      { x: centerX - 12, y: centerY + 15 },
      { x: centerX, y: centerY + 20 }
    ];
    
    paths.push({
      points: bodyPoints,
      color: '#4169E1',
      thickness: 3,
      delay: 500,
      type: 'curve'
    });
    
    // Neck and head
    const neckPoints: Point[] = [
      { x: centerX, y: centerY - 30 },
      { x: centerX + 5, y: centerY - 40 },
      { x: centerX + 8, y: centerY - 50 },
      { x: centerX + 6, y: centerY - 60 },
      { x: centerX, y: centerY - 65 },
      { x: centerX - 6, y: centerY - 60 },
      { x: centerX - 4, y: centerY - 50 }
    ];
    
    paths.push({
      points: neckPoints,
      color: '#00CED1',
      thickness: 2.5,
      delay: 800,
      type: 'curve'
    });
    
    // Crown feathers
    for (let i = 0; i < 5; i++) {
      const featherPoints: Point[] = [
        { x: centerX + (i - 2) * 6, y: centerY - 65 },
        { x: centerX + (i - 2) * 8, y: centerY - 75 },
        { x: centerX + (i - 2) * 6, y: centerY - 85 }
      ];
      
      paths.push({
        points: featherPoints,
        color: '#FFD700',
        thickness: 2,
        delay: 1100 + i * 100,
        type: 'curve'
      });
    }
    
    // Detailed tail feathers
    for (let i = 0; i < 15; i++) {
      const angle = (i - 7) * Math.PI / 20;
      const featherLength = 70 + i * 2;
      
      // Feather stem
      const stemPoints: Point[] = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const x = centerX + featherLength * Math.sin(angle) * t;
        const y = centerY + 25 + featherLength * Math.cos(angle) * t;
        stemPoints.push({ x, y });
      }
      
      paths.push({
        points: stemPoints,
        color: '#32CD32',
        thickness: 1.5,
        delay: 1600 + i * 80,
        type: 'line'
      });
      
      // Feather eye
      const eyeX = centerX + featherLength * Math.sin(angle);
      const eyeY = centerY + 25 + featherLength * Math.cos(angle);
      
      const eyePoints: Point[] = [];
      for (let angle2 = 0; angle2 <= Math.PI * 2; angle2 += 0.2) {
        eyePoints.push({
          x: eyeX + 8 * Math.cos(angle2),
          y: eyeY + 8 * Math.sin(angle2)
        });
      }
      
      paths.push({
        points: eyePoints,
        color: i % 3 === 0 ? '#FF69B4' : i % 3 === 1 ? '#FFD700' : '#FF4500',
        thickness: 2,
        delay: 1800 + i * 80,
        type: 'curve'
      });
    }
    
    return paths;
  }

  // Generate decorative border with intricate patterns
  function generateIntricateBorder(centerX: number, centerY: number, radius: number): KolamPath[] {
    const paths: KolamPath[] = [];
    
    // Outer decorative circle
    const outerPoints: Point[] = [];
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
      const r = radius + 20 * Math.sin(angle * 8);
      outerPoints.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      });
    }
    
    paths.push({
      points: outerPoints,
      color: '#32CD32',
      thickness: 3,
      delay: 4000,
      type: 'curve'
    });
    
    // Inner decorative elements
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const decorX = centerX + radius * 0.9 * Math.cos(angle);
      const decorY = centerY + radius * 0.9 * Math.sin(angle);
      
      // Small decorative flowers
      const flowerPoints: Point[] = [];
      for (let petals = 0; petals < 6; petals++) {
        const petalAngle = (petals * Math.PI) / 3;
        const px = decorX + 8 * Math.cos(petalAngle);
        const py = decorY + 8 * Math.sin(petalAngle);
        flowerPoints.push({ x: px, y: py });
        
        if (petals === 0) {
          flowerPoints.push({ x: decorX, y: decorY });
        }
      }
      
      paths.push({
        points: flowerPoints,
        color: '#FF69B4',
        thickness: 2,
        delay: 4200 + i * 100,
        type: 'curve'
      });
    }
    
    return paths;
  }

  // Authentic Kolam patterns with complete designs
  const kolamPatterns: KolamPattern[] = [
    {
      id: 'complete-lotus-mandala',
      name: 'Complete Lotus Mandala',
      description: 'Intricate lotus mandala with detailed petals and decorative borders',
      gridSize: 17,
      dotSpacing: 18,
      background: '#4A2C2A',
      paths: [
        // Dot grid foundation
        {
          points: generateDotGrid(17, 18, 225, 225),
          color: '#FFFFFF',
          thickness: 2,
          delay: 0,
          type: 'dot'
        },
        // Central lotus flower with all details
        ...generateCompleteFlower(225, 225, 1),
        // Surrounding smaller flowers
        ...generateCompleteFlower(225, 150, 0.5),
        ...generateCompleteFlower(300, 225, 0.5),
        ...generateCompleteFlower(225, 300, 0.5),
        ...generateCompleteFlower(150, 225, 0.5),
        // Connecting vine patterns
        {
          points: generateVinePattern(225, 175, 225, 125, 3),
          color: '#32CD32',
          thickness: 2,
          delay: 3500,
          type: 'curve'
        },
        {
          points: generateVinePattern(250, 225, 325, 225, 3),
          color: '#32CD32',
          thickness: 2,
          delay: 3600,
          type: 'curve'
        },
        {
          points: generateVinePattern(225, 275, 225, 325, 3),
          color: '#32CD32',
          thickness: 2,
          delay: 3700,
          type: 'curve'
        },
        {
          points: generateVinePattern(200, 225, 125, 225, 3),
          color: '#32CD32',
          thickness: 2,
          delay: 3800,
          type: 'curve'
        },
        // Decorative leaves
        ...Array.from({ length: 16 }, (_, i) => {
          const angle = (i * Math.PI) / 8;
          const leafX = 225 + 85 * Math.cos(angle);
          const leafY = 225 + 85 * Math.sin(angle);
          return {
            points: generateLeaf(leafX, leafY, angle + Math.PI / 2, 0.8),
            color: '#228B22',
            thickness: 1.5,
            delay: 3900 + i * 50,
            type: 'curve' as const
          };
        }),
        // Intricate border
        ...generateIntricateBorder(225, 225, 130)
      ]
    },
    {
      id: 'detailed-peacock-kolam',
      name: 'Detailed Peacock Kolam',
      description: 'Complete peacock design with intricate feathers and decorative elements',
      gridSize: 19,
      dotSpacing: 16,
      background: '#2F2F2F',
      paths: [
        // Dot grid
        {
          points: generateDotGrid(19, 16, 225, 225),
          color: '#FFFFFF',
          thickness: 1.5,
          delay: 0,
          type: 'dot'
        },
        // Detailed peacock
        ...generateDetailedPeacock(225, 240),
        // Surrounding lotus flowers
        ...generateCompleteFlower(150, 180, 0.4),
        ...generateCompleteFlower(300, 180, 0.4),
        ...generateCompleteFlower(150, 320, 0.4),
        ...generateCompleteFlower(300, 320, 0.4),
        // Decorative corners
        {
          points: generateVinePattern(100, 100, 150, 150, 4),
          color: '#32CD32',
          thickness: 2,
          delay: 4000,
          type: 'curve'
        },
        {
          points: generateVinePattern(350, 100, 300, 150, 4),
          color: '#32CD32',
          thickness: 2,
          delay: 4100,
          type: 'curve'
        },
        {
          points: generateVinePattern(350, 350, 300, 300, 4),
          color: '#32CD32',
          thickness: 2,
          delay: 4200,
          type: 'curve'
        },
        {
          points: generateVinePattern(100, 350, 150, 300, 4),
          color: '#32CD32',
          thickness: 2,
          delay: 4300,
          type: 'curve'
        }
      ]
    },
    {
      id: 'traditional-rangoli',
      name: 'Traditional Rangoli Pattern',
      description: 'Complete traditional rangoli with geometric patterns and floral motifs',
      gridSize: 21,
      dotSpacing: 14,
      background: '#3D2914',
      paths: [
        // Comprehensive dot grid
        {
          points: generateDotGrid(21, 14, 225, 225),
          color: '#FFFFFF',
          thickness: 1.5,
          delay: 0,
          type: 'dot'
        },
        // Central star pattern
        ...Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4;
          const starPoints: Point[] = [];
          
          // Create 8-pointed star
          for (let j = 0; j < 3; j++) {
            const radius = 30 + j * 15;
            starPoints.push({
              x: 225 + radius * Math.cos(angle),
              y: 225 + radius * Math.sin(angle)
            });
          }
          
          return {
            points: starPoints,
            color: i % 2 === 0 ? '#FFD700' : '#FF69B4',
            thickness: 2.5,
            delay: 500 + i * 100,
            type: 'line' as const
          };
        }),
        // Concentric decorative circles
        ...Array.from({ length: 4 }, (_, level) => {
          const radius = 60 + level * 25;
          const circlePoints: Point[] = [];
          
          for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
            const variation = 5 * Math.sin(angle * (8 + level * 2));
            circlePoints.push({
              x: 225 + (radius + variation) * Math.cos(angle),
              y: 225 + (radius + variation) * Math.sin(angle)
            });
          }
          
          return {
            points: circlePoints,
            color: level % 2 === 0 ? '#32CD32' : '#FF4500',
            thickness: 2,
            delay: 1300 + level * 200,
            type: 'curve' as const
          };
        }),
        // Corner lotus flowers
        ...generateCompleteFlower(120, 120, 0.6),
        ...generateCompleteFlower(330, 120, 0.6),
        ...generateCompleteFlower(330, 330, 0.6),
        ...generateCompleteFlower(120, 330, 0.6),
        // Connecting patterns
        {
          points: generateVinePattern(225, 80, 225, 120, 5),
          color: '#FF1493',
          thickness: 2,
          delay: 3000,
          type: 'curve'
        },
        {
          points: generateVinePattern(370, 225, 330, 225, 5),
          color: '#FF1493',
          thickness: 2,
          delay: 3150,
          type: 'curve'
        },
        {
          points: generateVinePattern(225, 370, 225, 330, 5),
          color: '#FF1493',
          thickness: 2,
          delay: 3300,
          type: 'curve'
        },
        {
          points: generateVinePattern(80, 225, 120, 225, 5),
          color: '#FF1493',
          thickness: 2,
          delay: 3450,
          type: 'curve'
        }
      ]
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced background with realistic texture
    ctx.fillStyle = kolamPatterns[currentPattern].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // More realistic ground texture
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3;
      const brightness = Math.random() * 100 + 100;
      ctx.fillStyle = `rgb(${brightness}, ${brightness - 20}, ${brightness - 40})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Add subtle highlights
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

  }, [currentPattern]);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pattern = kolamPatterns[currentPattern];
    const path = pattern.paths[currentPath];

    if (!path) return;

    const drawElement = () => {
      if (path.type === 'dot') {
        // Enhanced dot drawing with realistic powder effects
        path.points.forEach((point, index) => {
          setTimeout(() => {
            ctx.fillStyle = path.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = path.color;
            
            // Main dot with slight variation
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2 + Math.random() * 0.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Enhanced powder scatter effect
            for (let i = 0; i < 6; i++) {
              const offsetX = (Math.random() - 0.5) * 8;
              const offsetY = (Math.random() - 0.5) * 8;
              const alpha = 0.2 + Math.random() * 0.5;
              const size = 0.3 + Math.random() * 1.2;
              
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(point.x + offsetX, point.y + offsetY, size, 0, 2 * Math.PI);
              ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          }, index * (15 / animationSpeed));
        });
        
        setTimeout(() => {
          setCurrentPath(prev => prev + 1);
          setCurrentPoint(0);
        }, path.points.length * (15 / animationSpeed));
        return;
      }

      if (currentPoint >= path.points.length - 1) {
        setCurrentPath(prev => {
          if (prev >= pattern.paths.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          setCurrentPoint(0);
          return prev + 1;
        });
        return;
      }

      // Enhanced drawing with more realistic effects
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = path.color;

      if (currentPoint === 0) {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
      } else {
        ctx.beginPath();
        ctx.moveTo(path.points[currentPoint - 1].x, path.points[currentPoint - 1].y);
        
        if (path.type === 'curve') {
          // Smoother curves for better visual appeal
          const prev = path.points[currentPoint - 1];
          const curr = path.points[currentPoint];
          const next = path.points[Math.min(currentPoint + 1, path.points.length - 1)];
          
          const cp1x = prev.x + (curr.x - prev.x) * 0.3;
          const cp1y = prev.y + (curr.y - prev.y) * 0.3;
          const cp2x = curr.x - (next.x - curr.x) * 0.3;
          const cp2y = curr.y - (next.y - curr.y) * 0.3;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
        } else {
          ctx.lineTo(path.points[currentPoint].x, path.points[currentPoint].y);
        }
        
        ctx.stroke();

        // Enhanced powder particles
        const currentPoint2 = path.points[currentPoint];
        for (let i = 0; i < 4; i++) {
          const offsetX = (Math.random() - 0.5) * 5;
          const offsetY = (Math.random() - 0.5) * 5;
          const size = 0.4 + Math.random() * 1.8;
          const alpha = 0.15 + Math.random() * 0.6;
          
          ctx.globalAlpha = alpha;
          ctx.fillStyle = path.color;
          ctx.beginPath();
          ctx.arc(currentPoint2.x + offsetX, currentPoint2.y + offsetY, size, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Add rice flour texture lines
        if (Math.random() < 0.4) {
          ctx.strokeStyle = path.color;
          ctx.lineWidth = 0.3;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          const angle = Math.random() * Math.PI;
          ctx.moveTo(currentPoint2.x - 3 * Math.cos(angle), currentPoint2.y - 3 * Math.sin(angle));
          ctx.lineTo(currentPoint2.x + 3 * Math.cos(angle), currentPoint2.y + 3 * Math.sin(angle));
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      ctx.shadowBlur = 0;
      setCurrentPoint(prev => prev + 1);
    };

    const timer = setTimeout(drawElement, Math.max(15, 80 / animationSpeed));
    return () => clearTimeout(timer);
  }, [isPlaying, currentPath, currentPoint, currentPattern, animationSpeed]);

  const startAnimation = () => {
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentPath(0);
    setCurrentPoint(0);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = kolamPatterns[currentPattern].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const nextPattern = () => {
    setCurrentPattern(prev => (prev + 1) % kolamPatterns.length);
    resetAnimation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-amber-600" size={36} />
            Interactive Kolam Pattern Animator
            <Sparkles className="text-amber-600" size={36} />
          </h1>
          <p className="text-amber-700 text-lg">
            Experience the ancient art of South Indian floor patterns coming to life
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-amber-200">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={450}
                  className="border-2 border-amber-300 rounded-xl shadow-inner mx-auto block"
                  style={{ background: kolamPatterns[currentPattern].background }}
                />
                
                {/* Progress Indicator */}
                <div className="mt-4 bg-amber-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm text-amber-700 mb-2">
                    <span>Drawing Progress</span>
                    <span>{Math.round((currentPath / kolamPatterns[currentPattern].paths.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentPath / kolamPatterns[currentPattern].paths.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Pattern Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Grid className="text-amber-600" size={20} />
                Current Pattern
              </h3>
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-800">
                  {kolamPatterns[currentPattern].name}
                </h4>
                <p className="text-amber-700 text-sm">
                  {kolamPatterns[currentPattern].description}
                </p>
                <div className="flex justify-between text-xs text-amber-600">
                  <span>Grid: {kolamPatterns[currentPattern].gridSize}×{kolamPatterns[currentPattern].gridSize}</span>
                  <span>Elements: {kolamPatterns[currentPattern].paths.length}</span>
                </div>
              </div>
            </div>

            {/* Animation Controls */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Palette className="text-amber-600" size={20} />
                Animation Controls
              </h3>
              
              <div className="space-y-4">
                {/* Play/Pause/Reset Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={isPlaying ? pauseAnimation : startAnimation}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  
                  <button
                    onClick={resetAnimation}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>

                {/* Speed Control */}
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Animation Speed: {animationSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Pattern Selector */}
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">
                    Select Pattern
                  </label>
                  <select
                    value={currentPattern}
                    onChange={(e) => {
                      setCurrentPattern(parseInt(e.target.value));
                      resetAnimation();
                    }}
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
                  >
                    {kolamPatterns.map((pattern, index) => (
                      <option key={pattern.id} value={index}>
                        {pattern.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Next Pattern Button */}
                <button
                  onClick={nextPattern}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Grid size={18} />
                  Next Pattern
                </button>
              </div>
            </div>

            {/* About Kolam */}
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-amber-900 mb-3">About Kolam</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                Kolam is a traditional South Indian art form where intricate patterns are drawn on the ground using rice flour. 
                These beautiful designs are typically created at dawn in front of homes, symbolizing prosperity and welcoming guests. 
                Each pattern tells a story and connects the artist with ancient cultural traditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f59e0b, #ea580c);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f59e0b, #ea580c);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Kolam;