// import { PostOrderByInput } from "../generated/prisma-client/prisma-schema.js";
// const { PostOrderByInput } = require('../generated/prisma-client/prisma-schema.js')

const Query = {
  async userLoggedIn(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return null;
    }
    // 2. if there is a user, query user in database and return data to client
    const user = await context.prisma.user({ id: context.request.userId });

    return user;
  },

  async user(parent, args, context) {
    const user = await context.prisma.user({ id: args.id });

    return user;
  },

  async users(parent, args, context) {
    const users = await context.prisma.users();

    return users;
  },

  async postsGlobal(parent, args, context) {
    const posts = await context.prisma.posts(
      {
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  }
};

module.exports = {
  Query,
};
