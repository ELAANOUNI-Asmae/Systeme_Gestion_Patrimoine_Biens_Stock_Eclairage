import Logo from '../../components/common/Logo'

type HeaderProps = {
  onMenuClick?: () => void;
};

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      {/* La gauche*/}
      <div className="flex items-center gap-3">
        {/* buton d'ouvrire et fernmer la Sidebar */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Logo*/}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl">
            <Logo className="mb-3 h-20 w-20 object-contain" />
          </div>

          <div>
            <p className="text-base font-bold leading-tight text-slate-900">
              SGPBSE
            </p>

            <p className="hidden text-xs text-slate-500 sm:block">
              Gestion du patrimoine communal
            </p>
          </div>
        </div>
      </div>

      {/* Droite */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          </svg>

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </button>

        {/* info utilisateur */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-800">
              Administrateur
            </p>

            <p className="text-xs text-slate-500">
              admin@sgpbse.ma
            </p>
          </div>

          <button
            type="button"
            aria-label="Menu utilisateur"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 transition hover:bg-orange-200"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;