const mongoose = require("mongoose");

/*mongoose.connect(
    "mongodb+srv://Maharshi:Maharshi9@cluster0.uucha.mongodb.net/FLIGHTBOOKINGAPP?retryWrites=true&w=majority",
    () => {
        console.log("Connected to database succesfully..");
    }
);*/

mongoose.connect("mongodb+srv://Maharshi:Maharshi9@cluster0.uucha.mongodb.net/FLIGHTBOOKINGAPP?retryWrites=true&w=majority", 
{ useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false }
    ).then(() =>console.log('Database Connected Succesfully'));