import { User2, Video } from 'lucide-react'
import React from 'react'
import { MdPhoto } from 'react-icons/md'

export const Commentbox = () => {
  return (
    <div className='border border-none rounded-xl shadow p-8 bg-white'>
        <div className='flex flex-row items-start gap-4'>
            <div className='bg-green-600 rounded-full p-4'>
                <User2 className='w-6 h-6 text-white'/>
            </div>
            <div className='flex-1'>
                <input className="w-full border border-gray-300 rounded-2xl h-[20vh] p-2" type="text" value="" placeholder='Share your insights,updates, or achievements...'/>
            </div>
        </div>
        <div className='flex flex-row gap-5 justify-between p-6' >   
            <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <MdPhoto className="w-5 h-5" />
            <p className="text-sm">Photo</p>
          </div>

          <div className="flex items-center gap-2 cursor-pointer">
            <Video className="w-5 h-5" />
            <p className="text-sm">Video</p>
          </div>
        </div>
            <div className="flex justify-end">
                <button
              
              className="flex bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 justify-end"
            >
              Post
            </button>
            </div>

        </div>
    </div>
  )
}
