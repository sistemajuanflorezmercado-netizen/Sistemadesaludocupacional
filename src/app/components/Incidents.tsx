import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Search, Plus, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Incident {
  id: number;
  employeeName: string;
  date: string;
  time: string;
  location: string;
  type: "Caída" | "Corte" | "Quemadura" | "Ergonómico" | "Químico" | "Eléctrico" | "Otro";
  severity: "Leve" | "Moderado" | "Grave" | "Fatal";
  description: string;
  immediateAction: string;
  status: "Reportado" | "En investigación" | "En seguimiento" | "Cerrado";
  investigator?: string;
  rootCause?: string;
  correctiveActions?: string;
}

const initialIncidents: Incident[] = [
  {
    id: 1,
    employeeName: "Juan Pérez García",
    date: "2026-05-25",
    time: "10:30",
    location: "Área de Producción - Línea 2",
    type: "Caída",
    severity: "Leve",
    description: "Tropiezo con material en el suelo durante traslado de producto",
    immediateAction: "Atención en enfermería, revisión de área",
    status: "Cerrado",
    investigator: "Roberto Sánchez",
    rootCause: "Material apilado en zona de paso",
    correctiveActions: "Señalización de zonas de almacenamiento temporal, capacitación sobre orden y limpieza",
  },
  {
    id: 2,
    employeeName: "María González López",
    date: "2026-05-23",
    time: "14:15",
    location: "Laboratorio de Calidad",
    type: "Corte",
    severity: "Moderado",
    description: "Corte en mano derecha al manipular muestra con borde filoso",
    immediateAction: "Atención médica inmediata, curación y vendaje",
    status: "En seguimiento",
    investigator: "Dr. Martínez",
    rootCause: "Falta de guantes de protección adecuados",
    correctiveActions: "Provisión de guantes anticorte, revisión de procedimientos de manipulación",
  },
  {
    id: 3,
    employeeName: "Carlos Ruiz Martínez",
    date: "2026-05-20",
    time: "09:00",
    location: "Taller de Mantenimiento",
    type: "Ergonómico",
    severity: "Leve",
    description: "Dolor lumbar al levantar equipo pesado sin ayuda mecánica",
    immediateAction: "Reposo, evaluación médica",
    status: "Cerrado",
    investigator: "Ana López",
    rootCause: "Levantamiento manual de carga superior a límite permitido",
    correctiveActions: "Entrenamiento en manejo manual de cargas, disponibilidad de equipos de ayuda",
  },
  {
    id: 4,
    employeeName: "Pedro Jiménez",
    date: "2026-05-27",
    time: "16:45",
    location: "Almacén Central",
    type: "Químico",
    severity: "Moderado",
    description: "Exposición a vapores de producto de limpieza en área cerrada",
    immediateAction: "Evacuación inmediata, ventilación del área, evaluación médica",
    status: "En investigación",
    investigator: "Roberto Sánchez",
  },
];

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    status: "Reportado",
    severity: "Leve",
  });

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const handleAddIncident = () => {
    if (!newIncident.employeeName || !newIncident.type || !selectedDate || !newIncident.description) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const incident: Incident = {
      id: Math.max(...incidents.map((i) => i.id), 0) + 1,
      employeeName: newIncident.employeeName!,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: newIncident.time || "00:00",
      location: newIncident.location || "",
      type: newIncident.type as Incident["type"],
      severity: newIncident.severity as Incident["severity"] || "Leve",
      description: newIncident.description!,
      immediateAction: newIncident.immediateAction || "",
      status: newIncident.status as Incident["status"] || "Reportado",
    };

    setIncidents([...incidents, incident]);
    setIsAddDialogOpen(false);
    setNewIncident({ status: "Reportado", severity: "Leve" });
    setSelectedDate(undefined);
    toast.success("Incidente reportado exitosamente");
  };

  const getSeverityColor = (severity: Incident["severity"]) => {
    switch (severity) {
      case "Leve":
        return "secondary";
      case "Moderado":
        return "default";
      case "Grave":
        return "destructive";
      case "Fatal":
        return "destructive";
    }
  };

  const getStatusColor = (status: Incident["status"]) => {
    switch (status) {
      case "Reportado":
        return "outline";
      case "En investigación":
        return "default";
      case "En seguimiento":
        return "secondary";
      case "Cerrado":
        return "outline";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Incidentes</h1>
          <p className="text-gray-500 mt-1">Registro y seguimiento de incidentes laborales</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Reportar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reportar Nuevo Incidente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="employeeName">Empleado Afectado *</Label>
                <Input
                  id="employeeName"
                  value={newIncident.employeeName || ""}
                  onChange={(e) => setNewIncident({ ...newIncident, employeeName: e.target.value })}
                  placeholder="Nombre del empleado"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha del Incidente *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 size-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora del Incidente</Label>
                <Input
                  id="time"
                  type="time"
                  value={newIncident.time || ""}
                  onChange={(e) => setNewIncident({ ...newIncident, time: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newIncident.location || ""}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                  placeholder="Área o ubicación específica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Incidente *</Label>
                <Select
                  value={newIncident.type}
                  onValueChange={(value) => setNewIncident({ ...newIncident, type: value as Incident["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caída">Caída</SelectItem>
                    <SelectItem value="Corte">Corte</SelectItem>
                    <SelectItem value="Quemadura">Quemadura</SelectItem>
                    <SelectItem value="Ergonómico">Ergonómico</SelectItem>
                    <SelectItem value="Químico">Químico</SelectItem>
                    <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severidad *</Label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value) => setNewIncident({ ...newIncident, severity: value as Incident["severity"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leve">Leve</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Grave">Grave</SelectItem>
                    <SelectItem value="Fatal">Fatal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción del Incidente *</Label>
                <Textarea
                  id="description"
                  value={newIncident.description || ""}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Describa detalladamente lo ocurrido..."
                  rows={4}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="immediateAction">Acción Inmediata Tomada</Label>
                <Textarea
                  id="immediateAction"
                  value={newIncident.immediateAction || ""}
                  onChange={(e) => setNewIncident({ ...newIncident, immediateAction: e.target.value })}
                  placeholder="Describa las acciones inmediatas tomadas..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newIncident.status}
                  onValueChange={(value) => setNewIncident({ ...newIncident, status: value as Incident["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reportado">Reportado</SelectItem>
                    <SelectItem value="En investigación">En investigación</SelectItem>
                    <SelectItem value="En seguimiento">En seguimiento</SelectItem>
                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddIncident}>Reportar Incidente</Button>
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
                <div className="text-2xl font-bold">{incidents.length}</div>
                <p className="text-sm text-gray-500">Total Incidentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter((i) => i.status === "En investigación" || i.status === "En seguimiento").length}
            </div>
            <p className="text-sm text-gray-500">En Proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter((i) => i.severity === "Grave" || i.severity === "Fatal").length}
            </div>
            <p className="text-sm text-gray-500">Graves</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {incidents.filter((i) => i.status === "Cerrado").length}
            </div>
            <p className="text-sm text-gray-500">Cerrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por empleado, ubicación o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Severidades</SelectItem>
                <SelectItem value="Leve">Leve</SelectItem>
                <SelectItem value="Moderado">Moderado</SelectItem>
                <SelectItem value="Grave">Grave</SelectItem>
                <SelectItem value="Fatal">Fatal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{incident.employeeName}</h3>
                      <Badge variant={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                      <Badge variant={getStatusColor(incident.status)}>{incident.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Fecha:</span> {format(new Date(incident.date), "dd/MM/yyyy")} - {incident.time}
                      </p>
                      <p>
                        <span className="font-medium">Tipo:</span> {incident.type}
                      </p>
                      <p className="col-span-2">
                        <span className="font-medium">Ubicación:</span> {incident.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Descripción:</p>
                    <p className="text-gray-600">{incident.description}</p>
                  </div>
                  
                  {incident.immediateAction && (
                    <div>
                      <p className="font-medium text-gray-700">Acción Inmediata:</p>
                      <p className="text-gray-600">{incident.immediateAction}</p>
                    </div>
                  )}
                  
                  {incident.investigator && (
                    <div>
                      <p className="font-medium text-gray-700">Investigador:</p>
                      <p className="text-gray-600">{incident.investigator}</p>
                    </div>
                  )}
                  
                  {incident.rootCause && (
                    <div>
                      <p className="font-medium text-gray-700">Causa Raíz:</p>
                      <p className="text-gray-600">{incident.rootCause}</p>
                    </div>
                  )}
                  
                  {incident.correctiveActions && (
                    <div>
                      <p className="font-medium text-gray-700">Acciones Correctivas:</p>
                      <p className="text-gray-600">{incident.correctiveActions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron incidentes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
