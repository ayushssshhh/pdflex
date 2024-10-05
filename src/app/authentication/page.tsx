import AuthForm from '@/components/AuhForm'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'


const Page = async () => {

    return (
        <MaxWidthWrapper className='mb-8 mt-24 text-center max-w-5x'>
  

            <h1 className="mx-auto text-2xl w-[320px] mb-10">
            <span className="font-bold text-6xl text-left text-blue-600">PDFlex</span> Chat with your <span className=" text-blue-600">Documents</span> in seconds
            </h1>


            <div>
                <AuthForm />
            </div>
        </MaxWidthWrapper >
    )
}

export default Page