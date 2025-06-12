const express = require("express");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connections");

const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const { set } = require("mongoose");
const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "gender",
  "userName",
  "skills",
  "about",
  "photoURL",
  "location", //changed
];

userRouter.get("/user/requests/interested", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.status(200).json({
      message: `Data Fetched Successfully `,
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send("Error! " + error.message);
  }
});

//api for the CONNECTION requests
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUserId, status: "accepted" },
        { toUserId: loggedInUserId, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUserId.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.status(200).json({
      message: `${req.user.firstName}, your Connections are: `,
      data,
    });
  } catch (error) {
    res.status(400).send("Error! " + error.message);
  }
});

//changed
userRouter.post("/user/location", userAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { location } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Location updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//feed API
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    //finding all the connection requests that is sent and recieved
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
});

module.exports = { userRouter };
