import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const monthlyIncidents = [
  { month: "Ene", leves: 3, moderados: 1, graves: 0 },
  { month: "Feb", leves: 2, moderados: 0, graves: 1 },
  { month: "Mar", leves: 4, moderados: 2, graves: 0 },
  { month: "Abr", leves: 2, moderados: 1, graves: 0 },
  { month: "May", leves: 3, moderados: 1, graves: 0 },
  { month: "Jun", leves: 1, moderados: 0, graves: 0 },
];

const examResults = [
  { name: "Apto", value: 215, color: "#10b981" },
  { name: "Apto con restricciones", value: 28, color: "#f59e0b" },
  { name: "No apto", value: 5, color: "#ef4444" },
];

const trainingByCategory = [
  { category: "Seguridad", completados: 45, programados: 12 },
  { category: "Salud", completados: 32, programados: 8 },
  { category: "Emergencias", completados: 28, programados: 5 },
  { category: "EPP", completados: 38, programados: 15 },
  { category: "Ergonomía", completados: 25, programados: 10 },
  { category: "Primeros Auxilios", completados: 20, programados: 6 },
];

const riskMatrix = [
  { area: "Producción", critico: 2, alto: 5, medio: 8, bajo: 10 },
  { area: "Almacén", critico: 0, alto: 2, medio: 6, bajo: 15 },
  { area: "Laboratorio", critico: 1, alto: 4, medio: 5, bajo: 8 },
  { area: "Mantenimiento", critico: 1, alto: 3, medio: 7, bajo: 12 },
  { area: "Oficinas", critico: 0, alto: 0, medio: 3, bajo: 20 },
];

const complianceMetrics = [
  { metric: "Exámenes Médicos al Día", value: 94, target: 95 },
  { metric: "Capacitaciones Completadas", value: 88, target: 90 },
  { metric: "EPP Distribuido", value: 98, target: 100 },
  { metric: "Evaluaciones de Riesgo", value: 82, target: 85 },
  { metric: "Incidentes Cerrados", value: 96, target: 95 },
];

const departmentStats = [
  { department: "Producción", employees: 85, incidents: 8, trainings: 42, exams: 82 },
  { department: "Almacén", employees: 32, incidents: 3, trainings: 28, exams: 31 },
  { department: "Laboratorio", employees: 18, incidents: 2, trainings: 15, exams: 18 },
  { department: "Mantenimiento", employees: 25, incidents: 5, trainings: 22, exams: 25 },
  { department: "Oficinas", employees: 65, incidents: 1, trainings: 58, exams: 63 },
  { department: "Administración", employees: 23, incidents: 0, trainings: 20, exams: 23 },
];

export function Reports() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-gray-500 mt-1">Indicadores y estadísticas del sistema de salud ocupacional</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2026">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="size-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="exams">Exámenes Médicos</TabsTrigger>
          <TabsTrigger value="training">Capacitaciones</TabsTrigger>
          <TabsTrigger value="risks">Riesgos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceMetrics.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{metric.value}%</span>
                        {metric.value >= metric.target ? (
                          <TrendingUp className="size-4 text-green-600" />
                        ) : (
                          <AlertCircle className="size-4 text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          metric.value >= metric.target ? "bg-green-600" : "bg-orange-500"
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Meta: {metric.target}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Empleados</TableHead>
                    <TableHead className="text-right">Incidentes</TableHead>
                    <TableHead className="text-right">Capacitaciones</TableHead>
                    <TableHead className="text-right">Exámenes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell className="text-right">{dept.employees}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={dept.incidents > 5 ? "destructive" : "secondary"}>
                          {dept.incidents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{dept.trainings}</TableCell>
                      <TableCell className="text-right">{dept.exams}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incidentes por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyIncidents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leves" fill="#10b981" name="Leves" />
                    <Bar dataKey="moderados" fill="#f59e0b" name="Moderados" />
                    <Bar dataKey="graves" fill="#ef4444" name="Graves" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyIncidents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="leves"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Leves"
                    />
                    <Line
                      type="monotone"
                      dataKey="moderados"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Moderados"
                    />
                    <Line
                      type="monotone"
                      dataKey="graves"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Graves"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {monthlyIncidents.reduce((acc, m) => acc + m.leves, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Incidentes Leves</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {monthlyIncidents.reduce((acc, m) => acc + m.moderados, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Incidentes Moderados</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {monthlyIncidents.reduce((acc, m) => acc + m.graves, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Incidentes Graves</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resultados de Exámenes Médicos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={examResults}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {examResults.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Exámenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {examResults.map((result) => (
                    <div key={result.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-2xl font-bold" style={{ color: result.color }}>
                          {result.value}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: result.color,
                            width: `${(result.value / examResults.reduce((acc, r) => acc + r.value, 0)) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {((result.value / examResults.reduce((acc, r) => acc + r.value, 0)) * 100).toFixed(1)}% del total
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacitaciones por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trainingByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completados" fill="#10b981" name="Completados" />
                  <Bar dataKey="programados" fill="#3b82f6" name="Programados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {trainingByCategory.reduce((acc, t) => acc + t.completados, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Capacitaciones Completadas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {trainingByCategory.reduce((acc, t) => acc + t.programados, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Capacitaciones Programadas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">92%</div>
                  <p className="text-sm text-gray-600 mt-1">Tasa de Asistencia</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Riesgos por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riskMatrix}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critico" fill="#dc2626" name="Crítico" />
                  <Bar dataKey="alto" fill="#f59e0b" name="Alto" />
                  <Bar dataKey="medio" fill="#3b82f6" name="Medio" />
                  <Bar dataKey="bajo" fill="#10b981" name="Bajo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {riskMatrix.reduce((acc, r) => acc + r.critico, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Riesgos Críticos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {riskMatrix.reduce((acc, r) => acc + r.alto, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Riesgos Altos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {riskMatrix.reduce((acc, r) => acc + r.medio, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Riesgos Medios</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {riskMatrix.reduce((acc, r) => acc + r.bajo, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Riesgos Bajos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
