import { useState, useRef, useEffect } from 'react';
    import axios from 'axios';
    function Record() {
  const [socket, setSocket] = useState(null);
const remoteRef = useRef(null);
const pc = useRef(null);
const roomId = "video-room"; // You can make this dynamic if needed

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

// 1. Setup MediaRecorder
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
mediaRecorderRef.current = mediaRecorder;

// 2. Setup WebRTC
pc.current = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});
stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

// 3. Setup WebSocket
const ws = new WebSocket("ws://localhost:8080/ws");
ws.onmessage = async (event) => {
  const msg = JSON.parse(event.data);
  if (msg.roomId !== roomId) return;

  if (msg.type === "offer") {
    await pc.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    ws.send(JSON.stringify({ type: "answer", data: JSON.stringify(answer), roomId }));
  } else if (msg.type === "answer") {
    await pc.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
  } else if (msg.type === "candidate") {
    const candidate = new RTCIceCandidate(JSON.parse(msg.data));
    pc.current.addIceCandidate(candidate);
  }
};

ws.onopen = async () => {
  const offer = await pc.current.createOffer();
  await pc.current.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: "offer", data: JSON.stringify(offer), roomId }));
};

pc.current.onicecandidate = (event) => {
  if (event.candidate) {
    ws.send(JSON.stringify({
      type: 'candidate',
      data: JSON.stringify(event.candidate),
      roomId,
    }));
  }
};

pc.current.ontrack = (event) => {
  if (remoteRef.current) {
    remoteRef.current.srcObject = event.streams[0];
  }
};

setSocket(ws);


    const mediaRecorder1 = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder1;
     
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
      <video ref={remoteRef} autoPlay playsInline className="w-full max-w-md border border-blue-500 mt-4"></video>

    </div>
  );
}

export default Record;
// need to work on failure when a request fails 
