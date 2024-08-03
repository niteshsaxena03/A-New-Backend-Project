import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(401, "Something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  const { fullName, userName, email, password } = req.body;

  // Validate fields
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  // Check for images
  if (!req.files || !req.files.avatar) {
    throw new ApiError(400, "Avatar is mandatory");
  }

  const avatarLocalPath = req.files.avatar[0]?.path;
  const coverImageLocalPath = req.files.coverImage
    ? req.files.coverImage[0]?.path
    : null;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is mandatory");
  }

  // Upload to Cloudinary
  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : { url: "" };
  } catch (error) {
    throw new ApiError(500, "Error uploading images to Cloudinary");
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user object and save to DB
  const user = await User.create({
    fullName,
    email,
    password,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage.url, // This will be an empty string if no cover image is provided
  });

  // Remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while user registration");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body->data
  const { userName, email, password } = req.body;

  //username/email
  if (!userName && !email) {
    throw new ApiError(400, "either userName or email is required ");
  }
  //find user
  const user = User.findOne({
    $or: [{ userName, email }],
  });
  if (!user) {
    throw new ApiError(404, "User Not found");
  }
  //password check
  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User registered successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //we need to delete the refreshToken of user for logging him out
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefinded,
    }
    },
    {
      new:true,
    }
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out Successfully"))

});

export { registerUser, loginUser, logoutUser };
