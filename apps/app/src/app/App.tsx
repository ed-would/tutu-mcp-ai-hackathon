import { NavLink, Route, Routes } from "react-router-dom";
import { Wordmark } from "../components/BrandMark";
import { SiteFooter } from "../components/SiteFooter";
import { DiscoverPage } from "../pages/DiscoverPage";
import { GuidePage } from "../pages/GuidePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Wordmark />
        <nav className="primary-nav" aria-label="Основная навигация">
          <NavLink className={getNavClass} to="/discover">Маршрут</NavLink>
          <NavLink className={getNavClass} to="/guide">Как это работает</NavLink>
        </nav>
      </div>
    </header>
  );
}

function getNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}
