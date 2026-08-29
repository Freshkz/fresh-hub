import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import useSiteSettings from "./hooks/useSiteSettings";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Projects from "./pages/Projects";
import News from "./pages/News";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import DownloadsAdmin from "./pages/admin/DownloadsAdmin";
import NewsAdmin from "./pages/admin/NewsAdmin";
import SocialsAdmin from "./pages/admin/SocialsAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

export default function App() {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/news" element={<News />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><ProjectsAdmin /></ProtectedRoute>} />
          <Route path="/admin/downloads" element={<ProtectedRoute><DownloadsAdmin /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><NewsAdmin /></ProtectedRoute>} />
          <Route path="/admin/socials" element={<ProtectedRoute><SocialsAdmin /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><SettingsAdmin /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
