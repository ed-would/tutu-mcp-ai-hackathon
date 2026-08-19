export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-ticket">
        <p className="footer-panel footer-panel-from">
          <span className="footer-kicker">Маршрут</span>
          <span className="footer-display">Поездки</span>
          <span className="footer-rest">собранные вокруг вас</span>
        </p>
        <div className="footer-join" aria-hidden="true">
          <span className="footer-join-rule" />
          <FooterThread />
        </div>
        <p className="footer-panel footer-panel-to">
          <span className="footer-stamp">Live</span>
          <span className="footer-kicker">На базе</span>
          <span className="footer-brand">
            <img
              className="footer-tutu-mark"
              src="/logo.png"
              alt="Туту"
              width={930}
              height={260}
              decoding="async"
            />
            <span className="footer-display">MCP</span>
          </span>
        </p>
      </div>
    </footer>
  );
}

export function FooterThread() {
  return (
    <svg className="footer-thread" viewBox="4 10 40 36" focusable="false">
      <path
        className="footer-thread-glow"
        d="M10 38 C16 30, 15 22, 23 18 C29 14, 36 16, 36 23 C36 29, 31 31, 29 34"
      />
      <path className="footer-thread-path" d="M10 38 C16 30, 15 22, 23 18" />
      <path className="footer-thread-path footer-thread-ask-path" d="M23 18 C29 14, 36 16, 36 23 C36 29, 31 31, 29 34" />
      <circle className="footer-thread-origin" cx="10" cy="38" r="2.7" />
      <circle className="footer-thread-ask" cx="29" cy="40" r="2.5" />
    </svg>
  );
}
