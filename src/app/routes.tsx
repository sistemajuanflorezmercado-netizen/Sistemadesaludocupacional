import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Patients } from "./components/Patients";
import { Employees } from "./components/Employees";
import { MedicalExams } from "./components/MedicalExams";
import { Incidents } from "./components/Incidents";
import { RiskAssessments } from "./components/RiskAssessments";
import { Training } from "./components/Training";
import { Reports } from "./components/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "patients", Component: Patients },
      { path: "employees", Component: Employees },
      { path: "medical-exams", Component: MedicalExams },
      { path: "incidents", Component: Incidents },
      { path: "risk-assessments", Component: RiskAssessments },
      { path: "training", Component: Training },
      { path: "reports", Component: Reports },
    ],
  },
]);
