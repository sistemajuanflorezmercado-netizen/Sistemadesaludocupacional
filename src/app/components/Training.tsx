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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Search, Plus, GraduationCap, Users, Calendar as CalendarIcon, Award } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Training {
  id: number;
  title: string;
  category: "Seguridad" | "Salud" | "Emergencias" | "EPP" | "Ergonomía" | "Primeros Auxilios";
  instructor: string;
  date: string;
  duration: number;
  maxParticipants: number;
  enrolled: number;
  status: "Programado" | "En curso" | "Completado" | "Cancelado";
  description: string;
  location: string;
}

interface Attendance {
  id: number;
  trainingId: number;
  employeeName: string;
  attended: boolean;
  score?: number;
  certificate?: boolean;
}

const initialTrainings: Training[] = [
  {
    id: 1,
    title: "Uso Correcto de EPP",
    category: "EPP",
    instructor: "Roberto Sánchez",
    date: "2026-06-05",
    duration: 4,
    maxParticipants: 25,
    enrolled: 23,
    status: "Programado",
    description: "Capacitación sobre el uso adecuado de equipos de protección personal",
    location: "Sala de Capacitación A",
  },
  {
    id: 2,
    title: "Prevención de Incendios",
    category: "Emergencias",
    instructor: "Ana López",
    date: "2026-05-20",
    duration: 6,
    maxParticipants: 30,
    enrolled: 28,
    status: "Completado",
    description: "Manejo de extintores y procedimientos de evacuación",
    location: "Área Externa",
  },
  {
    id: 3,
    title: "Primeros Auxilios Básicos",
    category: "Primeros Auxilios",
    instructor: "Dr. Martínez",
    date: "2026-06-12",
    duration: 8,
    maxParticipants: 20,
    enrolled: 15,
    status: "Programado",
    description: "Técnicas básicas de primeros auxilios y RCP",
    location: "Sala de Capacitación B",
  },
  {
    id: 4,
    title: "Ergonomía en el Trabajo",
    category: "Ergonomía",
    instructor: "Dra. Ramírez",
    date: "2026-05-28",
    duration: 3,
    maxParticipants: 40,
    enrolled: 35,
    status: "En curso",
    description: "Posturas correctas y prevención de lesiones musculoesqueléticas",
    location: "Auditorio Principal",
  },
  {
    id: 5,
    title: "Manejo Seguro de Sustancias Químicas",
    category: "Seguridad",
    instructor: "Ing. Torres",
    date: "2026-06-18",
    duration: 5,
    maxParticipants: 15,
    enrolled: 12,
    status: "Programado",
    description: "Identificación, manipulación y almacenamiento de químicos",
    location: "Laboratorio",
  },
];

const initialAttendance: Attendance[] = [
  { id: 1, trainingId: 2, employeeName: "Juan Pérez García", attended: true, score: 95, certificate: true },
  { id: 2, trainingId: 2, employeeName: "María González López", attended: true, score: 88, certificate: true },
  { id: 3, trainingId: 2, employeeName: "Carlos Ruiz Martínez", attended: false },
  { id: 4, trainingId: 2, employeeName: "Ana Martínez Sánchez", attended: true, score: 92, certificate: true },
];

