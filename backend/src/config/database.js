import mongoose from 'mongoose';
import dns from 'node:dns';

const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
  });
  console.log('MongoDB connected');
};

export default connectDB;
