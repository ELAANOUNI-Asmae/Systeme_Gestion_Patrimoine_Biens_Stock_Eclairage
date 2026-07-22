type LogoProps = {
  className?: string
}

function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src="/src/assets/logo.png"
      alt="Logo SGPBSE"
      className={className}
    />
  )
}

export default Logo