// import { PostOrderByInput } from "../generated/prisma-client/prisma-schema.js";
// const { PostOrderByInput } = require('../generated/prisma-client/prisma-schema.js')
const { rad2Deg, deg2Rad } = require('../utils')
const { MyInfoForConnections, DetailPost } = require('../_fragments.js')

// custom functions
const getUsersMatchingTopicsFocus = async (me, context) => {
  try {
    const usersMatchingTopicsFocus = await context.prisma.users({
      first: 3,
      where: {
        AND: [
          { topicsFocus_some: { OR: me.topicsFocus } },
          { id_not: me.id },
        ]
      }
    });

    // add reason
    const usersMatchingTopicsFocusReason = usersMatchingTopicsFocus.map(user => {
      return { user, reason: { text: 'You have a matching topic of focus', icon: 'comment' } };
    })

    return usersMatchingTopicsFocusReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const getUsersMatchingGoal = async (me, post, context) => {
  const {
    goal,
    subField,
    location,
    locationLat,
    locationLon,
    topics,
  } = post;

  if (!goal) return [];

  // prepare variables for query
  const topicsIDonly = topics.map(topic => {
    return { topicID: topic.topicID }
  })

  try {
    const usersMatchingGoal = await context.prisma.users({
      first: 10,
      where: {

        AND: [
          { id_not: me.id },
          {
            OR: [
              // subtopic is one of their topics of focus
              { topicsFocus_some: subField.topicID },
              // one of the post's topics is one of their topics of interest
              { topicsFocus_some: { OR: topicsIDonly } },
            ],
          }
        ]
      }
    });

    return usersMatchingGoal;
  } catch (error) {
    console.error(error);
    return [];
  }
}

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



  // CONNECTIONS FOR YOU
  async usersForYou(parent, args, context) {
    // get my user data
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);

    // 1. find users that supplement of your Active Goals
    // add reason 

    // 2. find users that share a common Topic of Focus
    const usersMatchingTopicsFocusReason = await getUsersMatchingTopicsFocus(me, context)


    // combine all the arrays
    const SuggestedConnections = [...usersMatchingTopicsFocusReason];
    // console.log(SuggestedConnections)

    return SuggestedConnections;
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
    // all these await functions need parallized
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);
    const post = await context.prisma.post({ id }).$fragment(DetailPost);

    // get matches based on Goal and User 
    const usersMatchingGoal = await getUsersMatchingGoal(me, post, context)

    return { post, matches: usersMatchingGoal }
  },

};

module.exports = {
  Query,
};
