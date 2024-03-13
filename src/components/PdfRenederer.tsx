"use client"

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useResizeDetector } from 'react-resize-detector'
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import SimpleBar from 'simplebar-react'
import { notFound } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import PdfFullscreen from './PdfFullScreen'
// pdf worker to render pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

// Defing pdfRendererProps Type
interface PdfRendererProps {
    url: string
}

const PdfRenederer = ({ url }: PdfRendererProps) => {

    // handle toast
    const toast = useToast()

    // handle resize
    const { width, ref } = useResizeDetector()

    // handle state of numPages in doc
    const [numPages, setNumPages] = useState<number>()

    // handle state of curr redered page
    const [currPage, setCurrPage] = useState<number>(1)

    // definig valid coustom input
    // zod -> TypeScript-first schema declaration and validation library
    const CustomPageValidator = z.object({
        page: z
            .string()
            .refine(
                (num) => Number(num) > 0 && Number(num) <= numPages!
            ),
    })

    // infering type from zod (definig coustom ts type)
    type TCustomPageValidator = z.infer<typeof CustomPageValidator>

    // use to handle valid input 
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(CustomPageValidator) // linking custom type with useFrom on runtime
    })

    const PageSubmitHandler = ({ page }: TCustomPageValidator) => {
        setCurrPage(Number(page))
        setValue('page', String(page))
    }

    // handle pageScale state
    const [scale, setScale] = useState<number>(1)

    // handle rotation state
    const [rotation, setRotation] = useState<number>(0)



    return (
        <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
            <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
                <div className='flex items-center gap-1.5'>
                    <Button
                        disabled={
                            currPage <= 1
                        }
                        variant='ghost'
                        aria-label='previous page'
                        onClick={() => {
                            setCurrPage((prev) => (prev - 1 ? prev - 1 : 1))
                            setValue('page', String(currPage - 1))
                        }}
                    >
                        <ChevronDown className='h-4 w-4' />
                    </Button>

                    {/* use to input coustom pageNo. to render */}
                    <div className='flex items-center gap-1.5 '>
                        <Input
                            {...register("page")}
                            className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit(PageSubmitHandler)()
                                }
                            }}
                        />

                        {/* use to display total pageNo. */}
                        <p className='text-zinc-700 text-sm space-x-1'>
                            <span>/</span>
                            <span>{numPages}</span>
                        </p>
                    </div>

                    <Button
                        disabled={
                            numPages === undefined ||
                            currPage === numPages
                        }
                        variant='ghost'
                        aria-label='next page'
                        onClick={() => {
                            setCurrPage((prev) => (prev + 1 > numPages! ? numPages! : prev + 1))
                            setValue('page', String(currPage + 1))
                        }}
                    >
                        <ChevronUp className='h-4 w-4' />
                    </Button>
                </div>

                {/* zoom-in zoom-out button */}

                <div className='space-x-2'>
                    <DropdownMenu>
                        {/* asChild ensures we dont get two nested button */}
                        {/* DropdownMenuTrigger -> use to define behaviour of menu item when selected */}
                        <DropdownMenuTrigger asChild>
                            <Button
                                className='gap-1.5'
                                aria-label='zoom'
                                variant='ghost'>
                                <Search className='h-4 w-4' />
                                {scale * 100}%  {/* rendering current scaleState */}
                                <ChevronDown className='h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>

                        {/* creating contnet inside of dropdown menu */}
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onSelect={() => setScale(.5)}>
                                50%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(0.75)}>
                                75%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(1.5)}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(2)}>
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* rotaion button */}
                    <Button
                        onClick={() => setRotation((prev) => prev + 90)}
                        variant='ghost'
                        aria-label='rotate 90 degrees'>
                        <RotateCw className='h-4 w-4' />
                    </Button>

                    <PdfFullscreen fileUrl={url} />
                </div>
            </div>

            {/* redering pdf */}

            <div className='flex-1 w-full max-h-screen'>
                {/* ensures app doesnt crash while scaling up */}
                <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
                    <div ref={ref}>
                        <Document
                            loading={
                                <div className='flex justify-center'>
                                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                                </div>
                            }
                            file={url}
                            className='max-h-full'
                            onLoadError={() => {
                                alert("Unable to load Pdf : Please Refresh or upload File again")
                            }}
                            // setting number of pages in doc
                            onLoadSuccess={({ numPages }) =>
                                setNumPages(numPages)
                            }
                        >
                            <Page
                                width={width ? width : 1}
                                pageNumber={currPage}
                                scale={scale}
                                rotate={rotation}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>

        </div>
    )
}

export default PdfRenederer