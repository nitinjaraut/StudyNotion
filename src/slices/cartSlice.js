import { createSlice } from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"

// Helper to get the current user's ID from localStorage
function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"))
    return user?._id || null
  } catch {
    return null
  }
}

// Helper to get user-specific cart data from localStorage
function getUserCart(userId) {
  if (!userId) return { cart: [], total: 0, totalItems: 0 }
  try {
    const cart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || []
    const total = JSON.parse(localStorage.getItem(`total_${userId}`)) || 0
    const totalItems = JSON.parse(localStorage.getItem(`totalItems_${userId}`)) || 0
    return { cart, total, totalItems }
  } catch {
    return { cart: [], total: 0, totalItems: 0 }
  }
}

// Helper to save user-specific cart data to localStorage
function saveUserCart(userId, state) {
  if (!userId) return
  localStorage.setItem(`cart_${userId}`, JSON.stringify(state.cart))
  localStorage.setItem(`total_${userId}`, JSON.stringify(state.total))
  localStorage.setItem(`totalItems_${userId}`, JSON.stringify(state.totalItems))
}

const initialState = {
  cart: [],
  total: 0,
  totalItems: 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Called on login to load the user's saved cart
    loadCart: (state, action) => {
      const userId = action.payload
      const saved = getUserCart(userId)
      state.cart = saved.cart
      state.total = saved.total
      state.totalItems = saved.totalItems
    },
    addToCart: (state, action) => {
      const course = action.payload
      const index = state.cart.findIndex((item) => item._id === course._id)

      if (index >= 0) {
        toast.error("Course already in cart")
        return
      }
      state.cart.push(course)
      state.totalItems++
      state.total += course.price
      // Save to user-specific localStorage
      const userId = getCurrentUserId()
      saveUserCart(userId, state)
      toast.success("Course added to cart")
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload
      const index = state.cart.findIndex((item) => item._id === courseId)

      if (index >= 0) {
        state.totalItems--
        state.total -= state.cart[index].price
        state.cart.splice(index, 1)
        // Save to user-specific localStorage
        const userId = getCurrentUserId()
        saveUserCart(userId, state)
        toast.success("Course removed from cart")
      }
    },
    resetCart: (state) => {
      state.cart = []
      state.total = 0
      state.totalItems = 0
      // Note: We do NOT remove from localStorage here
      // so the cart persists for the next login
    },
  },
})

export const { addToCart, removeFromCart, resetCart, loadCart } = cartSlice.actions

export default cartSlice.reducer
