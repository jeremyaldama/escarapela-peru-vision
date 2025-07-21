import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, TrendingUp, Zap } from 'lucide-react';

interface DetectionResult {
  confidence: number;
  detected: boolean;
  timestamp: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetectionStatsProps {
  detections: DetectionResult[];
}

export const DetectionStats: React.FC<DetectionStatsProps> = ({ detections }) => {
  const totalDetections = detections.length;
  const successfulDetections = detections.filter(d => d.detected).length;
  const successRate = totalDetections > 0 ? (successfulDetections / totalDetections) * 100 : 0;
  const averageConfidence = detections.length > 0 
    ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length 
    : 0;
  
  const recentDetections = detections.slice(-5).reverse();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Detecciones</p>
              <p className="text-2xl font-bold text-white">{totalDetections}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-tech">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-white">{successRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-success">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Confianza Promedio</p>
              <p className="text-2xl font-bold text-white">{(averageConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Detectadas</p>
              <p className="text-2xl font-bold text-white">{successfulDetections}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Detections */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Detecciones Recientes
        </h3>
        
        {recentDetections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay detecciones aún</p>
            <p className="text-sm">Las detecciones aparecerán aquí cuando se procesen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDetections.map((detection, index) => (
              <div 
                key={`${detection.timestamp}-${index}`}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    detection.detected ? 'bg-detection-active' : 'bg-detection-inactive'
                  }`} />
                  <div>
                    <p className="font-medium">
                      {detection.detected ? 'Escarapela Detectada' : 'No Detectada'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(detection.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={detection.detected ? "default" : "outline"}
                    className={detection.detected ? 'bg-detection-active' : ''}
                  >
                    {(detection.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};