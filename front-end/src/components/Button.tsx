import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  loading?: boolean
}

function Button({
  children,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        w-full rounded-xl bg-gradient-to-r
        from-orange-500 to-amber-500
        px-4 py-3 font-semibold text-white
        shadow-lg shadow-orange-200
        transition duration-200
        hover:-translate-y-0.5 hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-orange-200
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
      {...props}
    >
      {loading ? 'Connexion...' : children}
    </button>
  )
}

export default Button