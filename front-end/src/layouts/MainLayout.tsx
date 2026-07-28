import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((previousState) => !previousState);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex flex-1 flex-col lg:flex-row">
        {isSidebarOpen && <Sidebar />}

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;