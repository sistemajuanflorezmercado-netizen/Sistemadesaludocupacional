import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Edit, Trash2, Eye, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import jsPDF from "jspdf";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: "Activo" | "Inactivo" | "Licencia";
  riskLevel: "Bajo" | "Medio" | "Alto";
}

interface MedicalHistory {
  id: number;
  employeeId: number;
  // Datos del paciente
  patientName: string;
  patientAge: number;
  patientGender: "Masculino" | "Femenino" | "Otro";
  patientId: string;
  patientAddress: string;
  patientPhone: string;
  patientEmail: string;

  // Datos de la empresa
  companyName: string;
  companyPosition: string;
  companyDepartment: string;
  companyStartDate: string;

  // Tipo de examen
  examType: "Ingreso" | "Retiro" | "Periódico" | "Post-incapacidad";
  examEmphasis: string; // Osteomuscular u otro énfasis

  // Antecedentes ginecobstétricos (si aplica)
  gynecologicalHistory?: {
    menarche?: string;
    menstrualCycle?: string;
    pregnancies?: number;
    births?: number;
    cesareans?: number;
    abortions?: number;
    lastMenstruation?: string;
  };

  // Antecedentes personales
  personalHistory: {
    chronicDiseases: string;
    surgeries: string;
    allergies: string;
    medications: string;
    smoking: boolean;
    alcohol: boolean;
    exercise: string;
  };

  // Antecedentes familiares
  familyHistory: {
    diabetes: boolean;
    hypertension: boolean;
    cancer: boolean;
    heartDisease: boolean;
    other: string;
  };

  // Signos vitales
  vitalSigns: {
    bloodPressure: string; // Ej: 120/80
    height: number; // cm
    weight: number; // kg
    bmi: number; // Calculado automáticamente
    abdominalPerimeter: number; // cm
  };

  // Concepto médico
  observations: string;
  recommendations: string;
  concept: "Recomendado" | "Aplazado";

  // Metadata
  createdDate: string;
  doctorName: string;
}

