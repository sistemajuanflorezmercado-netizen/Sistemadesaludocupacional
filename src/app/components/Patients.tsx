import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Search, Plus, Edit, Trash2, Eye, PenLine, X, RotateCcw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { colombiaDepartamentos, epsColombia, afpColombia, tiposSangre } from "./colombiaData";
import { HistoriaClinica, type HistoriaForm } from "./HistoriaClinica";
import { supabase } from "../lib/supabase";

const guardarPaciente = async (paciente) => {
  const { data, error } = await supabase
    .from("pacientes")
    .insert([paciente]);

  if (error) {
    console.error(error);
    return;
  }

  console.log("Paciente guardado", data);
};

export interface WorkData {
  company: string;
  position: string;
  municipio: string;
}

export interface Patient {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroIdentificacion: string;
  telefono1: string;
  telefono2: string;
  direccion: string;
  departamento: string;
  municipio: string;
  fechaNacimiento: string;
  sexo: string;
  estadoCivil: string;
  nivelSocioeconomico: string;
  dominancia: string;
  escolaridad: string;
  profesion: string;
  tipoSangre: string;
  correo: string;
  eps: string;
  afp: string;
  firmaBase64: string;
  datosLaborales: WorkData;
}

const emptyPatient: Omit<Patient, "id"> = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "",
  numeroIdentificacion: "",
  telefono1: "",
  telefono2: "",
  direccion: "",
  departamento: "",
  municipio: "",
  fechaNacimiento: "",
  sexo: "",
  estadoCivil: "",
  nivelSocioeconomico: "",
  dominancia: "",
  escolaridad: "",
  profesion: "",
  tipoSangre: "",
  correo: "",
  eps: "",
  afp: "",
  firmaBase64: "",
  datosLaborales: { company: "", position: "", municipio: "" },
};

interface SignaturePadProps {
  value: string;
  onChange: (base64: string) => void;
  onClose: () => void;
}

function SignaturePad({ value, onChange, onClose }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (value) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = value;
  }
}, [value]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    const canvas = canvasRef.current!;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL("image/png"));
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">Firme dentro del recuadro a continuación:</p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white" style={{ touchAction: "none" }}>
      <canvas
      ref={canvasRef}
      width={1800}
      height={900}
      className="w-full h-[75vh] cursor-crosshair"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={stopDraw}
      />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <RotateCcw className="size-4 mr-1" /> Limpiar
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="size-4 mr-1" /> Cancelar
        </Button>
        <Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white">
          Guardar firma
        </Button>
      </div>
    </div>
  );
}

