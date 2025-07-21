import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Square, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

const BACKEND_URL = "http://localhost:8000";

export const CameraFeed: React.FC<CameraFeedProps> = ({ onDetection }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(
    null
  );
  const [detectionInterval, setDetectionInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // This function now calls your backend proxy to get the token.
  const getAuthToken = async () => {
    const tokenUrl = `${BACKEND_URL}/auth/token`;

    try {
      const response = await fetch(tokenUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to get auth token from backend:", errorText);
        toast.error("Error de autenticación con el servidor.");
        return;
      }

      const data = await response.json();
      if (data.token) {
        setAuthToken(data.token);
        toast.success("Autenticación con el servidor exitosa.");
      } else {
        console.error("Token not found in backend response");
        toast.error("No se pudo obtener el token de autenticación.");
      }
    } catch (error) {
      console.error("Error fetching auth token from backend:", error);
      toast.error("Error de red al intentar autenticar con el servidor.");
    }
  };

  useEffect(() => {
    getAuthToken();
  }, []);

  const startCamera = async () => {
    setUploadedImage(null); // Clear any uploaded image
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Prefer rear camera for better detection
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for metadata to load to get correct video dimensions
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setMediaDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
          }
        };
        setCurrentStream(stream);
        setIsStreaming(true);
        toast.success("Cámara iniciada correctamente");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Error al acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      setCurrentStream(null);
    }
    setIsStreaming(false);
    setIsDetecting(false);
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    toast.info("Cámara detenida");
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // This function now calls your backend proxy for detection.
  const callDetectionAPI = async (
    imageBase64: string
  ): Promise<DetectionResult> => {
    if (!authToken) {
      toast.error(
        "Token de autenticación no disponible. Intentando de nuevo..."
      );
      await getAuthToken(); // Attempt to re-authenticate
      throw new Error("Authentication token is not available.");
    }

    const apiUrl = `${BACKEND_URL}/detect`;

    // Convert base64 data URL to a Blob
    const fetchRes = await fetch(imageBase64);
    const blob = await fetchRes.blob();

    // Create a FormData object to send as multipart/form-data
    const formData = new FormData();
    formData.append("image", blob, "detection-image.jpg");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        // 'Content-Type' is not set, the browser will automatically set it
        // to 'multipart/form-data' with the correct boundary.
        "X-Auth-Token": authToken,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response from backend:", errorBody);
      throw new Error(
        `API call to backend failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Detection API Response from backend:", data);
    // Assuming the target class is 'patriota'
    const patriotaResultIndex = data.detection_classes?.indexOf("patriota");

    if (
      patriotaResultIndex !== -1 &&
      data.detection_boxes &&
      data.detection_scores
    ) {
      const box = data.detection_boxes[patriotaResultIndex];
      const confidence = data.detection_scores[patriotaResultIndex];

      // The new response provides absolute coordinates: [y_min, x_min, y_max, x_max]
      const [y_min, x_min, y_max, x_max] = box;

      return {
        detected: true,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        boundingBox: {
          x: x_min,
          y: y_min,
          width: x_max - x_min,
          height: y_max - y_min,
        },
      };
    }

    // Return a 'not detected' result if no escarapela was found
    return {
      detected: false,
      confidence: 0,
      timestamp: new Date().toISOString(),
    };
  };

  const runDetectionOnImage = async (imageBase64: string) => {
    if (isDetecting) return;
    setIsDetecting(true);
    setLastDetection(null); // Clear previous results

    try {
      const result = await callDetectionAPI(imageBase64);
      setLastDetection(result);
      onDetection?.(result);

      if (result.detected) {
        toast.success(
          `¡Escarapela detectada! Confianza: ${(
            result.confidence * 100
          ).toFixed(1)}%`
        );
      } else {
        toast.info("No se detectó ninguna escarapela en la imagen.");
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Error en la detección. Por favor, intente de nuevo.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Stop camera if it's running
    if (isStreaming) {
      stopCamera();
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);

      // Create an image object to get its dimensions
      const img = new Image();
      img.onload = () => {
        setMediaDimensions({ width: img.width, height: img.height });
        runDetectionOnImage(base64String);
      };
      img.src = base64String;
    };
    reader.readAsDataURL(file);
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
        toast.success(
          `¡Escarapela detectada! Confianza: ${(
            result.confidence * 100
          ).toFixed(1)}%`
        );
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Error en la detección. Reintentando...");
    } finally {
      setIsDetecting(false);
    }
  };

  const startContinuousDetection = () => {
    if (detectionInterval) return;

    const interval = setInterval(runDetection, 2000); // Detect every 2 seconds
    setDetectionInterval(interval);
    toast.info("Detección continua iniciada");
  };

  const stopContinuousDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
      toast.info("Detección continua detenida");
    }
  };

  useEffect(() => {
    // This effect handles the cleanup for the camera stream.
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentStream]);

  useEffect(() => {
    // This effect handles the cleanup for the detection interval.
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [detectionInterval]);

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
                <p className="text-white/80">IA con Huawei Cloud ModelArts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastDetection && (
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    lastDetection.detected
                      ? "bg-detection-active text-white"
                      : "bg-detection-inactive text-white"
                  }`}
                >
                  {lastDetection.detected
                    ? `Detectado ${(lastDetection.confidence * 100).toFixed(
                        1
                      )}%`
                    : "No detectado"}
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
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isStreaming && !uploadedImage ? "block" : "hidden"
              }`}
            />

            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded for detection"
                className="w-full h-full object-contain"
              />
            )}

            {!isStreaming && !uploadedImage && (
              <div className="absolute inset-0 flex items-center justify-center h-full text-white/60">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Cámara no iniciada</p>
                  <p className="text-sm">
                    Haga clic en "Iniciar Cámara" o "Subir Imagen"
                  </p>
                </div>
              </div>
            )}

            {/* Detection overlay */}
            {(isStreaming || uploadedImage) &&
              lastDetection?.detected &&
              lastDetection.boundingBox &&
              mediaDimensions && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: uploadedImage ? "contain" : "cover",
                    }}
                  >
                    <div
                      className="absolute border-4 border-detection-active shadow-detection"
                      style={{
                        left: `${
                          (lastDetection.boundingBox.x /
                            mediaDimensions.width) *
                          100
                        }%`,
                        top: `${
                          (lastDetection.boundingBox.y /
                            mediaDimensions.height) *
                          100
                        }%`,
                        width: `${
                          (lastDetection.boundingBox.width /
                            mediaDimensions.width) *
                          100
                        }%`,
                        height: `${
                          (lastDetection.boundingBox.height /
                            mediaDimensions.height) *
                          100
                        }%`,
                      }}
                    >
                      <div className="absolute -top-8 left-0 bg-detection-active text-white px-2 py-1 rounded text-sm font-medium pointer-events-auto">
                        Patriota {(lastDetection.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {!isStreaming ? (
              <>
                <Button
                  onClick={startCamera}
                  className="bg-white text-primary hover:bg-white/90"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Cámara
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <label>
                    <Camera className="w-5 h-5 mr-2" />
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </Button>
              </>
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
