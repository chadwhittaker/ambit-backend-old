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

  async groups(parent, args, context) {
    return context.prisma.user({ id: parent.id }).groups({ orderBy: "updatedAt_DESC" })
  },

  async unReadMessages(parent, args, context) {
    return context.prisma.user({ id: parent.id }).unReadMessages()
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