export function Training() {
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newTraining, setNewTraining] = useState<Partial<Training>>({
    status: "Programado",
    enrolled: 0,
  });

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || training.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.category || !selectedDate || !newTraining.instructor) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const training: Training = {
      id: Math.max(...trainings.map((t) => t.id), 0) + 1,
      title: newTraining.title!,
      category: newTraining.category as Training["category"],
      instructor: newTraining.instructor!,
      date: format(selectedDate, "yyyy-MM-dd"),
      duration: newTraining.duration || 2,
      maxParticipants: newTraining.maxParticipants || 20,
      enrolled: 0,
      status: newTraining.status as Training["status"] || "Programado",
      description: newTraining.description || "",
      location: newTraining.location || "",
    };

    setTrainings([...trainings, training]);
    setIsAddDialogOpen(false);
    setNewTraining({ status: "Programado", enrolled: 0 });
    setSelectedDate(undefined);
    toast.success("Capacitación programada exitosamente");
  };

  const getStatusColor = (status: Training["status"]) => {
    switch (status) {
      case "Programado":
        return "outline";
      case "En curso":
        return "default";
      case "Completado":
        return "secondary";
      case "Cancelado":
        return "destructive";
    }
  };

  const getCategoryColor = (category: Training["category"]) => {
    const colors: Record<Training["category"], string> = {
      "Seguridad": "bg-blue-100 text-blue-700",
      "Salud": "bg-green-100 text-green-700",
      "Emergencias": "bg-red-100 text-red-700",
      "EPP": "bg-purple-100 text-purple-700",
      "Ergonomía": "bg-yellow-100 text-yellow-700",
      "Primeros Auxilios": "bg-pink-100 text-pink-700",
    };
    return colors[category];
  };

  const completedTrainings = trainings.filter((t) => t.status === "Completado").length;
  const upcomingTrainings = trainings.filter((t) => t.status === "Programado").length;
  const totalParticipants = trainings.reduce((acc, t) => acc + t.enrolled, 0);
  const certificatesIssued = attendance.filter((a) => a.certificate).length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capacitaciones</h1>
          <p className="text-gray-500 mt-1">Gestión de programas de formación y entrenamiento</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nueva Capacitación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Nueva Capacitación</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newTraining.title || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                  placeholder="Nombre de la capacitación"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={newTraining.category}
                  onValueChange={(value) => setNewTraining({ ...newTraining, category: value as Training["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seguridad">Seguridad</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Emergencias">Emergencias</SelectItem>
                    <SelectItem value="EPP">EPP</SelectItem>
                    <SelectItem value="Ergonomía">Ergonomía</SelectItem>
                    <SelectItem value="Primeros Auxilios">Primeros Auxilios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  value={newTraining.instructor || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, instructor: e.target.value })}
                  placeholder="Nombre del instructor"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha *</Label>
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
                <Label htmlFor="duration">Duración (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={newTraining.duration || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, duration: parseInt(e.target.value) })}
                  placeholder="Ej: 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Máx. Participantes</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={newTraining.maxParticipants || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, maxParticipants: parseInt(e.target.value) })}
                  placeholder="Ej: 20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newTraining.location || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, location: e.target.value })}
                  placeholder="Lugar de la capacitación"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTraining.description || ""}
                  onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                  placeholder="Describe el contenido de la capacitación..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTraining}>Programar Capacitación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="size-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{trainings.length}</div>
                <p className="text-sm text-gray-500">Total Capacitaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarIcon className="size-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{upcomingTrainings}</div>
                <p className="text-sm text-gray-500">Próximas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="size-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalParticipants}</div>
                <p className="text-sm text-gray-500">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="size-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificatesIssued}</div>
                <p className="text-sm text-gray-500">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trainings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trainings">Capacitaciones</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Buscar capacitaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    <SelectItem value="Seguridad">Seguridad</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Emergencias">Emergencias</SelectItem>
                    <SelectItem value="EPP">EPP</SelectItem>
                    <SelectItem value="Ergonomía">Ergonomía</SelectItem>
                    <SelectItem value="Primeros Auxilios">Primeros Auxilios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTrainings.map((training) => (
                  <div key={training.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{training.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(training.category)}`}>
                            {training.category}
                          </span>
                          <Badge variant={getStatusColor(training.status)}>{training.status}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{training.description}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Instructor:</span> {training.instructor}
                          </p>
                          <p>
                            <span className="font-medium">Fecha:</span> {format(new Date(training.date), "dd/MM/yyyy")}
                          </p>
                          <p>
                            <span className="font-medium">Duración:</span> {training.duration} horas
                          </p>
                          <p>
                            <span className="font-medium">Ubicación:</span> {training.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="text-gray-600">Participantes</span>
                          <span className="font-medium">
                            {training.enrolled} / {training.maxParticipants}
                          </span>
                        </div>
                        <Progress value={(training.enrolled / training.maxParticipants) * 100} className="h-2" />
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredTrainings.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No se encontraron capacitaciones
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Capacitaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainings
                  .filter((t) => t.status !== "Cancelado")
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((training) => (
                    <div key={training.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">{format(new Date(training.date), "dd")}</div>
                        <div className="text-xs text-gray-500 uppercase">{format(new Date(training.date), "MMM", { locale: es })}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{training.title}</h4>
                        <p className="text-sm text-gray-600">
                          {training.instructor} • {training.duration}h • {training.location}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(training.status)}>{training.status}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Capacitación</TableHead>
                    <TableHead>Asistió</TableHead>
                    <TableHead>Puntuación</TableHead>
                    <TableHead>Certificado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => {
                    const training = trainings.find((t) => t.id === record.trainingId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{training?.title || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={record.attended ? "default" : "secondary"}>
                            {record.attended ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.score ? `${record.score}%` : "-"}</TableCell>
                        <TableCell>
                          {record.certificate ? (
                            <Award className="size-5 text-yellow-600" />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {attendance.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay registros de asistencia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
