import {
  type InputHTMLAttributes,
} from "react";

type InputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  };

function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={props.id ?? props.name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <input
        id={
          props.id ??
          props.name
        }
        {...props}
        className={`
          w-full rounded-xl border bg-white px-4 py-3
          text-slate-900 outline-none transition
          placeholder:text-slate-400
          focus:border-orange-500
          focus:ring-2 focus:ring-orange-100
          disabled:cursor-not-allowed
          disabled:bg-slate-100
          disabled:text-slate-500

          dark:bg-slate-900
          dark:text-white
          dark:placeholder:text-slate-500
          dark:disabled:bg-slate-800
          dark:disabled:text-slate-500
          dark:focus:border-orange-500
          dark:focus:ring-orange-500/10

          ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-slate-200 dark:border-slate-600"
          }

          ${className}
        `}
      />

      {error && (
        <p
          role="alert"
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;