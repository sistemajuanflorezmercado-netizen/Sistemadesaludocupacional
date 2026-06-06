import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { X, FileDown, Save } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { Patient } from "./Patients";
import doctorFirmaUrl from "../../imports/image.png";
import doctorSelloUrl from "../../imports/image-1.png";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPOS_EXAMEN = ["Ingreso", "Periódico", "Reintegro", "Reubicación", "Retiro", "Otros"];
const ENFASIS_OPCIONES = [
  "Osteomuscular", "Alturas", "Espacios confinados", "Conductor",
  "Manipulador de alimentos", "Operador de maquinaria", "Energías peligrosas", "Otros",
];

const RIESGO_GRUPOS = [
  { grupo: "Psicosociales", items: ["Psicosociales"] },
  { grupo: "Amenazas naturales", items: ["Sismo", "Huracán", "Inundaciones", "Tormentas eléctricas", "Nevadas"] },
  { grupo: "Biomecánico", items: ["Carga física", "Carga estática", "Carga dinámica", "Movimiento repetitivo", "Sobreesfuerzo", "Sobreesfuerzo de la voz"] },
  { grupo: "Biológico", items: ["Microorganismos (virus, bacterias, hongos)", "Macroorganismos"] },
  { grupo: "Eléctricos", items: ["Energía de alto voltaje", "Energía de medio voltaje", "Energía de bajo voltaje"] },
  { grupo: "Físicos", items: ["Ruido", "Vibraciones", "Calor", "Frío", "Temperaturas extremas", "Disvarismos", "Radiaciones ionizantes", "Radiación UV"] },
  { grupo: "Físico / Químicos", items: ["Incendio", "Explosión"] },
  { grupo: "Iluminación", items: ["Trabajos a cielo abierto (sol)", "Iluminación deficiente", "Incandescencia"] },
  { grupo: "Mecánicos", items: ["Condiciones de seguridad", "Orden y aseo", "Locativo"] },
  { grupo: "Públicos", items: ["Hurto", "Robo", "Atraco"] },
  { grupo: "Químicos", items: ["Polvos", "Humos", "Nieblas", "Rocío", "Vapores"] },
  { grupo: "Tareas de alto riesgo", items: ["Trabajo en alturas; Espacios confinados", "Trabajos en caliente", "Energías peligrosas"] },
  { grupo: "Tránsito", items: ["Carro", "Moto", "Peatón"] },
];

const EXAMEN_FISICO_SECCIONES = [
  "Cabeza", "Ojos", "Dentadura", "Faringe", "Oído", "Cuello", "Tiroides",
  "Tórax", "Mamas", "Cardiovascular", "Respiratorio", "Abdomen", "Genitourinario",
  "MMSS", "MMII", "Vascular periférico", "Columna", "Neurológico", "Corazón",
  "Pulmones", "Miembros Sup.", "Miembros Inf.", "Psiquiátricos",
];

