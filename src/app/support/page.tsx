import MaxWidthWrapper from '@/components/MaxWidthWrapper'

const Page = async () => {
    

    return (
        <MaxWidthWrapper className='mb-8 mt-24 text-center max-w-5xl'>
            <div className='mx-auto mb-10 sm:max-w-lg'>
                <h1 className='text-6xl font-bold sm:text-7xl'>
                    Support
                </h1>

                <p className='mt-5 text-gray-600 sm:text-lg'>
                 We usually respond within an hour, but our team do sleep three to four hours a night, so it might take a bit longer.<br/> Thank you for using our service.
                </p>
            </div>

            
            <div className='h-20'></div>
        </MaxWidthWrapper >
    )
}

export default Page