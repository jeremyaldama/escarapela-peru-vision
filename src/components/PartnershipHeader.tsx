import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, GraduationCap, Cloud, Sparkles } from 'lucide-react';

export const PartnershipHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute inset-0 bg-black/5"></div>
      
      <div className="relative px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Partnership badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
              <GraduationCap className="w-4 h-4 mr-2" />
              Universidad San Martín de Porres
            </Badge>
            <div className="text-white/60 text-2xl">×</div>
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
              <Cloud className="w-4 h-4 mr-2" />
              Huawei Cloud
            </Badge>
          </div>

          {/* Main title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Detección IA de
              <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Escarapela Peruana
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Tecnología de vanguardia que combina la investigación académica de USMP 
              con la inteligencia artificial de Huawei Cloud para el reconocimiento 
              automático de símbolos patrios del Perú.
            </p>
          </div>

          {/* Technology highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ModelArts AI
                </h3>
                <p className="text-white/70 text-sm">
                  Modelo entrenado con tecnología Huawei Cloud para detección precisa
                </p>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Investigación USMP
                </h3>
                <p className="text-white/70 text-sm">
                  Desarrollo académico y validación científica del modelo
                </p>
              </div>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tiempo Real
                </h3>
                <p className="text-white/70 text-sm">
                  Detección instantánea con procesamiento en la nube
                </p>
              </div>
            </Card>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};