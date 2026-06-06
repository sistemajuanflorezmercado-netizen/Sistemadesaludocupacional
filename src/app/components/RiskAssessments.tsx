import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Search, Plus, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RiskAssessment {
  id: number;
  area: string;
  process: string;
  hazard: string;
  riskLevel: "Bajo" | "Medio" | "Alto" | "Crítico";
  probability: number;
  severity: number;
  currentControls: string;
  proposedActions: string;
  responsible: string;
  deadline: string;
  status: "Pendiente" | "En progreso" | "Completado";
}

const initialAssessments: RiskAssessment[] = [
  {
    id: 1,
    area: "Producción",
    process: "Operación de maquinaria pesada",
    hazard: "Atrapamiento en partes móviles",
    riskLevel: "Alto",
    probability: 3,
    severity: 4,
    currentControls: "Guardas de protección, señalización, capacitación básica",
    proposedActions: "Instalación de sistema de parada de emergencia adicional, mejora de guardas",
    responsible: "Roberto Sánchez",
    deadline: "2026-07-15",
    status: "En progreso",
  },
  {
    id: 2,
    area: "Almacén",
    process: "Manipulación manual de cargas",
    hazard: "Lesiones musculoesqueléticas",
    riskLevel: "Medio",
    probability: 4,
    severity: 2,
    currentControls: "Capacitación en manejo de cargas",
    proposedActions: "Adquisición de equipos de ayuda mecánica (carretillas, montacargas)",
    responsible: "Ana López",
    deadline: "2026-08-01",
    status: "Pendiente",
  },
  {
    id: 3,
    area: "Laboratorio",
    process: "Manipulación de sustancias químicas",
    hazard: "Exposición a vapores tóxicos",
    riskLevel: "Alto",
    probability: 3,
    severity: 4,
    currentControls: "Campana extractora, EPP básico",
    proposedActions: "Mejora del sistema de ventilación, provisión de máscaras con filtros específicos",
    responsible: "Dr. Martínez",
    deadline: "2026-06-30",
    status: "En progreso",
  },
  {
    id: 4,
    area: "Oficinas",
    process: "Trabajo en pantalla de visualización",
    hazard: "Fatiga visual y postural",
    riskLevel: "Bajo",
    probability: 5,
    severity: 1,
    currentControls: "Sillas ergonómicas, iluminación adecuada",
    proposedActions: "Pausas activas programadas, ajuste de monitores",
    responsible: "RRHH",
    deadline: "2026-06-15",
    status: "Completado",
  },
  {
    id: 5,
    area: "Mantenimiento",
    process: "Trabajos en altura",
    hazard: "Caída desde altura",
    riskLevel: "Crítico",
    probability: 2,
    severity: 5,
    currentControls: "Arnés de seguridad, líneas de vida",
    proposedActions: "Revisión y certificación de equipos anticaídas, capacitación avanzada",
    responsible: "Coordinador de Seguridad",
    deadline: "2026-06-20",
    status: "En progreso",
  },
];

