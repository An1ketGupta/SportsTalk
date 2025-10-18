import { auth } from "@/auth"
import { Session } from "next-auth"

export default async function Avatar(){

    const session:Session|null = await auth()

    return <div>
        {session?
            <div className="flex items-center gap-2 text-lg">
                <img className="h-8 w-8 rounded-full" src={`${session.user?.image}`}/>
                {session.user?.name?.toString().split(" ")[0]}
            </div>
            :<div>
                <a className="bg-white text-lg text-black h-auto w-auto px-3 py-1 rounded-full flex items-center" href="/auth">
                Sign In</a>
            </div>}
    </div>
}