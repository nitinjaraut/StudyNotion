import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Autoplay, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import "../../App.css"
import { FaStar } from "react-icons/fa"
import { apiconnector } from "../../services/apiconnector"
// Get apiFunction and the endpoint

import { ratingsEndpoints } from "../../services/apis"
// chat gpt code when there are less review
// function ReviewSlider() {
//   const [reviews, setReviews] = useState([])
//   const truncateWords = 15

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const { data } = await apiconnector(
//           "GET",
//           ratingsEndpoints.REVIEWS_DETAILS_API
//         )

//         if (data?.success && Array.isArray(data.data)) {
//           setReviews(data.data)
//         } else {
//           setReviews([])
//         }
//       } catch (error) {
//         console.error("GET REVIEWS FRONTEND ERROR:", error)
//         setReviews([])
//       }
//     }

//     fetchReviews()
//   }, [])

//   if (!reviews.length) {
//     return null // you can replace with skeleton loader
//   }

//   return (
//     <section className="w-full bg-richblack-900 text-white">
//       {/* Heading */}
//       <h2 className="mb-10 text-center text-3xl font-semibold">
//         Reviews from other learners
//       </h2>

//       {/* Slider container */}
//       <div className="mx-auto w-full max-w-screen-xl px-4">
//         <Swiper
//           spaceBetween={25}
//           loop
//           freeMode
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false,
//           }}
//           breakpoints={{
//             0: { slidesPerView: 1 },
//             640: { slidesPerView: 2 },
//             1024: { slidesPerView: 4 },
//           }}
//           modules={[FreeMode, Autoplay]}
//           className="w-full"
//         >
//           {reviews.map((review) => (
//             <SwiperSlide key={review._id} className="h-auto">
//               <div className="flex h-full flex-col gap-4 rounded-lg bg-richblack-800 p-4 text-sm text-richblack-25 shadow-md">
//                 {/* User info */}
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={
//                       review?.user?.image ||
//                       `https://api.dicebear.com/5.x/initials/svg?seed=${
//                         review?.user?.firstName || "User"
//                       }`
//                     }
//                     alt="user"
//                     className="h-10 w-10 rounded-full object-cover"
//                   />
//                   <div>
//                     <h3 className="font-semibold text-richblack-5">
//                       {review?.user?.firstName} {review?.user?.lastName}
//                     </h3>
//                     <p className="text-xs text-richblack-400">
//                       {review?.course?.courseName}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Review text */}
//                 <p className="text-sm leading-relaxed">
//                   {review?.review
//                     ? review.review.split(" ").length > truncateWords
//                       ? `${review.review
//                           .split(" ")
//                           .slice(0, truncateWords)
//                           .join(" ")}...`
//                       : review.review
//                     : ""}
//                 </p>

//                 {/* Rating */}
//                 <div className="mt-auto flex items-center gap-2">
//                   <span className="font-semibold text-yellow-100">
//                     {Number(review.rating || 0).toFixed(1)}
//                   </span>
//                   <ReactStars
//                     count={5}
//                     value={Number(review.rating)}
//                     size={18}
//                     edit={false}
//                     activeColor="#ffd700"
//                     emptyIcon={<FaStar />}
//                     fullIcon={<FaStar />}
//                   />
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   )
// }

// export default ReviewSlider
function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      const { data } = await apiconnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, [])

  // console.log(reviews)

  return (
    <div className="text-white">
      <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          slidesPerView={3}
          spaceBetween={25}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full "
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25">
                    {review?.review.split(" ").length > truncateWords
                      ? `${review?.review
                          .split(" ")
                          .slice(0, truncateWords)
                          .join(" ")} ...`
                      : `${review?.review}`}
                  </p>
                  <div className="flex items-center gap-2 ">
                    <h3 className="font-semibold text-yellow-100">
                      {review.rating.toFixed(1)}
                    </h3>
                    <ReactStars
                      count={5}
                      value={review.rating}
                      size={20}
                      edit={false}
                      activeColor="#ffd700"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
          {/* <SwiperSlide>Slide 1</SwiperSlide> */}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider