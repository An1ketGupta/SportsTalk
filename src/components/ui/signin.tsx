import SigninHandler from "@/app/handlerFunctions/SignIn"
import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={SigninHandler}
    >
      <button type="submit">Signin with GitHub</button>
    </form>
  )
} 