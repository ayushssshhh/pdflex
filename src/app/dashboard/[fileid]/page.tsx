// used to render file with dynamic route

import ChatWrapper from "@/components/chat/ChatWrapper"
import PdfRenederer from "@/components/PdfRenederer"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"

// defining PageProps
interface PageProps {
    params: {
        fileid: string  //name of dynamic folder ex: [name]
    }
}

const Page = async ({ params }: PageProps) => {
    const { fileid } = params

    // make user user is loggedIn
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        // if user not logged in redirecting to auth
        // origin ensures once user logged in it gets back to same fileOpen 
        redirect(`/auth-callback?origin=dashboard/${fileid}`)
    }

    const file = await db.file.findFirst({
        where: {
            id: fileid,
            userId: user.id
        }
    })

    if(!file){
        return notFound()
    }

    return (
        <div className='flex-1 justify-between flex flex-col'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        {/* Left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            {/* Main area */}
            <PdfRenederer url={file.url} />
          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
    )
}

export default Page