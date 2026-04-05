// const Course = require("../models/Course");
// const Category = require("../models/Category");
// const User = require("../models/User");
// const {uploadImageToCloudinary} = require("../utils/imageUploader");
// require("dotenv").config;
// // tubmail require image that is stored in cloudinary

// // create a course handler function

// exports.createCourse = async (req,res) => {
//     try{
//         // ---------- as the user is currently logged in and in auth we put playload in the req body --------
//         // data fetch from the body
//         // ---------------  TAG IS REF TYPE IN COURSE SO WE RECIEVE TAG ID -----------------------------

// 		// Get all required fields from request body
// 		let {
// 			courseName,
// 			courseDescription,
// 			whatYouWillLearn,
// 			price,
// 			tag: _tag,
// 			category,
// 			status,
// 			instructions: _instructions,
// 		} = req.body;
//         // file fecth from the req for tumbnail
//         // Get thumbnail image from request files
//         const thumbnail = req.files.thumbnailImage

//         // Convert the tag and instructions from stringified Array to Array
//         const tag = JSON.parse(_tag)
//         const instructions = JSON.parse(_instructions)

//         console.log("tag", tag)
//         console.log("instructions", instructions)

//         // validation
//         if(!courseName ||
//             !courseDescription ||
//             !whatYouWillLearn ||
//             !price ||
//             !tag.length ||
//             !thumbnail ||
//             !category ||
//             !instructions.length){
//             return res.status(400).json({
//                 success : false,
//                 message : "All fields are required",
//             });
//         }
// // ------------------------------------ CHECK userId and InstructorId same ----------------------------
//         // course require a instructor while creating a course
//         const userId  = req.user.id; // as we put req.user = decode while authz
//         const instructorDetails = await User.findById(userId);
//         console.log("Instructor Details: ",instructorDetails);

//         if (!status || status === undefined) {
// 			status = "Draft";
// 		}
//         if(!instructorDetails){
//             return res.status(404).json({
//                 success : false,
//                 message : "instructor Details Not Found",
//             })
//         }

//         // get the tag for the course 
//         const categoryDetails = await Category.findById(category);
// 		if (!categoryDetails) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Category Details Not Found",
// 			});
// 		}

//         // upload the image to cloudinary
//          const thumbnailImage = await uploadImageToCloudinary(
//             thumbnail,
//             process.env.FOLDER_NAME
//         )
//         // create an entry for new course
//         const newCourse = await  Course.create({
//             courseName,
//             courseDescription,
//             instructor: instructorDetails._id, // instructor is ref type so we store ID
//             whatYouWillLearn,
//             price,
//             category: categoryDetails._id, // category is ref type so store id || we can also use tag ( present is req body)
//             thumbnail: thumbnailImage.secure_url,
// 			status: status,
// 			instructions,
//             tag,
//         });
        

//         // update the new Course in User i.e the Instructor
//         // instructor have array of ref of course
//         await User.findByIdAndUpdate(
//                 {_id: instructorDetails._id},
//                 {
//                     $push : {
//                         courses : newCourse._id,
//                     }
//                 },
//                 {new : true},
//         )
//         // --------------------- UPDATE THE categories SCHEMA ------------------
//         // Add the new course to the Categories
// 		await Category.findByIdAndUpdate(
// 			{ _id: category },
// 			{
// 				$push: {
// 					courses : newCourse._id,
// 				},
// 			},
// 			{ new: true }
// 		);
//         return res.status(200).json({
//             success : true,
//             message : "Course Created SuccessFully",
//             data : newCourse,
//         });

//     }
//     catch(err){
//         console.log("Error while creating a Course: ",err);
//         return res.status(500),json({
//             success : true,
//             message : "Error while creating course",
//             error : err.message,
//         });

//     }
     
// }

// // Edit Course Details
// exports.editCourse = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const updates = req.body
//     const course = await Course.findById(courseId)

//     if (!course) {
//       return res.status(404).json({ error: "Course not found" })
//     }

//     // If Thumbnail Image is found, update it
//     if (req.files) {
//       console.log("thumbnail update")
//       const thumbnail = req.files.thumbnailImage
//       const thumbnailImage = await uploadImageToCloudinary(
//         thumbnail,
//         process.env.FOLDER_NAME
//       )
//       course.thumbnail = thumbnailImage.secure_url
//     }

