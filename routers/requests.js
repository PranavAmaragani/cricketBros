const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const ConnectionRequest = require("../models/connections.js");
const User = require("../models/user.js");

// send connection requests api
requestRouter.post(
  "/request/send/:status/:touserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.touserId; // lowercase 'touserId' in params
      const status = req.params.status;
      const allowedStatus = ["interested", "ignored"];
      // checking only accepted values can be sent
      if (!allowedStatus.includes(status)) {
        throw new Error("Status is not valid");
      }

      // checking whether User is exists in database or not
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("user not found");
      }

      /* 
          logic for not sending connection request to himself
          if(toUserId == fromUserId) {
              throw new Error("Cannot send yurself a connection rquest")
        } */

      // checking whether the request has been sent earlier or not
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        throw new Error("Connection Request has been already Sent!!");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.status(200).json({
        message: `${req.user.firstName} has ${status} ${toUser.firstName}`,
      });
    } catch (error) {
      res.status(400).send("Error! " + error.message);
    }
  }
);

// review connection requests api
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];

      // checking whether the status inclue allowedStatus or not
      if (!allowedStatus.includes(status)) {
        return res.status(404).json({
          message: `${status} not valid`,
        });
      }
      /*logic to the user only loggged in can accept the request and only which requests are
               only accepted and the ignored ones cannot come*/
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        status: "interested",
        toUserId: loggedInUser._id,
      });

      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Requests Doesnot exists" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.status(200).json({
        message: `Connection Request ${status} Successfully`,
        data,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
module.exports = { requestRouter };
