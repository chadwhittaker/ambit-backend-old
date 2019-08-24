require('dotenv').config();

const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');

const { resolvers } = require('./resolvers');
const { getUserId } = require('./utils');

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => {

    return {
      ...request,
      prisma,
    };
  },
});

// 1. grab the JWT from each request
// 2. convert to userId
// 3. place userId in request
server.express.use((req, res, next) => {
  const userId = getUserId(req);
  req.userId = userId
  next();
})

server.start((deets) => console.log(`Server is running on http://localhost:${deets.port}`));
