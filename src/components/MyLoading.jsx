import React from 'react'

const MyLoading = () => {
  return (
    <>
    <div className='absolute w-full h-1 bg-slate-200'>
        <div id="bar" className='bg-yellow-400 h-full w-[15%] relative transition-all ' s style={{
          animationName: 'loadingBar',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDuration: '1.25s', // Adjust the duration as needed
        }} ></div>
    </div>
    </>
  )
}

export default MyLoading
