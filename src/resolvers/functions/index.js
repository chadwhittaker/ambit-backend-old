const { DetailPost, FollowersFragment, UserIDFragment } = require('../../_fragments.js')
const { rad2Deg, deg2Rad } = require('../../utils')

// custom functions for queries

// location stuff - must return a PostWhereInput or UserWhereInput
const getLocationQuery = (lat, lon, radius = 50) => {

  const EARTH_RADIUS_MI = 3959;
  const distance = radius;  // default to 50 miles radius
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

const getActiveGoalsOfUser = async (user, context) => {
  try {
    const activeGoals = await context.prisma.posts({
      first: 10,
      orderBy: 'lastUpdated_ASC',
      where: {
        AND: [
          { owner: { id: user.id } },
          // active goal (needs updated once active field is added)
          { isGoal: true },
        ]
      }
    }).$fragment(DetailPost);

    return activeGoals;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const getUsersMatchingTopicsFocus = async (me, context, excludeIDs = []) => {
  try {
    // commented the "where" so that all users would appear here
    const usersMatchingTopicsFocus = await context.prisma.users({
      // first: 3,
      where: { id_not: me.id },
      // where: {
      //   AND: [
      //     { topicsFocus_some: { OR: me.topicsFocus } },
      //     { id_not_in: [me.id, ...excludeIDs] },
      //   ]
      // }
    });

    // add reason
    const usersMatchingTopicsFocusReason = usersMatchingTopicsFocus.map(user => {
      return { user, reason: { text: `You and ${user.firstName} have a matching topic of focus`, icon: 'comment' } };
    })

    return usersMatchingTopicsFocusReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// find matches for MANY goals
const getUsersMatchingManyGoals = (me, posts, context) => {
  const usersMatchingGoalsPromises = posts.map(post => {
    const usersMatchingGoal = getUsersMatchingGoal(me, post, context, 10);  // each one returns a promise
    return usersMatchingGoal;
  })
  return Promise.all(usersMatchingGoalsPromises);
}

// find matches for a SINGLE goal
const getUsersMatchingGoal = async (me, post, context, first = 10) => {
  // must return a PROMISE for an array of type [Match]
  if (!post.goal) return [];

  if (post.goal === 'Find Investors') return getMatchesFindInvestor(me, post, context, first);
  if (post.goal === 'Find Mentors') return getMatchesFindMentors(me, post, context, first);
  if (post.goal === 'Find Freelancers') return getMatchesFindFreelancers(me, post, context, first);
  if (post.goal === 'Find Agencies') return getMatchesFindFreelancers(me, post, context, first);
  if (post.goal === 'Find Business Partners') return getMatchesFindBusinessPartners(me, post, context, first);
  if (post.goal === 'Network') return getMatchesFindBusinessPartners(me, post, context, first);
  if (post.goal === 'Get Coffee') {
    try {
      const coffeeUsers1 = await getMatchesGetCoffee1(me, post, context, first);
      const coffeeUsers1_IDs = coffeeUsers1.map(item => item.user.id)
      // get 2nd group of users, but exclude users from first group
      const coffeeUsers2 = await getMatchesGetCoffee2(me, post, context, first, coffeeUsers1_IDs);

      // const coffeeUsers = await Promise.all([coffeeUsers1, coffeeUsers2])
      // const coffeeUsersFlat = [].concat.apply([], coffeeUsers); // returns [Match]
      return [...coffeeUsers1, ...coffeeUsers2]
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  return [];
}

////////////////////////////////////////
// QUERIES FOR INDIVIDUAL GOAL TYPES
////////////////////////////////////////

// FIND INVESTORS - Matches
const getMatchesFindInvestor = async (me, post, context, first = 10) => {
  const {
    goal,
    subField,
    // location,
    // locationLat,
    // locationLon,
    // topics = [],
  } = post;

  if (goal !== "Find Investors" || !goal || !subField.topicID) return [];

  // prepare variables for query
  // const topicsIDonly = topics.map(topic => {
  //   return { topicID: topic.topicID }
  // })

  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          // the user is an investor of type subField
          { topicsInvest_some: { topicID: subField.topicID } },
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `${user.firstName} is interested in investing in ${subField.name.toLowerCase()}`, icon: 'comment-dollar' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// FIND MENTORS - Matches
const getMatchesFindMentors = async (me, post, context, first = 10) => {
  const {
    goal,
    subField,
    // location,
    // locationLat,
    // locationLon,
    // topics = [],
  } = post;

  if (goal !== "Find Mentors" || !goal || !subField.topicID) return [];

  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          // the user is a mentor of type subField
          { topicsMentor_some: { topicID: subField.topicID } },
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `${user.firstName} is open to mentor others in ${subField.name.toLowerCase()}`, icon: 'user-friends' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// FIND FREELANCERS - Matches
const getMatchesFindFreelancers = async (me, post, context, first = 10) => {
  const {
    goal,
    subField,
    // location,
    // locationLat,
    // locationLon,
    // topics = [],
  } = post;

  if (goal !== "Find Freelancers" || !goal || !subField.topicID) return [];

  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          // the user is a freelancer of type subField
          { topicsFreelance_some: { topicID: subField.topicID } },
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `${user.firstName} is open to freelance for ${subField.name.toLowerCase()}`, icon: 'briefcase' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// GET COFFEE - Matches
// user also posted to Get Coffee in the same subField
const getMatchesGetCoffee1 = async (me, post, context, first = 10) => {
  const {
    goal,
    subField,
    // location,
    locationLat,
    locationLon,
    // topics = [],
  } = post;

  if (goal !== "Get Coffee" || !goal || !subField.topicID) return [];

  // find users who also posted to Get Coffee in this subject
  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          getLocationQuery(locationLat, locationLon), // User must be within 50 mile radius of Post
          {
            posts_some: {
              AND: [
                { goal: "Get Coffee" },
                { subField: { topicID: subField.topicID } }
              ]
            }
          }
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `You and ${user.firstName} would both like to get coffee to discuss ${subField.name.toLowerCase()}`, icon: 'mug-hot' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}
const getMatchesGetCoffee2 = async (me, post, context, first = 10, excludeIDs) => {
  const {
    goal,
    subField,
    // location,
    locationLat,
    locationLon,
    // topics = [],
  } = post;

  if (goal !== "Get Coffee" || !goal || !subField.topicID) return [];

  // find users with a topicFocus that matches subField
  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          getLocationQuery(locationLat, locationLon), // User must be within 50 mile radius of Post
          { id_not_in: [me.id, ...excludeIDs] },
          { topicsFocus_some: { topicID: subField.topicID } },
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `You and ${user.firstName} are both focused on photography & live nearby`, icon: 'comment' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// FIND FREELANCERS - Matches
const getMatchesFindBusinessPartners = async (me, post, context, first = 10) => {
  const {
    goal,
    subField,
    // location,
    // locationLat,
    // locationLon,
    // topics = [],
  } = post;

  if (goal !== "Find Business Partners" || !goal || !subField.topicID) return [];

  try {
    const usersMatchingGoal = await context.prisma.users({
      first,
      where: {
        AND: [
          { id_not: me.id },
          // the user is a freelancer of type subField
          { topicsFocus_some: { topicID: subField.topicID } },
        ]
      }
    });

    // add reason
    const usersMatchingGoalWithReason = usersMatchingGoal.map(user => {
      return { user, reason: { text: `You and ${user.firstName} are both focused on ${subField.name.toLowerCase()}`, icon: 'users' } };
    })

    return usersMatchingGoalWithReason;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const createNotification = async ({ context, style, targetID, userID, userIDs, postID, updateID, commentID }) => {
  // switch between styles
  switch (style) {
    case 'LIKE_POST':
      // check if the same notification already exists
      try {
        const notif = await context.prisma.notifications({
          where: {
            AND: [
              { style: 'LIKE_POST' },
              { post: { id: postID } },
              { user: { id: userID } },
            ]
          }
        })

        const doesNotExist = (!notif || notif.length === 0)

        // if the notification does not already exist, create notification
        if (doesNotExist) {
          await context.prisma.createNotification(
            {
              target: { connect: { id: targetID } },
              user: { connect: { id: userID } },
              style: 'LIKE_POST',
              post: { connect: { id: postID } },
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
      break;

    case 'LIKE_GOAL':
      // check if the same notification already exists
      try {
        const notif = await context.prisma.notifications({
          where: {
            AND: [
              { style: 'LIKE_GOAL' },
              { post: { id: postID } },
              { user: { id: userID } },
            ]
          }
        })

        const doesNotExist = (!notif || notif.length === 0)

        // if the notification does not already exist, create notification
        if (doesNotExist) {
          await context.prisma.createNotification(
            {
              target: { connect: { id: targetID } },
              user: { connect: { id: userID } },
              style: 'LIKE_GOAL',
              post: { connect: { id: postID } },
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
      break;

    case 'LIKE_UPDATE':
      // check if the same notification already exists
      try {
        const notif = await context.prisma.notifications({
          where: {
            AND: [
              { style: 'LIKE_UPDATE' },
              { update: { id: updateID } },
              { user: { id: userID } },
            ]
          }
        })

        const doesNotExist = (!notif || notif.length === 0)

        // if the notification does not already exist, create notification
        if (doesNotExist) {
          await context.prisma.createNotification(
            {
              target: { connect: { id: targetID } },
              user: { connect: { id: userID } },
              style: 'LIKE_UPDATE',
              update: { connect: { id: updateID } },
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
      break;

    case 'LIKE_COMMENT':
      // check if the same notification already exists
      try {
        const notif = await context.prisma.notifications({
          where: {
            AND: [
              { style: 'LIKE_COMMENT' },
              { comment: { id: commentID } },
              { user: { id: userID } },
            ]
          }
        })

        const doesNotExist = (!notif || notif.length === 0)

        // if the notification does not already exist, create notification
        if (doesNotExist) {
          await context.prisma.createNotification(
            {
              target: { connect: { id: targetID } },
              user: { connect: { id: userID } },
              style: 'LIKE_COMMENT',
              comment: { connect: { id: commentID } },
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
      break;

    case 'COMMENT_GOAL':
      try {
        await context.prisma.createNotification(
          {
            style: 'COMMENT_GOAL',
            target: { connect: { id: targetID } },
            user: { connect: { id: userID } },
            comment: { connect: { id: commentID } },
          }
        )
      } catch (e) {
        console.error(e)
      }
      break;

    case 'COMMENT_POST':
      try {
        await context.prisma.createNotification(
          {
            style: 'COMMENT_POST',
            target: { connect: { id: targetID } },
            user: { connect: { id: userID } },
            comment: { connect: { id: commentID } },
          }
        )
      } catch (e) {
        console.error(e)
      }
      break;

    case 'COMMENT_UPDATE':
      try {
        await context.prisma.createNotification(
          {
            style: 'COMMENT_UPDATE',
            target: { connect: { id: targetID } },
            user: { connect: { id: userID } },
            comment: { connect: { id: commentID } },
          }
        )
      } catch (e) {
        console.error(e)
      }
      break;

    default:
      break;
  }
}

const getAllMessageConnections = (groups, context, first) => {
  const messageConnectionPromises = groups.map(group => {
    const messageConnection = getMessageConnection(group, context, first);  // each one returns a promise for MessageConnection
    return messageConnection;
  })
  return Promise.all(messageConnectionPromises);
}

const getMessageConnection = async (group, context, first) => {
  // must return a PROMISE for a MessageConnection
  if (!group) return null;

  try {
    const messageConnection = await context.prisma.messagesConnection(
      {
        where: { to: { id: group.id } },
        first,
        orderBy: 'createdAt_DESC'
      }
    );
    return messageConnection
  } catch (e) {
    console.error(e)
    return null
  }
}

const addMessageToUnread = async (message, context) => {
  // for each user in the group chat
  message.to.users.forEach(async user => {
    // that is not the sender
    if (user.id !== message.from.id) {
      // add the message to their unReadMessages
      try {
        await context.prisma.updateUser({
          where: { id: user.id },
          data: {
            about: 'lolll',
            unReadMessages: {
              connect: [{ id: message.id }],
            }
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const updateFollowersAndVerify = async (followers, userID, context) => {
  // 3. update followers of userID
  const userFollowers = await context.prisma.updateUser(
    {
      where: { id: userID },
      data: {
        followers
      }
    },
  ).$fragment(FollowersFragment)

  // 4. update # of followers of userID
  const followersCount = userFollowers.followers.length;
  // console.log('followers', followersCount);
  await context.prisma.updateUser(
    {
      where: { id: userID },
      data: {
        followersCount,
      }
    },
  );

  // 5. do a verificatoin to make sure all followers are connected

  // search the database for everyone that follows the userID
  const usersThatFollow = await context.prisma.users({
    where: {
      following_some: { id: userID }
    }
  }).$fragment(UserIDFragment)

  const usersThatNeedAddedToFollowers = [];
  // verify they are all connected to userID
  usersThatFollow.forEach(user => {
    const check = userFollowers.followers.find(u => u.id === user.id);

    if (!check) {
      // add it to a list of users that need added to followers
      console.log('user that needs added to followers', user);
      usersThatNeedAddedToFollowers.push(user);
    }
  })

  if (usersThatNeedAddedToFollowers.length === 0) {
    console.log('all followers accounted for!')
  } else {
    console.log('all followers not accounted for!')
  }
}

const getTopicIDsFromUser = usr => {
  if (!usr) {
    return [];
  }
  const topicFocusIDs = usr.topicsFocus ? usr.topicsFocus.map(t => t.topicID) : [];
  const topicInterestIDs = usr.topicsInterest ? usr.topicsInterest.map(t => t.topicID) : [];
  return [...topicFocusIDs, ...topicInterestIDs];
};

const getNetworkIDsFromUser = usr => {
  if (!usr) {
    return [];
  }
  const followingIDs = usr.following ? usr.following.map(u => u.id) : [];
  const connectionIDs = usr.connection ? usr.connections.map(u => u.id) : [];
  return [...followingIDs, ...connectionIDs];
};



module.exports = {
  getUsersMatchingTopicsFocus,
  getUsersMatchingManyGoals,
  getUsersMatchingGoal,
  getActiveGoalsOfUser,
  createNotification,
  getAllMessageConnections,
  getMessageConnection,
  addMessageToUnread,
  updateFollowersAndVerify,
  getTopicIDsFromUser,
  getNetworkIDsFromUser,
}