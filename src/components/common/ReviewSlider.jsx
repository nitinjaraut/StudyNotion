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
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiconnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success && Array.isArray(data?.data)) {
          setReviews(data?.data)
        }
      } catch (error) {
        console.error("GET REVIEWS FRONTEND ERROR:", error)
      }
    })()
  }, [])

  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <div className="w-full text-white">
      <div className="my-[40px] mx-auto w-full max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={reviews.length >= 4}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full"
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={review._id || i} className="h-auto">
                <div className="flex h-full min-h-[190px] flex-col justify-between gap-3 rounded-lg bg-richblack-800 p-4 text-[14px] text-richblack-25 shadow-md">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25">
                    {review?.review?.split(" ").length > truncateWords
                      ? `${review?.review
                          ?.split(" ")
                          ?.slice(0, truncateWords)
                          ?.join(" ")} ...`
                      : `${review?.review}`}
                  </p>
                  <div className="mt-auto flex items-center gap-2">
                    <h3 className="font-semibold text-yellow-100">
                      {Number(review.rating || 0).toFixed(1)}
                    </h3>
                    <ReactStars
                      count={5}
                      value={Number(review.rating || 0)}
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
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider