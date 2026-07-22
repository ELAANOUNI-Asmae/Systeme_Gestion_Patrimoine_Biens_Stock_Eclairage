import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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

  const [email, setEmail] = useState(
      () => localStorage.getItem('rememberedEmail') ?? '',
  )

  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(
      () => Boolean(localStorage.getItem('rememberedEmail')),
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est obligatoire."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Le format de l'adresse e-mail est invalide."
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire.'
    } else if (password.length < 8) {
      newErrors.password =
          'Le mot de passe doit contenir au moins 8 caractères.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (loading || !validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})

      await loginUser({
        email: email.trim(),
        password,
      })

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim())
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      navigate('/dashboard', {
        replace: true,
      })
    } catch (error: unknown) {
      let errorMessage = 'Email ou mot de passe incorrect.'

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data

        if (typeof responseData === 'string' && responseData.trim()) {
          errorMessage = responseData
        } else if (
            responseData &&
            typeof responseData === 'object' &&
            'message' in responseData &&
            typeof responseData.message === 'string'
        ) {
          errorMessage = responseData.message
        } else if (!error.response) {
          errorMessage =
              'Impossible de contacter le serveur. Vérifiez que le back-end est démarré.'
        }
      }

      setErrors({
        general: errorMessage,
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
            <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600"
            >
              {errors.general}
            </div>
        )}

        <Input
            id="email"
            label="Adresse e-mail"
            type="email"
            placeholder="Entrez votre adresse e-mail"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)

              if (errors.email || errors.general) {
                setErrors((previousErrors) => ({
                  ...previousErrors,
                  email: undefined,
                  general: undefined,
                }))
              }
            }}
            error={errors.email}
            autoComplete="email"
            disabled={loading}
        />

        <Input
            id="password"
            label="Mot de passe"
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)

              if (errors.password || errors.general) {
                setErrors((previousErrors) => ({
                  ...previousErrors,
                  password: undefined,
                  general: undefined,
                }))
              }
            }}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-300 accent-orange-500"
            />

            Se souvenir de moi
          </label>

          <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              className="font-semibold text-orange-600 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <Button
            type="submit"
            loading={loading}
            disabled={loading}
        >
          Se connecter
        </Button>
      </form>
  )
}

export default LoginForm