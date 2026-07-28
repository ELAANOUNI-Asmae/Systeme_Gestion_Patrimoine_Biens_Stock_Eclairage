import { useState } from 'react'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'
import SuccessCard from '../../components/auth/SuccessCard'

function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">

      {emailSent ? (
        <SuccessCard />
      ) : (
        <ForgotPasswordForm
          onSuccess={() => setEmailSent(true)}
        />
      )}

    </main>
  )
}

export default ForgotPasswordPage