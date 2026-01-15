// const User = require('../models/User');
// const OTP = require("../models/OTP");
// const otpGenarator = require("otp-generator");
// const bcrypt = require('bcrypt');
// const Profile = require('../models/Profile');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const mailSender = require("../utils/imageUploader");
// const { passwordUpdated } = require("../mail/templates/passwordUpdate");


// // otp verification 

// exports.sendotp = async (req,res) => {
//     try {
//         // 1> fetch the mail from the req body
//         const { email } = req.body;
//         //2> check if the user with the email already exists
//         const existingUser = await User.findOne({email : email});
//         if(existingUser){
//             return res.status(400).json({
//                 success : false,
//                 message : "User with this email already exists",
//             });
//         }
//         //3> generate a 6 digit random OTP
//         const otp = otpGenarator.generate(6,{
//             upperCaseAlphabets : false,
//             lowerCaseAlphabets : false,
//             specialChars : false,
//         });
//         // 4> check whether the otp already exists or not
//         console.log("Generated OTP: ", otp);
//         let result = await OTP.findOne({otp : otp});
//         while(result){
//             otp = otpGenarator.generate(6,{
//                 upperCaseAlphabets : false,
//                 lowerCaseAlphabets : false,
//                 specialChars : false,
//             });
//             result = await OTP.findOne({otp : otp});
//         }
        
//         //5> store the otp in the database against the email
//         const otpPayload = {email,otp};
//         const otpBody = await OTP.create(otpPayload);
//         console.log("otp body : ",otpBody);

//         // return the reponse
//         return res.status(200).json({
//             success : true,
//             message : "OTP sent successfully to your email",
//             otp,
//         });

//     }
//     catch(err){
//         console.log("Error in sending OTP: ", err);
//         return res.status(500).json({
//             success : false,
//             message : "Error in sending OTP",
//         });
//     }
 
// }

// // signup

// exports.signup = async (req,res) => {
//     try{
//         // data fetch
//         const {
//             firstName,lastName,email,password,confirmPassword,
//             accountType,contactNumber,otp
//         } = req.body;


//         if( !firstName || !lastName || !email || !password || 
//             !confirmPassword || !otp)
//         {
//             return res.status(403).json({
//                 success : false,
//                 message : "All fields are required",
//             });
//         }
//         // check password and confirm password
//         if(password !== confirmPassword){
//             return res.status(400).json({
//                 success : false,
//                 message : "Password and Confirm Password do not match",
//             });
//         }
//         // check for the user existence
//         const existingUser = await User.findOne({email : email});
//         if(existingUser){
//             return res.status(400).json({
//                 success : false,
//                 message : "User with this email already exists",
//             });
//         }

//         // bring the latest otp from the database for the user
//         /// ---------------------- CHECK HOW THIS WORK ---------------------- //
//         // sorting by DB --->  [ createdAt: 1  → oldest → newest ]  [ createdAt: -1 → newest → oldest ]
// 		//  limit(1) --->  After sorting, return only ONE document
//         const recentOtp = await OTP.find({email}).sort({createdAt : -1}).limit(1);
//         console.log("recent otp: ",recentOtp);

//         // validate the otp 
//         if(recentOtp.length === 0){
//             return res.status(400).json({
//                 success : false,
//                 message : "OTP not found, please generate a new OTP",
//             });
//         }
//         else if(recentOtp[0].otp !== otp){  // recentOtp is array of size 1 as find return array 
//             return res.status(400).json({
//                 success : false,
//                 message : "Invalid OTP",
//             }); 
//         }
//         // hash the password
//         const hashedPassword = await bcrypt.hash(password,10);

//         // crere the entry of the use in db
//         // we need additonal details for the user so create a profile document first
//         const profileDetails = await Profile.create({
//             gender : null,
//             dateOfBirth : null,
//             contactNumber : null,
//             about : null,
//             dateOfBirth : null,
//         });
//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             password : hashedPassword,
//             accountType,
//             additionalDetails : profileDetails._id, // store the id as profile is ref type
//             // default profile image creation like : Nitin Jaraut => NJ
//             image : `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
//         });
//         //return the respose
//         return res.statuse(200).json({
//             success : true,
//             message : "User registered successfully",
//             user,
//         });

//     }
//     catch(err){
//         console.log("Error in signup: ", err);
//         return res.status(500).json({
//             success : false,
//             message : "Error in signup",
//         });
//     }

