import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Search, Plus, Calendar as CalendarIcon, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MedicalExam {
  id: number;
  employeeName: string;
  employeeId: string;
  examType: "Ingreso" | "Periódico" | "Egreso" | "Post-incidente" | "Reintegro";
  scheduledDate: string;
  status: "Pendiente" | "Programado" | "Completado" | "Cancelado";
  result?: "Apto" | "Apto con restricciones" | "No apto";
  doctor?: string;
  observations?: string;
}

const initialExams: MedicalExam[] = [
  {
    id: 1,
    employeeName: "Juan Pérez García",
    employeeId: "EMP001",
    examType: "Periódico",
    scheduledDate: "2026-06-02",
    status: "Programado",
    doctor: "Dr. Rodríguez",
  },
  {
    id: 2,
    employeeName: "María González López",
    employeeId: "EMP002",
    examType: "Ingreso",
    scheduledDate: "2026-05-15",
    status: "Completado",
    result: "Apto",
    doctor: "Dra. Martínez",
    observations: "Sin observaciones",
  },
  {
    id: 3,
    employeeName: "Carlos Ruiz Martínez",
    employeeId: "EMP003",
    examType: "Post-incidente",
    scheduledDate: "2026-05-20",
    status: "Completado",
    result: "Apto con restricciones",
    doctor: "Dr. Rodríguez",
    observations: "Reposo 3 días. No cargar peso mayor a 5kg por 2 semanas",
  },
  {
    id: 4,
    employeeName: "Ana Martínez Sánchez",
    employeeId: "EMP004",
    examType: "Periódico",
    scheduledDate: "2026-06-10",
    status: "Pendiente",
  },
  {
    id: 5,
    employeeName: "Luis Torres Fernández",
    employeeId: "EMP005",
    examType: "Reintegro",
    scheduledDate: "2026-06-15",
    status: "Programado",
    doctor: "Dra. Martínez",
  },
];

export function MedicalExams() {
  const [exams, setExams] = useState<MedicalExam[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newExam, setNewExam] = useState<Partial<MedicalExam>>({
    status: "Pendiente",
  });

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddExam = () => {
    if (!newExam.employeeName || !newExam.examType || !selectedDate) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const exam: MedicalExam = {
      id: Math.max(...exams.map((e) => e.id), 0) + 1,
      employeeName: newExam.employeeName!,
      employeeId: newExam.employeeId || `EMP${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      examType: newExam.examType as MedicalExam["examType"],
      scheduledDate: format(selectedDate, "yyyy-MM-dd"),
      status: newExam.status as MedicalExam["status"] || "Pendiente",
      doctor: newExam.doctor,
    };

    setExams([...exams, exam]);
    setIsAddDialogOpen(false);
    setNewExam({ status: "Pendiente" });
    setSelectedDate(undefined);
    toast.success("Examen médico programado exitosamente");
  };

  const getStatusColor = (status: MedicalExam["status"]) => {
    switch (status) {
      case "Completado":
        return "default";
      case "Programado":
        return "secondary";
      case "Pendiente":
        return "outline";
      case "Cancelado":
        return "destructive";
    }
  };

  const getResultColor = (result?: MedicalExam["result"]) => {
    switch (result) {
      case "Apto":
        return "default";
      case "Apto con restricciones":
        return "secondary";
      case "No apto":
        return "destructive";
      default:
        return "outline";
    }
  };

  const pendingExams = exams.filter((e) => e.status === "Pendiente" || e.status === "Programado");
  const completedExams = exams.filter((e) => e.status === "Completado");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exámenes Médicos</h1>
          <p className="text-gray-500 mt-1">Gestiona los exámenes médicos ocupacionales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Programar Examen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Programar Examen Médico</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Empleado *</Label>
                  <Input
                    id="employeeName"
                    value={newExam.employeeName || ""}
                    onChange={(e) => setNewExam({ ...newExam, employeeName: e.target.value })}
                    placeholder="Nombre del empleado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">Tipo de Examen *</Label>
                  <Select
                    value={newExam.examType}
                    onValueChange={(value) => setNewExam({ ...newExam, examType: value as MedicalExam["examType"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingreso">Ingreso</SelectItem>
                      <SelectItem value="Periódico">Periódico</SelectItem>
                      <SelectItem value="Egreso">Egreso</SelectItem>
                      <SelectItem value="Post-incidente">Post-incidente</SelectItem>
                      <SelectItem value="Reintegro">Reintegro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Programada *</Label>
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
                  <Label htmlFor="doctor">Médico</Label>
                  <Input
                    id="doctor"
                    value={newExam.doctor || ""}
                    onChange={(e) => setNewExam({ ...newExam, doctor: e.target.value })}
                    placeholder="Nombre del médico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={newExam.status}
                    onValueChange={(value) => setNewExam({ ...newExam, status: value as MedicalExam["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Programado">Programado</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddExam}>Programar Examen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingExams.length}</div>
            <p className="text-sm text-gray-500">Exámenes Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedExams.length}</div>
            <p className="text-sm text-gray-500">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {completedExams.filter((e) => e.result === "Apto").length}
            </div>
            <p className="text-sm text-gray-500">Aptos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {completedExams.filter((e) => e.result === "Apto con restricciones").length}
            </div>
            <p className="text-sm text-gray-500">Con Restricciones</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por empleado, ID o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Programado">Programado</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo de Examen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.employeeName}</TableCell>
                      <TableCell>{exam.employeeId}</TableCell>
                      <TableCell>{exam.examType}</TableCell>
                      <TableCell>{format(new Date(exam.scheduledDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{exam.doctor || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(exam.status)}>{exam.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {exam.result ? (
                          <Badge variant={getResultColor(exam.result)}>{exam.result}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredExams.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron exámenes médicos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Exámenes Pendientes y Programados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{exam.employeeName}</p>
                      <p className="text-sm text-gray-600">
                        {exam.examType} - {format(new Date(exam.scheduledDate), "dd/MM/yyyy")}
                      </p>
                      {exam.doctor && <p className="text-sm text-gray-500">Dr. {exam.doctor}</p>}
                    </div>
                    <Badge variant={getStatusColor(exam.status)}>{exam.status}</Badge>
                  </div>
                ))}
                {pendingExams.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay exámenes pendientes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Exámenes Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedExams.map((exam) => (
                  <div key={exam.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{exam.employeeName}</p>
                        <p className="text-sm text-gray-600">
                          {exam.examType} - {format(new Date(exam.scheduledDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Badge variant={getResultColor(exam.result)}>{exam.result}</Badge>
                    </div>
                    {exam.observations && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Observaciones:</span> {exam.observations}
                      </p>
                    )}
                  </div>
                ))}
                {completedExams.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay exámenes completados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
