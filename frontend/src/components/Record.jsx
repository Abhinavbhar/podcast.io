import { useState, useRef, useEffect } from 'react';
    import axios from 'axios';
    function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  var chunksCounter=1;
  var uploadedCounter=1;
  const blobMap = useRef({})
  const urlMap=useRef({})
  const userid = localStorage.getItem('userId')
  const videoId=useRef()
   const handleStart = async () => {
    const responseStart = await axios.post('http://localhost:8080/upload/start',{
      userid,
      title:"video",
      
    })
    videoId.current=responseStart.data.videoId
    console.log(responseStart.data,"videoId")
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
     
    setIsRecording(true);
    mediaRecorder.ondataavailable = async (event) => {
      // pushing the new blob every second to the full video 
      //client will push video id (unique) and which part is chunk of the video 
      
      const blob = new Blob([event.data],{type:'video/webm'})
      blobMap[chunksCounter]=blob
      chunksCounter++;
      console.log(chunksCounter)
      console.log("blob pushed")
      console.log(blobMap[chunksCounter])
      chunksRef.current.push(event.data);
      await handleChunkUpload()
      
    
    };
    mediaRecorder.start(20000);

    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };
   
  };
  const handleChunkUpload=async()=>{
    const putUrl= await axios.post('http://localhost:8080/upload/chunk-upload',{
      chunkUserId:userid,
      "videoid":videoId.current,
      chunkId:uploadedCounter,
    })

    const bucketResponse = await axios.put(putUrl.data.signedUrl,blobMap[uploadedCounter],{ headers: {
        'Content-Type': 'video/webm',
      }})
      console.log(putUrl)
      console.log(bucketResponse)
      uploadedCounter++;
  }
 
   const handleStop = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleDownload = () => {

    const orderedBlobs = Object.keys(blobMap)
  .sort((a, b) => Number(a) - Number(b)) // sort keys numerically
  .map(key => blobMap[key]);
  const finalBlob = new Blob(orderedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-xl font-bold mb-4">Record Video & Audio</h1>
      <button 
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={isRecording ? handleStop : handleStart}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md border border-black"></video>
      {recordedBlob && (
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleDownload}
        >
          Download Recording
        </button>
      )}
    </div>
  );
}

export default Record;
// need to work on failure when a request fails 