const PVE_ITEMS = [
  { name: "Biomecánico", opciones: ["Prevalente"] },
  { name: "Psicosocial", opciones: ["Prevalente"] },
  { name: "Cardiovascular", opciones: ["Prevalente"] },
  { name: "Ruido", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Respiratorio (Polvos, Vapores, Humos, Neblinas)", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Biológico", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Temperaturas Extremas (Frío/Calor)", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Visual (Soldaduras, Trabajos a cielo Abierto)", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Radiaciones Ionizantes (Rx, Rayos Beta, Rayos Gamma)", opciones: ["N/A", "Prevalente", "Estudiar"] },
  { name: "Vibraciones", opciones: ["N/A", "Prevalente", "Estudiar"] },
];

const DICTAMEN_OPCIONES = [
  "Recomendado para el cargo",
  "Aplazado",
  "Recomendado para trabajar en Alturas",
  "Recomendado para trabajar para energías",
  "Recomendado para trabajar en espacios Confinados",
  "Recomendado para manipulación de alimentos",
];

const PARACLINICOS = [
  "Audiometría", "Visiometria", "Optometria", "Espirometría", "Cuadro Hemático",
  "Perfil Lipídico", "Glicemia Basal", "Perfil Hepático", "Test de fobias",
  "Electrocardiograma", "Rx Tórax", "KOH, Coprológico, Frotis Faringeo",
  "Rx Columna Dinámica", "Rx Columna Lumbosacra", "Psicosensométrico", "Parcial de Orina",
];

const TEXTO_LEGAL = `Este documento hace parte de la historia clínica electrónica ocupacional y su contenido pleno es inmodificable. El trabajador manifiesta conocer el contenido registrado en el "Examen Médico de Ingreso"; el cual cumple con lo dispuesto en la Resolución 1843 de 2025. Se manifiesta informado de las medidas preventivas y correctivas en el cuidado de su salud. Autoriza al suscrito Médico para que custodie su Historia Clínica Ocupacional cumpliendo con el ordenamiento de la Resolución 1918 de 2009 y la Resolución 0839 de 2017. Su uso y copias solo pueden ser divulgadas en el momento y modo descritos por la Ley.`;

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface HistoriaForm {
  tipoExamen: string;
  tipoExamenOtro: string;
  enfasis: string;
  enfasisOtro: string;
  tiposRiesgo: string[];
  gineco: { fur: string; metodoPlanificacion: string; embarazos: string; parto: string; cesarea: string; vivos: string; abortos: string; ultimaCitologia: string };
  antFamiliares: { maternos: string; paternos: string };
  antPersonales: { clinicos: string; alergicos: string; quirurgicos: string; medicamentos: string; accidentes: string };
  consentimientoInformado: boolean;
  habitos: { fumador: string; fumadorAnios: string; fumadorFrecuencia: string; fumadorCantidad: string; bebedor: string; bebedorAnios: string; bebedorFrecuencia: string };
  actividadFisica: { deporte: string; cual: string; frecuenciaDeporte: string; ejercicioRutinario: string; frecuenciaEjercicio: string };
  signosVitales: { tSistolica: string; tDiastolica: string; resultadoTA: string; fc: string; fr: string; perimAbdomen: string; peso: string; talla: string; imc: string };
  revisionSistemas: { cabezaCuello: string; cardioRespiratorio: string; gastroIntestinal: string; genitourinario: string; musculoEsqueletico: string; neurologico: string; psicologico: string; observaciones: string };
  sintomatologia: string;
  examenFisico: Record<string, { evidencias: string; comentarios: string }>;
  resultadosPruebasOsteo: string;
  inmunizaciones: { fiebreAmarilla: string; tetano: string; tetanoDosis: string; sarsCov2Nombre: string; sarsCov2Dosis: string; hepatitisBDosis: string };
  dictamen: string[];
  dictamenOtro: string;
  pve: Record<string, string>;
  recomendaciones: string;
  paraclinicos: string[];
  otrosParaclinicos: string;
  lugarRealizacion: string;
  realizadoPor: string;
  fechaExamen: string;
}

const emptyHistoria: HistoriaForm = {
  tipoExamen: "", tipoExamenOtro: "", enfasis: "", enfasisOtro: "", tiposRiesgo: [],
  gineco: { fur: "", metodoPlanificacion: "", embarazos: "", parto: "", cesarea: "", vivos: "", abortos: "", ultimaCitologia: "" },
  antFamiliares: { maternos: "", paternos: "" },
  antPersonales: { clinicos: "", alergicos: "", quirurgicos: "", medicamentos: "", accidentes: "" },
  consentimientoInformado: false,
  habitos: { fumador: "", fumadorAnios: "", fumadorFrecuencia: "", fumadorCantidad: "", bebedor: "", bebedorAnios: "", bebedorFrecuencia: "" },
  actividadFisica: { deporte: "", cual: "", frecuenciaDeporte: "", ejercicioRutinario: "", frecuenciaEjercicio: "" },
  signosVitales: { tSistolica: "", tDiastolica: "", resultadoTA: "", fc: "", fr: "", perimAbdomen: "", peso: "", talla: "", imc: "" },
  revisionSistemas: { cabezaCuello: "", cardioRespiratorio: "", gastroIntestinal: "", genitourinario: "", musculoEsqueletico: "", neurologico: "", psicologico: "", observaciones: "" },
  sintomatologia: "",
  examenFisico: Object.fromEntries(EXAMEN_FISICO_SECCIONES.map(s => [s, { evidencias: "", comentarios: "" }])),
  resultadosPruebasOsteo: "",
  inmunizaciones: { fiebreAmarilla: "", tetano: "", tetanoDosis: "", sarsCov2Nombre: "", sarsCov2Dosis: "", hepatitisBDosis: "" },
  dictamen: [], dictamenOtro: "",
  pve: Object.fromEntries(PVE_ITEMS.map(p => [p.name, ""])),
  recomendaciones: "", paraclinicos: [], otrosParaclinicos: "",
  lugarRealizacion: "", realizadoPor: "Luis Gabriel Aldana Otero", fechaExamen: new Date().toISOString().split("T")[0],
};

// ─── PDF helpers ──────────────────────────────────────────────────────────────

function makePDFContext(doc: jsPDF) {
  const margin = 14;
  const pageW = 210;
  const contentW = pageW - margin * 2;
  let y = 20;

  const checkY = (needed = 10) => {
    if (y + needed > 282) { doc.addPage(); y = 18; }
  };

  const title = (text: string, color: [number, number, number] = [30, 80, 172]) => {
    checkY(12);
    doc.setFillColor(...color);
    doc.rect(margin, y, contentW, 6.5, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(text.toUpperCase(), margin + 2, y + 4.5);
    doc.setTextColor(0, 0, 0);
    y += 9;
  };

  const row = (label: string, value: string, halfW = false) => {
    checkY(7);
    const w = halfW ? contentW / 2 : contentW;
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "—", w - 38);
    doc.text(lines, margin + 38, y);
    y += lines.length * 4.5 + 1;
  };

  const twoCol = (pairs: [string, string][]) => {
    const colW = contentW / 2;
    for (let i = 0; i < pairs.length; i += 2) {
      checkY(7);
      const [la, va] = pairs[i];
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(la + ":", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(va || "—", margin + 30, y);
      if (pairs[i + 1]) {
        const [lb, vb] = pairs[i + 1];
        doc.setFont("helvetica", "bold");
        doc.text(lb + ":", margin + colW, y);
        doc.setFont("helvetica", "normal");
        doc.text(vb || "—", margin + colW + 30, y);
      }
      y += 5.5;
    }
  };

  const textBlock = (text: string) => {
    checkY(8);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text || "—", contentW);
    lines.forEach((line: string) => { checkY(5); doc.text(line, margin, y); y += 4.5; });
    y += 2;
  };

  const spacer = (h = 4) => { y += h; };

  const hline = () => {
    checkY(4);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + contentW, y);
    y += 3;
  };

  return { doc, margin, pageW, contentW, title, row, twoCol, textBlock, spacer, hline, checkY, getY: () => y, setY: (v: number) => { y = v; } };
}

