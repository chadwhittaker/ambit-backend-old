const { hash, compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { getUserId } = require('../utils')
const { MessageFragment, BasicPost, UpdateFragment, CommentFragment, FollowersFragment, UserIDFragment } = require('../_fragments.js')
const { createNotification, addMessageToUnread, updateFollowersAndVerify } = require('./functions')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const Mutation = {

  // ================
  // USER
  // ================

  async signup(parent, { firstName, lastName, email, password }, context) {
    // 1. lowercase the email
    const emailLower = email.toLowerCase();
    // 2. hash their password
    const hashedPassword = await hash(password, 10);
    // 3. create the user in database
    const user = await context.prisma.createUser(
      {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: emailLower,
        password: hashedPassword,
      }
    )
    // 4. create JWT token
    const token = sign({ userId: user.id }, process.env.APP_SECRET)

    // 5. return Auth Payload
    return {
      token,
      user,
    }
  },

  async login(parent, { email, password }, context) {
    // 1. check if there is a user with that email
    const emailLower = email.toLowerCase();
    const user = await context.prisma.user({ email: emailLower });

    if (!user) throw new Error(`No user found for email: ${emailLower}`)

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

  async editFollowing(parent, { userID, newFollow }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. decide if this is a follow or un-follow
    const following = newFollow ? {
      connect: [{ id: userID }]
    } : {
        disconnect: [{ id: userID }]
      }

    const followers = newFollow ? {
      connect: [{ id: context.request.userId }]
    } : {
        disconnect: [{ id: context.request.userId }]
      }

    // 3. add user to following of the requester
    const user = await context.prisma.updateUser(
      {
        where: { id: context.request.userId },
        data: {
          following
        }
      },
    )

    updateFollowersAndVerify(followers, userID, context);

    return user;
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

  async editTopicsFocus(parent, { id, topics }, context) {

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
          topicsFocus: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsInterest(parent, { id, topics }, context) {

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
          topicsInterest: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsFreelance(parent, { id, topics }, context) {

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
          topicsFreelance: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsInvest(parent, { id, topics }, context) {

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
          topicsInvest: {
            set: topics,
          },
        }
      },
    )

    return user;
  },

  async editTopicsMentor(parent, { id, topics }, context) {

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

  async editIntro(parent, args, context) {
    const userId = args.userId
    // delete args.id

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the profile
    if (context.request.userId !== userId) {
      throw new Error(`You cannot edit a profile that is not your own`)
    }

    // 3. find the ID of the current Intro so we can delete it later
    const oldIntro = await context.prisma.user({ id: userId }).intro();
    // future upgrade:
    // could ask the user if they want to keep their changes...or they say no, revert back to old Intro
    // if they say yes then we can delete the old Intro
    const oldIntroID = oldIntro ? oldIntro.id : null

    // 4. update intro (if one already exists) or create intro (if one doesnt exist) - autoamtically linked to user
    const user = await context.prisma.updateUser(
      {
        where: { id: userId },
        data: {
          intro: {
            create: {
              title: args.title,
              items: {
                create: [...args.items]
              }
            },
          }
        },
      },
    )

    // if there was an existing intro...delete it
    if (oldIntroID) await context.prisma.deleteStory({ id: oldIntroID })


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

    return post
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

    // 2. query for the post
    const postToEdit = await context.prisma.post({ id: postId })
    if (!postToEdit) throw new Error(`No post found`)

    const liked = postToEdit.likes.includes(context.request.userId)

    // 3. update the post
    const post = await context.prisma.updatePost(
      {
        where: { id: postId },
        data: {
          likes: {
            set: liked ? [...postToEdit.likes.filter(like => like !== context.request.userId)] : [...postToEdit.likes, context.request.userId]
          },
        }
      }
    ).$fragment(BasicPost)

    // dont create notificaton if it is an UNLIKE
    if (!liked) {
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

    }

    return post
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

    // 4. create education & connect to owner
    const post = await context.prisma.updatePost(
      {
        where: { id: postId },
        data: {
          lastUpdated: new Date(),
          updates: {
            create: {
              ...update
            }
          }
        }

      }
    )

    return post
  },

  async likeUpdate(parent, { updateId }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. query for the post
    const updateToEdit = await context.prisma.update({ id: updateId })
    if (!updateToEdit) throw new Error(`No update found`)

    const liked = updateToEdit.likes.includes(context.request.userId)

    // 3. update the post
    const update = await context.prisma.updateUpdate(
      {
        where: { id: updateId },
        data: {
          likes: {
            set: liked ? [...updateToEdit.likes.filter(like => like !== context.request.userId)] : [...updateToEdit.likes, context.request.userId]
          },
        }
      }
    ).$fragment(UpdateFragment)

    // dont create notificaton if it is an UNLIKE
    if (!liked) {
      createNotification({
        context,
        style: 'LIKE_UPDATE',
        targetID: update.parentPost.owner.id,
        userID: context.request.userId,
        updateID: update.id,
      })
    }

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
    }

    return commentCreated;
  },

  async likeComment(parent, { id }, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. query for the post
    const commentToEdit = await context.prisma.comment({ id })
    if (!commentToEdit) throw new Error(`No post found`)

    const liked = commentToEdit.likes.includes(context.request.userId)

    // 3. update the comment
    const comment = await context.prisma.updateComment(
      {
        where: { id },
        data: {
          likes: {
            set: liked ? [...commentToEdit.likes.filter(like => like !== context.request.userId)] : [...commentToEdit.likes, context.request.userId]
          },
        }
      }
    ).$fragment(CommentFragment)

    // dont create notificaton if it is an UNLIKE
    if (!liked) {
      createNotification({
        context,
        style: 'LIKE_COMMENT',
        targetID: comment.owner.id,
        userID: context.request.userId,
        commentID: comment.id,
      })
    }

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

  async createGroup(parent, { users }, context) {
    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. create group
    const group = await context.prisma.createGroup(
      {
        data: {
          users: {
            connect: [users] // [ { id: ##### }, { id: ##### }]
          }
        }
      }
    )

    return group
  },

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
  }

}

module.exports = {
  Mutation,
}