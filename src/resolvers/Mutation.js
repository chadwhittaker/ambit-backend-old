const { hash, compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { getUserId } = require('../utils')

const Mutation = {
  async signup(parent, { name, email, password }, context) {
    // 1. lowercase the email
    const emailLower = email.toLowerCase();
    // 2. hash their password
    const hashedPassword = await hash(password, 10);
    // 3. create the user in database
    const user = await context.prisma.createUser(
      {
        name,
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

    if(!user) throw new Error(`No user found for email: ${emailLower}`)

    // 2. check if the password is correct
    const passwordValid = await compare(password, user.password)
    if(!passwordValid) throw new Error(`Invalid password`)

    // 3. generate JWT token
    const token = sign({ userId: user.id }, process.env.APP_SECRET)

    return {
      token,
      user,
    }
  },

  // editProfile(name: String, jobTitle: String, profession: String, industry: String, location: String, website: String, bio: String): User

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
          ...args
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
      return [ ...newArray, { id: currentValue.id }]
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

    return experience
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

    return experience
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

    return experience
  },


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

    return education
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

    return education
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

    return education
  },

}

module.exports = {
  Mutation,
}