import Link from "next/link";
import {Button} from '@/components/ui/button'
import {ArrowLeft} from 'lucide-react'
export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return   <div className='mx-4'>
            <div className="flex items-center mb-6 ">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <p className="font-bold text-2xl">Integrations</p>
            </div>
            
            <div className="w-full border rounded-full p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-6 h-6 mr-3 bg-gray-200 rounded-full animate-pulse" />
                    <div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      
                    </div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
        </div>
  }