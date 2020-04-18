const StoryItem = {

  async owner(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).owner()
  },

  async stories(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).stories()
  },

}

module.exports = {
  StoryItem,
}
