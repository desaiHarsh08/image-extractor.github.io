
import * as XLSX from 'xlsx';
import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import myImage from '../assets/data-analysis-concept-illustration_114360-8013.png'
import MyLoading from './MyLoading';

function ImageUploader() {
    const inputFileRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [extractionResults, setExtractionResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const extractTextFromImage = async (file) => {
        setIsLoading(true);


        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: (info) => {
                    if (info.status === 'recognizing text') {
                        // const currentProgress = Math.floor((info.progress * 100) / info.total);
                        // setProgress(currentProgress);
                    }
                },
            });
            // console.log('text: ', text)
            const registerStart = text.indexOf("Registration No.:") + 18;
            const registerLast = text.indexOf("Roll No.:") - 2;
            const registrationNo = text.substring(registerStart, registerLast);

            //   const rollStart = text.indexOf("Roll No.:") + 10;
            const rollStart = registerLast + 12;
            const rollLast = text.indexOf("Course Code") - 1;
            const rollNo = text.substring(rollStart, rollLast);
            // console.log('roll no: -', rollStart, rollLast, text.substring(rollStart, rollLast))
            // console.log()
            // console.log()
            // console.log()
            // console.log('rs', text.charAt(rollStart))
            // console.log(text.indexOf("Course Code Credit"))


            const cgpaStart = text.indexOf('Remarks') - 1;
            const cgpaLast = text.indexOf('Remarks') - 6;
            let cgpa = text.substring(cgpaStart, cgpaLast);

            if (typeof parseFloat(cgpa) === 'number' && cgpa > 10) {
                cgpa = parseFloat(cgpa) / 1000;
            }

            if (typeof parseFloat(cgpa) === 'number') { cgpa = parseFloat(cgpa); }

            if (isNaN(cgpa)) { 
                // console.log('space in cgpa'); 
                cgpa = '' 
            }

            // console.log("************* cgpa: ", cgpa)

            const extractionResult = {
                registrationNo,
                rollNo,
                cgpa,
            };

            // Update extractionResults state with the new result
            setExtractionResults((prevResults) => [...prevResults, extractionResult]);
            // setProgress(extractionResults.length * 100 / selectedFiles.length)
        } catch (error) {
            console.error('Error extracting text:', error);
        } finally {
            // Finally, reset the input after extracting text
            // inputFileRef.current.value = null;
        }
    };

    useEffect(() => {
        // console.log("extractionResults.length: ", extractionResults.length)
        // console.log("progress: ", progress, extractionResults.length * 100 / selectedFiles.length)
        setProgress((extractionResults.length * 100 / selectedFiles.length).toFixed(2))
        if (extractionResults.length > 0 && extractionResults.length === selectedFiles.length) {
            // Generate and download the Excel file when extractionResults change
            const ws = XLSX.utils.json_to_sheet(extractionResults);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            XLSX.writeFile(wb, 'extracted_data.xlsx');
            setIsLoading(false);
        }

        // if(!isNaN(extractionResults)) {
        //     setProgress(extractionResults.length * 100 / selectedFiles.length)
        // }
        // eslint-disable-next-line
    }, [extractionResults]);

    const handleExtractAll = async () => {
        setExtractionResults([]);
        setIsLoading(true);

        // Use Promise.all to wait for all extraction operations to complete
        const extractionPromises = selectedFiles.map(async (file, index) => {
            await extractTextFromImage(file);

            // console.log(progress)
        });

        try {
            await Promise.all(extractionPromises);
        } catch (error) {
            console.error('Error extracting text from all files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <MyLoading />}
            <nav className='flex justify-center items-center bg-blue-500 py-3 text-white '>
                <h1 className='text-xl sm:text-2xl font-medium '>Image Extractor</h1>
            </nav>
            <div className="w-full h-[91vh] ">
                <div id="top" className='h-[40%] border-b flex flex-col sm:flex-row gap-5 sm:gap-2 justify-center items-center '>
                    <div className='flex  transition-all flex-col justify-center items-center  p-3'  >
                        <div className=' flex justify-center items-center'>
                            <input
                            ref={inputFileRef}
                                className='border-2 border-blue-500 px-4 py-3 '
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div >
                            {isLoading && <p>Completed: {progress}%</p>}
                        </div>


                    </div>
                    <div className='flex gap-2 flex-row-reverse'>
                        <button onClick={() => { setSelectedFiles([]); inputFileRef.current.value = null; }} className='px-4 py-2 rounded-md text-white font-medium bg-orange-500 hover:bg-orange-600' >Clear Selection</button>
                        <button onClick={handleExtractAll} className='px-4 py-2 rounded-md text-white font-medium bg-blue-500 hover:bg-blue-600 ' >Extract</button>
                    </div>

                </div>
                <div id="bottom" className='h-[60%] flex justify-center items-center '>
                    <img src={myImage} alt="myImage" className='h-[80%]' />
                </div>
            </div>



            {/* <div>
                <button onClick={() => setSelectedFiles([])}>Clear Selection</button>
                <button onClick={handleExtractAll}>Extract All</button>
            </div> */}
            {/* {isLoading && <p>Loading...</p>}
            {<p>Progress: {progress}%</p>} */}
            {/* {extractionResults.length > 0 && (
                <div>
                    <p>Extracted Information:</p>
                    <ul>
                        {extractionResults.map((result, index) => (
                            <li key={index}>
                                Registration No.: {result.registrationNo}, Roll No.: {result.rollNo}, CGPA: {result.cgpa}
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
    );
}

export default ImageUploader;
