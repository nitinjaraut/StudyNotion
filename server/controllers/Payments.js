// const { errorMonitor } = require("nodemailer/lib/xoauth2");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const CourseProgress = require("../models/CourseProgress");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto")
const mongoose = require("mongoose")


exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body
    const userId = req.user.id

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide course IDs",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (user.accountType === "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Instructors cannot purchase courses",
      })
    }

    let total_amount = 0

    for (const courseId of courses) {
      const course = await Course.findById(courseId)

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      // ✅ FIXED FIELD NAME
      if (course.studentsEnrolled.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Already enrolled in this course",
        })
      }

      total_amount += Number(course.price)
    }

    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }
    console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID)
    const paymentResponse = await instance.orders.create(options)
       
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.error("CAPTURE PAYMENT ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Could not initiate payment",
      error: error.message,
    })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body

    const userId = req.user.id

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !Array.isArray(courses)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      })
    }

    await enrollStudents(courses, userId)

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    })
  }
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId) => {
  for (const courseId of courses) {
    const enrolledCourse = await Course.findById(courseId)

    if (!enrolledCourse) {
      throw new Error("Course not found")
    }

    // ✅ Prevent duplicate push
    if (!enrolledCourse.studentsEnrolled.includes(userId)) {
      enrolledCourse.studentsEnrolled.push(userId)
      await enrolledCourse.save()
    }

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId,
      completedVideos: [],
    })

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        courses: courseId,
        courseProgress: courseProgress._id,
      },
    }) 

    await mailSender(
      enrolledCourse.instructor.email,
      `Successfully Enrolled`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        enrolledCourse.instructor.firstName
      )
    )
  }
}