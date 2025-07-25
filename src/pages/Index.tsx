import React, { useState } from "react";
import { PartnershipHeader } from "@/components/PartnershipHeader";
import { CameraFeed } from "@/components/CameraFeed";
import { DetectionStats } from "@/components/DetectionStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const Index = () => {
  const [detections, setDetections] = useState<DetectionResult[]>([]);

  const handleDetection = (result: DetectionResult) => {
    setDetections((prev) => [...prev, result]);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    toast.info(
      "Enviando simulación de inicio de sesión... El WAF analizará la solicitud."
    );

    try {
      const response = await fetch("https://usmp.losfisicos.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // This is the most likely path for a WAF block (e.g., status 403)
        toast.error(
          `Solicitud bloqueada por el WAF. Código de estado: ${response.status}`
        );
      } else {
        // This path is unlikely if the endpoint doesn't exist, but good for simulation
        toast.success("La solicitud pasó el WAF (simulación).");
      }
    } catch (error) {
      // This will catch network errors, which can also happen if the WAF blocks the request
      console.error("Login simulation error:", error);
      toast.error(
        "Error de red. La solicitud pudo haber sido bloqueada por el WAF."
      );
    }
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

        {/* WAF Demonstration Section */}
        <div className="mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Demostración de Seguridad WAF
            </h2>
            <p className="text-muted-foreground mb-8">
              Este formulario simula un inicio de sesión para demostrar cómo el
              Web Application Firewall (WAF) de Huawei Cloud protege la
              aplicación. Intente ingresar un ataque común de inyección SQL como{" "}
              <code className="bg-muted text-red-500 p-1 rounded text-sm">
                ' OR '1'='1
              </code>{" "}
              en cualquiera de los campos para ver la protección en acción.
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Simulación de Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="admin"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="········"
                    className="bg-input"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Iniciar Sesión
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Tecnología de Vanguardia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  Universidad San Martín de Porres
                </h3>
                <p className="text-muted-foreground">
                  Líder en investigación e innovación tecnológica en el Perú. La
                  USMP desarrolla soluciones de inteligencia artificial
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
                  Plataforma líder mundial en servicios de nube e inteligencia
                  artificial. ModelArts proporciona la infraestructura y
                  herramientas necesarias para entrenar y desplegar modelos de
                  IA a escala industrial.
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
      <footer className="text-center py-8">
        <a
          href="https://jeremyaldama.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Made by Jeremy
        </a>
      </footer>
    </div>
  );
};

export default Index;
