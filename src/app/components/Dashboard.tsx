import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Stethoscope, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "./ui/badge";

const monthlyData = [
  { month: "Ene", examenes: 45, incidentes: 2, capacitaciones: 8 },
  { month: "Feb", examenes: 52, incidentes: 1, capacitaciones: 12 },
  { month: "Mar", examenes: 48, incidentes: 3, capacitaciones: 10 },
  { month: "Abr", examenes: 61, incidentes: 1, capacitaciones: 15 },
  { month: "May", examenes: 55, incidentes: 2, capacitaciones: 18 },
  { month: "Jun", examenes: 67, incidentes: 0, capacitaciones: 20 },
];

const incidentsByType = [
  { name: "Caídas", value: 35, color: "#3b82f6" },
  { name: "Cortes", value: 28, color: "#8b5cf6" },
  { name: "Ergonómicos", value: 22, color: "#10b981" },
  { name: "Químicos", value: 15, color: "#f59e0b" },
];

const riskLevels = [
  { area: "Producción", alto: 3, medio: 8, bajo: 12 },
  { area: "Almacén", alto: 2, medio: 5, bajo: 15 },
  { area: "Oficinas", alto: 0, medio: 2, bajo: 20 },
  { area: "Laboratorio", alto: 4, medio: 6, bajo: 8 },
];

const recentIncidents = [
  { id: 1, employee: "Juan Pérez", type: "Caída", severity: "Leve", date: "2026-05-25", status: "Cerrado" },
  { id: 2, employee: "María González", type: "Corte", severity: "Moderado", date: "2026-05-23", status: "En investigación" },
  { id: 3, employee: "Carlos Ruiz", type: "Ergonómico", severity: "Leve", date: "2026-05-20", status: "Cerrado" },
];

const upcomingExams = [
  { id: 1, employee: "Ana Martínez", type: "Periódico", date: "2026-06-02", status: "Pendiente" },
  { id: 2, employee: "Luis Torres", type: "Ingreso", date: "2026-06-05", status: "Programado" },
  { id: 3, employee: "Sofia Ramírez", type: "Egreso", date: "2026-06-08", status: "Pendiente" },
];

export function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general del sistema de salud ocupacional</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Empleados</CardTitle>
            <Users className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="size-4 text-green-600" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Exámenes Pendientes</CardTitle>
            <Stethoscope className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="size-4 text-red-600" />
              <span className="text-red-600">-5%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Incidentes Este Mes</CardTitle>
            <AlertTriangle className="size-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="size-4 text-green-600" />
              <span className="text-green-600">-50%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cumplimiento</CardTitle>
            <CheckCircle className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="size-4 text-green-600" />
              <span className="text-green-600">+2%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="examenes" stroke="#3b82f6" strokeWidth={2} name="Exámenes" />
                <Line type="monotone" dataKey="incidentes" stroke="#ef4444" strokeWidth={2} name="Incidentes" />
                <Line type="monotone" dataKey="capacitaciones" stroke="#10b981" strokeWidth={2} name="Capacitaciones" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidentes por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Riesgos por Área</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alto" fill="#ef4444" name="Riesgo Alto" />
              <Bar dataKey="medio" fill="#f59e0b" name="Riesgo Medio" />
              <Bar dataKey="bajo" fill="#10b981" name="Riesgo Bajo" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidentes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{incident.employee}</p>
                    <p className="text-sm text-gray-600">{incident.type} - {incident.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={incident.severity === "Leve" ? "secondary" : "destructive"}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={incident.status === "Cerrado" ? "outline" : "default"}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Exámenes Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{exam.employee}</p>
                    <p className="text-sm text-gray-600">{exam.type} - {exam.date}</p>
                  </div>
                  <Badge variant={exam.status === "Programado" ? "default" : "secondary"}>
                    {exam.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
