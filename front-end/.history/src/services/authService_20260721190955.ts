export type LoginRequest = {
  email: string
  password: string
}

export async function loginUser(data: LoginRequest) {
  console.log('Login data:', data)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
  }
}