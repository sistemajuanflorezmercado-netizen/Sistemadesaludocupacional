import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  AlertTriangle,
  Shield,
  GraduationCap,
  FileText,
  Activity,
  UserRound,
} from "lucide-react";
import { cn } from "./ui/utils";

export function Layout() {
  const navigation = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
    { name: "Pacientes", to: "/patients", icon: UserRound },
    { name: "Empleados", to: "/employees", icon: Users },
    { name: "Exámenes Médicos", to: "/medical-exams", icon: Stethoscope },
    { name: "Incidentes", to: "/incidents", icon: AlertTriangle },
    { name: "Evaluaciones de Riesgo", to: "/risk-assessments", icon: Shield },
    { name: "Capacitaciones", to: "/training", icon: GraduationCap },
    { name: "Reportes", to: "/reports", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Salud Ocupacional</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-5", isActive ? "text-blue-600" : "text-gray-500")} />
                    <span className="font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              AD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-gray-500">admin@empresa.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
