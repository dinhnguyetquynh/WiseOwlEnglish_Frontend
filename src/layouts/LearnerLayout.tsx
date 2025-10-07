// src/layouts/LearnerLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/learner/ui/Sidebar";
import "../styles/LearnerLayout.css";
export default function LearnerLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