const FIELD_CLASS = "col-span-1";
const LABEL_CLASS = "text-xs font-medium text-gray-700 mb-1 block";

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : FIELD_CLASS}>
      <Label className={LABEL_CLASS}>{label}</Label>
      {children}
    </div>
  );
}

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  useEffect(() => {
  const datosGuardados = localStorage.getItem("patients");

  if (datosGuardados) {
    setPatients(JSON.parse(datosGuardados));
  }
}, []);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [viewing, setViewing] = useState<Patient | null>(null);
  const [form, setForm] = useState<Omit<Patient, "id">>(emptyPatient);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [histories, setHistories] = useState<Record<number, HistoriaForm>>({});
  useEffect(() => {
  const savedHistories = localStorage.getItem("histories");

  if (savedHistories) {
    setHistories(JSON.parse(savedHistories));
  }
}, []);
useEffect(() => {
  localStorage.setItem(
    "histories",
    JSON.stringify(histories)
  );
}, [histories]);
  const [historiaPatient, setHistoriaPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (form.departamento && colombiaDepartamentos[form.departamento]) {
      setMunicipios(colombiaDepartamentos[form.departamento]);
    } else {
      setMunicipios([]);
    }
  }, [form.departamento]);

    useEffect(() => {
    const datosGuardados = localStorage.getItem("patients");

    if (datosGuardados) {
    setPatients(JSON.parse(datosGuardados));
    }
    }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
      p.numeroIdentificacion.toLowerCase().includes(q) ||
      p.eps.toLowerCase().includes(q)
    );
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyPatient);
    setOpen(true);
  };

  const openEdit = (p: Patient) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const openView = (p: Patient) => {
    setViewing(p);
    setViewOpen(true);
  };

  const del = (id: number) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    toast.success("Paciente eliminado");
  };

  const set = (field: keyof Omit<Patient, "id">, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "departamento") next.municipio = "";
      return next;
    });
  };

  const setLaboral = (field: keyof WorkData, value: string) => {
    setForm((prev) => ({ ...prev, datosLaborales: { ...prev.datosLaborales, [field]: value } }));
  };

  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numeroIdentificacion) {
      toast.error("Nombres, apellidos y número de identificación son obligatorios");
      return;
    }
    if (editing) {
      setPatients((prev) => prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)));
      toast.success("Paciente actualizado");
    } else {
      setPatients((prev) => [...prev, { ...form, id: Date.now() }]);
      toast.success("Paciente registrado");
    }
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-500 text-sm">Registro y gestión de datos de pacientes</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="size-4" /> Nuevo Paciente
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Pacientes</p>
            <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Con firma digital</p>
            <p className="text-3xl font-bold text-green-600">{patients.filter((p) => p.firmaBase64).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Sin firma</p>
            <p className="text-3xl font-bold text-orange-500">{patients.filter((p) => !p.firmaBase64).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Pacientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, documento o EPS..."
                className="pl-9 w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No hay pacientes registrados</p>
              <p className="text-sm">Haga clic en "Nuevo Paciente" para agregar el primero</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>EPS</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombres} {p.apellidos}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">{p.tipoDocumento}</span>
                      <br />
                      {p.numeroIdentificacion}
                    </TableCell>
                    <TableCell>{p.telefono1}</TableCell>
                    <TableCell>
                      <span className="text-xs">{p.eps}</span>
                    </TableCell>
                    <TableCell>{p.municipio}{p.departamento && `, ${p.departamento}`}</TableCell>
                    <TableCell>
                      {p.firmaBase64 ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Firmado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setHistoriaPatient(p)}>
                          <ClipboardList className="size-3.5" /> Historia
                        </Button>
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => openView(p)}>
                          <Eye className="size-4 text-blue-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(p)}>
                          <Edit className="size-4 text-gray-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => del(p.id)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open && !signOpen} onOpenChange={setOpen}>
        <DialogContent
        className="!w-[98vw] !max-w-none h-[95vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Paciente" : "Nuevo Paciente"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* ── Identificación ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Datos de Identificación</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombres *">
                  <Input value={form.nombres} onChange={(e) => set("nombres", e.target.value)} placeholder="Nombres" />
                </Field>
                <Field label="Apellidos *">
                  <Input value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} placeholder="Apellidos" />
                </Field>
                <Field label="Tipo de Documento *">
                  <Select value={form.tipoDocumento} onValueChange={(v) => set("tipoDocumento", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {["Cédula de Ciudadanía", "Tarjeta de Identidad", "Cédula Extranjera", "Pasaporte", "Registro Civil", "Adulto sin identificación", "Menor sin identificación"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Número de Identificación *">
                  <Input value={form.numeroIdentificacion} onChange={(e) => set("numeroIdentificacion", e.target.value)} placeholder="Número" />
                </Field>
              </div>
            </section>

            {/* ── Contacto ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Datos de Contacto</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono Principal *">
                  <Input value={form.telefono1} onChange={(e) => set("telefono1", e.target.value)} placeholder="Teléfono 1" />
                </Field>
                <Field label="Teléfono Secundario (opcional)">
                  <Input value={form.telefono2} onChange={(e) => set("telefono2", e.target.value)} placeholder="Teléfono 2" />
                </Field>
                <Field label="Correo Electrónico" span2>
                  <Input type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} placeholder="correo@ejemplo.com" />
                </Field>
                <Field label="Dirección" span2>
                  <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Dirección completa" />
                </Field>
                <Field label="Departamento">
                  <Select value={form.departamento} onValueChange={(v) => set("departamento", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar departamento..." /></SelectTrigger>
                    <SelectContent className="max-h-56">
                      {Object.keys(colombiaDepartamentos).sort().map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Municipio">
                  <Select value={form.municipio} onValueChange={(v) => set("municipio", v)} disabled={municipios.length === 0}>
                    <SelectTrigger><SelectValue placeholder={municipios.length === 0 ? "Seleccione depto. primero" : "Seleccionar municipio..."} /></SelectTrigger>
                    <SelectContent className="max-h-56">
                      {municipios.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            {/* ── Datos Personales ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha de Nacimiento">
                  <Input type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} />
                </Field>
                <Field label="Sexo">
                  <Select value={form.sexo} onValueChange={(v) => set("sexo", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Estado Civil">
                  <Select value={form.estadoCivil} onValueChange={(v) => set("estadoCivil", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a", "Separado/a"].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nivel Socioeconómico">
                  <Select value={form.nivelSocioeconomico} onValueChange={(v) => set("nivelSocioeconomico", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar estrato..." /></SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6"].map((n) => (
                        <SelectItem key={n} value={n}>Estrato {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Dominancia">
                  <Select value={form.dominancia} onValueChange={(v) => set("dominancia", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Derecha">Derecha</SelectItem>
                      <SelectItem value="Izquierda">Izquierda</SelectItem>
                      <SelectItem value="Ambidiestro">Ambidiestro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo de Sangre">
                  <Select value={form.tipoSangre} onValueChange={(v) => set("tipoSangre", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {tiposSangre.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Escolaridad">
                  <Select value={form.escolaridad} onValueChange={(v) => set("escolaridad", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {["Ninguna", "Primaria incompleta", "Primaria completa", "Secundaria incompleta", "Secundaria completa", "Técnico", "Tecnólogo", "Universitario", "Especialización", "Maestría", "Doctorado"].map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Profesión / Oficio">
                  <Input value={form.profesion} onChange={(e) => set("profesion", e.target.value)} placeholder="Ej: Ingeniero, Conductor, Operario..." />
                </Field>
              </div>
            </section>

            {/* ── Seguridad Social ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Seguridad Social</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="EPS">
                  <Select value={form.eps} onValueChange={(v) => set("eps", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar EPS..." /></SelectTrigger>
                    <SelectContent className="max-h-56">
                      {epsColombia.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="AFP (Fondo de Pensiones)">
                  <Select value={form.afp} onValueChange={(v) => set("afp", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar AFP..." /></SelectTrigger>
                    <SelectContent>
                      {afpColombia.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            {/* ── Datos Laborales ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Datos Laborales</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Empresa donde va a trabajar" span2>
                  <Input value={form.datosLaborales.company} onChange={(e) => setLaboral("company", e.target.value)} placeholder="Nombre de la empresa" />
                </Field>
                <Field label="Cargo">
                  <Input value={form.datosLaborales.position} onChange={(e) => setLaboral("position", e.target.value)} placeholder="Cargo o puesto" />
                </Field>
                <Field label="Municipio de la empresa">
                  <Input value={form.datosLaborales.municipio} onChange={(e) => setLaboral("municipio", e.target.value)} placeholder="Ciudad / municipio" />
                </Field>
              </div>
            </section>

            {/* ── Firma Digital ── */}
            <section>
              <h3 className="text-sm font-semibold text-blue-700 border-b border-blue-100 pb-1 mb-3">Firma Digital del Paciente</h3>
              {form.firmaBase64 ? (
                <div className="flex flex-col gap-2">
                  <div className="border rounded-lg p-2 bg-gray-50 inline-block">
                    <img src={form.firmaBase64} alt="Firma" className="h-20 object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSignOpen(true)}
                    >
                    <PenLine className="size-4 mr-1" />
                    Volver a firmar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => set("firmaBase64", "")}>
                      <X className="size-4 mr-1" /> Eliminar firma
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-gray-500">El paciente aún no ha firmado.</p>
                  <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSignOpen(true)}
                  >
                  <PenLine className="size-4 mr-2" />
                  Abrir panel de firma
                  </Button>
                  
                </div>
              )}
            </section>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editing ? "Guardar cambios" : "Registrar paciente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog — fullscreen overlay */}
      {signOpen && (
        <div
        className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        >
        <div
        className="bg-white w-[98vw] h-[98vh] rounded-2xl shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Firma del Paciente</h2>
                <p className="text-sm text-gray-500">Use el área de abajo para capturar la firma</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSignOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="p-6 flex-1">
              <SignaturePad
                value={form.firmaBase64}
                onChange={(b64) => set("firmaBase64", b64)}
                onClose={() => setSignOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {viewing && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="w-[98vw] max-w-[1600px] h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Datos del Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <InfoSection title="Identificación">
                <InfoRow label="Nombre completo" value={`${viewing.nombres} ${viewing.apellidos}`} />
                <InfoRow label="Tipo de documento" value={viewing.tipoDocumento} />
                <InfoRow label="Número" value={viewing.numeroIdentificacion} />
              </InfoSection>
              <InfoSection title="Contacto">
                <InfoRow label="Teléfono 1" value={viewing.telefono1} />
                {viewing.telefono2 && <InfoRow label="Teléfono 2" value={viewing.telefono2} />}
                <InfoRow label="Correo" value={viewing.correo} />
                <InfoRow label="Dirección" value={viewing.direccion} />
                <InfoRow label="Departamento" value={viewing.departamento} />
                <InfoRow label="Municipio" value={viewing.municipio} />
              </InfoSection>
              <InfoSection title="Datos Personales">
                <InfoRow label="Fecha de nacimiento" value={viewing.fechaNacimiento} />
                <InfoRow label="Sexo" value={viewing.sexo} />
                <InfoRow label="Estado civil" value={viewing.estadoCivil} />
                <InfoRow label="Estrato" value={viewing.nivelSocioeconomico} />
                <InfoRow label="Dominancia" value={viewing.dominancia} />
                <InfoRow label="Escolaridad" value={viewing.escolaridad} />
                <InfoRow label="Profesión" value={viewing.profesion} />
                <InfoRow label="Tipo de sangre" value={viewing.tipoSangre} />
              </InfoSection>
              <InfoSection title="Seguridad Social">
                <InfoRow label="EPS" value={viewing.eps} />
                <InfoRow label="AFP" value={viewing.afp} />
              </InfoSection>
              <InfoSection title="Datos Laborales">
                <InfoRow label="Empresa" value={viewing.datosLaborales.company} />
                <InfoRow label="Cargo" value={viewing.datosLaborales.position} />
                <InfoRow label="Municipio empresa" value={viewing.datosLaborales.municipio} />
              </InfoSection>
              {viewing.firmaBase64 && (
                <InfoSection title="Firma Digital">
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img src={viewing.firmaBase64} alt="Firma del paciente" className="h-24 object-contain" />
                  </div>
                </InfoSection>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Cerrar</Button>
              <Button onClick={() => { setViewOpen(false); openEdit(viewing); }} className="bg-blue-600 text-white hover:bg-blue-700">
                <Edit className="size-4 mr-1" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Historia Clínica — full screen */}
      {historiaPatient && (
        <HistoriaClinica
          patient={historiaPatient}
          initialHistoria={histories[historiaPatient.id]}
          onSave={(data) => {
            setHistories(prev => ({ ...prev, [historiaPatient.id]: data }));
            setHistoriaPatient(null);
            toast.success("Historia clínica guardada");
          }}
          onClose={() => setHistoriaPatient(null)}
        />
      )}
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </>
  );
}
