const Topic = {

  async parentList(parent, args, context) {
    return context.prisma.topic({ id: parent.id }).parentList()
  },

  async parentTopic(parent, args, context) {
    return context.prisma.topic({ id: parent.id }).parentTopic()
  },

  async children(parent, args, context) {
    return context.prisma.topic({ id: parent.id }).children()
  },

  // async experience(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).experience()
  // },

  // async education(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).education()
  // },

  // async posts(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).posts()
  // },

  // async intro(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).intro()
  // },
}

module.exports = {
  Topic,
}
