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
}

module.exports = {
  User,
}
