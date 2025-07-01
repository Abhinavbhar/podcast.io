import { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Settings, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Preview() {
    const navigate = useNavigate()
  const videoRef = useRef(null);
  const [devices, setDevices] = useState({ video: [], audioIn: [], audioOut: [] });
  const [selectedDevices, setSelectedDevices] = useState({
    video: '',
    audioIn: '',
    audioOut: ''
  });
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
        const audioInDevices = allDevices.filter(d => d.kind === 'audioinput');
        const audioOutDevices = allDevices.filter(d => d.kind === 'audiooutput');
        
        setDevices({
          video: videoDevices,
          audioIn: audioInDevices,
          audioOut: audioOutDevices,
        });
        
        // Set default selected devices
        setSelectedDevices({
          video: videoDevices[0]?.deviceId || '',
          audioIn: audioInDevices[0]?.deviceId || '',
          audioOut: audioOutDevices[0]?.deviceId || ''
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setIsLoading(false);
      }
    })();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleDeviceChange = async (deviceType, deviceId) => {
    setSelectedDevices(prev => ({
      ...prev,
      [deviceType]: deviceId
    }));
    
    if (deviceType === 'video' && stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: { deviceId: selectedDevices.audioIn }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        
        // Stop old tracks
        stream.getTracks().forEach(track => track.stop());
        setStream(newStream);
      } catch (error) {
        console.error('Error switching video device:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading camera and microphone...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get ready to record</h1>
          <p className="text-gray-400">Check your camera and microphone before joining</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Preview */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {/* Video overlay when camera is off */}
                {!isVideoOn && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  </div>
                )}
                
                {/* Control buttons overlay */}
                <div className="absolute bottom-4 left-4 flex space-x-3">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoOn 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioOn 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Device Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Camera Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </label>
                    <select 
                      value={selectedDevices.video}
                      onChange={(e) => handleDeviceChange('video', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {devices.video.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Microphone Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Mic className="w-4 h-4 mr-2" />
                      Microphone
                    </label>
                    <select 
                      value={selectedDevices.audioIn}
                      onChange={(e) => handleDeviceChange('audioIn', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {devices.audioIn.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Speaker Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Speakers
                    </label>
                    <select 
                      value={selectedDevices.audioOut}
                      onChange={(e) => handleDeviceChange('audioOut', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {devices.audioOut.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Audio Level Indicator */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Audio Level</h3>
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-150" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {isAudioOn ? 'Microphone is working' : 'Microphone is muted'}
                </p>
              </div>

              {/* Join Button */}
              <button
                onClick={() => navigate('/call/:123')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Join Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;