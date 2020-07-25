const gql = require('graphql-tag')

const IDfragment = gql`
  fragment IDfragment on User {
    id
  }
`;

const User = {

  async topicsFocus(parent, args, context) {
    return context.prisma.user({ id: parent.id }).topicsFocus()
  },

  async topicsInterest(parent, args, context) {
    return context.prisma.user({ id: parent.id }).topicsInterest()
  },

  async topicsFreelance(parent, args, context) {
    return context.prisma.user({ id: parent.id }).topicsFreelance()
  },

  async topicsInvest(parent, args, context) {
    return context.prisma.user({ id: parent.id }).topicsInvest()
  },

  async topicsMentor(parent, args, context) {
    return context.prisma.user({ id: parent.id }).topicsMentor()
  },

  async skills(parent, args, context) {
    return context.prisma.user({ id: parent.id }).skills()
  },

  async experience(parent, args, context) {
    return context.prisma.user({ id: parent.id }).experience()
  },

  async education(parent, args, context) {
    return context.prisma.user({ id: parent.id }).education()
  },

  async posts(parent, args, context) {
    return context.prisma.user({ id: parent.id }).posts()
  },

  async intro(parent, args, context) {
    return context.prisma.user({ id: parent.id }).intro()
  },

  async myStory(parent, args, context) {
    return context.prisma.user({ id: parent.id }).myStory()
  },

  async latestProject(parent, args, context) {
    const stories = await context.prisma.user({ id: parent.id }).stories({ where: { type: "PROJECT" }, first: 1, orderBy: "lastUpdated_DESC" });
    
    if (stories.length === 0) {
      return null
    }

    return stories[0]
  },

  // async stories(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).stories();
  // },

  async stories(parent, args, context) {
    return context.prisma.user({ id: parent.id }).stories({ where: { type: "PROJECT" }, orderBy: "lastUpdated_DESC"});
  },

  async groups(parent, args, context) {
    return context.prisma.user({ id: parent.id }).groups({ orderBy: "updatedAt_DESC" })
  },

  async unReadMessages(parent, args, context) {
    return context.prisma.user({ id: parent.id }).unReadMessages()
  },

  async following(parent, args, context) {
    return context.prisma.user({ id: parent.id }).following()
  },

  async followers(parent, args, context) {
    return context.prisma.user({ id: parent.id }).followers()
  },

  async followingCount(parent, args, context) {
    const following = await context.prisma.user({ id: parent.id }).following().$fragment(IDfragment)

    return following.length
  },

  async followersCount(parent, args, context) {
    const followers = await context.prisma.user({ id: parent.id }).followers().$fragment(IDfragment)

    return followers.length
  },

  async unReadMessagesCount(parent, args, context) {
    // console.log(parent)
    let count = 0;
    const messages = await context.prisma.user({ id: parent.id }).unReadMessages()
    // console.log(messages)
    if (messages.length > 0) {
      count = messages.length;
    }
    return count;
  },
}

module.exports = {
  User,
}
