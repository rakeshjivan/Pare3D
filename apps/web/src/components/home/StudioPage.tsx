"use client";

/*
 * Build 104: the head of CAD Studio's own page.
 */
import { Plus, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import type { PareStudio } from "@/lib/pareStudio";

export function StudioHeader({
  studio,
  onHome,
  onNew,
  onImport,
  extra,
}: {
  studio: PareStudio;
  onHome: () => void;
  onNew: () => void;
  onImport: () => void;
  extra?: ReactNode;
}) {
  useLanguage();
  return (
    <div className={`studio-head ${studio}`}>
      <div className="studio-head-inner">
        <div className="studio-head-text">
          <nav className="studio-crumbs" aria-label={t("home.breadcrumb")}>
            <button type="button" onClick={onHome}>{t("home.tabHome")}</button>
            <span aria-hidden="true">/</span>
            <span>{t("home.cadStudio")}</span>
          </nav>
          <h1><span className={`home-studio-mark ${studio}`} aria-hidden="true" />{t("home.cadStudio")}</h1>
          <p>{t("home.cadPageSummary")}</p>
          {extra}
        </div>
        <div className="studio-head-actions">
          <button type="button" className="home-secondary" onClick={onImport}>
            <Upload size={16} strokeWidth={2.2} aria-hidden="true" />
            {t("home.importCad")}
          </button>
          <button type="button" className="home-primary cad" onClick={onNew}>
            <Plus size={17} strokeWidth={2.4} aria-hidden="true" />
            {t("home.newDesign")}
          </button>
        </div>
      </div>
    </div>
  );
}
