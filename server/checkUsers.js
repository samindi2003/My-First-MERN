const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");


    const users = await User.find({}).select('-password');

    console.log(`\n👥 Total Registered Users: ${users.length}`);
    console.log("------------------------------------------------");
    console.log(users);
    console.log("------------------------------------------------\n");


    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

checkUsers();
