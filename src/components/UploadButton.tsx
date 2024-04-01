"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import Dropzone from "react-dropzone"
import { Cloud, File, Loader2 } from "lucide-react"
import { Progress } from "./ui/progress"
import { UploadButton as UploadThingBtn, useUploadThing } from "@/lib/uploadthing"
import { useToast } from "./ui/use-toast"
import { trpc } from "@/app/_trpc/client"
import { useRouter } from "next/navigation"
import classes from './UploadButton.module.css'

interface stateProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }

const UploadDropzone = ({setOpen} : stateProps) => {
    // to tack is file uploading state
    const [isUploading, setIsUploading] = useState<boolean>(false)

    // to track file uploading progress
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    // handeling upload thing
    const { startUpload } = useUploadThing("pdfUploader")

    // handeling toast alert
    const { toast } = useToast()

    // router
    const route = useRouter()

    // pooling
    const { mutate: startPolling } = trpc.getFile.useMutation(
        {
            onSuccess: (file) => {
                window.location.reload()
            },
            retry: true,
            retryDelay: 500,
        }
    )

    // useEffect(()=>{
    //     route.push(`/dashboard/${uploadCompleted}`)
    // } , [uploadCompleted , route])

    // deterministic progress logic
    const startSimulatedProgress = () => {
        setUploadProgress(0) //setting progress to 0

        const interval = setInterval(() => {
            setUploadProgress((previousProgress) => {
                if (previousProgress >= 90) {
                    // clearInterval(interval)
                    return previousProgress
                }

                return previousProgress + 5
            })
        }, 500)

        return interval
    }

    // multiple -> to select multiple file
    // Dropzone as callback fn 
    // accepted files -> use to save droped file
    // getRootProps , getInputProps -> important to rendering top level div
    return (
        <Dropzone
            multiple={false}

            onDrop={async (acceptedFile) => {
                // seting uploading state true
                setIsUploading(true)

                // envoking deterministic Progress
                const progressInterval = startSimulatedProgress()

                // handle progress for file upload completion
                const res = await startUpload(acceptedFile)

                // if failed while uploading pdf raise toast alert
                if (!res) {
                    setOpen(false)
                    return toast({
                        title: 'Invalid file type',
                        description: "Please try uploading PDF file only",
                        variant: 'destructive'
                    })
                }

                // destructuring 1st element of array res
                const [fileResponse] = res
                const key = fileResponse.key

                // if uploaded file has no key raise toast alert
                if (!key) {
                    setOpen(false)
                    return toast({
                        title: 'Something went Wrong',
                        description: "Please try again later",
                        variant: 'destructive'
                    })
                }

                // ensuring file is uploaded to db (using pooling approach)
                // pooling-> after uploading file in db check is file exist on db

                clearInterval(progressInterval)
                setUploadProgress(100)

                startPolling({ key })
            }}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
                    <div className='flex items-center justify-center h-full w-full'>
                        {/* drop funtionality */}
                        <label
                            htmlFor='dropzone-file'
                            className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>

                            {uploadProgress != 100 ? (
                                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                    <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                                    <p className='mb-2 text-sm text-zinc-700'>
                                        <span className='font-semibold'>
                                            Click to upload
                                        </span>{' '}
                                        or drag and drop
                                    </p>
                                    <p className='text-xs text-zinc-500'>
                                        PDF (up to 16MB)
                                    </p>
                                </div>
                            ) : null}

                            {/* if file uploaded successfully indication */}
                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                                    <div className='px-3 py-2 h-full grid place-items-center'>
                                        <File className='h-4 w-4 text-blue-500' />
                                    </div>
                                    <div className='px-3 py-2 h-full text-sm truncate'>
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {/* file uploading progress */}
                            {isUploading ? (
                                <div className='w-full mt-4 max-w-xs mx-auto'>
                                    <Progress
                                        className="h-1 w-full bg-zinc-200"
                                        value={uploadProgress}
                                    />

                                    {/*after file uploadeed 100% redirect  */}
                                    {uploadProgress === 100 ? (
                                        <div>
                                            <h3 className="text-center">File Uploaded Successfuly 👍</h3>
                                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                                <Loader2 className='h-3 w-3 animate-spin' />
                                                <p>Syncing...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                            <input {...getInputProps} type="file" id='dropzone-file' className="hidden" />
                        </label>
                    </div>
                </div >
            )}
        </Dropzone >)
}

// file select upload
const UploadSelectzone = () => {
    // to tack is file uploading state
    const [isUploading, setIsUploading] = useState<boolean>(false)

    // to track file uploading progress
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    // deterministic progress logic
    const startSimulatedProgress = () => {
        setUploadProgress(0) //setting progress to 0

        const interval = setInterval(() => {
            setUploadProgress((previousProgress) => {
                if (previousProgress >= 90) {
                    // clearInterval(interval)
                    return previousProgress
                }

                return previousProgress + 5
            })
        }, 500)

        return interval
    }

    return (
        <div>
            <label
                htmlFor='dropzone-file'
                className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>

                {uploadProgress != 100 ? (
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                        <p className='mb-2 text-sm text-zinc-700'>
                            <span className='font-semibold'>
                                Click to upload
                            </span>
                        </p>
                        <p className='text-xs text-zinc-500'>
                            PDF (up to 16MB)
                        </p>
                    </div>
                ) : null}

                {/* file uploading progress */}
                {isUploading ? (
                    <div className='w-full mt-4 max-w-xs mx-auto'>
                        <Progress
                            className="h-1 w-full bg-zinc-200"
                            value={uploadProgress}
                        />

                        {/*after file uploadeed 100% redirect  */}
                        {uploadProgress === 100 ? (
                            <div>
                                <h3 className="text-center">File Uploaded Successfuly 👍</h3>
                                <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                    <Loader2 className='h-3 w-3 animate-spin' />
                                    <p>Syncing...</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
                <UploadThingBtn
                    className={classes.custom}

                    endpoint="pdfUploader"
                    onUploadBegin={() => {
                        // seting uploading state true
                        setIsUploading(true)

                        // envoking deterministic Progress
                        const progressInterval = startSimulatedProgress()
                    }}
                    onClientUploadComplete={(res) => {
                        // setting progressbar filled 
                        setUploadProgress(100)

                        // re-rendering dashboard
                        window.location.reload()
                    }}
                    onUploadError={(error: Error) => {
                        // Do something with the error.
                        alert(`ERROR! ${error.message}`);
                        window.location.reload()
                    }}
                />
            </label>
        </div>)
}


const UploadButton = () => {
    const [isOpen, setOpen] = useState<boolean>(false)

    return (
        <Dialog
            open={isOpen} onOpenChange={(v) => {
                if (!v) {
                    setOpen(v)
                }
            }}>
            {/* asChild tells to use child as coustom button rather wrapping button inside button */}
            {/* DialogTrigger use to set dialog open and control logic */}
            <DialogTrigger asChild
                onClick={() => setOpen(true)}
            >
                <Button>UPLOAD PDF</Button>
            </DialogTrigger>

            <DialogContent>
                {/* coustom component for dropzone button  */}

                {/* dropzone for large screen */}
                <div className={classes.Dropzone}>
                    <UploadDropzone setOpen={setOpen}/>
                </div>

                {/* upload btn */}
                <div className={classes.Uploadbtn}>
                    <UploadSelectzone />
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default UploadButton