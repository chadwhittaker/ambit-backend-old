require('dotenv').config();

const { GraphQLServer, PubSub } = require('graphql-yoga');
const { prisma } = require('../generated/prisma-client');

const { resolvers } = require('./resolvers');
const { getUserId, cleanupStories } = require('./utils');

// const pubsub = new PubSub()
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => {

    return {
      ...request,
      prisma,
      // pubsub,
    };
  },
});

// 1. grab the JWT from each request
// 2. convert to userId
// 3. place userId in request
server.express.use((req, res, next) => {
  // console.log(req)
  const userId = getUserId(req);
  req.userId = userId
  next();
})

// use with prisma playground to insert a userid for a fake requester
// server.express.use((req, res, next) => {
//   req.userId = 'ck62jdm8qynpc09016ed0q8s4'
//   next();
// })

server.start((deets) => {
  console.log(`Server is running on http://localhost:${deets.port}`)

  console.log(process.env.LOAD_TOPICS === "yes");

  // start cron jobs
  // cleanupStories(prisma)
  setInterval(() => cleanupStories(prisma), 600000); // 600,000 ms = 10 minutes
});