const initialEmployees: Employee[] = [];
const initialMedicalHistories: MedicalHistory[] = [];

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>(initialMedicalHistories);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    status: "Activo",
    riskLevel: "Bajo",
  });

  const [newHistory, setNewHistory] = useState<Partial<MedicalHistory>>({
    patientGender: "Masculino",
    examType: "Ingreso",
    examEmphasis: "",
    personalHistory: {
      chronicDiseases: "",
      surgeries: "",
      allergies: "",
      medications: "",
      smoking: false,
      alcohol: false,
      exercise: "",
    },
    familyHistory: {
      diabetes: false,
      hypertension: false,
      cancer: false,
      heartDisease: false,
      other: "",
    },
    vitalSigns: {
      bloodPressure: "",
      height: 0,
      weight: 0,
      bmi: 0,
      abdominalPerimeter: 0,
    },
    concept: "Recomendado",
  });

  const departments = ["Producción", "Calidad", "Mantenimiento", "Recursos Humanos", "Almacén", "Administración"];

  // Calcular IMC automáticamente
  useEffect(() => {
    if (newHistory.vitalSigns?.height && newHistory.vitalSigns?.weight) {
      const heightInMeters = newHistory.vitalSigns.height / 100;
      const bmi = newHistory.vitalSigns.weight / (heightInMeters * heightInMeters);
      const calculatedBmi = Math.round(bmi * 100) / 100;

      // Solo actualizar si el BMI calculado es diferente al actual
      if (newHistory.vitalSigns.bmi !== calculatedBmi) {
        setNewHistory(prev => ({
          ...prev,
          vitalSigns: {
            ...prev.vitalSigns!,
            bmi: calculatedBmi,
          },
        }));
      }
    }
  }, [newHistory.vitalSigns?.height, newHistory.vitalSigns?.weight, newHistory.vitalSigns?.bmi]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.department) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const employee: Employee = {
      id: Math.max(...employees.map((e) => e.id), 0) + 1,
      name: newEmployee.name!,
      position: newEmployee.position!,
      department: newEmployee.department!,
      email: newEmployee.email || "",
      phone: newEmployee.phone || "",
      hireDate: newEmployee.hireDate || new Date().toISOString().split("T")[0],
      status: newEmployee.status as Employee["status"] || "Activo",
      riskLevel: newEmployee.riskLevel as Employee["riskLevel"] || "Bajo",
    };

    setEmployees([...employees, employee]);
    setIsAddDialogOpen(false);
    setNewEmployee({ status: "Activo", riskLevel: "Bajo" });
    toast.success("Empleado agregado exitosamente");
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast.success("Empleado eliminado");
  };

  const handleAddMedicalHistory = () => {
    if (!newHistory.patientName || !newHistory.companyName || !newHistory.doctorName) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const history: MedicalHistory = {
      id: Math.max(...medicalHistories.map((h) => h.id), 0) + 1,
      employeeId: newHistory.employeeId || 0,
      patientName: newHistory.patientName!,
      patientAge: newHistory.patientAge || 0,
      patientGender: newHistory.patientGender as MedicalHistory["patientGender"],
      patientId: newHistory.patientId || "",
      patientAddress: newHistory.patientAddress || "",
      patientPhone: newHistory.patientPhone || "",
      patientEmail: newHistory.patientEmail || "",
      companyName: newHistory.companyName!,
      companyPosition: newHistory.companyPosition || "",
      companyDepartment: newHistory.companyDepartment || "",
      companyStartDate: newHistory.companyStartDate || "",
      examType: newHistory.examType as MedicalHistory["examType"],
      examEmphasis: newHistory.examEmphasis || "",
      gynecologicalHistory: newHistory.gynecologicalHistory,
      personalHistory: newHistory.personalHistory!,
      familyHistory: newHistory.familyHistory!,
      vitalSigns: newHistory.vitalSigns!,
      observations: newHistory.observations || "",
      recommendations: newHistory.recommendations || "",
      concept: newHistory.concept as MedicalHistory["concept"],
      createdDate: new Date().toISOString().split("T")[0],
      doctorName: newHistory.doctorName!,
    };

    setMedicalHistories([...medicalHistories, history]);
    setIsHistoryDialogOpen(false);
    resetHistoryForm();
    toast.success("Historia clínica creada exitosamente");
  };

  const resetHistoryForm = () => {
    setNewHistory({
      patientGender: "Masculino",
      examType: "Ingreso",
      examEmphasis: "",
      personalHistory: {
        chronicDiseases: "",
        surgeries: "",
        allergies: "",
        medications: "",
        smoking: false,
        alcohol: false,
        exercise: "",
      },
      familyHistory: {
        diabetes: false,
        hypertension: false,
        cancer: false,
        heartDisease: false,
        other: "",
      },
      vitalSigns: {
        bloodPressure: "",
        height: 0,
        weight: 0,
        bmi: 0,
        abdominalPerimeter: 0,
      },
      concept: "Recomendado",
    });
  };

  const generateCertificatePDF = (history: MedicalHistory) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CERTIFICADO MÉDICO OCUPACIONAL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(history.createdDate).toLocaleDateString()}`, 20, 40);

    doc.setFontSize(14);
    doc.text("DATOS DEL PACIENTE", 20, 55);
    doc.setFontSize(11);
    doc.text(`Nombre: ${history.patientName}`, 20, 65);
    doc.text(`Identificación: ${history.patientId}`, 20, 72);
    doc.text(`Edad: ${history.patientAge} años`, 20, 79);

    doc.setFontSize(14);
    doc.text("DATOS DE LA EMPRESA", 20, 95);
    doc.setFontSize(11);
    doc.text(`Empresa: ${history.companyName}`, 20, 105);
    doc.text(`Cargo: ${history.companyPosition}`, 20, 112);
    doc.text(`Departamento: ${history.companyDepartment}`, 20, 119);

    doc.setFontSize(14);
    doc.text("CONCEPTO MÉDICO", 20, 135);
    doc.setFontSize(11);
    doc.text(`Tipo de examen: ${history.examType}`, 20, 145);
    doc.text(`Concepto: ${history.concept} para el cargo`, 20, 152);

    if (history.recommendations) {
      doc.text("Recomendaciones:", 20, 165);
      const lines = doc.splitTextToSize(history.recommendations, 170);
      doc.text(lines, 20, 172);
    }

    doc.setFontSize(10);
    doc.text(`Dr./Dra. ${history.doctorName}`, 20, 250);
    doc.text("Firma y sello", 20, 257);

    doc.save(`Certificado_${history.patientName.replace(/\s+/g, "_")}_${history.createdDate}.pdf`);
    toast.success("Certificado descargado");
  };

  const generateMedicalHistoryPDF = (history: MedicalHistory) => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text("HISTORIA CLÍNICA OCUPACIONAL", 105, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(history.createdDate).toLocaleDateString()}`, 20, yPos);
    yPos += 10;

    // Datos del paciente
    doc.setFontSize(14);
    doc.text("DATOS DEL PACIENTE", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Nombre: ${history.patientName}`, 20, yPos);
    yPos += 6;
    doc.text(`Identificación: ${history.patientId}`, 20, yPos);
    yPos += 6;
    doc.text(`Edad: ${history.patientAge} años - Género: ${history.patientGender}`, 20, yPos);
    yPos += 6;
    doc.text(`Teléfono: ${history.patientPhone} - Email: ${history.patientEmail}`, 20, yPos);
    yPos += 6;
    doc.text(`Dirección: ${history.patientAddress}`, 20, yPos);
    yPos += 10;

    // Datos de la empresa
    doc.setFontSize(14);
    doc.text("DATOS DE LA EMPRESA", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Empresa: ${history.companyName}`, 20, yPos);
    yPos += 6;
    doc.text(`Cargo: ${history.companyPosition} - Departamento: ${history.companyDepartment}`, 20, yPos);
    yPos += 6;
    doc.text(`Fecha de ingreso: ${history.companyStartDate}`, 20, yPos);
    yPos += 10;

    // Tipo de examen
    doc.setFontSize(14);
    doc.text("TIPO DE EXAMEN", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Tipo: ${history.examType}`, 20, yPos);
    yPos += 6;
    doc.text(`Énfasis: ${history.examEmphasis}`, 20, yPos);
    yPos += 10;

    // Antecedentes ginecobstétricos (si aplica)
    if (history.gynecologicalHistory && history.patientGender === "Femenino") {
      doc.setFontSize(14);
      doc.text("ANTECEDENTES GINECOBSTÉTRICOS", 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Menarquia: ${history.gynecologicalHistory.menarche || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Ciclo menstrual: ${history.gynecologicalHistory.menstrualCycle || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Embarazos: ${history.gynecologicalHistory.pregnancies || 0} - Partos: ${history.gynecologicalHistory.births || 0}`, 20, yPos);
      yPos += 6;
      doc.text(`Cesáreas: ${history.gynecologicalHistory.cesareans || 0} - Abortos: ${history.gynecologicalHistory.abortions || 0}`, 20, yPos);
      yPos += 10;
    }

    // Nueva página si es necesario
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Antecedentes personales
    doc.setFontSize(14);
    doc.text("ANTECEDENTES PERSONALES", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Enfermedades crónicas: ${history.personalHistory.chronicDiseases || "Ninguna"}`, 20, yPos);
    yPos += 6;
    doc.text(`Cirugías: ${history.personalHistory.surgeries || "Ninguna"}`, 20, yPos);
    yPos += 6;
    doc.text(`Alergias: ${history.personalHistory.allergies || "Ninguna"}`, 20, yPos);
    yPos += 6;
    doc.text(`Medicamentos: ${history.personalHistory.medications || "Ninguno"}`, 20, yPos);
    yPos += 6;
    doc.text(`Fumador: ${history.personalHistory.smoking ? "Sí" : "No"} - Alcohol: ${history.personalHistory.alcohol ? "Sí" : "No"}`, 20, yPos);
    yPos += 6;
    doc.text(`Ejercicio: ${history.personalHistory.exercise || "No especificado"}`, 20, yPos);
    yPos += 10;

    // Antecedentes familiares
    doc.setFontSize(14);
    doc.text("ANTECEDENTES FAMILIARES", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Diabetes: ${history.familyHistory.diabetes ? "Sí" : "No"} - Hipertensión: ${history.familyHistory.hypertension ? "Sí" : "No"}`, 20, yPos);
    yPos += 6;
    doc.text(`Cáncer: ${history.familyHistory.cancer ? "Sí" : "No"} - Enf. Cardíacas: ${history.familyHistory.heartDisease ? "Sí" : "No"}`, 20, yPos);
    yPos += 6;
    doc.text(`Otros: ${history.familyHistory.other || "Ninguno"}`, 20, yPos);
    yPos += 10;

    // Signos vitales
    doc.setFontSize(14);
    doc.text("SIGNOS VITALES", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Presión arterial: ${history.vitalSigns.bloodPressure} mmHg`, 20, yPos);
    yPos += 6;
    doc.text(`Altura: ${history.vitalSigns.height} cm - Peso: ${history.vitalSigns.weight} kg`, 20, yPos);
    yPos += 6;
    doc.text(`IMC: ${history.vitalSigns.bmi} - Perímetro abdominal: ${history.vitalSigns.abdominalPerimeter} cm`, 20, yPos);
    yPos += 10;

    // Concepto médico
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("CONCEPTO MÉDICO", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Concepto: ${history.concept}`, 20, yPos);
    yPos += 8;

    if (history.observations) {
      doc.text("Observaciones:", 20, yPos);
      yPos += 6;
      const obsLines = doc.splitTextToSize(history.observations, 170);
      doc.text(obsLines, 20, yPos);
      yPos += obsLines.length * 6;
    }

    if (history.recommendations) {
      yPos += 4;
      doc.text("Recomendaciones:", 20, yPos);
      yPos += 6;
      const recLines = doc.splitTextToSize(history.recommendations, 170);
      doc.text(recLines, 20, yPos);
    }

    // Firma
    doc.setFontSize(10);
    doc.text(`Dr./Dra. ${history.doctorName}`, 20, 270);
    doc.text("Firma y sello", 20, 277);

    doc.save(`Historia_Clinica_${history.patientName.replace(/\s+/g, "_")}_${history.createdDate}.pdf`);
    toast.success("Historia clínica descargada");
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Activo":
        return "default";
      case "Inactivo":
        return "secondary";
      case "Licencia":
        return "outline";
    }
  };

  const getRiskColor = (risk: Employee["riskLevel"]) => {
    switch (risk) {
      case "Alto":
        return "destructive";
      case "Medio":
        return "default";
      case "Bajo":
        return "secondary";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
          <p className="text-gray-500 mt-1">Administra el personal de la empresa</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="size-4 mr-2" />
                Crear Historia Clínica
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Historia Clínica Ocupacional</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="patient" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="patient">Paciente</TabsTrigger>
                  <TabsTrigger value="company">Empresa</TabsTrigger>
                  <TabsTrigger value="exam">Examen</TabsTrigger>
                  <TabsTrigger value="history">Antecedentes</TabsTrigger>
                  <TabsTrigger value="vitals">Signos Vitales</TabsTrigger>
                  <TabsTrigger value="concept">Concepto</TabsTrigger>
                </TabsList>

                {/* Datos del Paciente */}
                <TabsContent value="patient" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Nombre Completo *</Label>
                      <Input
                        id="patientName"
                        value={newHistory.patientName || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientName: e.target.value })}
                        placeholder="Ej: Juan Pérez García"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Identificación *</Label>
                      <Input
                        id="patientId"
                        value={newHistory.patientId || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientId: e.target.value })}
                        placeholder="Número de identificación"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientAge">Edad</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        value={newHistory.patientAge || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientAge: parseInt(e.target.value) })}
                        placeholder="Edad"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientGender">Género</Label>
                      <Select
                        value={newHistory.patientGender}
                        onValueChange={(value) => setNewHistory({ ...newHistory, patientGender: value as MedicalHistory["patientGender"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientPhone">Teléfono</Label>
                      <Input
                        id="patientPhone"
                        value={newHistory.patientPhone || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientPhone: e.target.value })}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientEmail">Email</Label>
                      <Input
                        id="patientEmail"
                        type="email"
                        value={newHistory.patientEmail || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientEmail: e.target.value })}
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="patientAddress">Dirección</Label>
                      <Input
                        id="patientAddress"
                        value={newHistory.patientAddress || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, patientAddress: e.target.value })}
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Datos de la Empresa */}
                <TabsContent value="company" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Empresa *</Label>
                      <Input
                        id="companyName"
                        value={newHistory.companyName || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, companyName: e.target.value })}
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPosition">Cargo</Label>
                      <Input
                        id="companyPosition"
                        value={newHistory.companyPosition || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, companyPosition: e.target.value })}
                        placeholder="Cargo a desempeñar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyDepartment">Departamento</Label>
                      <Select
                        value={newHistory.companyDepartment}
                        onValueChange={(value) => setNewHistory({ ...newHistory, companyDepartment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyStartDate">Fecha de Ingreso</Label>
                      <Input
                        id="companyStartDate"
                        type="date"
                        value={newHistory.companyStartDate || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, companyStartDate: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tipo de Examen */}
                <TabsContent value="exam" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examType">Tipo de Examen *</Label>
                      <Select
                        value={newHistory.examType}
                        onValueChange={(value) => setNewHistory({ ...newHistory, examType: value as MedicalHistory["examType"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ingreso">Ingreso</SelectItem>
                          <SelectItem value="Retiro">Retiro</SelectItem>
                          <SelectItem value="Periódico">Periódico</SelectItem>
                          <SelectItem value="Post-incapacidad">Post-incapacidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examEmphasis">Énfasis del Examen</Label>
                      <Input
                        id="examEmphasis"
                        value={newHistory.examEmphasis || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, examEmphasis: e.target.value })}
                        placeholder="Ej: Osteomuscular, Auditivo, Visual"
                      />
                    </div>
                  </div>

                  {/* Antecedentes Ginecobstétricos (solo para género femenino) */}
                  {newHistory.patientGender === "Femenino" && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-3">Antecedentes Ginecobstétricos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="menarche">Menarquia (edad)</Label>
                          <Input
                            id="menarche"
                            value={newHistory.gynecologicalHistory?.menarche || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, menarche: e.target.value }
                            })}
                            placeholder="Ej: 12 años"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="menstrualCycle">Ciclo Menstrual</Label>
                          <Input
                            id="menstrualCycle"
                            value={newHistory.gynecologicalHistory?.menstrualCycle || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, menstrualCycle: e.target.value }
                            })}
                            placeholder="Ej: Regular 28 días"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pregnancies">Embarazos</Label>
                          <Input
                            id="pregnancies"
                            type="number"
                            value={newHistory.gynecologicalHistory?.pregnancies || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, pregnancies: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="births">Partos</Label>
                          <Input
                            id="births"
                            type="number"
                            value={newHistory.gynecologicalHistory?.births || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, births: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cesareans">Cesáreas</Label>
                          <Input
                            id="cesareans"
                            type="number"
                            value={newHistory.gynecologicalHistory?.cesareans || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, cesareans: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="abortions">Abortos</Label>
                          <Input
                            id="abortions"
                            type="number"
                            value={newHistory.gynecologicalHistory?.abortions || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, abortions: parseInt(e.target.value) || 0 }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastMenstruation">Última Menstruación</Label>
                          <Input
                            id="lastMenstruation"
                            type="date"
                            value={newHistory.gynecologicalHistory?.lastMenstruation || ""}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              gynecologicalHistory: { ...newHistory.gynecologicalHistory, lastMenstruation: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Antecedentes */}
                <TabsContent value="history" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Antecedentes Personales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chronicDiseases">Enfermedades Crónicas</Label>
                        <Textarea
                          id="chronicDiseases"
                          value={newHistory.personalHistory?.chronicDiseases || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            personalHistory: { ...newHistory.personalHistory!, chronicDiseases: e.target.value }
                          })}
                          placeholder="Ej: Diabetes, hipertensión..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surgeries">Cirugías Previas</Label>
                        <Textarea
                          id="surgeries"
                          value={newHistory.personalHistory?.surgeries || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            personalHistory: { ...newHistory.personalHistory!, surgeries: e.target.value }
                          })}
                          placeholder="Describa cirugías previas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Alergias</Label>
                        <Textarea
                          id="allergies"
                          value={newHistory.personalHistory?.allergies || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            personalHistory: { ...newHistory.personalHistory!, allergies: e.target.value }
                          })}
                          placeholder="Medicamentos, alimentos, otros..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medications">Medicamentos Actuales</Label>
                        <Textarea
                          id="medications"
                          value={newHistory.personalHistory?.medications || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            personalHistory: { ...newHistory.personalHistory!, medications: e.target.value }
                          })}
                          placeholder="Medicamentos que toma actualmente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exercise">Actividad Física</Label>
                        <Input
                          id="exercise"
                          value={newHistory.personalHistory?.exercise || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            personalHistory: { ...newHistory.personalHistory!, exercise: e.target.value }
                          })}
                          placeholder="Frecuencia y tipo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hábitos</Label>
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newHistory.personalHistory?.smoking || false}
                              onChange={(e) => setNewHistory({
                                ...newHistory,
                                personalHistory: { ...newHistory.personalHistory!, smoking: e.target.checked }
                              })}
                            />
                            Fumador
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newHistory.personalHistory?.alcohol || false}
                              onChange={(e) => setNewHistory({
                                ...newHistory,
                                personalHistory: { ...newHistory.personalHistory!, alcohol: e.target.checked }
                              })}
                            />
                            Consume alcohol
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Antecedentes Familiares</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newHistory.familyHistory?.diabetes || false}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              familyHistory: { ...newHistory.familyHistory!, diabetes: e.target.checked }
                            })}
                          />
                          Diabetes
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newHistory.familyHistory?.hypertension || false}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              familyHistory: { ...newHistory.familyHistory!, hypertension: e.target.checked }
                            })}
                          />
                          Hipertensión
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newHistory.familyHistory?.cancer || false}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              familyHistory: { ...newHistory.familyHistory!, cancer: e.target.checked }
                            })}
                          />
                          Cáncer
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newHistory.familyHistory?.heartDisease || false}
                            onChange={(e) => setNewHistory({
                              ...newHistory,
                              familyHistory: { ...newHistory.familyHistory!, heartDisease: e.target.checked }
                            })}
                          />
                          Enf. Cardíacas
                        </label>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="otherFamily">Otros Antecedentes Familiares</Label>
                        <Textarea
                          id="otherFamily"
                          value={newHistory.familyHistory?.other || ""}
                          onChange={(e) => setNewHistory({
                            ...newHistory,
                            familyHistory: { ...newHistory.familyHistory!, other: e.target.value }
                          })}
                          placeholder="Otros antecedentes relevantes"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Signos Vitales */}
                <TabsContent value="vitals" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressure">Presión Arterial (mmHg)</Label>
                      <Input
                        id="bloodPressure"
                        value={newHistory.vitalSigns?.bloodPressure || ""}
                        onChange={(e) => setNewHistory({
                          ...newHistory,
                          vitalSigns: { ...newHistory.vitalSigns!, bloodPressure: e.target.value }
                        })}
                        placeholder="Ej: 120/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newHistory.vitalSigns?.height || ""}
                        onChange={(e) => setNewHistory({
                          ...newHistory,
                          vitalSigns: { ...newHistory.vitalSigns!, height: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Ej: 170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={newHistory.vitalSigns?.weight || ""}
                        onChange={(e) => setNewHistory({
                          ...newHistory,
                          vitalSigns: { ...newHistory.vitalSigns!, weight: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Ej: 70.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bmi">IMC (Calculado Automáticamente)</Label>
                      <Input
                        id="bmi"
                        value={newHistory.vitalSigns?.bmi || "0"}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abdominalPerimeter">Perímetro Abdominal (cm)</Label>
                      <Input
                        id="abdominalPerimeter"
                        type="number"
                        value={newHistory.vitalSigns?.abdominalPerimeter || ""}
                        onChange={(e) => setNewHistory({
                          ...newHistory,
                          vitalSigns: { ...newHistory.vitalSigns!, abdominalPerimeter: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Ej: 85"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Concepto Médico */}
                <TabsContent value="concept" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Nombre del Médico *</Label>
                      <Input
                        id="doctorName"
                        value={newHistory.doctorName || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, doctorName: e.target.value })}
                        placeholder="Dr./Dra. Nombre Completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observations">Observaciones al Concepto</Label>
                      <Textarea
                        id="observations"
                        value={newHistory.observations || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, observations: e.target.value })}
                        placeholder="Observaciones clínicas..."
                        className="min-h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommendations">Recomendaciones</Label>
                      <Textarea
                        id="recommendations"
                        value={newHistory.recommendations || ""}
                        onChange={(e) => setNewHistory({ ...newHistory, recommendations: e.target.value })}
                        placeholder="Recomendaciones médicas..."
                        className="min-h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="concept">Concepto Médico</Label>
                      <Select
                        value={newHistory.concept}
                        onValueChange={(value) => setNewHistory({ ...newHistory, concept: value as MedicalHistory["concept"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Recomendado">Recomendado al cargo</SelectItem>
                          <SelectItem value="Aplazado">Aplazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMedicalHistory}>Guardar Historia Clínica</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={newEmployee.name || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={newEmployee.position || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="Ej: Operario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="ejemplo@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Fecha de Ingreso</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={newEmployee.hireDate || ""}
                  onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newEmployee.status}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value as Employee["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Licencia">Licencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                <Select
                  value={newEmployee.riskLevel}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, riskLevel: value as Employee["riskLevel"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bajo">Bajo</SelectItem>
                    <SelectItem value="Medio">Medio</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEmployee}>Guardar Empleado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="histories">Historias Clínicas</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, cargo o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(employee.status)}>{employee.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskColor(employee.riskLevel)}>{employee.riskLevel}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredEmployees.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron empleados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="histories">
          <Card>
            <CardHeader>
              <CardTitle>Historias Clínicas Ocupacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo de Examen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalHistories.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="font-medium">{history.patientName}</TableCell>
                      <TableCell>{history.patientId}</TableCell>
                      <TableCell>{history.companyName}</TableCell>
                      <TableCell>{history.examType}</TableCell>
                      <TableCell>{new Date(history.createdDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={history.concept === "Recomendado" ? "default" : "destructive"}>
                          {history.concept}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCertificatePDF(history)}
                          >
                            <FileDown className="size-4 mr-1" />
                            Certificado
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateMedicalHistoryPDF(history)}
                          >
                            <FileDown className="size-4 mr-1" />
                            Historia Completa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {medicalHistories.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se han creado historias clínicas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
