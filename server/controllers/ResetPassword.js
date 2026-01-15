// we will 2 parts
// 1 part : 
// we will generate the link and send is to the mail
// token will be generate for the link

// 2 part : 
// UI will be opened and new password set by the user

const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// part 1: - RESETPASSWORD TOKEN
exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}
		const token = crypto.randomBytes(20).toString("hex");

		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

		const url = `http://localhost:3000/update-password/${token}`;
		//  const url = `https://studynotion-edtech-project.vercel.app/update-password/${token}`
		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};

// reset password


// exports.resetPassword = async (req, res) => {
//    try{
//         // data fetch
//         // -------------------------  DOUBT HOW TOKEN IS IN THE BODY OF REQ AS WE SENT IT IN THE URL ---------------
//         // reason FRONTEND TOOK password, confirmPassword, token AND PUT IN THE REQ
//         const { password, confirmPassword, token } = req.body;
//         // validation
//         if(password !== confirmPassword){
//             return res.json({
//                 success : false,
//                 message : 'Password not matched, Try Again !',
//             });
//         }
//         // use the token to get the user and then user password
//         const userDetails = await User.findOne({token:token});
//         // if no entry -> invalid token or expired token
//         if(!userDetails){
//             return res.json({
//                 success : false,
//                 message : 'Token is Invalid',
//             });
//         }
//         // token has expired
//         if(user.Details.resetPasswordExpires < Date.now()){
//             return res.json({
//                 success : false,
//                 message : 'Token has Expired, Please regerate new Token',
//             });

//         }
//         // hash the password 
//         const hashedPassword = await bcrypt.hash(password,10);
//         // update the password in the DB
//         await User.findOneAndUpdate(
//             {token : token},
//             {password : hashedPassword},
//             {new:true},
//         )
//         // return the response
//         return res.status(200).json({
//             success : true,
//             message : 'Password reset SuccessFully',
//         });

//     }
//    catch(err){
//         console.log("Error while reset : ",err);
//         return res.status(500).json({
//             success : false,
//             message : 'Something went Wrong while reset password',
//         })
//    }

// }
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }
    const userDetails = await User.findOne({ token: token })
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }
    const encryptedPassword = await bcrypt.hash(password, 10)
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    )
    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}
