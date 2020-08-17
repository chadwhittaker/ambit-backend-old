// import { PostOrderByInput } from "../generated/prisma-client/prisma-schema.js";
// const { PostOrderByInput } = require('../generated/prisma-client/prisma-schema.js')
const { compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { rad2Deg, deg2Rad } = require('../utils')
const { topicsList } = require('../topicsList')
const { investList } = require('../investList')
const { freelanceList } = require('../freelanceList')
const { MyInfoForConnections, DetailPost, UserForYouPostsFragment, MyInfoForStories } = require('../_fragments.js')
const { getUsersMatchingManyGoals, getUsersMatchingGoal, getUsersMatchingTopicsFocus, getActiveGoalsOfUser, getAllMessageConnections, getNetworkIDsFromUser, getTopicIDsFromUser } = require('./functions')
const gql = require('graphql-tag')

const IDfragment = gql`
  fragment IDfragment on User {
    id
  }
`;

const Query = {

  async login(parent, { username, password }, context) {
    // 1. check if there is a user with that username
    const usernameLower = username.toLowerCase();
    const user = await context.prisma.user({ username: usernameLower });

    if (!user) throw new Error(`No user found for username: ${usernameLower}`)

    // 2. check if the password is correct
    const passwordValid = await compare(password, user.password)
    if (!passwordValid) throw new Error(`Invalid password`)

    // 3. generate JWT token
    const token = sign({ userId: user.id }, process.env.APP_SECRET)

    return {
      token,
      user,
    }
  },

  // USERS
  async myTopics(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return null;
    }

    const user = await context.prisma.user({ id: context.request.userId });

    return user;
  },

  async iFollow(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return [];
    }

    const users = await context.prisma.user({ id: context.request.userId }).following().$fragment(IDfragment);

    // return an array of ID's
    return users.map(user => user.id);
  },

  async userLoggedIn(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return null;
    }
    // 2. if there is a user, query user in database and return data to client
    const user = await context.prisma.user({ id: context.request.userId });

    // make topics (base this off an ENV variable)
    if (process.env.LOAD_TOPICS === "yes") {
      console.log("LOADING INITIAL TOPICS...")
      let i;
      for (i = 0; i < topicsList.length; i++) {
        try {
          const topic = await context.prisma.createTopic({
            topicID: topicsList[i].topicID,
            name: topicsList[i].name,
            // icon: topicsList[i].icon,
            // color: topicsList[i].color,
            // image: topicsList[i].image,
            parentList: { connect: { listName: "topicsList" } }, // must create this list first in DB
            children: {
              create: topicsList[i].children.map(child => {
                return {
                  topicID: child.topicID,
                  name: child.name,
                  // icon: child.icon,
                  // color: child.color,
                  // image: child.image,
                }
              })
            }
          })

          // console.log(topic)
        } catch (e) {
          console.log(e)
        }
      }

      let j;
      for (j = 0; j < investList.length; j++) {
        try {
          const topic = await context.prisma.createTopic({
            topicID: investList[j].topicID,
            name: investList[j].name,
            // icon: investList[j].icon,
            // color: investList[j].color,
            parentList: { connect: { listName: "investList" } }, // must create this list first in DB
          })

          // console.log(topic)
        } catch (e) {
          console.log(e)
        }
      }

      let k;
      for (k = 0; k < freelanceList.length; k++) {
        try {
          const topic = await context.prisma.createTopic({
            topicID: freelanceList[k].topicID,
            name: freelanceList[k].name,
            // icon: freelanceList[k].icon,
            // color: freelanceList[k].color,
            parentList: { connect: { listName: "freelanceList" } }, // must create this list first in DB
            children: {
              create: freelanceList[k].children.map(child => {
                return {
                  topicID: child.topicID,
                  name: child.name,
                  // icon: freelanceList[k].icon,
                }
              })
            }
          })

          // console.log(topic)
        } catch (e) {
          console.log(e)
        }
      }

      //   // make user stories & intros
      //   //   const users = await context.prisma.users();

      //   //   let i;
      //   //   for (i = 0; i < users.length; i++) {
      //   //     try {
      //   //       const user = await context.prisma.updateUser({
      //   //         where: { username: users[i].username },
      //   //         data: {
      //   //           myStory: {
      //   //             create: {
      //   //               title: "My Story",
      //   //               type: "MYSTORY",
      //   //               owner: { connect: { username: users[i].username }}
      //   //             }
      //   //           },
      //   //           intro: {
      //   //             create: {
      //   //               title: "My Intro",
      //   //               type: "INTRO",
      //   //               owner: { connect: { username: users[i].username }}
      //   //             }
      //   //           }
      //   //         }
      //   //       })

      //   //       console.log(user)
      //   //   } catch (e) {
      //   //     console.log(e)
      //   //   }
      //   // }
      console.log("...FINISHED LOADING INITIAL TOPICS")
    }

    return user;
  },

  async user(parent, { id, username }, context) {
    const user = await context.prisma.user({ id, username });

    if (!user) {
      throw new Error(`No user found for that username`)
    }

    return user;
  },

  async userMessages(parent, args, context) {
    const user = await context.prisma.user({ id: context.request.userId });

    return user;
  },

  async userFollowers(parent, { id }, context) {
    const user = await context.prisma.user({ id }).followers()

    return user;
  },

  async userFollowing(parent, { id }, context) {
    const user = await context.prisma.user({ id }).following();

    return user;
  },

  async users(parent, args, context) {
    const users = await context.prisma.users();

    return users;
  },

  async unReadMessagesCount(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return null;
    }
    // 2. if there is a user, query user in database and return data to client
    const user = await context.prisma.user({ id: context.request.userId });

    return user;
  },

  async postsNetwork(parent, { after, first = 6, network = [] }, context) {

    const posts = await context.prisma.postsConnection(
      {
        first,
        after,
        where: {
          owner: {
            id_in: [...network, context.request.userId],
          }
        },
        orderBy: 'lastUpdated_DESC'
      }
    );

    // console.log(posts)

    return posts
  },

  async postsMyGoals(parent, { after, first = 6 }, context) {

    if (!context.request.userId) {
      // don't throw an error, just return nothing. It is ok to not be logged in.
      return [];
    }

    const posts = await context.prisma.postsConnection(
      {
        first,
        after,
        where: {
          AND: [
            {
              owner: {
                id: context.request.userId,
              }
            },
            {
              isGoal: true,
            }
          ]

        },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async hatMatches(parent, { type, after, first = 10 }, context) {
    // get current user data
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(UserForYouPostsFragment);

    const { topicsInvest, topicsFreelance, topicsMentor } = me;

    let goal = 'hey';
    let topicsToSearch = [];
    if (type === 'invest' && !!topicsInvest && topicsInvest.length > 0) {
      goal = 'Find Investors'
      topicsToSearch = [...topicsInvest]
    } else if (type === 'freelance' && !!topicsFreelance && topicsFreelance.length > 0) {
      goal = 'Find Freelancers'
      topicsToSearch = [...topicsFreelance]
    } else if (type === 'mentor' && !!topicsMentor && topicsMentor.length > 0) {
      goal = 'Find Mentors'
      topicsToSearch = [...topicsMentor]
    }

    const topicsToSearchIDs = topicsToSearch.map(top => top.topicID);

    const posts = await context.prisma.postsConnection(
      {
        first,
        after,
        where: {
          AND: [
            // not from me
            {
              owner: {
                id_not_in: [context.request.userId],
              }
            },
            {
              goal,
            },
            {
              subField: {
                topicID_in: topicsToSearchIDs,
              }
            }
          ]

        },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async postsForYou(parent, { after, first = 20 }, context) {

    // get current user data
    const me = await context.prisma.user({ id: context.request.userId }).$fragment(UserForYouPostsFragment);

    const { topicsFocus, topicsInterest, topicsInvest, topicsFreelance, topicsMentor } = me;

    const myTopics = [...topicsFocus, ...topicsInterest];
    const myTopicIDs = myTopics.map(top => top.topicID);

    const getInvestPosts = () => {
      // if not an investor, return dumb query
      if (!topicsInvest || topicsInvest.length === 0) {
        return { id: 'haha' }
      }

      const myInvestTopicIDs = topicsInvest.map(top => top.topicID);

      return {
        AND: [
          {
            goal: 'Find Investors',
          },
          {
            subField: {
              topicID_in: myInvestTopicIDs,
            }
          }
        ]
      }
    }

    const getFreelancePosts = () => {
      // if not a freelancer, return dumb query
      if (!topicsFreelance || topicsFreelance.length === 0) {
        return { id: 'haha' }
      }

      const myFreelanceTopicIDs = topicsFreelance.map(top => top.topicID);

      return {
        AND: [
          {
            goal: 'Find Freelancers',
          },
          {
            subField: {
              topicID_in: myFreelanceTopicIDs,
            }
          }
        ]
      }
    }

    const getMentorPosts = () => {
      // if not a freelancer, return dumb query
      if (!topicsMentor || topicsMentor.length === 0) {
        return { id: 'haha' }
      }

      const myMentorTopicIDs = topicsMentor.map(top => top.topicID);

      return {
        AND: [
          {
            goal: 'Find Mentors',
          },
          {
            subField: {
              topicID_in: myMentorTopicIDs,
            }
          }
        ]
      }
    }

    // get all the posts from my topics of focus & interest
    const getTopicsPosts = () => {
      // return an array of PostWhereInputs, one for each of my topics
      return myTopicIDs.map(topicID => {
        return {
          topics_some: { topicID_starts_with: topicID }
        }
      })
    }

    const posts = await context.prisma.postsConnection(
      {
        first,
        after,
        where: {
          AND: [
            // not from followers (that appears in NetworkPosts)
            {
              owner: {
                id_not_in: [context.request.userId],
              }
            },
            {
              OR: [
                ...getTopicsPosts(),
                getInvestPosts(),
                getFreelancePosts(),
                getMentorPosts(),
              ]
            }
          ]

        },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  // async postsLocal(parent, { lat, lon, radius, after }, context) {

  //   // console.log(lat, lon,)

  //   const EARTH_RADIUS_MI = 3959;

  //   const distance = radius || 10;

  //   const maxLat = lat + rad2Deg(distance / EARTH_RADIUS_MI);
  //   const minLat = lat - rad2Deg(distance / EARTH_RADIUS_MI);

  //   const maxLon = lon + rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));
  //   const minLon = lon - rad2Deg(distance / EARTH_RADIUS_MI / Math.cos(deg2Rad(lat)));

  //   // console.log(minLat, maxLat)
  //   // console.log(minLon, maxLon)


  //   const posts = await context.prisma.postsConnection(
  //     {
  //       where: {
  //         AND: [
  //           { locationLat_gte: minLat },
  //           { locationLat_lte: maxLat },
  //           { locationLon_gte: minLon },
  //           { locationLon_lte: maxLon },
  //         ],
  //       },
  //       first: 30,
  //       after,
  //       orderBy: 'lastUpdated_DESC'
  //     }
  //   );

  //   return posts
  // },

  async postsTopic(parent, { after, topicID }, context) {
    let where = { topics_some: { topicID_contains: topicID } }

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

  async postsSearch(parent, { text, goal, topicIDs, lat, lon, after }, context) {

    const hasTopics = topicIDs.length > 0;
    const haveInputs = !!text || !!goal || hasTopics || (!!lat && !!lon);
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
      if (!hasTopics) return allSearch;

      // if there's a goal involved then the topic refers to subField
      if (goal) {
        return { subField: { topicID_in: topicIDs } }
      }

      // otherwise query the topics array
      return { topics_some: { topicID_in: topicIDs } }
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
        first: 20,
        after,
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async postsUser(parent, { id, username }, context) {

    let posts = []

    posts = await context.prisma.posts(
      {
        where: { owner: { id, username } },
        orderBy: 'lastUpdated_DESC'
      }
    );

    return posts
  },

  async singlePost(parent, { id }, context) {
    const post = await context.prisma.post({ id })

    return post
  },

  async singlePostMatches(parent, { id }, context) {
    // all these await functions need parallized
    // const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);
    const post = await context.prisma.post({ id }).$fragment(DetailPost);

    // get matches based on Goal and User 
    const isMyPost = context.request.userId === post.owner.id;

    // let matches = [];
    if (isMyPost && !!post.goal) {
      const users = await getUsersMatchingGoal(post.owner, post, context) // returns [Match]

      return users
    }

    return []
  },



  // NOT USING THIS
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

  async myMatches(parent, args, context) {
    // get the topics of focus from the user
    // const me = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForConnections);

    // match up with people of the same topic (for now just send all people)
    const users = await context.prisma.users({
      // first: 3,
      where: { id_not: context.request.userId },
      // where: {
      //   AND: [
      //     { topicsFocus_some: { OR: me.topicsFocus } },
      //     { id_not_in: [me.id, ...excludeIDs] },
      //   ]
      // }
    });

    return users;
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

  // GROUPS

  async allMyGroups(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      throw new Error(`You must be logged in to see messages`)
    }
    // 2. if there is a user, get all my groups
    const groups = await context.prisma.groups(
      {
        where: { users_some: { id: context.request.userId } },
        orderBy: "updatedAt_DESC",
      }
    );

    return groups;
  },

  async messages(parent, { groupID, after, first }, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      throw new Error(`You must be logged in to see messages`)
    }

    // if the group does not exist yet
    if (!groupID || groupID === null) return null;

    const messages = await context.prisma.messagesConnection(
      {
        where: { to: { id: groupID } },
        first: first || 20,
        after,
        orderBy: 'createdAt_DESC'
      }
    );
    return messages;
  },

  async allMessagesConnections(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      return null
    }

    // get an array of all my group chats
    const groups = await context.prisma.user({ id: context.request.userId }).groups()

    try {
      const messageConnectionsArray = await getAllMessageConnections(groups, context, 30); // returns [MessageConnection]
      return messageConnectionsArray;
    } catch (e) {
      console.error(e)
      return null;
    }
  },

  async group(parent, args, context) {
    // 1. check if there is a user on the request
    if (!context.request.userId) {
      throw new Error(`You must be logged in to see messages`)
    }

    // if the group does not exist yet
    if (!args.id || args.id === null) return null;

    // 2. if there is a user, get all my groups
    const group = await context.prisma.group({ id: args.id });

    return group;
  },

  async myNotifications(parent, args, context) {
    if (!context.request.userId) {
      return [];
    }

    const notifications = await context.prisma.notifications(
      {
        where: { target: { id: context.request.userId } },
        orderBy: 'createdAt_DESC',
        first: 10,
      }
    );

    return notifications
  },

  // STORIES
  async storiesHome(parent, args, context) {
    if (!context.request.userId) {
      return [];
    }

    // get latest user data
    const user = await context.prisma.user({ id: context.request.userId }).$fragment(MyInfoForStories);
    const network = getNetworkIDsFromUser(user);
    // const topicIDs = getTopicIDsFromUser(user);

    const stories = await context.prisma.stories(
      {
        where: {
          OR: [
            // STORIES OR PROJECTS FROM USERS I FOLLOW (OR ME)
            {
              AND: [
                {
                  type_in: ['MYSTORY', 'PROJECT'],
                },
                {
                  owner: { id_in: [...network, context.request.userId] }
                },
                {
                  items_some: { id_gt: 'a' }
                }
              ]
            },
          ]
        },
        first: 50,
      }
    );

    // console.log(stories)

    return stories
  },

  async storiesTopic(parent, { topicID }, context) {

    const stories = await context.prisma.stories(
      {
        where: {
          OR: [
            // {
            //   AND: [
            //     {
            //       type_in: ['SOLO'],
            //     },
            //     {
            //       topics_some: { topicID_starts_with: topicID }
            //     },
            //   ]
            // },
            // TOPIC-STORIES FROM MYTOPICS
            {
              AND: [
                {
                  type: 'PROJECT',
                },
                {
                  topics_some: { topicID_starts_with: topicID }
                },
                {
                  items_some: { id_gt: 'a' }
                }
              ]
            }
          ]
        },
        first: 50,
      }
    );

    return stories
  },
};

module.exports = {
  Query,
};