// }


// // login
// exports.login = async (req,res) => {
//     try{
//         // data fetch
//         const { email,password } = req.body;
        
//         if(!email || !password){
//             return res.status(403).json({
//                 success : false,
//                 message : "All fields are required",
//             });
//         }
//         // check the user present or not
//         // will fetch the full document from the referenced collection and attach it to user.additionalDetails.
//         // same as of doing user.additionalDetails = "........"
//         const user = await User.findOne({email : email}).populate("additionalDetails");
//         if(!user){
//             return res.status(401).json({
//                 success : false,
//                 message : "User not found, please signup",
//             });
//         }

//         // match the password
//         const isPasswordMatch = await bcrypt.compare(password,user.password);
//         if(!isPasswordMatch){
//             return res.status(401).json({
//                 success : false,
//                 message : "Invalid credentials(password mismatch)",
//             });
//         }

//         // --------------------------------  create a JWT token ---------------------
//         // this jwt token is decoded by  authorizaition middleware
//         // and req.body = decode
//         // so while authorization we can have access to the role in the req
//         const payload = {
//             email : user.email,
//             id : user._id,
//             role : user.accountType,
//         };
//         const token = jwt.sign(payload,process.env.JWT_SECRET,{
//             expiresIn : '7h',
//         });
//         // ------------------------------------------- WHY user.token = token ? ---------------------
//         // put the token in the user object 
//         // this user object will be sent in the response
//         // this then intercept by auth middleware and put payload in req body by req.body = decode
//         user.token = token;
//         user.password = undefined; // so that password is not sent in the response
        
//         // return the response with cookie
//         const options = {
//             expiresIn : new Date(Date.now() + 3*24*60*60*1000), // 3 days
//             httpOnly : true,
//         } 
//         return res.cookie("token",token,options).status(200).json({
//             success : true,
//             message : "User logged in successfully",
//             user,
//             token,
//         });

//     }
//     catch(err){
//         console.log("Error in login: ", err);
//         return res.status(500).json({
//             success : false,
//             message : "Error in login",
//         });
//     }
// }
// // change password
// exports.changePassword = async (req,res) => {
//     try{
//         // data fetch
//         const { oldPassword,newPassword,confirmNewPassword } = req.body;
//         const userId = req.user.id; // from the auth middleware

//         if(!oldPassword || !newPassword || !confirmNewPassword){
//             return res.status(403).json({
//                 success : false,
//                 message : "All fields are required",
//             });
//         }
//         // fetch the user from the db
//         const user = await User.findById(userId);
//         // match the old password
//         const isPasswordMatch = await bcrypt.compare(oldPassword,user.password);
//         if(!isPasswordMatch){
//             return res.status(401).json({
//                 success : false,
//                 message : "Old password is incorrect",
//             });
//         }
//         //check if it is the same as old one
//         const isSameAsOld = await bcrypt.compare(newPassword, user.password);
//         if (isSameAsOld) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'New password must be different from the old password',
//             });
//         }
//         // check new password and confirm new password
//         if(newPassword !== confirmNewPassword){
//             return res.status(400).json({
//                 success : false,
//                 message : "New Password and Confirm New Password do not match",
//             });
//         }
//         // hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword,10);
//         // update the password in the db
//         user.password = hashedPassword;
//         await user.save();
//         // now send the mail to the user email as password is changed
//          // send notification email (don't block the response on email failure)
//         try {
// 			const emailResponse = await mailSender(
// 				updatedUserDetails.email,
// 				passwordUpdated(
// 					updatedUserDetails.email,
// 					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
// 				)
// 			);
// 			console.log("Email sent successfully:", emailResponse.response);
// 		} catch (error) {
// 			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
// 			console.error("Error occurred while sending email:", error);
// 			return res.status(500).json({
// 				success: false,
// 				message: "Error occurred while sending email",
// 				error: error.message,
// 			});
// 		}
//         // return the response
//         return res.status(200).json({
//             success : true,
//             message : "Password changed successfully",
//         });

//     }
//     catch(err){
//         console.log("Error in changing password: ", err);
//         return res.status(500).json({
//             success : false,
//             message : "Error in changing password",
//         });
//     }
// }
const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Signup Controller for Registering USers


exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log(response)
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: "",
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails")

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    const result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
    }
    const otpPayload = { email, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
