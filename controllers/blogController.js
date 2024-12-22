const Blog = require("../models/postModels");
const User = require("../models/usersModels");
const calculateReadingTime = require("../utils/calculateReadingTime");

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;

    // Calculate reading time
    const reading_time = calculateReadingTime(body);

    const newBlog = new Blog({
      title,
      description,
      tags,
      body,
      author: req.user._id, // Assuming req.user is populated by the auth middleware
      reading_time,
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all published blogs with pagination, search, and sorting
exports.getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "timestamp",
      order = "desc",
    } = req.query;

    const query = { state: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("author", "first_name last_name email");

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get a single blog
exports.getBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate(
      "author",
      "first_name last_name email"
    );

    if (!blog || blog.state !== "published") {
      return res
        .status(404)
        .json({ success: false, message: "Post not found or unpublished" });
    }

    // Increment read count
    blog.read_count += 1;
    await blog.save();

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    Object.assign(blog, req.body);
    blog.reading_time = calculateReadingTime(blog.body); // Recalculate reading time if body changes

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await blog.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update blog state
exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!["draft", "published"].includes(state)) {
      return res.status(400).json({ success: false, message: "Invalid state" });
    }

    blog.state = state;

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog state updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get user blogs (filterable by state)
exports.getUserBlogs = async (req, res) => {
  try {
    const { state, page = 1, limit = 10 } = req.query;

    const query = { author: req.user._id };
    if (state) {
      query.state = state;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
