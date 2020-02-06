const { DetailPost } = require('../../_fragments.js')
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
    const usersMatchingTopicsFocus = await context.prisma.users({
      first: 3,
      where: {
        AND: [
          { topicsFocus_some: { OR: me.topicsFocus } },
          { id_not_in: [me.id, ...excludeIDs] },
        ]
      }
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
    const usersMatchingGoal = getUsersMatchingGoal(me, post, context, 3);  // each one returns a promise
    return usersMatchingGoal;
  })
  return Promise.all(usersMatchingGoalsPromises);
}

// find matches for a SINGLE goal
const getUsersMatchingGoal = async (me, post, context, first = 10) => {
  // must return a PROMISE for an array of type [Match]
  if (!post.goal) return [];

  if (post.goal === 'Find investors') return getMatchesFindInvestor(me, post, context, first);
  if (post.goal === 'Find mentors') return getMatchesFindMentors(me, post, context, first);
  if (post.goal === 'Find freelancers') return getMatchesFindFreelancers(me, post, context, first);
  if (post.goal === 'Find agencies') return getMatchesFindFreelancers(me, post, context, first);
  if (post.goal === 'Get coffee') {
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

  if (goal !== "Find investors" || !goal || !subField.topicID) return [];

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

  if (goal !== "Find mentors" || !goal || !subField.topicID) return [];

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

  if (goal !== "Find freelancers" || !goal || !subField.topicID) return [];

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

  if (goal !== "Get coffee" || !goal || !subField.topicID) return [];

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
                { goal: "Get coffee" },
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

  if (goal !== "Get coffee" || !goal || !subField.topicID) return [];

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


module.exports = {
  getUsersMatchingTopicsFocus,
  getUsersMatchingManyGoals,
  getUsersMatchingGoal,
  getActiveGoalsOfUser,
}