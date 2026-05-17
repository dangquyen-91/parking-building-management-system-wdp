import mongoose from 'mongoose';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
  });
  console.log('MongoDB connected');
};

export default connectDB;
