const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  updateState,
  getUserBlogs,
} = require("../controllers/blogController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", isAuthenticated, createBlog);
router.get("/", getBlogs); // Public endpoint
router.get("/:id", getBlog); // Public endpoint with read_count update
router.patch("/:id", isAuthenticated, updateBlog);
router.delete("/:id", isAuthenticated, deleteBlog);
router.patch("/:id/state", isAuthenticated, updateState);
router.get("/user/blogs", isAuthenticated, getUserBlogs);

module.exports = router;
