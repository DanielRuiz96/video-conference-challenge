import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaStop, FaUndo, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const Recorder = ({ question, questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(questions.findIndex((q) => q.id === question.id));
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(new Array(questions.length).fill(false));
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const maxRecordingTime = 10; // 10 seconds
  const navigate = useNavigate();

  useEffect(() => {
    if (recordingTime >= maxRecordingTime) {
      handleStop();
    }
  }, [recordingTime]);

  useEffect(() => {
    if (recordedChunks.length > 0) {
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      videoRef.current.src = videoUrl;
    }
  }, [recordedChunks]);

  const startTimer = () => {
    setRecordingTime(0);
    const timer = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    return timer;
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsQuestionAnswered((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = true;
        return updatedAnswers;
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
          }
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        timerRef.current = startTimer();
      } catch (error) {
        console.error('Error starting video recording:', error);
      }
    }
  };

  const handleReset = () => {
    setRecordedChunks([]);
    setRecordingTime(0);
    setIsQuestionAnswered((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = false;
      return updatedAnswers;
    });
  };

  const handleStop = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsQuestionAnswered((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = true;
        return updatedAnswers;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setRecordedChunks([]);
      setRecordingTime(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsQuestionAnswered((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = true;
        return updatedAnswers;
      });
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setRecordedChunks([]);
      setRecordingTime(0);
      if (isRecording) {
        handleStop();
      }
    }
  };

  const handleFinish = () => {
    if (isQuestionAnswered.every((answered) => answered)) {
      navigate('/');
    }
  };

  const Timer = () => {
    const remainingTime = maxRecordingTime - recordingTime;
    const formattedTime = new Date(remainingTime * 1000).toISOString().substr(14, 5);

    return <span className="text-white">{formattedTime}</span>;
  };

  const isRecordingComplete = recordingTime >= maxRecordingTime;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const shouldShowResetButton = recordedChunks.length > 0 && (!isRecording || isRecordingComplete);

  return (
    <div className="flex flex-col items-center">
      <Link to="/" className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <FaArrowLeft className="ml-10" />
        Back to Home
      </Link>
      {questions.length > 0 && (
        <div className="bg-gray-200 rounded-lg p-4 text-center">
          <h3 className="text-xl font-bold">{questions[currentQuestionIndex].title}</h3>
          <p>{questions[currentQuestionIndex].description}</p>
        </div>
      )}
      <div className="w-full max-w-md mt-4 relative">
        <div className="bg-blue-500 rounded-lg p-3">
          <div className="bg-black rounded-lg overflow-hidden aspect-w-16 aspect-h-9 relative h-[400px]">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <div className="text-white">
                  <Timer />
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex justify-start">
              {!isRecording ? (
                <>
                  {recordedChunks.length === 0 ? (
                    <button
                      onClick={handleRecord}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mr-2 flex items-center"
                    >
                      <FaVideo />
                      Record
                    </button>
                  ) : (
                    <>
                      {shouldShowResetButton && (
                        <button
                          onClick={handleReset}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full mr-2 flex items-center"
                        >
                          <FaUndo />
                          Reset
                        </button>
                      )}
                      {isQuestionAnswered[currentQuestionIndex] && (
                        <FaCheckCircle className="text-green-500 ml-3" />
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleStop}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-full mr-2 flex items-center"
                  >
                    <FaStop />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          <FaArrowLeft className="mr-2" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Next
          <FaArrowRight className="ml-2" />
        </button>
        {isLastQuestion && isQuestionAnswered.every((answered) => answered) && (
          <button
            onClick={handleFinish}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Finish
            <FaCheckCircle className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Recorder;