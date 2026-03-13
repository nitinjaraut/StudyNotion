# StudyNotion

A full-stack EdTech platform where instructors can create and sell courses while students can browse, purchase, enroll, track progress, and review courses.

Features:
- Role-based authentication for Students and Instructors
- Secure login using JWT authentication and Bcrypt password hashing
- OTP verification and password recovery functionality
- Instructors can create, update, and manage courses
- Instructor dashboard showing course analytics (students enrolled, courses created, revenue insights)
- Students can purchase and enroll in courses
- Course progress tracking for enrolled students
- Course ratings and reviews system
- Wishlist and cart checkout functionality
- Razorpay payment gateway integration for secure course purchases
- Cloudinary media storage for course videos and images
- Course content stored and rendered using Markdown

Tech Stack:

Frontend:
- React.js
- HTML
- CSS
- JavaScript

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

Authentication & Security:
- JWT (JSON Web Tokens)
- Bcrypt

Integrations:
- Razorpay (Payment Gateway)
- Cloudinary (Media Storage)

Architecture:

StudyNotion follows a monolithic architecture where all modules are part of a single backend application.

The backend is built using Node.js and Express.js, while MongoDB is used for data storage.
The frontend communicates with backend APIs to fetch and manage course, user, and payment data.

Main Modules:

Student Features:
- Browse available courses
- Add courses to wishlist
- Purchase courses through Razorpay
- Track course progress
- Leave ratings and reviews

Instructor Features:
- Create and manage courses
- Upload course media
- View course analytics and statistics
- Track enrolled students and revenue
