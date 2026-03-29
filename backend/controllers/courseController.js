import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      search,
      sort = '-createdAt',
      minPrice,
      maxPrice,
      instructor
    } = req.query;

    // Build query
    const query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-lessons.videoUrl')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar email')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If user is enrolled, include full lesson data
    let isEnrolled = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isEnrolled = user.enrolledCourses.some(
        ec => ec.course.toString() === course._id.toString()
      );
    }

    // Hide video URLs for non-enrolled users (except free lessons)
    const courseData = course.toObject();
    if (!isEnrolled && req.user?.role !== 'admin') {
      courseData.lessons = courseData.lessons.map(lesson => ({
        ...lesson,
        videoUrl: lesson.isFree ? lesson.videoUrl : null
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        course: courseData,
        isEnrolled
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};

// @desc    Get course by slug
// @route   GET /api/courses/slug/:slug
// @access  Public
export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name avatar email')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      price,
      discountPrice,
      tags,
      requirements,
      whatYouWillLearn
    } = req.body;

    const course = await Course.create({
      title,
      description,
      shortDescription,
      category,
      level,
      price,
      discountPrice,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
      whatYouWillLearn: whatYouWillLearn ? whatYouWillLearn.split(',').map(w => w.trim()) : [],
      instructor: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const updateData = { ...req.body };

    // Handle array fields
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }
    if (updateData.requirements && typeof updateData.requirements === 'string') {
      updateData.requirements = updateData.requirements.split(',').map(r => r.trim());
    }
    if (updateData.whatYouWillLearn && typeof updateData.whatYouWillLearn === 'string') {
      updateData.whatYouWillLearn = updateData.whatYouWillLearn.split(',').map(w => w.trim());
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Delete associated media from cloudinary
    if (course.thumbnailPublicId) {
      await deleteFromCloudinary(course.thumbnailPublicId);
    }
    for (const lesson of course.lessons) {
      if (lesson.videoPublicId) {
        await deleteFromCloudinary(lesson.videoPublicId, 'video');
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

// @desc    Upload course thumbnail
// @route   POST /api/courses/:id/thumbnail
// @access  Private (Instructor/Admin)
export const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete old thumbnail
    if (course.thumbnailPublicId) {
      await deleteFromCloudinary(course.thumbnailPublicId);
    }

    // Upload new thumbnail
    const result = await uploadToCloudinary(req.file.path, 'edtech/thumbnails', 'image');
    fs.unlinkSync(req.file.path);

    course.thumbnail = result.url;
    course.thumbnailPublicId = result.publicId;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: { thumbnail: result.url }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Upload thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading thumbnail'
    });
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Private (Instructor/Admin)
export const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { title, description, videoUrl, duration, isFree } = req.body;

    const lesson = {
      title,
      description,
      videoUrl,
      duration: duration || 0,
      order: course.lessons.length + 1,
      isFree: isFree || false
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: { lesson: course.lessons[course.lessons.length - 1] }
    });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding lesson'
    });
  }
};

// @desc    Upload lesson video
// @route   POST /api/courses/:id/lessons/:lessonId/video
// @access  Private (Instructor/Admin)
export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Delete old video
    if (lesson.videoPublicId) {
      await deleteFromCloudinary(lesson.videoPublicId, 'video');
    }

    // Upload new video
    const result = await uploadVideoToCloudinary(req.file.path, 'edtech/videos');
    fs.unlinkSync(req.file.path);

    lesson.videoUrl = result.url;
    lesson.videoPublicId = result.publicId;
    lesson.duration = result.duration || 0;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoUrl: result.url,
        duration: result.duration
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video'
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/courses/:id/lessons/:lessonId
// @access  Private (Instructor/Admin)
export const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Delete video from cloudinary
    if (lesson.videoPublicId) {
      await deleteFromCloudinary(lesson.videoPublicId, 'video');
    }

    course.lessons.pull({ _id: req.params.lessonId });

    // Reorder remaining lessons
    course.lessons.forEach((l, index) => {
      l.order = index + 1;
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lesson'
    });
  }
};

// @desc    Enroll in course (for free courses)
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === course._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Only allow free enrollment for free courses
    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This course requires payment'
      });
    }

    // Enroll user
    user.enrolledCourses.push({ course: course._id });
    await user.save();

    // Update course enrollment count
    course.enrolledStudents += 1;
    await course.save();

    // Create progress record
    await Progress.create({
      user: user._id,
      course: course._id,
      totalLessons: course.lessons.length,
      lessonsProgress: course.lessons.map(lesson => ({
        lessonId: lesson._id,
        isCompleted: false,
        watchedDuration: 0
      }))
    });

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully'
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course'
    });
  }
};

// @desc    Add review
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === course._id.toString()
    );

    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You must be enrolled to review this course'
      });
    }

    // Check if already reviewed
    const existingReview = course.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    course.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.ratings.average = totalRating / course.reviews.length;
    course.ratings.count = course.reviews.length;

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
};

// @desc    Get my enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title thumbnail slug instructor totalDuration lessons',
        populate: { path: 'instructor', select: 'name' }
      });

    // Get progress for each course
    const enrolledWithProgress = await Promise.all(
      user.enrolledCourses.map(async (ec) => {
        const progress = await Progress.findOne({
          user: req.user._id,
          course: ec.course._id
        });

        return {
          ...ec.toObject(),
          progress: progress ? {
            percentageComplete: progress.percentageComplete,
            completedLessons: progress.completedLessons,
            totalLessons: progress.totalLessons,
            isCompleted: progress.isCompleted
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { courses: enrolledWithProgress }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses'
    });
  }
};

export default {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  addLesson,
  uploadLessonVideo,
  deleteLesson,
  enrollCourse,
  addReview,
  getEnrolledCourses
};
