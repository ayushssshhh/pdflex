import { redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import { db } from '@/db';
import Dashboard from '@/components/Dashboard';

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();


  if (!user || !user.email) {
    redirect('/auth-callback')
    // auth-callback will sync new user logedin for first time to our db
    // origin enable navigate back to page once callback is completed 
  }

  // checking user in db
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  if (!dbUser) {
    redirect('/auth-callback')
    // auth-callback will sync new user logedin for first time to our db
    // origin enable navigate back to page once callback is completed 
  }

  return (
    <>
      <Dashboard />
      <div className='h-20'></div>
    </>
  )
}

export default Page