import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Square, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface CameraFeedProps {
  onDetection?: (result: DetectionResult) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onDetection }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer rear camera for better detection
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCurrentStream(stream);
        setIsStreaming(true);
        toast.success('Cámara iniciada correctamente');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Error al acceder a la cámara. Verifique los permisos.');
    }
  };

  const stopCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    setIsStreaming(false);
    setIsDetecting(false);
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    toast.info('Cámara detenida');
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const callDetectionAPI = async (imageBase64: string): Promise<DetectionResult> => {
    // Simulated API call to Huawei ModelArts
    // In production, this would call the actual Huawei Cloud ModelArts endpoint
    const mockDetection = (): DetectionResult => {
      const detected = Math.random() > 0.7; // 30% chance of detection for demo
      return {
        confidence: detected ? 0.85 + Math.random() * 0.14 : Math.random() * 0.3,
        detected,
        timestamp: new Date().toISOString(),
        ...(detected && {
          boundingBox: {
            x: 100 + Math.random() * 200,
            y: 80 + Math.random() * 150,
            width: 150 + Math.random() * 100,
            height: 120 + Math.random() * 80
          }
        })
      };
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    return mockDetection();
  };

  const runDetection = async () => {
    if (!isStreaming || isDetecting) return;
    
    const frame = captureFrame();
    if (!frame) return;
    
    setIsDetecting(true);
    
    try {
      const result = await callDetectionAPI(frame);
      setLastDetection(result);
      onDetection?.(result);
      
      if (result.detected) {
        toast.success(`¡Escarapela detectada! Confianza: ${(result.confidence * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Detection error:', error);
      toast.error('Error en la detección. Reintentando...');
    } finally {
      setIsDetecting(false);
    }
  };

  const startContinuousDetection = () => {
    if (detectionInterval) return;
    
    const interval = setInterval(runDetection, 2000); // Detect every 2 seconds
    setDetectionInterval(interval);
    toast.info('Detección continua iniciada');
  };

  const stopContinuousDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
      toast.info('Detección continua detenida');
    }
  };

  useEffect(() => {
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [currentStream, detectionInterval]);

  return (
    <Card className="bg-card shadow-card border-0 overflow-hidden">
      <div className="relative bg-gradient-tech">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Detección de Escarapela
                </h3>
                <p className="text-white/80">
                  IA con Huawei Cloud ModelArts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lastDetection && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  lastDetection.detected 
                    ? 'bg-detection-active text-white' 
                    : 'bg-detection-inactive text-white'
                }`}>
                  {lastDetection.detected 
                    ? `Detectado ${(lastDetection.confidence * 100).toFixed(1)}%`
                    : 'No detectado'
                  }
                </div>
              )}
              
              {isDetecting && (
                <div className="flex items-center gap-2 px-3 py-2 bg-detection-processing text-white rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Analizando...</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            {isStreaming ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Detection overlay */}
                {lastDetection?.detected && lastDetection.boundingBox && (
                  <div 
                    className="absolute border-4 border-detection-active shadow-detection"
                    style={{
                      left: `${(lastDetection.boundingBox.x / 1280) * 100}%`,
                      top: `${(lastDetection.boundingBox.y / 720) * 100}%`,
                      width: `${(lastDetection.boundingBox.width / 1280) * 100}%`,
                      height: `${(lastDetection.boundingBox.height / 720) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-detection-active text-white px-2 py-1 rounded text-sm font-medium">
                      Escarapela {(lastDetection.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white/60">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Cámara no iniciada</p>
                  <p className="text-sm">Haga clic en "Iniciar Cámara" para comenzar</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {!isStreaming ? (
              <Button 
                onClick={startCamera}
                className="bg-white text-primary hover:bg-white/90"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Iniciar Cámara
              </Button>
            ) : (
              <>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Detener
                </Button>
                
                <Button 
                  onClick={runDetection}
                  disabled={isDetecting}
                  className="bg-white text-primary hover:bg-white/90"
                  size="lg"
                >
                  {isDetecting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 mr-2" />
                  )}
                  Detectar Ahora
                </Button>
                
                {!detectionInterval ? (
                  <Button 
                    onClick={startContinuousDetection}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    size="lg"
                  >
                    Auto Detectar
                  </Button>
                ) : (
                  <Button 
                    onClick={stopContinuousDetection}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    size="lg"
                  >
                    Detener Auto
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};