//     // Update only the fields that are present in the request body
//     for (const key in updates) {
//       if (updates.hasOwnProperty(key)) {
//         if (key === "tag" || key === "instructions") {
//           course[key] = JSON.parse(updates[key])
//         } else {
//           course[key] = updates[key]
//         }
//       }
//     }

//     await course.save()

//     const updatedCourse = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()

//     res.json({
//       success: true,
//       message: "Course updated successfully",
//       data: updatedCourse,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     })
//   }
// }

// // get all courses
// exports.getAllCourses = async (req, res) => {
//     try {
//         // find all the courses with all the mentioned field present 
//         const allCourses = await Course.find({ status : "Published"},{courseName:true,price:true,thumbnail:true,
//             instructor:true,ratingAndReviews:true,studetsEnrolled:true
//         }).populate("instructor").exec();

//         // pouplate Replaces that ObjectId with the actual instructor document from the User collection
//         // .exec() executes the query and returns a real Promise.


//         return res.status(200).json({
//             success : true,
//             message : "All the Courses Fetch",
//             data : allCourses,

//         });
//     }

//     catch(err){
//         console.log("Error while fetching All Courses",err);
//         return  res.status(500).json({
//             success : true,
//             message : "Erroe while fetching all courses",
//             error : err,
//         });
//     }

// }


// // get all course details
// exports.getCourseDetails = async ( req, res) =>{
//     try{
//         //get id of course
//         const {courseId} = req.body;
//         // find the course details
//         // we will return all the  details wihtout any object id 
//         const courseDetails = await Course.find({_id : courseId})
//                                         .populate(
//                                                 {
//                                                 // pouplate instructor and its profile i.e additional details
//                                                     path : "instructor",
//                                                     populate : {
//                                                         path : "additionalDetails",
//                                                     }
//                                                 }     
//                                         )
//                                         .populate("category")
//                                         .populate("ratingAndReviews")
//                                         .populate({
//                                             // populate section and and its subsection
//                                             path : "courseContent",
//                                             populate :{
//                                                 path : "subSection",
//                                                 select: "-videoUrl",
//                                             },
//                                         }).exec();
//         // validation
//         if(!courseDetails){
//             return res.status(400).json({
//                 success : false,
//                 message : `Could not find the course with the id : ${courseId}`,
//             });
//         }
//         // response
//         let totalDurationInSeconds = 0
//         courseDetails.courseContent.forEach((content) => {
//         content.subSection.forEach((subSection) => {
//             const timeDurationInSeconds = parseInt(subSection.timeDuration)
//             totalDurationInSeconds += timeDurationInSeconds
//         })
//         })

//         const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

//         return res.status(200).json({
//         success: true,
//         data: {
//                 courseDetails,
//                 totalDuration,
//             },
//         })
//     } catch (error) {
//         return res.status(500).json({
//         success: false,
//         message: error.message,
//         })
//     }
// }
// exports.getFullCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const userId = req.user.id
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()

//     let courseProgressCount = await CourseProgress.findOne({
//       courseID: courseId,
//       userId: userId,
//     })

//     console.log("courseProgressCount : ", courseProgressCount)

//     if (!courseDetails) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     // if (courseDetails.status === "Draft") {
//     //   return res.status(403).json({
//     //     success: false,
//     //     message: `Accessing a draft course is forbidden`,
//     //   });
//     // }

//     let totalDurationInSeconds = 0
//     courseDetails.courseContent.forEach((content) => {
//       content.subSection.forEach((subSection) => {
//         const timeDurationInSeconds = parseInt(subSection.timeDuration)
//         totalDurationInSeconds += timeDurationInSeconds
//       })
//     })

//     const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

//     return res.status(200).json({
//       success: true,
//       data: {
//         courseDetails,
//         totalDuration,
//         completedVideos: courseProgressCount?.completedVideos
//           ? courseProgressCount?.completedVideos
//           : [],
//       },
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }

// // Get a list of Course for a given Instructor
// exports.getInstructorCourses = async (req, res) => {
//   try {
//     // Get the instructor ID from the authenticated user or request body
//     const instructorId = req.user.id

//     // Find all courses belonging to the instructor
//     const instructorCourses = await Course.find({
//       instructor: instructorId,
//     }).sort({ createdAt: -1 })

//     // Return the instructor's courses
//     res.status(200).json({
//       success: true,
//       data: instructorCourses,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve instructor courses",
//       error: error.message,
//     })
//   }
// }
// // Delete the Course
// exports.deleteCourse = async (req, res) => {
//   try {
//     const { courseId } = req.body

