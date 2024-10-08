"use client"

import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { trpc } from '../_trpc/client'

const Page = () => {
  const router = useRouter()

  // to get origin value from param
  // const SearchParams = useSearchParams()
  // const origin = SearchParams.get('origin')

  // using trpc => response type is defined
  const { data: authData } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500
  });

  // Check for successful authentication
  if (authData?.success) {
    // User is synced to the database
    console.log("redirecting to dashboard")
    setTimeout(() => {
      router.push('/dashboard');
    }, 10000);
  }

  if (authData?.success === false) {
    // User is synced to the database
    router.push('/authentication');
  }

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page
