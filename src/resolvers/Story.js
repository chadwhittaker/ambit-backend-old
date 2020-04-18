const Story = {

  async owner(parent, args, context) {
    return context.prisma.story({ id: parent.id }).owner()
  },

  async topics(parent, args, context) {
    return context.prisma.story({ id: parent.id }).topics()
  },

  async items(parent, args, context) {
    return context.prisma.story({ id: parent.id }).items({ orderBy: "createdAt_ASC" })
  },

}

module.exports = {
  Story,
}
