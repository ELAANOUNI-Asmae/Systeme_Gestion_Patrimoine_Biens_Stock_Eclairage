import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Input from './Input'
import { loginUser } from '../services/authService'

type FormErrors = {
  email?: string
  password?: string
  general?: string
}

function LoginForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est obligatoire."
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Le format de l'adresse e-mail est invalide."
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire.'
    } else if (password.length < 6) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 6 caractères.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})

      await loginUser({
        email,
        password,
      })

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      navigate('/dashboard')
    } catch {
      setErrors({
        general: 'Email ou mot de passe incorrect.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {errors.general && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
          {errors.general}
        </div>
      )}

      <Input
        id="email"
        label="Adresse e-mail"
        type="email"
        placeholder="Entrez votre adresse e-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        id="password"
        label="Mot de passe"
        type="password"
        placeholder="Entrez votre mot de passe"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-orange-500"
          />

          Se souvenir de moi
        </label>

        <button
          type="button"
          className="font-semibold text-orange-600 transition hover:text-orange-700"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <Button type="submit" loading={loading}>
        Se connecter
      </Button>
    </form>
  )
}

export default LoginForm