import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

function MainLayout() {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(
        window.innerWidth >=
          1024,
      );
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(
      (previous) =>
        !previous,
    );
  };

  const closeSidebarOnMobile =
    () => {
      if (
        window.innerWidth <
        1024
      ) {
        setIsSidebarOpen(
          false,
        );
      }
    };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-900">
      <Header
        onMenuClick={
          toggleSidebar
        }
      />

      <div className="relative flex flex-1">
        {isSidebarOpen && (
          <>
            <button
              type="button"
              aria-label="Fermer le menu"
              className="fixed inset-0 top-18 z-20 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
              onClick={
                closeSidebarOnMobile
              }
            />

            <div className="fixed bottom-0 start-s-0 top-18 z-30 w-[85%] max-w-72 shadow-2xl lg:sticky lg:top-18 lg:z-10 lg:w-72 lg:max-w-none lg:self-start lg:shadow-none">
              <Sidebar
                onNavigate={
                  closeSidebarOnMobile
                }
              />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-4 transition-colors sm:p-6 lg:p-8">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;