export function RiskAssessments() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>(initialAssessments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Partial<RiskAssessment>>({
    probability: 1,
    severity: 1,
    status: "Pendiente",
  });

  const calculateRiskLevel = (probability: number, severity: number): RiskAssessment["riskLevel"] => {
    const riskScore = probability * severity;
    if (riskScore >= 15) return "Crítico";
    if (riskScore >= 10) return "Alto";
    if (riskScore >= 5) return "Medio";
    return "Bajo";
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.hazard.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === "all" || assessment.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const handleAddAssessment = () => {
    if (!newAssessment.area || !newAssessment.process || !newAssessment.hazard) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const riskLevel = calculateRiskLevel(
      newAssessment.probability || 1,
      newAssessment.severity || 1
    );

    const assessment: RiskAssessment = {
      id: Math.max(...assessments.map((a) => a.id), 0) + 1,
      area: newAssessment.area!,
      process: newAssessment.process!,
      hazard: newAssessment.hazard!,
      riskLevel,
      probability: newAssessment.probability || 1,
      severity: newAssessment.severity || 1,
      currentControls: newAssessment.currentControls || "",
      proposedActions: newAssessment.proposedActions || "",
      responsible: newAssessment.responsible || "",
      deadline: newAssessment.deadline || "",
      status: newAssessment.status as RiskAssessment["status"] || "Pendiente",
    };

    setAssessments([...assessments, assessment]);
    setIsAddDialogOpen(false);
    setNewAssessment({ probability: 1, severity: 1, status: "Pendiente" });
    toast.success("Evaluación de riesgo agregada exitosamente");
  };

  const getRiskColor = (risk: RiskAssessment["riskLevel"]) => {
    switch (risk) {
      case "Bajo":
        return "secondary";
      case "Medio":
        return "default";
      case "Alto":
        return "destructive";
      case "Crítico":
        return "destructive";
    }
  };

  const getStatusColor = (status: RiskAssessment["status"]) => {
    switch (status) {
      case "Pendiente":
        return "outline";
      case "En progreso":
        return "default";
      case "Completado":
        return "secondary";
    }
  };

  const riskCounts = {
    critico: assessments.filter((a) => a.riskLevel === "Crítico").length,
    alto: assessments.filter((a) => a.riskLevel === "Alto").length,
    medio: assessments.filter((a) => a.riskLevel === "Medio").length,
    bajo: assessments.filter((a) => a.riskLevel === "Bajo").length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluaciones de Riesgo</h1>
          <p className="text-gray-500 mt-1">Identificación y gestión de riesgos laborales</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación de Riesgo</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área *</Label>
                <Input
                  id="area"
                  value={newAssessment.area || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, area: e.target.value })}
                  placeholder="Ej: Producción"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="process">Proceso *</Label>
                <Input
                  id="process"
                  value={newAssessment.process || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, process: e.target.value })}
                  placeholder="Ej: Operación de maquinaria"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="hazard">Peligro Identificado *</Label>
                <Input
                  id="hazard"
                  value={newAssessment.hazard || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, hazard: e.target.value })}
                  placeholder="Describa el peligro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">
                  Probabilidad (1-5) * 
                  <span className="text-xs text-gray-500 ml-2">1=Muy baja, 5=Muy alta</span>
                </Label>
                <Select
                  value={String(newAssessment.probability)}
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, probability: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muy baja</SelectItem>
                    <SelectItem value="2">2 - Baja</SelectItem>
                    <SelectItem value="3">3 - Media</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muy alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">
                  Severidad (1-5) *
                  <span className="text-xs text-gray-500 ml-2">1=Leve, 5=Catastrófico</span>
                </Label>
                <Select
                  value={String(newAssessment.severity)}
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, severity: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Leve</SelectItem>
                    <SelectItem value="2">2 - Menor</SelectItem>
                    <SelectItem value="3">3 - Moderado</SelectItem>
                    <SelectItem value="4">4 - Mayor</SelectItem>
                    <SelectItem value="5">5 - Catastrófico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newAssessment.probability && newAssessment.severity && (
                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Nivel de Riesgo Calculado:</span>
                    <Badge variant={getRiskColor(calculateRiskLevel(newAssessment.probability, newAssessment.severity))}>
                      {calculateRiskLevel(newAssessment.probability, newAssessment.severity)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Puntuación: {newAssessment.probability * newAssessment.severity}
                  </p>
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="currentControls">Controles Actuales</Label>
                <Textarea
                  id="currentControls"
                  value={newAssessment.currentControls || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, currentControls: e.target.value })}
                  placeholder="Describa los controles existentes..."
                  rows={3}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="proposedActions">Acciones Propuestas</Label>
                <Textarea
                  id="proposedActions"
                  value={newAssessment.proposedActions || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, proposedActions: e.target.value })}
                  placeholder="Describa las acciones a implementar..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsable</Label>
                <Input
                  id="responsible"
                  value={newAssessment.responsible || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, responsible: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Fecha Límite</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newAssessment.deadline || ""}
                  onChange={(e) => setNewAssessment({ ...newAssessment, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newAssessment.status}
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, status: value as RiskAssessment["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAssessment}>Guardar Evaluación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{riskCounts.critico}</div>
                <p className="text-sm text-gray-500">Riesgos Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="size-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{riskCounts.alto}</div>
                <p className="text-sm text-gray-500">Riesgos Altos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{riskCounts.medio}</div>
            <p className="text-sm text-gray-500">Riesgos Medios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{riskCounts.bajo}</div>
                <p className="text-sm text-gray-500">Riesgos Bajos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por área, proceso o peligro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Niveles</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Medio">Medio</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{assessment.area} - {assessment.process}</h3>
                      <Badge variant={getRiskColor(assessment.riskLevel)}>{assessment.riskLevel}</Badge>
                      <Badge variant={getStatusColor(assessment.status)}>{assessment.status}</Badge>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-medium">Peligro:</span> {assessment.hazard}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Probabilidad</p>
                    <div className="flex items-center gap-2">
                      <Progress value={assessment.probability * 20} className="h-2" />
                      <span className="text-sm text-gray-600">{assessment.probability}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Severidad</p>
                    <div className="flex items-center gap-2">
                      <Progress value={assessment.severity * 20} className="h-2" />
                      <span className="text-sm text-gray-600">{assessment.severity}/5</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {assessment.currentControls && (
                    <div>
                      <p className="font-medium text-gray-700">Controles Actuales:</p>
                      <p className="text-gray-600">{assessment.currentControls}</p>
                    </div>
                  )}

                  {assessment.proposedActions && (
                    <div>
                      <p className="font-medium text-gray-700">Acciones Propuestas:</p>
                      <p className="text-gray-600">{assessment.proposedActions}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-gray-600">
                    {assessment.responsible && (
                      <p>
                        <span className="font-medium">Responsable:</span> {assessment.responsible}
                      </p>
                    )}
                    {assessment.deadline && (
                      <p>
                        <span className="font-medium">Fecha límite:</span> {new Date(assessment.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredAssessments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron evaluaciones de riesgo
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
