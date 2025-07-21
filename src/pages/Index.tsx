import React, { useState } from 'react';
import { PartnershipHeader } from '@/components/PartnershipHeader';
import { CameraFeed } from '@/components/CameraFeed';
import { DetectionStats } from '@/components/DetectionStats';

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

const Index = () => {
  const [detections, setDetections] = useState<DetectionResult[]>([]);

  const handleDetection = (result: DetectionResult) => {
    setDetections(prev => [...prev, result]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Partnership Header */}
      <PartnershipHeader />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Camera Feed - Takes 2 columns */}
          <div className="xl:col-span-2">
            <CameraFeed onDetection={handleDetection} />
          </div>
          
          {/* Detection Stats - Takes 1 column */}
          <div className="xl:col-span-1">
            <DetectionStats detections={detections} />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Tecnología de Vanguardia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  Universidad San Martín de Porres
                </h3>
                <p className="text-muted-foreground">
                  Líder en investigación e innovación tecnológica en el Perú. 
                  La USMP desarrolla soluciones de inteligencia artificial 
                  aplicadas al reconocimiento de patrimonio cultural peruano.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Investigación en Computer Vision</li>
                  <li>• Desarrollo de modelos de IA especializados</li>
                  <li>• Validación académica y científica</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-secondary">
                  Huawei Cloud
                </h3>
                <p className="text-muted-foreground">
                  Plataforma líder mundial en servicios de nube e inteligencia artificial. 
                  ModelArts proporciona la infraestructura y herramientas necesarias 
                  para entrenar y desplegar modelos de IA a escala industrial.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Procesamiento en tiempo real</li>
                  <li>• Escalabilidad automática</li>
                  <li>• APIs de alta disponibilidad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
