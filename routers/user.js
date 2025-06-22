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

// location tracker route
userRouter.put("/user/update-location", userAuth, async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user._id;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    await User.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [lng, lat], // Important: GeoJSON format
      },
    });


    res.json({ message: "📍 Location updated successfully" });
  } catch (err) {
    console.error("Failed to update location:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
  
});

//nearby users route
userRouter.get("/nearby", userAuth, async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user._id);

    if (
      !loggedInUser ||
      !loggedInUser.location ||
      !loggedInUser.location.coordinates
    ) {
      return res
        .status(400)
        .json({ error: "Location not set for current user" });
    }

    const [lng, lat] = loggedInUser.location.coordinates;

    const nearbyUsers = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, // 10 km
        },
      },
    }).select("firstName userName photoURL location");

    res.json({ users: nearbyUsers });
  } catch (err) {
    console.error("Nearby users error:", err);
    res.status(500).json({ error: "Failed to fetch nearby users" });
  }
});

module.exports = { userRouter };
