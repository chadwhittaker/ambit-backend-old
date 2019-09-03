const Post = {

  async owner(parent, args, context) {
    return context.prisma.post({ id: parent.id }).owner()
  },

}

module.exports = {
  Post,
}
