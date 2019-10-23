// import { PostOrderByInput } from "../generated/prisma-client/prisma-schema.js";
// const { PostOrderByInput } = require('../generated/prisma-client/prisma-schema.js')
const { rad2Deg, deg2Rad } = require('../utils')

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
        where: { isPrivate: false },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async postsLocal(parent, { lat, lon, radius }, context) {

    // console.log(lat, lon,)

    const EARTH_RADIUS_MI = 3959;

    const distance = radius || 10;

    const maxLat = lat + rad2Deg(distance / EARTH_RADIUS_MI);
    const minLat = lat - rad2Deg(distance / EARTH_RADIUS_MI);

    const maxLon = lon + rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));
    const minLon = lon - rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));

    // console.log(minLat, maxLat)
    // console.log(minLon, maxLon)


    const posts = await context.prisma.posts(
      {
        where: {
          AND: [
            { isPrivate: false },
            { locationLat_gte: minLat },
            { locationLat_lte: maxLat },
            { locationLon_gte: minLon },
            { locationLon_lte: maxLon },
          ],
        },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async postsUser(parent, args, context) {
    // modify so isPrivate only applies if not connected
    // first check if user requesting is connected to args.id

    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return null;
    }

    let posts = []

    if (context.request.userId === args.id) {
      // if they are MY posts
      posts = await context.prisma.posts(
        {
          where: { owner: { id: args.id } },
          orderBy: 'lastUpdated_DESC'
        }
      );
    } else {
      // if they are not my posts
      posts = await context.prisma.posts(
        {
          where: {
            AND: [
              { isPrivate: false },
              {
                owner: { id: args.id }
              }
            ],
          },
          orderBy: 'lastUpdated_DESC'
        }
      );
    }

    return posts
  },

  async singlePost(parent, { id }, context) {

    const post = await context.prisma.post({ id });

    return post
  },

  // async allComments(parent, { postId, isUpdate = false }, context) {

  //   if (!context.request.userId) {
  //     // don't throw an error, just return nothing. It is ok to not be logged in.
  //     return null;
  //   }

  //   const whereInput = isUpdate ? { parentUpdate: { id: postId } } : { parentPost: { id: postId } }

  //   const comments = await context.prisma.comments(
  //     {
  //       where: whereInput,
  //       orderBy: 'createdAt_DESC'
  //     }
  //   );

  //   return comments
  // },


};

module.exports = {
  Query,
};
