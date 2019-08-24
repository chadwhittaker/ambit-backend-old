const User = {

  async skills(parent, args, context) {
    return context.prisma.user({ id: parent.id }).skills()
  },

  async experience(parent, args, context) {
    return context.prisma.user({ id: parent.id }).experience()
  },

  async education(parent, args, context) {
    return context.prisma.user({ id: parent.id }).education()
  },
}

module.exports = {
  User,
}
