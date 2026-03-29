import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import progressService from '../services/progressService';

export default function VideoPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId, lessonId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, progressRes] = await Promise.all([
        courseService.getCourse(courseId),
        progressService.getCourseProgress(courseId).catch(() => null)
      ]);

      if (courseRes.success) {
        setCourse(courseRes.data.course);
        const lesson = courseRes.data.course.lessons?.find(l => l._id === lessonId);
        setCurrentLesson(lesson || courseRes.data.course.lessons?.[0]);
      }

      if (progressRes?.success) {
        setProgress(progressRes.data.progress);
      }
    } catch (err) {
      setError('Error loading course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson) return;
    try {
      await progressService.markLessonComplete(courseId, currentLesson._id);
      // Move to next lesson
      const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentIndex + 1];
        navigate(`/video/${courseId}/${nextLesson._id}`);
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const selectLesson = (lesson) => {
    navigate(`/video/${courseId}/${lesson._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'Course not found'}</h2>
          <Link to="/dashboard" className="text-yellow-500 hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-lg font-semibold truncate">{course.title}</h1>
            <div></div>
          </div>

          {/* Video Container */}
          <div className="bg-black aspect-video">
            {currentLesson?.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full"
                onEnded={handleLessonComplete}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <p>No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{currentLesson?.title || 'Lesson'}</h2>
            <p className="text-zinc-400">{currentLesson?.description}</p>

            <button
              onClick={handleLessonComplete}
              className="mt-4 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="w-full lg:w-80 bg-zinc-800 border-l border-zinc-700 overflow-y-auto max-h-screen sticky top-0">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="font-semibold">Course Content</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {course.lessons?.length || 0} lessons
            </p>
          </div>
          <div className="divide-y divide-zinc-700">
            {course.lessons?.map((lesson, index) => {
              const isCompleted = progress?.lessonsProgress?.find(
                lp => lp.lessonId === lesson._id
              )?.isCompleted;
              const isCurrent = lesson._id === currentLesson?._id;

              return (
                <button
                  key={lesson._id}
                  onClick={() => selectLesson(lesson)}
                  className={`w-full text-left p-4 hover:bg-zinc-700 transition-colors ${
                    isCurrent ? 'bg-zinc-700 border-l-2 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-zinc-600 text-zinc-400'
                    }`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isCurrent ? 'text-yellow-500' : 'text-white'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {lesson.duration ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')}` : 'Video'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