//     // Find the course
//     const course = await Course.findById(courseId)
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" })
//     }

//     // Unenroll students from the course
//     const studentsEnrolled = course.studentsEnrolled
//     for (const studentId of studentsEnrolled) {
//       await User.findByIdAndUpdate(studentId, {
//         $pull: { courses: courseId },
//       })
//     }

//     // Delete sections and sub-sections
//     const courseSections = course.courseContent
//     for (const sectionId of courseSections) {
//       // Delete sub-sections of the section
//       const section = await Section.findById(sectionId)
//       if (section) {
//         const subSections = section.subSection
//         for (const subSectionId of subSections) {
//           await SubSection.findByIdAndDelete(subSectionId)
//         }
//       }

//       // Delete the section
//       await Section.findByIdAndDelete(sectionId)
//     }

//     // Delete the course
//     await Course.findByIdAndDelete(courseId)

//     return res.status(200).json({
//       success: true,
//       message: "Course deleted successfully",
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     })
//   }
// }
const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status = "Draft",
      instructions,
    } = req.body

    if (!req.files || !req.files.thumbnailImage) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      })
    }

    tag = JSON.parse(tag || "[]")
    instructions = JSON.parse(instructions || "[]")

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !tag.length ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      }) 
    }

    const instructorDetails = await User.findOne({
      _id: userId,
      accountType: "Instructor",
    })

    if (!instructorDetails) {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      })
    }

    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    const thumbnailImage = await uploadImageToCloudinary(
      req.files.thumbnailImage,
      process.env.FOLDER_NAME
    )

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions,
    })

    await User.findByIdAndUpdate(instructorDetails._id, {
      $push: { courses: newCourse._id },
    })

    await Category.findByIdAndUpdate(category, {
      $push: { courses: newCourse._id },
    })

    return res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course created successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user?.id

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this course",
      })
    }

    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    const allowedFields = [
      "courseName",
      "courseDescription",
      "whatYouWillLearn",
      "price",
      "status",
      "category",
      "tag",
      "instructions",
    ]

    for (const field of allowedFields) {
      if (req.body[field]) {
        course[field] =
          field === "tag" || field === "instructions"
            ? JSON.parse(req.body[field])
            : req.body[field]
      }
    }

    await course.save()

    const updatedCourse = await Course.findById(courseId)
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })

    return res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      "courseName price thumbnail instructor ratingAndReviews studentsEnrolled"
    ).populate("instructor")

    return res.status(200).json({ success: true, data: allCourses })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    })
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
// get course details only showes subsection without video url for non logged in user
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body

    const courseDetails = await Course.findById(courseId)
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection", select: "-videoUrl" },
      })

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    let totalSeconds = 0
    courseDetails.courseContent?.forEach(section =>
      section.subSection?.forEach(sub =>
        (totalSeconds += Number(sub.timeDuration || 0))
      )
    )

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration: convertSecondsToDuration(totalSeconds),
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
// get full course deltails including video and progress url for logged in user
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user?.id

    const courseDetails = await Course.findById(courseId)
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const progress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    })

    let totalSeconds = 0
    courseDetails.courseContent?.forEach(section =>
      section.subSection?.forEach(sub =>
        (totalSeconds += Number(sub.timeDuration || 0))
      )
    )

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration: convertSecondsToDuration(totalSeconds),
        completedVideos: progress?.completedVideos || [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (user.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can access this",
      })
    }

    const courses = await Course.find({ instructor: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .lean()

    // Compute totalDuration for each course
    for (const course of courses) {
      let totalSeconds = 0
      course.courseContent?.forEach((section) =>
        section.subSection?.forEach((sub) => {
          totalSeconds += Number(sub.timeDuration || 0)
        })
      )
      course.totalDuration = convertSecondsToDuration(totalSeconds)
    }

    return res.status(200).json({ success: true, data: courses })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // FIX 1: correct field name
    const studentsEnrolled = course.studentsEnrolled || []

    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections & subsections safely
    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId)

      if (section && section.subSection?.length) {
        for (const subSectionId of section.subSection) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      await Section.findByIdAndDelete(sectionId)
    }

    //  Remove from category
    await Category.findByIdAndUpdate(course.category, {
      $pull: { courses: courseId },
    })

    //  Delete course
    await Course.findByIdAndDelete(courseId)

    // removing course from instructor 
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { courses: courseId },
    })

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}