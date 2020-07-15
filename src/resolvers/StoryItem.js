const StoryItem = {

  async stories(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).stories()
  },

  async views(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).views()
  },

}

module.exports = {
  StoryItem,
}
