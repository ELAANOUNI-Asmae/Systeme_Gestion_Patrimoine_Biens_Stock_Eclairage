import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={id}
        className={`
          w-full rounded-xl border bg-white px-4 py-3
          text-slate-800 outline-none transition
          placeholder:text-slate-400
          focus:border-orange-500 focus:ring-4 focus:ring-orange-100
          ${error ? 'border-red-500' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input