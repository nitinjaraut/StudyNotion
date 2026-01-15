import { toast } from "react-hot-toast"
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiconnector } from "../apiconnector"
import { studentEndpoints } from "../apis"

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Course
export async function BuyCourse(
  token,
  courses,
  user,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...")

  try {
    const loaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    )

    if (!loaded) {
      toast.error("Razorpay SDK failed to load")
      return
    }

    const orderResponse = await apiconnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      { Authorization: `Bearer ${token}` }
    )

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }

    // 🔥 HARD-CODED KEY (TEST ONLY)
    const RAZORPAY_TEST_KEY = "rzp_test_S25I3ASZP06v49"

    console.log("RAZORPAY HARDCODED KEY:", RAZORPAY_TEST_KEY)

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: orderResponse.data.data.amount,
      currency: orderResponse.data.data.currency,
      order_id: orderResponse.data.data.id,
      name: "StudyNotion",
      description: "Course Purchase",
      image: rzpLogo,
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      handler: function (response) {
        sendPaymentSuccessEmail(
          response,
          orderResponse.data.data.amount,
          token
        )
        verifyPayment({ ...response, courses }, token, navigate, dispatch)
      },
      theme: {
        color: "#000000",
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  } catch (error) {
    console.error("PAYMENT ERROR:", error)
    toast.error("Could not make payment")
  }

  toast.dismiss(toastId)
}

// ================================
// VERIFY PAYMENT
// ================================
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying payment...")
  dispatch(setPaymentLoading(true))

  try {
    const response = await apiconnector(
      "POST",
      COURSE_VERIFY_API,
      bodyData,
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Payment successful 🎉")
    navigate("/dashboard/enrolled-courses")
    dispatch(resetCart())
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error)
    toast.error("Payment verification failed")
  }

  toast.dismiss(toastId)
  dispatch(setPaymentLoading(false))
}

// ================================
// PAYMENT SUCCESS EMAIL
// ================================
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiconnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      { Authorization: `Bearer ${token}` }
    )
  } catch (error) {
    console.error("PAYMENT EMAIL ERROR:", error)
  }
}
