import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand-logo">Cora Extrator</Link>
            <p className="brand-tagline italic">
              Extraindo a essência visual da web, <br />
              um kit de cada vez.
            </p>
          </div>
          
          <div className="footer-grid">
            <div className="footer-column">
              <p className="footer-label">// navegação</p>
              <nav className="footer-links">
                <Link to="/">Início</Link>
                <Link to="/library">Biblioteca</Link>
                <Link to="/apoiar">Apoiar Projeto</Link>
              </nav>
            </div>
            
            <div className="footer-column">
              <p className="footer-label">// legal</p>
              <nav className="footer-links">
                <Link to="/termos" className="opacity-50 pointer-events-none">Termos</Link>
                <Link to="/privacidade" className="opacity-50 pointer-events-none">Privacidade</Link>
              </nav>
            </div>
            
            <div className="footer-column">
              <p className="footer-label">// contato</p>
              <a href="mailto:picpayultra@gmail.com" className="footer-email">
                picpayultra@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Cora Extrator. Desenvolvido com precisão.
          </p>
          <div className="footer-status">
            <span className="status-dot"></span>
            Sistemas Operacionais
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          border-top: 1px solid var(--hairline, rgba(10,10,10,0.15));
          padding: 80px 40px 40px;
          background: transparent;
          margin-top: auto;
        }
        .footer-content {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .footer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 60px;
          margin-bottom: 80px;
        }
        .footer-brand {
          max-width: 300px;
        }
        .brand-logo {
          font-family: 'Courier Prime', monospace;
          font-size: 14px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--sumi, #0A0A0A);
          text-decoration: none;
          display: block;
          margin-bottom: 20px;
        }
        .brand-tagline {
          font-family: 'Libre Baskerville', serif;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(10,10,10,0.6);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(140px, auto));
          gap: 48px;
        }
        .footer-label {
          font-family: 'Courier Prime', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.4);
          margin-bottom: 24px;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links a, .footer-email {
          font-family: 'Courier Prime', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sumi, #0A0A0A);
          text-decoration: none;
          transition: all 150ms ease;
          opacity: 0.75;
        }
        .footer-links a:hover, .footer-email:hover {
          opacity: 1;
          color: var(--hanko, #8B1A1A);
          transform: translateX(4px);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          border-top: 1px solid rgba(10,10,10,0.08);
        }
        .copyright {
          font-family: 'Courier Prime', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.4);
        }
        .footer-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Courier Prime', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.5);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        @media (max-width: 768px) {
          .footer-main {
            flex-direction: column;
            gap: 48px;
          }
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            width: 100%;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
