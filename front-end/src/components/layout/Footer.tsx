import {
  Code2,
} from "lucide-react";

import {
  useTranslation,
} from "react-i18next";
import { Link } from "react-router-dom";

function Footer() {
  const {
    t,
  } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center transition-colors dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        © 2026 SGPBSE —{" "}
        {t(
          "footer.rights",
        )}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Code2
          size={13}
          className="text-orange-500"
        />

        <span>
          {t(
            "footer.developedBy",
          )}
        </span>

        <Link
          to="/team"
          className="font-semibold text-slate-500 transition-colors hover:text-orange-500 dark:text-slate-400"
        >
          {t("footer.developer1")} {t("footer.and")} {t("footer.developer2")}
        </Link>

        <span className="hidden sm:inline">
          •
        </span>

        <span>
          v1.0.0
        </span>
      </div>
    </footer>
  );
}

export default Footer;