function generateCertificadoPDF(patient: Patient, h: HistoriaForm, doctorFirma: string, doctorSello: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ctx = makePDFContext(doc);
  const { margin, contentW, title, row, twoCol, textBlock, spacer, hline, getY, setY } = ctx;

  // Outer border
  doc.setDrawColor(30, 80, 172);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.2);

  // Header
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 80, 172);
  doc.text("CERTIFICADO MÉDICO OCUPACIONAL", 105, 22, { align: "center" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Luis Gabriel Aldana Otero · Médico Salud Ocupacional · L.S.O. 01252", 105, 28, { align: "center" });
  doc.setTextColor(0, 0, 0);
  setY(32);
  hline();

  // Meta
  twoCol([
    ["Lugar", h.lugarRealizacion],
    ["Fecha", h.fechaExamen],
    ["Realizado por", h.realizadoPor],
    ["Tipo de examen", h.tipoExamen === "Otros" ? h.tipoExamenOtro : h.tipoExamen],
  ]);
  spacer(2);

  // Patient data
  title("Datos del Paciente");
  twoCol([
    ["Apellidos", patient.apellidos],
    ["Nombres", patient.nombres],
    ["RH", patient.tipoSangre],
    ["Tipo Documento", patient.tipoDocumento],
    ["Número Documento", patient.numeroIdentificacion],
    ["Fecha Nacimiento", patient.fechaNacimiento],
    ["Profesión", patient.profesion],
    ["EPS", patient.eps],
    ["AFP", patient.afp],
    ["Teléfono", patient.telefono1],
    ["Correo", patient.correo],
    ["Dirección", patient.direccion],
    ["Empresa", patient.datosLaborales.company],
    ["Cargo", patient.datosLaborales.position],
  ]);
  spacer(2);

  // Dictamen
  title("Dictamen");
  const dictamenText = [...h.dictamen, ...(h.dictamenOtro ? [h.dictamenOtro] : [])].join(" · ") || "—";
  textBlock(dictamenText);
  spacer(2);

  // PVE
  title("Programas de Vigilancia Epidemiológica");
  const pveAplicados = PVE_ITEMS.filter(p => h.pve[p.name]).map(p => `${p.name}: ${h.pve[p.name]}`);
  textBlock(pveAplicados.length ? pveAplicados.join(" | ") : "—");
  spacer(2);

  // Recomendaciones
  title("Recomendaciones");
  textBlock(h.recomendaciones);
  spacer(2);

  // Exámenes realizados
  title("Exámenes Paraclínicos Realizados");
  const examList = [...h.paraclinicos, ...(h.otrosParaclinicos ? [h.otrosParaclinicos] : [])].join(", ") || "—";
  textBlock(examList);
  spacer(3);

  // Legal
  title("Legalidad", [100, 100, 100]);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic");
  const legalLines = doc.splitTextToSize(TEXTO_LEGAL, contentW);
  legalLines.forEach((line: string) => { ctx.checkY(5); doc.text(line, margin, getY()); setY(getY() + 4.2); });
  spacer(6);

  // Signatures
  const sigY = getY();
  const halfW = contentW / 2;

  // Doctor side
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("FIRMA Y SELLO DEL MÉDICO", margin + halfW / 2, sigY, { align: "center" });
  if (doctorFirma) {
    try { doc.addImage(doctorFirma, "PNG", margin + 5, sigY + 2, 38, 14); } catch (_) {}
  }
  if (doctorSello) {
    try { doc.addImage(doctorSello, "PNG", margin + 5, sigY + 18, 38, 14); } catch (_) {}
  }
  doc.line(margin, sigY + 35, margin + halfW - 4, sigY + 35);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text("Luis Gabriel Aldana Otero", margin + halfW / 2 - 12, sigY + 39);
  doc.text("Médico Salud Ocupacional", margin + halfW / 2 - 12, sigY + 43);

  // Patient side
  const pX = margin + halfW + 4;
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("FIRMA DEL PACIENTE", pX + halfW / 2, sigY, { align: "center" });
  if (patient.firmaBase64) {
    try { doc.addImage(patient.firmaBase64, "PNG", pX + 5, sigY + 4, 52, 20); } catch (_) {}
  }
  doc.line(pX, sigY + 35, pX + halfW - 4, sigY + 35);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text(`${patient.nombres} ${patient.apellidos}`, pX + halfW / 2, sigY + 39, { align: "center" });

  doc.save(`Certificado_${patient.apellidos}_${patient.nombres}.pdf`);
}

function generateHistoriaPDF(patient: Patient, h: HistoriaForm, doctorFirma: string, doctorSello: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ctx = makePDFContext(doc);
  const { margin, contentW, title, row, twoCol, textBlock, spacer, hline, getY, setY } = ctx;

  // Header
  doc.setFillColor(30, 80, 172);
  doc.rect(0, 0, 210, 18, "F");
  doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text("HISTORIA CLÍNICA OCUPACIONAL", 105, 8, { align: "center" });
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("Luis Gabriel Aldana Otero · Médico Salud Ocupacional · L.S.O. 01252", 105, 14, { align: "center" });
  doc.setTextColor(0, 0, 0);
  setY(22);

  // Datos del examen
  title("Datos del Examen");
  twoCol([
    ["Lugar", h.lugarRealizacion], ["Fecha", h.fechaExamen],
    ["Realizado por", h.realizadoPor], ["Tipo examen", h.tipoExamen === "Otros" ? h.tipoExamenOtro : h.tipoExamen],
    ["Énfasis", h.enfasis === "Otros" ? h.enfasisOtro : h.enfasis], ["", ""],
  ]);
  spacer(2);

  // Datos del paciente
  title("Datos del Paciente");
  twoCol([
    ["Apellidos", patient.apellidos], ["Nombres", patient.nombres],
    ["Tipo Doc.", patient.tipoDocumento], ["N° Identificación", patient.numeroIdentificacion],
    ["Fecha Nac.", patient.fechaNacimiento], ["Sexo", patient.sexo],
    ["Estado Civil", patient.estadoCivil], ["Tipo Sangre", patient.tipoSangre],
    ["EPS", patient.eps], ["AFP", patient.afp],
    ["Profesión", patient.profesion], ["Escolaridad", patient.escolaridad],
    ["Estrato", patient.nivelSocioeconomico], ["Dominancia", patient.dominancia],
    ["Teléfono 1", patient.telefono1], ["Teléfono 2", patient.telefono2],
    ["Correo", patient.correo], ["Dirección", patient.direccion],
    ["Municipio", patient.municipio], ["Departamento", patient.departamento],
    ["Empresa", patient.datosLaborales.company], ["Cargo", patient.datosLaborales.position],
    ["Municipio empresa", patient.datosLaborales.municipio], ["", ""],
  ]);
  spacer(2);

  // Tipos de riesgo
  if (h.tiposRiesgo.length) {
    title("Tipos de Riesgo");
    textBlock(h.tiposRiesgo.join(" · "));
    spacer(2);
  }

  // Antecedentes ginecobstétricos
  title("Antecedentes Ginecobstétricos");
  twoCol([
    ["FUR", h.gineco.fur], ["Método Planificación", h.gineco.metodoPlanificacion],
    ["Embarazos", h.gineco.embarazos], ["Partos", h.gineco.parto],
    ["Cesáreas", h.gineco.cesarea], ["Vivos", h.gineco.vivos],
    ["Abortos", h.gineco.abortos], ["Última Citología", h.gineco.ultimaCitologia],
  ]);
  spacer(2);

  // Antecedentes familiares
  title("Antecedentes Familiares Relevantes");
  row("Maternos", h.antFamiliares.maternos);
  row("Paternos", h.antFamiliares.paternos);
  spacer(2);

  // Antecedentes personales
  title("Antecedentes de Salud Personales");
  row("Clínicos", h.antPersonales.clinicos);
  row("Alérgicos", h.antPersonales.alergicos);
  row("Quirúrgicos", h.antPersonales.quirurgicos);
  row("Medicamentos", h.antPersonales.medicamentos);
  row("Accidentes", h.antPersonales.accidentes);
  spacer(2);

  // Consentimiento
  title("Consentimiento Informado");
  textBlock(h.consentimientoInformado ? "El paciente aceptó el consentimiento informado." : "Pendiente de aceptación.");
  spacer(2);

  // Hábitos
  title("Hábitos");
  twoCol([
    ["Fumador", h.habitos.fumador], ["Años", h.habitos.fumadorAnios],
    ["Frecuencia", h.habitos.fumadorFrecuencia], ["Cantidad", h.habitos.fumadorCantidad],
    ["Bebedor", h.habitos.bebedor], ["Años", h.habitos.bebedorAnios],
    ["Frecuencia", h.habitos.bebedorFrecuencia], ["", ""],
  ]);
  spacer(2);

  // Actividad física
  title("Actividad Física");
  twoCol([
    ["Deporte", h.actividadFisica.deporte], ["Cuál", h.actividadFisica.cual],
    ["Frecuencia", h.actividadFisica.frecuenciaDeporte], ["Ejercicio rutinario", h.actividadFisica.ejercicioRutinario],
    ["Frecuencia", h.actividadFisica.frecuenciaEjercicio], ["", ""],
  ]);
  spacer(2);

  // Signos vitales
  title("Signos Vitales y Datos Antropométricos");
  twoCol([
    ["T. Sistólica", h.signosVitales.tSistolica], ["T. Diastólica", h.signosVitales.tDiastolica],
    ["Resultado TA", h.signosVitales.resultadoTA], ["F.C.", h.signosVitales.fc],
    ["F.R.", h.signosVitales.fr], ["Perim. Abdomen", h.signosVitales.perimAbdomen],
    ["Peso (Kg)", h.signosVitales.peso], ["Talla (m)", h.signosVitales.talla],
    ["IMC", h.signosVitales.imc], ["", ""],
  ]);
  spacer(2);

  // Revisión por sistemas
  title("Revisión por Sistemas");
  const revSist: [string, string][] = [
    ["Cabeza/Cuello/Sentidos", h.revisionSistemas.cabezaCuello],
    ["CardioRrespiratorio", h.revisionSistemas.cardioRespiratorio],
    ["GastroIntestinal", h.revisionSistemas.gastroIntestinal],
    ["Genitourinario", h.revisionSistemas.genitourinario],
    ["Músculo Esquelético", h.revisionSistemas.musculoEsqueletico],
    ["Neurológico", h.revisionSistemas.neurologico],
    ["Psicológico y Mental", h.revisionSistemas.psicologico],
    ["Observaciones", h.revisionSistemas.observaciones],
  ];
  revSist.forEach(([l, v]) => { if (v) row(l, v); });
  spacer(2);

  // Sintomatología
  if (h.sintomatologia) {
    title("Sintomatología Reportada por el Trabajador");
    textBlock(h.sintomatologia);
    spacer(2);
  }

  // Examen físico
  title("Examen Físico");
  EXAMEN_FISICO_SECCIONES.forEach(sec => {
    const ef = h.examenFisico[sec];
    if (ef?.evidencias || ef?.comentarios) {
      ctx.checkY(10);
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      doc.text(sec, margin, getY()); setY(getY() + 5);
      if (ef.evidencias) row("  Evidencias", ef.evidencias);
      if (ef.comentarios) row("  Comentarios", ef.comentarios);
    }
  });
  spacer(2);

  // Pruebas osteomusculares
  if (h.resultadosPruebasOsteo) {
    title("Resultados Pruebas Osteomusculares");
    textBlock(h.resultadosPruebasOsteo);
    spacer(2);
  }

  // Inmunizaciones
  title("Inmunizaciones");
  twoCol([
    ["Fiebre Amarilla", h.inmunizaciones.fiebreAmarilla], ["Tétano", h.inmunizaciones.tetano],
    ["Dosis Tétano", h.inmunizaciones.tetanoDosis], ["Sars-Cov-2", h.inmunizaciones.sarsCov2Nombre],
    ["Dosis Sars-Cov-2", h.inmunizaciones.sarsCov2Dosis], ["Hepatitis B Dosis", h.inmunizaciones.hepatitisBDosis],
  ]);
  spacer(2);

  // Dictamen
  title("Dictamen");
  const dictamenText = [...h.dictamen, ...(h.dictamenOtro ? [h.dictamenOtro] : [])].join(" · ") || "—";
  textBlock(dictamenText);
  spacer(2);

  // PVE
  title("Programas de Vigilancia Epidemiológica");
  const pveLines = PVE_ITEMS.filter(p => h.pve[p.name]).map(p => `${p.name}: ${h.pve[p.name]}`);
  textBlock(pveLines.length ? pveLines.join(" | ") : "—");
  spacer(2);

  // Recomendaciones
  title("Recomendaciones");
  textBlock(h.recomendaciones);
  spacer(2);

  // Paraclínicos
  title("Exámenes Paraclínicos Realizados");
  const examList = [...h.paraclinicos, ...(h.otrosParaclinicos ? [h.otrosParaclinicos] : [])].join(", ") || "—";
  textBlock(examList);
  spacer(4);

  // Legalidad
  title("Legalidad", [100, 100, 100]);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic");
  const legalLines = doc.splitTextToSize(TEXTO_LEGAL, contentW);
  legalLines.forEach((line: string) => { ctx.checkY(5); doc.text(line, margin, getY()); setY(getY() + 4.2); });
  spacer(8);

  // Signatures
  const sigY = getY();
  const halfW = contentW / 2;
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("FIRMA Y SELLO DEL MÉDICO", margin + halfW / 2, sigY, { align: "center" });
  if (doctorFirma) { try { doc.addImage(doctorFirma, "PNG", margin + 5, sigY + 2, 38, 14); } catch (_) {} }
  if (doctorSello) { try { doc.addImage(doctorSello, "PNG", margin + 5, sigY + 18, 38, 14); } catch (_) {} }
  doc.line(margin, sigY + 35, margin + halfW - 4, sigY + 35);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text("Luis Gabriel Aldana Otero", margin + halfW / 2 - 12, sigY + 39);
  doc.text("Médico Salud Ocupacional", margin + halfW / 2 - 12, sigY + 43);

  const pX = margin + halfW + 4;
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("FIRMA DEL PACIENTE", pX + halfW / 2, sigY, { align: "center" });
  if (patient.firmaBase64) { try { doc.addImage(patient.firmaBase64, "PNG", pX + 5, sigY + 4, 52, 20); } catch (_) {} }
  doc.line(pX, sigY + 35, pX + halfW - 4, sigY + 35);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text(`${patient.nombres} ${patient.apellidos}`, pX + halfW / 2, sigY + 39, { align: "center" });

  doc.save(`Historia_${patient.apellidos}_${patient.nombres}.pdf`);
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide bg-blue-50 border border-blue-100 px-3 py-1.5 rounded mb-3 mt-1">
    {children}
  </h4>
);

const FL = ({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) => (
  <div className={span2 ? "col-span-2" : ""}>
    <Label className="text-xs font-medium text-gray-600 mb-1 block">{label}</Label>
    {children}
  </div>
);

const TA = ({ value, onChange, rows = 2 }: { value: string; onChange: (v: string) => void; rows?: number }) => (
  <Textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className="text-sm resize-none" />
);

const TI = ({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
);

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  patient: Patient;
  initialHistoria?: HistoriaForm;
  onSave: (data: HistoriaForm) => void;
  onClose: () => void;
}

export function HistoriaClinica({ patient, initialHistoria, onSave, onClose }: Props) {
  const [form, setForm] = useState<HistoriaForm>(initialHistoria ?? emptyHistoria);
  const [doctorImages, setDoctorImages] = useState<{ firma: string; sello: string } | null>(null);
  const [tab, setTab] = useState("examen");

  // Preload doctor images as base64
  useEffect(() => {
    const toB64 = (url: string) =>
      fetch(url).then(r => r.blob()).then(blob =>
        new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        })
      );
    Promise.all([toB64(doctorFirmaUrl), toB64(doctorSelloUrl)])
      .then(([firma, sello]) => setDoctorImages({ firma, sello }))
      .catch(() => {});
  }, []);

  // Auto-calculate IMC
  useEffect(() => {
    const peso = parseFloat(form.signosVitales.peso);
    const talla = parseFloat(form.signosVitales.talla);
    if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
      const newImc = (peso / (talla * talla)).toFixed(1);
      setForm(prev => {
        if (prev.signosVitales.imc === newImc) return prev;
        return { ...prev, signosVitales: { ...prev.signosVitales, imc: newImc } };
      });
    }
  }, [form.signosVitales.peso, form.signosVitales.talla]);

  // Generic setters
  const set = (field: keyof HistoriaForm, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setNested = <K extends keyof HistoriaForm>(key: K, field: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: { ...(prev[key] as Record<string, string>), [field]: value } }));

  const setSV = (field: string, value: string) => setNested("signosVitales", field, value);
  const setGineco = (field: string, value: string) => setNested("gineco", field, value);
  const setAntFam = (field: string, value: string) => setNested("antFamiliares", field, value);
  const setAntPers = (field: string, value: string) => setNested("antPersonales", field, value);
  const setHabitos = (field: string, value: string) => setNested("habitos", field, value);
  const setAF = (field: string, value: string) => setNested("actividadFisica", field, value);
  const setRS = (field: string, value: string) => setNested("revisionSistemas", field, value);
  const setInmun = (field: string, value: string) => setNested("inmunizaciones", field, value);

  const setEF = (seccion: string, field: "evidencias" | "comentarios", value: string) =>
    setForm(prev => ({
      ...prev,
      examenFisico: { ...prev.examenFisico, [seccion]: { ...prev.examenFisico[seccion], [field]: value } },
    }));

  const setPVE = (name: string, value: string) =>
    setForm(prev => ({ ...prev, pve: { ...prev.pve, [name]: value } }));

  const toggleRiesgo = (item: string, checked: boolean) =>
    setForm(prev => ({
      ...prev,
      tiposRiesgo: checked ? [...prev.tiposRiesgo, item] : prev.tiposRiesgo.filter(r => r !== item),
    }));

  const toggleDictamen = (item: string, checked: boolean) =>
    setForm(prev => ({
      ...prev,
      dictamen: checked ? [...prev.dictamen, item] : prev.dictamen.filter(d => d !== item),
    }));

  const toggleParaclinico = (item: string, checked: boolean) =>
    setForm(prev => ({
      ...prev,
      paraclinicos: checked ? [...prev.paraclinicos, item] : prev.paraclinicos.filter(p => p !== item),
    }));

  const handleSave = () => { onSave(form); toast.success("Historia clínica guardada"); };

  const handleCertPDF = () => {
    generateCertificadoPDF(patient, form, doctorImages?.firma ?? "", doctorImages?.sello ?? "");
  };
  const handleHistoriaPDF = () => {
    generateHistoriaPDF(patient, form, doctorImages?.firma ?? "", doctorImages?.sello ?? "");
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <p className="font-bold text-gray-900 text-base">Historia Clínica Ocupacional</p>
          <p className="text-xs text-gray-500">{patient.nombres} {patient.apellidos} · {patient.numeroIdentificacion}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCertPDF} className="gap-1.5">
            <FileDown className="size-4" /> Certificado PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleHistoriaPDF} className="gap-1.5">
            <FileDown className="size-4" /> Historia PDF
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Save className="size-4" /> Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-4 shrink-0">
          <TabsList className="h-9 bg-transparent gap-0 flex-wrap">
            {[
              ["examen", "Tipo de Examen"],
              ["antecedentes", "Antecedentes"],
              ["habitos", "Hábitos"],
              ["vitales", "Signos Vitales"],
              ["sistemas", "Rev. Sistemas"],
              ["fisico", "Examen Físico"],
              ["dictamen", "Dictamen / PVE"],
              ["paraclinicos", "Paraclínicos"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="text-xs px-3 h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── Tab: Tipo de Examen ─────────────────────────────────────────── */}
          <TabsContent value="examen" className="p-5 space-y-5 mt-0">
            <SectionTitle>Tipo de Examen y Énfasis</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <FL label="Tipo de Examen">
                <Select value={form.tipoExamen} onValueChange={v => set("tipoExamen", v)}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{TIPOS_EXAMEN.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FL>
              {form.tipoExamen === "Otros" && (
                <FL label="Especificar tipo">
                  <TI value={form.tipoExamenOtro} onChange={v => set("tipoExamenOtro", v)} />
                </FL>
              )}
              <FL label="Énfasis">
                <Select value={form.enfasis} onValueChange={v => set("enfasis", v)}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{ENFASIS_OPCIONES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </FL>
              {form.enfasis === "Otros" && (
                <FL label="Especificar énfasis">
                  <TI value={form.enfasisOtro} onChange={v => set("enfasisOtro", v)} />
                </FL>
              )}
            </div>

            <SectionTitle>Tipo de Riesgo</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {RIESGO_GRUPOS.map(grupo => (
                <div key={grupo.grupo} className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2 border-b pb-1">{grupo.grupo}</p>
                  <div className="space-y-1.5">
                    {grupo.items.map(item => (
                      <label key={item} className="flex items-start gap-2 cursor-pointer">
                        <Checkbox
                          id={`riesgo-${item}`}
                          checked={form.tiposRiesgo.includes(item)}
                          onCheckedChange={c => toggleRiesgo(item, !!c)}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-xs leading-tight text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Antecedentes ───────────────────────────────────────────── */}
          <TabsContent value="antecedentes" className="p-5 space-y-5 mt-0">
            <SectionTitle>Antecedentes Ginecobstétricos</SectionTitle>
            <div className="grid grid-cols-4 gap-3">
              {[
                ["FUR", "fur"], ["Método Planificación", "metodoPlanificacion"],
                ["Embarazos", "embarazos"], ["Partos", "parto"],
                ["Cesáreas", "cesarea"], ["Vivos", "vivos"],
                ["Abortos", "abortos"], ["Última Citología", "ultimaCitologia"],
              ].map(([label, field]) => (
                <FL key={field} label={label}>
                  <TI value={(form.gineco as Record<string, string>)[field]} onChange={v => setGineco(field, v)} />
                </FL>
              ))}
            </div>

            <SectionTitle>Antecedentes Familiares Relevantes</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <FL label="Maternos"><TA value={form.antFamiliares.maternos} onChange={v => setAntFam("maternos", v)} /></FL>
              <FL label="Paternos"><TA value={form.antFamiliares.paternos} onChange={v => setAntFam("paternos", v)} /></FL>
            </div>

            <SectionTitle>Antecedentes de Salud Personales</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <FL label="Clínicos"><TA value={form.antPersonales.clinicos} onChange={v => setAntPers("clinicos", v)} /></FL>
              <FL label="Alérgicos"><TA value={form.antPersonales.alergicos} onChange={v => setAntPers("alergicos", v)} /></FL>
              <FL label="Quirúrgicos"><TA value={form.antPersonales.quirurgicos} onChange={v => setAntPers("quirurgicos", v)} /></FL>
              <FL label="Medicamentos de uso permanente"><TA value={form.antPersonales.medicamentos} onChange={v => setAntPers("medicamentos", v)} /></FL>
              <FL label="Accidentes" span2><TA value={form.antPersonales.accidentes} onChange={v => setAntPers("accidentes", v)} /></FL>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Checkbox
                id="consentimiento"
                checked={form.consentimientoInformado}
                onCheckedChange={c => set("consentimientoInformado", !!c)}
              />
              <label htmlFor="consentimiento" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                <span className="font-semibold">Consentimiento Informado:</span> El paciente acepta y entiende el proceso del examen médico ocupacional, autoriza el manejo de sus datos según la normativa vigente.
              </label>
            </div>
          </TabsContent>

          {/* ── Tab: Hábitos ─────────────────────────────────────────────────── */}
          <TabsContent value="habitos" className="p-5 space-y-5 mt-0">
            <SectionTitle>Hábitos</SectionTitle>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Fumador</p>
              <div className="grid grid-cols-4 gap-3">
                <FL label="Fumador (Sí/No)"><TI value={form.habitos.fumador} onChange={v => setHabitos("fumador", v)} /></FL>
                <FL label="Tiempo en años"><TI value={form.habitos.fumadorAnios} onChange={v => setHabitos("fumadorAnios", v)} /></FL>
                <FL label="Frecuencia"><TI value={form.habitos.fumadorFrecuencia} onChange={v => setHabitos("fumadorFrecuencia", v)} /></FL>
                <FL label="Cantidad"><TI value={form.habitos.fumadorCantidad} onChange={v => setHabitos("fumadorCantidad", v)} /></FL>
              </div>
              <p className="text-xs font-semibold text-gray-600 mb-3 mt-4">Bebedor</p>
              <div className="grid grid-cols-3 gap-3">
                <FL label="Bebedor (Sí/No)"><TI value={form.habitos.bebedor} onChange={v => setHabitos("bebedor", v)} /></FL>
                <FL label="Tiempo en años"><TI value={form.habitos.bebedorAnios} onChange={v => setHabitos("bebedorAnios", v)} /></FL>
                <FL label="Frecuencia"><TI value={form.habitos.bebedorFrecuencia} onChange={v => setHabitos("bebedorFrecuencia", v)} /></FL>
              </div>
            </div>

            <SectionTitle>Actividad Física</SectionTitle>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Deporte</p>
              <div className="grid grid-cols-3 gap-3">
                <FL label="Practica deporte (Sí/No)"><TI value={form.actividadFisica.deporte} onChange={v => setAF("deporte", v)} /></FL>
                <FL label="Cuál"><TI value={form.actividadFisica.cual} onChange={v => setAF("cual", v)} /></FL>
                <FL label="Frecuencia"><TI value={form.actividadFisica.frecuenciaDeporte} onChange={v => setAF("frecuenciaDeporte", v)} /></FL>
              </div>
              <p className="text-xs font-semibold text-gray-600 mb-3 mt-4">Ejercicio rutinario</p>
              <div className="grid grid-cols-2 gap-3">
                <FL label="Ejercicio rutinario (Sí/No)"><TI value={form.actividadFisica.ejercicioRutinario} onChange={v => setAF("ejercicioRutinario", v)} /></FL>
                <FL label="Frecuencia"><TI value={form.actividadFisica.frecuenciaEjercicio} onChange={v => setAF("frecuenciaEjercicio", v)} /></FL>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Signos Vitales ──────────────────────────────────────────── */}
          <TabsContent value="vitales" className="p-5 space-y-5 mt-0">
            <SectionTitle>Signos Vitales y Datos Antropométricos</SectionTitle>
            <div className="grid grid-cols-3 gap-4">
              <FL label="T. Sistólica (mmHg)"><TI value={form.signosVitales.tSistolica} onChange={v => setSV("tSistolica", v)} placeholder="ej. 120" /></FL>
              <FL label="T. Diastólica (mmHg)"><TI value={form.signosVitales.tDiastolica} onChange={v => setSV("tDiastolica", v)} placeholder="ej. 80" /></FL>
              <FL label="Resultado Tensión Arterial"><TI value={form.signosVitales.resultadoTA} onChange={v => setSV("resultadoTA", v)} placeholder="Normal / Alta / Baja" /></FL>
              <FL label="F.C. (lpm)"><TI value={form.signosVitales.fc} onChange={v => setSV("fc", v)} placeholder="ej. 72" /></FL>
              <FL label="F.R. (rpm)"><TI value={form.signosVitales.fr} onChange={v => setSV("fr", v)} placeholder="ej. 18" /></FL>
              <FL label="Perímetro Abdominal (cm)"><TI value={form.signosVitales.perimAbdomen} onChange={v => setSV("perimAbdomen", v)} placeholder="ej. 85" /></FL>
              <FL label="Peso (Kg)"><TI value={form.signosVitales.peso} onChange={v => setSV("peso", v)} placeholder="ej. 70" /></FL>
              <FL label="Talla (m)"><TI value={form.signosVitales.talla} onChange={v => setSV("talla", v)} placeholder="ej. 1.70" /></FL>
              <FL label="IMC (calculado automáticamente)">
                <div className="flex items-center h-8 px-3 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-blue-800 font-semibold text-sm">
                    {form.signosVitales.imc || "—"}
                    {form.signosVitales.imc && (
                      <span className="text-xs font-normal text-blue-600 ml-2">
                        {parseFloat(form.signosVitales.imc) < 18.5 ? "Bajo peso" :
                          parseFloat(form.signosVitales.imc) < 25 ? "Normal" :
                            parseFloat(form.signosVitales.imc) < 30 ? "Sobrepeso" : "Obesidad"}
                      </span>
                    )}
                  </span>
                </div>
              </FL>
            </div>
          </TabsContent>

          {/* ── Tab: Revisión por Sistemas ───────────────────────────────────── */}
          <TabsContent value="sistemas" className="p-5 space-y-5 mt-0">
            <SectionTitle>Revisión por Sistemas</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Cabeza, cuello y órgano de los sentidos", "cabezaCuello"],
                ["CardioRrespiratorio", "cardioRespiratorio"],
                ["GastroIntestinal", "gastroIntestinal"],
                ["Genitourinario", "genitourinario"],
                ["Músculo esquelético", "musculoEsqueletico"],
                ["Neurológico", "neurologico"],
                ["Psicológico y Mental", "psicologico"],
                ["Observaciones", "observaciones"],
              ].map(([label, field]) => (
                <FL key={field} label={label}>
                  <TA value={(form.revisionSistemas as Record<string, string>)[field]} onChange={v => setRS(field, v)} />
                </FL>
              ))}
            </div>

            <SectionTitle>Sintomatología Reportada por el Trabajador</SectionTitle>
            <TA value={form.sintomatologia} onChange={v => set("sintomatologia", v)} rows={4} />

            <SectionTitle>Resultados Pruebas Osteomusculares Aplicadas</SectionTitle>
            <TA value={form.resultadosPruebasOsteo} onChange={v => set("resultadosPruebasOsteo", v)} rows={4} />
          </TabsContent>

          {/* ── Tab: Examen Físico ───────────────────────────────────────────── */}
          <TabsContent value="fisico" className="p-5 mt-0">
            <SectionTitle>Examen Físico</SectionTitle>
            <div className="grid grid-cols-1 gap-3">
              {EXAMEN_FISICO_SECCIONES.map(sec => (
                <div key={sec} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-800 mb-2 border-b pb-1">{sec}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FL label="Evidencias Clínicas">
                      <TA value={form.examenFisico[sec]?.evidencias ?? ""} onChange={v => setEF(sec, "evidencias", v)} />
                    </FL>
                    <FL label="Comentarios">
                      <TA value={form.examenFisico[sec]?.comentarios ?? ""} onChange={v => setEF(sec, "comentarios", v)} />
                    </FL>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Dictamen / PVE ──────────────────────────────────────────── */}
          <TabsContent value="dictamen" className="p-5 space-y-5 mt-0">
            <SectionTitle>Datos del Certificado</SectionTitle>
            <div className="grid grid-cols-3 gap-4">
              <FL label="Lugar de realización">
                <TI value={form.lugarRealizacion} onChange={v => set("lugarRealizacion", v)} placeholder="Ciudad / consultorio" />
              </FL>
              <FL label="Realizado por">
                <TI value={form.realizadoPor} onChange={v => set("realizadoPor", v)} />
              </FL>
              <FL label="Fecha del examen">
                <Input type="date" value={form.fechaExamen} onChange={e => set("fechaExamen", e.target.value)} className="h-8 text-sm" />
              </FL>
            </div>

            <SectionTitle>Inmunizaciones</SectionTitle>
            <div className="grid grid-cols-3 gap-4">
              <FL label="Fiebre Amarilla"><TI value={form.inmunizaciones.fiebreAmarilla} onChange={v => setInmun("fiebreAmarilla", v)} placeholder="Sí / No / Fecha" /></FL>
              <FL label="Tétano"><TI value={form.inmunizaciones.tetano} onChange={v => setInmun("tetano", v)} placeholder="Sí / No / Fecha" /></FL>
              <FL label="Dosis Tétano"><TI value={form.inmunizaciones.tetanoDosis} onChange={v => setInmun("tetanoDosis", v)} /></FL>
              <FL label="Sars-Cov-2 (Nombre)"><TI value={form.inmunizaciones.sarsCov2Nombre} onChange={v => setInmun("sarsCov2Nombre", v)} /></FL>
              <FL label="Dosis Sars-Cov-2"><TI value={form.inmunizaciones.sarsCov2Dosis} onChange={v => setInmun("sarsCov2Dosis", v)} /></FL>
              <FL label="Hepatitis B (Dosis)"><TI value={form.inmunizaciones.hepatitisBDosis} onChange={v => setInmun("hepatitisBDosis", v)} /></FL>
            </div>

            <SectionTitle>Dictamen</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {DICTAMEN_OPCIONES.map(op => (
                <label key={op} className="flex items-center gap-2 cursor-pointer bg-white border rounded-lg px-3 py-2">
                  <Checkbox
                    id={`dictamen-${op}`}
                    checked={form.dictamen.includes(op)}
                    onCheckedChange={c => toggleDictamen(op, !!c)}
                  />
                  <span className="text-sm text-gray-700">{op}</span>
                </label>
              ))}
            </div>
            <FL label="Otro dictamen (especificar)">
              <TI value={form.dictamenOtro} onChange={v => set("dictamenOtro", v)} />
            </FL>

            <SectionTitle>Programas de Vigilancia Epidemiológica (PVE)</SectionTitle>
            <div className="grid grid-cols-1 gap-3">
              {PVE_ITEMS.map(pve => (
                <div key={pve.name} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex-1">{pve.name}</span>
                  <RadioGroup
                    value={form.pve[pve.name] || ""}
                    onValueChange={v => setPVE(pve.name, v)}
                    className="flex gap-4"
                  >
                    {pve.opciones.map(op => (
                      <div key={op} className="flex items-center gap-1.5">
                        <RadioGroupItem value={op} id={`pve-${pve.name}-${op}`} />
                        <Label htmlFor={`pve-${pve.name}-${op}`} className="text-sm cursor-pointer">{op}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <SectionTitle>Recomendaciones</SectionTitle>
            <TA value={form.recomendaciones} onChange={v => set("recomendaciones", v)} rows={4} />
          </TabsContent>

          {/* ── Tab: Paraclínicos ───────────────────────────────────────────── */}
          <TabsContent value="paraclinicos" className="p-5 space-y-5 mt-0">
            <SectionTitle>Exámenes Paraclínicos Realizados</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PARACLINICOS.map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer bg-white border rounded-lg px-3 py-2">
                  <Checkbox
                    id={`para-${p}`}
                    checked={form.paraclinicos.includes(p)}
                    onCheckedChange={c => toggleParaclinico(p, !!c)}
                  />
                  <span className="text-xs text-gray-700">{p}</span>
                </label>
              ))}
            </div>
            <FL label="Otros paraclínicos (especificar)">
              <TI value={form.otrosParaclinicos} onChange={v => set("otrosParaclinicos", v)} />
            </FL>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Legalidad</p>
              <p className="text-xs text-gray-600 leading-relaxed">{TEXTO_LEGAL}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={handleCertPDF} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <FileDown className="size-4" /> Descargar Certificado PDF
              </Button>
              <Button onClick={handleHistoriaPDF} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <FileDown className="size-4" /> Descargar Historia Completa PDF
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
