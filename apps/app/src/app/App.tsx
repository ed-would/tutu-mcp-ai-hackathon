import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { DiscoverPage } from "../pages/DiscoverPage";
import { GuidePage } from "../pages/GuidePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

// Design checkpoint — Intent: help an overwhelmed traveler make one confident next choice.
// Hierarchy: one focal CTA per view; Palette: warm near-white canvas with #0D0B68 ink and #7D71FF action.
// Depth: quiet borders and small shadows; Surfaces: paper-like layers; Typography: system sans, >=16px body.
// Spacing: a deliberate 4px grid with generous section rhythm.
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
      <Footer />
    </div>
  );
}

function Header() {
  const location = useLocation();

  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Туту Куда? — на главную">
        <span className="wordmark-mark" aria-hidden="true">Т</span>
        <span>Туту Куда?</span>
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation">
        <NavLink className={getNavClass} to="/discover">Маршрут</NavLink>
        <NavLink className={getNavClass} to="/guide">Как это работает</NavLink>
      </nav>
      <span className="route-thread" aria-live="polite">
        {location.pathname === "/discover" ? "ваш маршрут · 01" : location.pathname === "/guide" ? "ваш маршрут · гид" : "ваш маршрут · старт"}
      </span>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>Поездки, собранные вокруг вас.</span>
      <span className="footer-dot" aria-hidden="true">·</span>
      <span>На базе Туту MCP</span>
    </footer>
  );
}

function getNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}
