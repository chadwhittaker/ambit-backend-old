const Post = {

  async owner(parent, args, context) {
    return context.prisma.post({ id: parent.id }).owner()
  },

  async updates(parent, args, context) {
    return context.prisma.post({ id: parent.id }).updates()
  },

}

module.exports = {
  Post,
}
