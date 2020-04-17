const Story = {

  async owner(parent, args, context) {
    return context.prisma.story({ id: parent.id }).owner()
  },

  async topic(parent, args, context) {
    return context.prisma.story({ id: parent.id }).topic()
  },

  async projectTopics(parent, args, context) {
    return context.prisma.story({ id: parent.id }).projectTopics()
  },

  async items(parent, args, context) {
    return context.prisma.story({ id: parent.id }).items({ orderBy: "createdAt_ASC" })
  },

}

module.exports = {
  Story,
}
