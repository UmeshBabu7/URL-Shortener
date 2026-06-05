import { useState } from "react";
import Shortener from "./components/Shortener";
import Dashboard from "./components/Dashboard";
import styles from "./App.module.css";

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewURL = () => setRefreshTrigger((n) => n + 1);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>✂</span>
            <span className={styles.logoText}>SNIP</span>
          </div>
          <div className={styles.headerTag}>URL SHORTENER + ANALYTICS</div>
        </div>
        <div className={styles.headerLine} />
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <Shortener onNewURL={handleNewURL} />
          <Dashboard refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>GREPSR ASSESSMENT</span>
        <span className={styles.footerDot}>·</span>
        <span>RATE-LIMITED URL SHORTENER</span>
      </footer>
    </div>
  );
}
