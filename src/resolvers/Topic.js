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
}

module.exports = {
  Topic,
}
