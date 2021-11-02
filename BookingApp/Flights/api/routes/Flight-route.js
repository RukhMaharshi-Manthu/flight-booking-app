const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const Flight = require("../models/Flight-schema");

// Routes
/**
 * @swagger
 * /flights:
 *  get:
 *    description: Use to request all flights
 *    responses:
 *      '200':
 *        description: A successful response
 */
route.get("/", (req, res, next) => {
  // console.log("req andar ghusi hai");
  Flight.find()
    .exec()
    .then((result) => {
      console.log("data retriive kiya hai");
      res.status(200).json(result);
    })
    .catch((err) => console.log(err));
});


//posting a flight with autogenerated flightID 
/**
 * @swagger
 * /flights/:
 *    post:
 *      description: Use to post new flight in the database
 *      parameters:
 *              - name: reqBody
 *                description: request body
 *                in: body
 *                schema:
 *                    type: object
 *                    properties:
 *                       flightSource:
 *                          type: String
 *                       flightDestination:
 *                          type: String
 *                       flightArrival:
 *                          type: String
 *                       flightDeparture:
 *                          type: String
 *                       amount:
 *                          type: number
 *      responses:
 *          '201':
 *                   description: A successful response
 *          '400':
 *                   description: An error
 *                 
 */
route.post("/", (req, res, next) => {
  console.log("post is working");
  const flght = new Flight({
    _id: new mongoose.Types.ObjectId(),
    flightId:
      req.body.flightSource.toUpperCase().slice(0, 3) +
      req.body.flightDestination.toUpperCase().slice(0, 3) +
      Date.now(),
    flightSource: req.body.flightSource.toLowerCase(),
    flightDestination: req.body.flightDestination.toLowerCase(),
    flightArrival: req.body.flightArrival,
    flightDeparture: req.body.flightDeparture,
    amount: req.body.amount
  });
  flght
    .save()
    .then((result) => {
      res.status(201).json({
        flight: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});


//getting a certain flight from the database through a flightID
/**
 * @swagger
 * /flights/{id}:
 *  get:
 *      description: find by id
 *      parameters:
 *           - name: id
 *             description: id to get by
 *             in: path
 *             type: string
 *             required: true
 * 
 *      responses:
 *          '200':
 *                   description: A successful response
 */
route.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Flight.find({ flightId: id })
    .select("flightStatus flightSource flightDestination flightArrival flightDeparture flightId amount")
    .exec()
    .then((doc) => {
      // console.log(doc);
      res.status(200).json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//Updating a certain data of flight through flight ID
/**
 * @swagger
 * /flights/{id}:
 *  patch:
 *      description: updates the certain data of flight with ID 
 *      parameters:
 *           - name: id
 *             description: id to get by
 *             in: path
 *             type: string
 *             required: true
 *          
 *           - name: reqBody
 *             description: request body
 *             in: body
 *             schema:
 *                 type: object
 *                 properties:
 *                     propName:
 *                       type: string
 *                     value:
 *                       type: string    
 *      responses:
 *          '200':
 *                   description: A successful response
 */
route.patch("/:id", (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Flight.update({ flightId: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      // console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});


//deleting a flight throught FLight ID
/**
 * @swagger
 * /flights/{id}:
 *  delete:
 *         description: delete by id
 *         parameters:
 *           - name: id
 *             description: id to get by
 *             in: path
 *             type: string
 *             required: true
 * 
 *         responses:
 *             '200':
 *                    description: A successful response
 */
route.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  Flight.remove({ flightId: id })
    .exec()
    .then((doc) => {
      console.log("deleted succesfully");
      res.status(200).json({
        message: "deleted",
        count: doc.deletedCount,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});


//searching a flight with specific source and destination
/**
 * @swagger
 * /flights/{source}/{destination}:
 *  get:
 *      description: returns certain flights with same source and destination
 *      parameters:
 *         - name: source
 *           description: get source by url
 *           in: path
 *           type: string
 *           required: true
 *         - name: destination
 *           description: get destination by url
 *           in: path
 *           type: string
 *           required: true
 *      responses:
 *          '200':
 *                 description: A successful response
 */
route.get("/:source/:destination", (req, res, next) => {
  const source = req.params.source;
  const destination = req.params.destination;

  var query = {
    $and: [
      {
        flightSource: {
          $regex: source,
          $options: "I",
        },
      },
      {
        flightDestination: {
          $regex: destination,
          $options: "I",
        },
      },
    ],
  };

  Flight.find(query)
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});




module.exports = route;