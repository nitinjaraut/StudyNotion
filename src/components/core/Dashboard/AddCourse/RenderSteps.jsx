import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"


export default function RenderSteps() {
  const { step } = useSelector((state) => state.course)

  const steps = [
    {
      id: 1,
      title: "Course Information",
    },
    {
      id: 2,
      title: "Course Builder",
    },
    {
      id: 3,
      title: "Publish",
    },
  ]

 
  return (
    <>
      {/* Steps: Circles, Labels, and Connecting Lines */}
      <div className="relative mb-16 flex w-full select-none items-start">
        {steps.map((item, idx) => (
          <>
            {/* Step: Circle + Label */}
            <div
              key={item.id}
              className="flex flex-col items-center gap-y-2"
            >
              <button
                className={`grid cursor-default aspect-square w-[34px] place-items-center rounded-full border-[1px]
                  ${
                    step === item.id
                      ? "border-yellow-50 bg-yellow-900 text-yellow-50"
                      : "border-richblack-700 bg-richblack-800 text-richblack-300"
                  }
                  ${step > item.id ? "bg-yellow-50 text-yellow-50" : ""}
                `}
              >
                {step > item.id ? (
                  <FaCheck className="font-bold text-richblack-900" />
                ) : (
                  item.id
                )}
              </button>
              <p
                className={`text-sm whitespace-nowrap ${
                  step >= item.id
                    ? "text-richblack-5"
                    : "text-richblack-500"
                }`}
              >
                {item.title}
              </p>
            </div>

            {/* Connecting line (between circles, not after the last one) */}
            {idx < steps.length - 1 && (
              <div
                key={`line-${item.id}`}
                className={`mt-[17px] flex-1 border-dashed border-b-2 ${
                  step > item.id
                    ? "border-yellow-50"
                    : "border-richblack-500"
                }`}
              />
            )}
          </>
        ))}
      </div>

      {/* Render Step Component */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  )
}