const { hash, compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { getUserId } = require('../utils')
const { MessageFragment, BasicPost, UpdateFragment, CommentFragment, FollowersFragment, UserIDFragment, LoggedInUser } = require('../_fragments.js')
const { createNotification, addMessageToUnread, updateFollowersAndVerify } = require('./functions')
const gql = require('graphql-tag')


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const IDfragment = gql`
  fragment IDfragment on User {
    id
  }
`;

const Mutation = {

  // ================
  // USER
  // ================

  async signup(parent, { name, username, password }, context) {
    // 1. lowercase the username
    const usernameLower = username.toLowerCase();
    // 2. hash their password
    const hashedPassword = await hash(password, 10);
    // 3. create the user in database
    const user = await context.prisma.createUser(
      {
        name,
        username: usernameLower,
        password: hashedPassword,
      }
    )

    // const introIndex = user.stories.findIndex(story => story.type === "INTRO");
    // const storyIndex = user.stories.findIndex(story => story.type === "MYSTORY");

    // create and connect mystory and intro to user
    const userFinal = await context.prisma.updateUser({
      where: { id: user.id },
      data: {
        intro: {
          create: {
            title: "My Intro",
            type: "INTRO",
            owner: {
              connect: { id: user.id }
            },
            lastUpdated: new Date(),
          }
        },
        myStory: {
          create: {
            title: "My Story",
            type: "MYSTORY",
            owner: {
              connect: { id: user.id }
            },
            lastUpdated: new Date(),
          }
        },
      }
    }).$fragment(LoggedInUser)

    // this did not work because stories are a required field on user
    // const storiesToDisconnect = userWithStories.stories.map(story => {
    //   return { id: story.id }
    // })

    // // disconnect MYSTORY & INTRO from stories
    // const userFinal = await context.prisma.updateUser({
    //   where: { id: user.id },
    //   data: {
    //     stories: {
    //       disconnect: storiesToDisconnect
    //     }
    //   }
    // })

    // 4. create JWT token
    const token = sign({ userId: user.id }, process.env.APP_SECRET)

    // 5. return Auth Payload
    return {
      token,
      user: userFinal,
    }
  },

  async followUser(parent, { userID }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    try {
      // add user to the person being followed
      const userBeingFollwed = await context.prisma.updateUser(
        {
          where: { id: userID },
          data: {
            followers: {
              connect: [{ id: context.request.userId }],
            },
          }
        }
      )
    } catch (e) {
      console.log('couldnt follow')
    }


    try {
      // add user to the person following
      const user = await context.prisma.updateUser(
        {
          where: { id: context.request.userId },
          data: {
            following: {
              connect: [{ id: userID }],
            },
          }
        }
      )

      createNotification({
        context,
        style: 'NEW_FOLLOWER',
        targetID: userID,
        userID: context.request.userId,
      })
    } catch (e) {
      console.log('couldnt follow 2')
    }

    const users = await context.prisma.user({ id: context.request.userId }).following().$fragment(IDfragment);

    // return an array of ID's
    return users.map(user => user.id);
  },

  async unfollowUser(parent, { userID }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // remove user to the person being unfollowed
    try {
      const userBeingUnfollwed = await context.prisma.updateUser(
        {
          where: { id: userID },
          data: {
            followers: {
              disconnect: [{ id: context.request.userId }],
            },
          }
        }
      )
    } catch (e) {
      console.log('couldnt unfollow')
    }

    try {
      // remove user from the person following
      const user = await context.prisma.updateUser(
        {
          where: { id: context.request.userId },
          data: {
            following: {
              disconnect: [{ id: userID }],
            },
          }
        }
      )

      // return user
    } catch (e) {
      console.log('couldnt unfollow 2')
    }

    const users = await context.prisma.user({ id: context.request.userId }).following().$fragment(IDfragment);

    // return an array of ID's
    return users.map(user => user.id);
  },

  // ================
  // PROFILE
  // ================

  async editBio(parent, args, context) {
    const id = args.id
    delete args.id

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id },
        data: {
          ...args.data
        }
      },
    )

    return user;
  },

  async editTopicsFocus(parent, { topics }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    // if (context.request.userId !== id) {
    //   throw new Error(`You cannot edit a profile that is not your own`)
    // }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          topicsFocus: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsInterest(parent, { topics }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          topicsInterest: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsFreelance(parent, { topics }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          topicsFreelance: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsInvest(parent, { topics }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          topicsInvest: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsMentor(parent, { topics }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 3. make mutation
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          topicsMentor: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editSkills(parent, args, context) {
    const id = args.id
    delete args.id

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. gather the list of old skills
    const oldSkills = await context.prisma.skills({ where: { owner: { id } } });
    const oldSkillsIdOnly = oldSkills.reduce((newArray, currentValue) => {
      return [...newArray, { id: currentValue.id }]
    }, [])

    // 4. add new skills & delete old skills
    const user = await context.prisma.updateUser(
      {
        where: { id },
        data: {
          skills: {
            create: [...args.skills],
            delete: [...oldSkillsIdOnly],
          }
        },
      },
    )

    return user;
  },

  // ================
  // EXPERIENCE
  // ================

  async createExperience(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. create experience & connect to owner
    const experience = await context.prisma.createExperience(
      {
        ...args.experience,
        owner: {
          connect: { id }
        },
      },
    )

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  async editExperience(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. edit experience
    const experience = await context.prisma.updateExperience(
      {
        where: { id: args.id },
        data: {
          ...args.experience,
        },
      },
    )

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  async deleteExperience(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. create experience & connect to owner
    const experience = await context.prisma.deleteExperience({ id: args.id })

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  // ================
  // EDUCATION
  // ================

  async createEducation(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. create education & connect to owner
    const education = await context.prisma.createEducation(
      {
        ...args.education,
        owner: {
          connect: { id }
        },
      },
    )

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  async editEducation(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. edit education
    const education = await context.prisma.updateEducation(
      {
        where: { id: args.id },
        data: {
          ...args.education,
        },
      },
    )

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  async deleteEducation(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. create education & connect to owner
    const education = await context.prisma.deleteEducation({ id: args.id })

    // 4. return the updated user
    const user = await context.prisma.user({ id: args.owner });

    return user
  },

  // ================
  // POSTS
  // ================

  async createPost(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    const post = await context.prisma.createPost(
      {
        ...args.post,
        lastUpdated: new Date(),
      }
    )

    // create an array of the mentions
    const mentionsWithSymbol = post.content.match(/\B@[a-z0-9_]+/gi);

    // if the post has mentions in it...notify the people being mentioned
    if (!!mentionsWithSymbol && mentionsWithSymbol.length > 0) {
      const mentionsNoSymbol = mentionsWithSymbol.map((mention) => mention.substr(1))
      const mentions = [...new Set(mentionsNoSymbol)]; // remove duplicates

      mentions.forEach((username) => {
        if (username && context.request.userId && post) {
          console.log('sending notification to', username)
          createNotification({
            context,
            style: 'MENTIONED_IN_POST',
            targetID: username,
            userID: context.request.userId,
            postID: post.id
          })
        }
      })
    }


    return post
  },

  async updatePost(parent, { owner, postID, post }, context) {
    const id = owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    const updatedPost = await context.prisma.updatePost(
      {
        where: {
          id: postID,
        },
        data: {
          ...post,
        }
      }
    )

    return updatedPost
  },

  async deletePost(parent, { id, ownerID }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== ownerID) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. create experience & connect to owner
    const postDeleted = await context.prisma.deletePost({ id })

    return postDeleted
  },

  async likePost(parent, { postId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const post = await context.prisma.updatePost(
      {
        where: { id: postId },
        data: {
          likes: {
            connect: [{ id: context.request.userId }],
          },
        }
      }
    ).$fragment(BasicPost)

    if (!!post.goal) {
      createNotification({
        context,
        style: 'LIKE_GOAL',
        targetID: post.owner.id,
        userID: context.request.userId,
        postID: post.id
      })
    } else {
      createNotification({
        context,
        style: 'LIKE_POST',
        targetID: post.owner.id,
        userID: context.request.userId,
        postID: post.id
      })
    }

    return post
  },

  async unlikePost(parent, { postId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const post = await context.prisma.updatePost(
      {
        where: { id: postId },
        data: {
          likes: {
            disconnect: [{ id: context.request.userId }],
          },
        }
      }
    )

    return post
  },

  async editGoalStatus(parent, { ownerID, id, goalStatus }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== ownerID) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. create experience & connect to owner
    const post = await context.prisma.updatePost({
      data: {
        goalStatus,
        lastUpdated: new Date(),
      },
      where: {
        id,
      }
    })

    return post
  },

  async viewedPost(parent, { postId }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    const post = await context.prisma.post({ id: postId })

    const postReturned = await context.prisma.updatePost({
      where: { id: postId },
      data: {
        views: {
          connect: [{ id: context.request.userId }]
        },
      },
    })

    return postReturned
  },

  // ================
  // UPDATES
  // ================

  async createUpdate(parent, { postId, update }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. query for the post
    const owner = await context.prisma.post({ id: postId }).owner()
    if (!owner) throw new Error(`No post found`)

    // 3. check if user on the request owns the profile
    if (context.request.userId !== owner.id) {
      throw new Error(`You cannot update a post that is not your own`)
    }

    // 4. creat the new update
    const post = await context.prisma.updatePost(
      {
        where: { id: postId },
        data: {
          lastUpdated: new Date(),
          updates: {
            create: {
              ...update
            }
          },
          goalStatus: 'Active',
        }

      }
    )

    // create an array of the mentions
    const mentionsWithSymbol = update.content.match(/\B@[a-z0-9_]+/gi);

    // if the post has mentions in it...notify the people being mentioned
    if (!!mentionsWithSymbol && mentionsWithSymbol.length > 0) {
      const mentionsNoSymbol = mentionsWithSymbol.map((mention) => mention.substr(1))
      const mentions = [...new Set(mentionsNoSymbol)]; // remove duplicates

      mentions.forEach((username) => {
        if (username && context.request.userId && post) {
          console.log('sending mention notification to', username)
          createNotification({
            context,
            style: 'MENTIONED_IN_UPDATE',
            targetID: username,
            userID: context.request.userId,
            postID: post.id,
          })
        }
      })
    }

    return post
  },

  async likeUpdate(parent, { updateId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const update = await context.prisma.updateUpdate(
      {
        where: { id: updateId },
        data: {
          likes: {
            connect: [{ id: context.request.userId }],
          },
        }
      }
    ).$fragment(UpdateFragment)

    createNotification({
      context,
      style: 'LIKE_UPDATE',
      targetID: update.parentPost.owner.id,
      userID: context.request.userId,
      updateID: update.id,
    })

    return update
  },

  async unlikeUpdate(parent, { updateId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const update = await context.prisma.updateUpdate(
      {
        where: { id: updateId },
        data: {
          likes: {
            disconnect: [{ id: context.request.userId }],
          },
        }
      }
    )

    return update
  },

  async deleteUpdate(parent, { id, ownerID }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== ownerID) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. delete update
    const updateDeleted = await context.prisma.deleteUpdate({ id })

    return updateDeleted
  },

  // ================
  // COMMENTS
  // ================

  async createComment(parent, { comment }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. create the comment
    const commentCreated = await context.prisma.createComment({ ...comment }).$fragment(CommentFragment)

    if (!!commentCreated.id) {
      if (!!commentCreated.parentUpdate) {
        // if the comment is on an update
        createNotification({
          context,
          style: 'COMMENT_UPDATE',
          targetID: commentCreated.parentPost.owner.id,
          userID: context.request.userId,
          commentID: commentCreated.id,
        })
      } else if (!!commentCreated.parentPost.goal) {
        // if the comment is on a goal
        createNotification({
          context,
          style: 'COMMENT_GOAL',
          targetID: commentCreated.parentPost.owner.id,
          userID: context.request.userId,
          commentID: commentCreated.id,
        })
      } else {
        // if the comment is on a post
        createNotification({
          context,
          style: 'COMMENT_POST',
          targetID: commentCreated.parentPost.owner.id,
          userID: context.request.userId,
          commentID: commentCreated.id,
        })
      }

      // if this is a subcomment, also notify the parent comment owner
      if (!!commentCreated.parentComment) {
        createNotification({
          context,
          style: 'COMMENT_COMMENT',
          targetID: commentCreated.parentComment.owner.id,
          userID: context.request.userId,
          commentID: commentCreated.id,
        })
      }

      // create an array of the mentions
      const mentionsWithSymbol = commentCreated.content.match(/\B@[a-z0-9_]+/gi);

      // if the post has mentions in it...notify the people being mentioned
      if (!!mentionsWithSymbol && mentionsWithSymbol.length > 0) {
        const mentionsNoSymbol = mentionsWithSymbol.map((mention) => mention.substr(1))
        const mentions = [...new Set(mentionsNoSymbol)]; // remove duplicates

        mentions.forEach((username) => {
          if (username && context.request.userId && commentCreated.id) {
            console.log('sending mention notification to', username)
            createNotification({
              context,
              style: 'MENTIONED_IN_COMMENT',
              targetID: username,
              userID: context.request.userId,
              commentID: commentCreated.id,
            })
          }
        })
      }

    }

    return commentCreated;
  },

  async likeComment(parent, { commentId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. update the comment
    const comment = await context.prisma.updateComment(
      {
        where: { id: commentId },
        data: {
          likes: {
            connect: [{ id: context.request.userId }],
          },
        }
      }
    ).$fragment(CommentFragment)

    createNotification({
      context,
      style: 'LIKE_COMMENT',
      targetID: comment.owner.id,
      userID: context.request.userId,
      commentID: comment.id,
    })

    return comment
  },

  async unlikeComment(parent, { commentId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. update the comment
    const comment = await context.prisma.updateComment(
      {
        where: { id: commentId },
        data: {
          likes: {
            disconnect: [{ id: context.request.userId }],
          },
        }
      }
    )

    return comment
  },

  async deleteComment(parent, { id, ownerID }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== ownerID) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. delete comment
    const commentDeleted = await context.prisma.deleteComment({ id })

    return commentDeleted
  },

  // ================
  // GROUP
  // ================
  async createMessage(parent, args, context) {
    // 1. check if user is logged in
    // if (!context.request.userId) {
    //   throw new Error(`You must be logged in to do that`)
    // }

    const message = await context.prisma.createMessage({ ...args.message }).$fragment(MessageFragment);

    // connect message to associated users unseen messages
    if (message.id) {
      addMessageToUnread(message, context)
    }

    return message
  },


  async clearUnReadMessages(parent, { groupID }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }
    // if no groupID should we just disconnect all unReadMessages??

    // 2. get a list of the users unread messages in the groupID 
    const unReadMessages = await context.prisma.user({ id: context.request.userId }).unReadMessages().$fragment(MessageFragment);
    // console.log('unReadMessages', unReadMessages);
    const unReadMessagesInGroup = unReadMessages.filter(message => message.to.id === groupID);
    const unReadMessagesInGroupIDs = unReadMessagesInGroup.map(message => {
      return { id: message.id }
    })

    // 3. update user to clear the unread messages in the groupID listed
    const user = await context.prisma.updateUser({
      where: { id: context.request.userId },
      data: {
        unReadMessages: {
          disconnect: unReadMessagesInGroupIDs,
        }
      }
    })

    // 4. return the user
    return user;
  },

  async clearMyNotifications(parent, args, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    // 2. update all of MY UNSEEN notifications to be SEEN
    await context.prisma.updateManyNotifications({
      where: {
        AND: [
          { target: { id: context.request.userId } },
          { seen: false },
        ]
      },
      data: { seen: true },
    })

    // 3. get an updated list of notifications to send to the frontend
    const updatedNotifications = await context.prisma.notifications(
      {
        where: { target: { id: context.request.userId } },
        orderBy: 'createdAt_DESC',
        first: 50,
      }
    );

    return updatedNotifications;
  },

  /////////////////////////
  // STORIES
  /////////////////////////
  async createStory(parent, { story }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    const storyReturned = await context.prisma.createStory({ ...story })

    return storyReturned
  },

  async updateStory(parent, { id, story }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    const storyReturned = await context.prisma.updateStory({
      where: { id },
      data: { ...story },
    })

    return storyReturned
  },

  async deleteStory(parent, { id }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    const storyReturned = await context.prisma.deleteStory({ id });

    return storyReturned
  },

  async viewedStoryItem(parent, { storyItemID }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      return null
    }

    const storyItem = await context.prisma.storyItem({ id: storyItemID })

    const storyItemReturned = await context.prisma.updateStoryItem({
      where: { id: storyItemID },
      data: {
        views: {
          connect: [{ id: context.request.userId }]
        },
        plays: storyItem.plays + 1
      },
    })

    return storyItemReturned
  },

  async likeStoryItem(parent, { storyItemId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const storyItem = await context.prisma.updateStoryItem(
      {
        where: { id: storyItemId },
        data: {
          likes: {
            connect: [{ id: context.request.userId }],
          },
        }
      }
    )

    // add later
    // if (!!post.goal) {
    //   createNotification({
    //     context,
    //     style: 'LIKE_GOAL',
    //     targetID: post.owner.id,
    //     userID: context.request.userId,
    //     postID: post.id
    //   })
    // } else {
    //   createNotification({
    //     context,
    //     style: 'LIKE_POST',
    //     targetID: post.owner.id,
    //     userID: context.request.userId,
    //     postID: post.id
    //   })
    // }

    return storyItem
  },

  async unlikeStoryItem(parent, { storyItemId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    const storyItem = await context.prisma.updateStoryItem(
      {
        where: { id: storyItemId },
        data: {
          likes: {
            disconnect: [{ id: context.request.userId }],
          },
        }
      }
    )

    return storyItem
  },
}

module.exports = {
  Mutation,
}