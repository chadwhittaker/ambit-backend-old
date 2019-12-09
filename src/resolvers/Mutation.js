const { hash, compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { getUserId } = require('../utils')

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

    // 3. create education & connect to owner
    const post = await context.prisma.createPost(
      {
        ...args.post,
        lastUpdated: new Date(),
      }
    )

    return post
  },

  async deletePost(parent, args, context) {
    const id = args.owner

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== id) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. create experience & connect to owner
    const post = await context.prisma.deletePost({ id: args.id })

    return post
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
    )

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
    )

    return update
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
    const commentCreated = await context.prisma.createComment({...comment})

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
    )

    return comment
  },

  async deleteComment(parent, args, context) {

    // 1. check if user is logged in
    if (!context.request.userId) {
      throw new Error(`You must be logged in to do that`)
    }

    // 2. check if user on the request owns the post
    if (context.request.userId !== args.owner) {
      throw new Error(`You cannot edit a post that is not your own`)
    }

    // 3. delete comment
    const comment = await context.prisma.deleteComment({ id: args.id })

    return comment
  },

}

module.exports = {
  Mutation,
}