import LoginForm from '../components/LoginForm'
import Logo from '../components/Logo'

function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl shadow-slate-200 sm:p-10">
            <div className="mb-8">
              <Logo className="mb-6 h-20 w-20 object-contain" />

              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
                SGPBSE
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Bienvenue
              </h1>

              <p className="mt-3 leading-6 text-slate-500">
                Connectez-vous pour accéder à la plateforme de gestion du
                patrimoine, des biens, du stock et de l'éclairage public.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Accès réservé aux utilisateurs autorisés.
            </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 lg:flex lg:items-center lg:justify-center">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-orange-700/20 blur-3xl" />

          <div className="relative z-10 max-w-xl px-12 text-center text-white">
            <div className="mx-auto mb-8 flex h-72 w-72 items-center justify-center rounded-full bg-white/20 shadow-2xl shadow-orange-800/20 backdrop-blur-md">
              <Logo className="h-60 w-60 object-contain drop-shadow-2xl" />
            </div>

            <h2 className="text-4xl font-extrabold leading-tight">
              Une gestion centralisée, simple et intelligente
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-white/90">
              Suivez les biens, gérez le stock et organisez les opérations
              d'éclairage public depuis une plateforme unique.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage