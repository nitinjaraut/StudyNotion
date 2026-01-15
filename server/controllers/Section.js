// const Section = require("../models/Section");
// const Course = require("../models/Course");

// exports.createSection = async (req, res) =>{
//     try{
//         // data fetch
//         const {sectionName, courseId } = req.body;
//          // validation
//         if(!sectionName || !courseId){
//             return res.status(400).json({
//                 success : true,
//                 message : "Please Enter All fileds",
//             });
//         }
//         // create section
//         const newSection = await Section.create({sectionName});
//           // now put this section to the course
//         const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
//                             {
//                                 $push:{
//                                     courseContent : newSection._id,
//                                 }
//                             },
//                             {new:true},
//         ).populate({
// 				path: "courseContent",
// 				populate: {
// 					path: "subSection",
// 				},
// 			})
// 			.exec();
//         // ----------------------- TO DO :-populate the course with sectiona + subsection -----------------
      
//         // response
//         return res.status(200).json({
//             success : true,
//             message : "Section created successsfullly",
//             updatedCourseDetails,
//         });
//     }
//     catch(err){
//         console.log("Error in creating section",err);
//         return res.status(500).json({
//             success : true,
//             message : "Unable to Create Section",
//             error : err.message,
//         });
//     }
// }


// exports.updateSection = async (req, res) =>{
//     try{
//         // data fetch 
//         const {sectionName, sectionId,courseId} = req.body;
//          // validation
//         if(!sectionName || !sectionId){
//             return res.status(400).json({
//                 success : true,
//                 message : "Please Enter All fileds",
//             });
//         }
//          // update the data
//         const course = await Course.findById(courseId)
// 		.populate({
// 			path:"courseContent",
// 			populate:{
// 				path:"subSection",
// 			},
// 		})
// 		.exec();

// 		res.status(200).json({
// 			success: true,
// 			message: section,
// 			data:course,
// 		});
//     }
//     catch(err){
//         console.log("Error in updating section",err);
//         return res.status(500).json({
//             success : true,
//             message : "Unable to update Section",
//             error : err.message,
//         });
        
//     }
// }


// // delete section

// exports.deleteSection = async (req, res) => {
//     try{
//         // fetch the data 
//         // we are seding id in the params
//         const { sectionId, courseId }  = req.body;
//         await Course.findByIdAndUpdate(courseId, {
// 			$pull: {
// 				courseContent: sectionId,
// 			}
// 		})
//         const section = await Section.findById(sectionId);
// 		console.log(sectionId, courseId);
// 		if(!section) {
// 			return res.status(404).json({
// 				success:false,
// 				message:"Section not Found",
// 			})
// 		}

// 		//delete sub section
// 		await SubSection.deleteMany({_id: {$in: section.subSection}});

// 		await Section.findByIdAndDelete(sectionId);

// 		//find the updated course and return 
// 		const course = await Course.findById(courseId).populate({
// 			path:"courseContent",
// 			populate: {
// 				path: "subSection"
// 			}
// 		})
// 		.exec();

// 		res.status(200).json({
// 			success:true,
// 			message:"Section deleted",
// 			data:course
// 		});
// 	} catch (error) {
// 		console.error("Error deleting section:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 		});
// 	}
// };   
const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
// CREATE a new section
exports.createSection = async (req, res) => {
  try {
    // Extract the required properties from the request body
    const { sectionName, courseId } = req.body

    // Validate the input
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      })
    }

    // Create a new section with the given name
    const newSection = await Section.create({ sectionName })

    // Add the new section to the course's content array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    // Return the updated course object in the response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    })
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    )
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    console.log(course)
    res.status(200).json({
      success: true,
      message: section,
      data: course,
    })
  } catch (error) {
    console.error("Error updating section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })
    const section = await Section.findById(sectionId)
    console.log(sectionId, courseId)
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })

    await Section.findByIdAndDelete(sectionId)

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
