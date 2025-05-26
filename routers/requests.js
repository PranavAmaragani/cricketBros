const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const ConnectionRequest = require("../models/connections.js");
const User = require("../models/user.js");

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
module.exports = { requestRouter };
