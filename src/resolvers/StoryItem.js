const StoryItem = {

  async owner(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).owner()
  },

  async story(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).story()
  },

  async topics(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).topics()
  },

}

module.exports = {
  StoryItem,
}
