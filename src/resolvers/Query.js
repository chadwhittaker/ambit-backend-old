// import { PostOrderByInput } from "../generated/prisma-client/prisma-schema.js";
// const { PostOrderByInput } = require('../generated/prisma-client/prisma-schema.js')
const { rad2Deg, deg2Rad } = require('../utils')
const { MyInfoForConnections, DetailPost } = require('../_fragments.js')
const { getUsersMatchingManyGoals, getUsersMatchingGoal, getUsersMatchingTopicsFocus, getActiveGoalsOfUser } = require('./functions')

const Query = {

  // USERS
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

  async postsGlobal(parent, { after }, context) {
    const posts = await context.prisma.postsConnection(
      {
        first: 30,
        after,
        where: { isPrivate: false },
        orderBy: 'lastUpdated_DESC'
      }
    );

    // console.log(posts)

    return posts
  },

  async postsLocal(parent, { lat, lon, radius, after }, context) {

    // console.log(lat, lon,)

    const EARTH_RADIUS_MI = 3959;

    const distance = radius || 10;

    const maxLat = lat + rad2Deg(distance / EARTH_RADIUS_MI);
    const minLat = lat - rad2Deg(distance / EARTH_RADIUS_MI);

    const maxLon = lon + rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));
    const minLon = lon - rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));

    // console.log(minLat, maxLat)
    // console.log(minLon, maxLon)


    const posts = await context.prisma.postsConnection(
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
        first: 30,
        after,
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async postsTopic(parent, { after, topicID }, context) {
    let where = { isPrivate: false, topics_some: { topicID_contains: topicID } }
    // if (topic === 'Trending') where = { isPrivate: false }

    const posts = await context.prisma.postsConnection(
      {
        first: 30,
        after,
        where,
        orderBy: 'lastUpdated_DESC'
      }
    );

    // console.log(posts)

    return posts
  },

  async postsSearch(parent, { text, goal, topicID, lat, lon, after }, context) {

    const haveInputs = !!text || !!goal || !!topicID || (!!lat && !!lon);
    const blankSearch = { id: "99" }
    const allSearch = { id_not: "99" }

    // text stuff - must return a PostWhereInput
    const getTextQuery = () => {
      if (!haveInputs) return blankSearch;
      if (!text) return allSearch;

      return { OR: [{ content_contains: text }, { goal_contains: text }, { owner: { name_contains: text } }] }
    }

    // goal stuff - must return a PostWhereInput
    const getGoalQuery = () => {
      if (!haveInputs) return blankSearch;
      if (!goal) return allSearch;

      return { goal }
    }

    // topic stuff - must return a PostWhereInput
    const getTopicQuery = () => {
      if (!haveInputs) return blankSearch;
      if (!topicID) return allSearch;

      // if there's a goal involved then the topic refers to subField
      if (goal) {
        return { subField: { topicID } }
      }

      // otherwise query the topics array
      return { topics_some: { topicID_contains: topicID } }
    }

    // location stuff - must return a PostWhereInput
    const getLocationQuery = () => {
      if (!haveInputs) return blankSearch;
      if (!lat || !lon) return allSearch;

      const EARTH_RADIUS_MI = 3959;
      const distance = 50;  // default to 50 miles radius
      const maxLat = lat + rad2Deg(distance / EARTH_RADIUS_MI);
      const minLat = lat - rad2Deg(distance / EARTH_RADIUS_MI);
      const maxLon = lon + rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));
      const minLon = lon - rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));

      return {
        AND: [{ locationLat_gte: minLat },
        { locationLat_lte: maxLat },
        { locationLon_gte: minLon },
        { locationLon_lte: maxLon }]
      }
    }

    const posts = await context.prisma.postsConnection(
      {
        where: {
          AND: [
            getTextQuery(),
            getGoalQuery(),
            getTopicQuery(),
            getLocationQuery(),
          ],
        },
        first: 30,
        after,
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
    const post = await context.prisma.post({ id })

    return post
  },

  async singlePostMatches(parent, { id }, context) {
    // all these await functions need parallized
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);
    const post = await context.prisma.post({ id }).$fragment(DetailPost);

    // get matches based on Goal and User 
    const isMyPost = context.request.userId === post.owner.id;

    let matches = null;
    if (isMyPost && !!post.goal) {
      matches = await getUsersMatchingGoal(me, post, context) // returns [Match]
    }

    return matches
  },



  async activeGoalsUser(parent, args, context) {
    // all these await functions need parallized
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);
    const myActiveGoals = await getActiveGoalsOfUser(me, context)

    const myActiveGoalsWithMatches = myActiveGoals.map(post => {
      try {
        const usersMatchingGoal = getUsersMatchingGoal(me, post, context) // returns [Match]
        return { post, matches: usersMatchingGoal }
      } catch (e) {
        console.error(e)
        return { post, matches: [] }
      }
    })

    return myActiveGoalsWithMatches; // [PostWithMatches]!
  },

  async allConnections(parent, args, context) {
    // all these await functions need parallized

    // 1. find matches for each active goal
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);
    const myActiveGoals = await getActiveGoalsOfUser(me, context)
    const myActiveGoalsWithMatches = myActiveGoals.map(post => {
      try {
        const usersMatchingGoal = getUsersMatchingGoal(me, post, context) // returns [Match]
        return { post, matches: usersMatchingGoal } // returns [PostWithMatches]
      } catch (e) {
        console.error(e)
        return { post, matches: [] }
      }
    })

    // 2. find users that share a common Topic of Focus
    const usersMatchingTopicsFocus = await getUsersMatchingTopicsFocus(me, context) // returns [Match]

    return { postsWithMatches: myActiveGoalsWithMatches, matches: usersMatchingTopicsFocus }; // AllConnections
  },

  // CHATS

  async allMyChats(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      throw new Error(`You must be logged in to see messages`)
    }
    // 2. if there is a user, get all my chats
    const chats = await context.prisma.chats(
      {
        where: { users_some: { id: context.request.userId } },
        orderBy: "updatedAt_DESC",
      }
    );

    return chats;
  },

  async fullChat(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      throw new Error(`You must be logged in to see messages`)
    }

    // if the chat does not exist yet
    if (!args.id || args.id === null) return null;

    // 2. if there is a user, get all my chats
    const chat = await context.prisma.chat({ id: args.id });

    return chat;
  },

  async myNotifications(parent, args, context) {
    if (!context.request.userId) {
      return [];
    }

    const notifications = await context.prisma.notifications(
      {
        where: { target: { id: context.request.userId } },
        orderBy: 'createdAt_DESC'
      }
    );

    return notifications
  },

};

module.exports = {
  Query,
};
