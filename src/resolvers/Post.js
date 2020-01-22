const Post = {

  async owner(parent, args, context) {
    return context.prisma.post({ id: parent.id }).owner()
  },

  async topics(parent, args, context) {
    return context.prisma.post({ id: parent.id }).topics()
  },

  async subField(parent, args, context) {
    return context.prisma.post({ id: parent.id }).subField()
  },

  async updates(parent, args, context) {
    return context.prisma.post({ id: parent.id }).updates()
  },

  async comments(parent, args, context) {
    return context.prisma.post({ id: parent.id }).comments()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.post({ id: parent.id }).likes()

    if (likes.length === 0) return null

    return likes.length
  },

  async likedByMe(parent, args, context) {
    const likes = await context.prisma.post({ id: parent.id }).likes()

    return likes.includes(context.request.userId)
  },

  async commentsCount(parent, args, context) {
    const comments = await context.prisma.post({ id: parent.id }).comments()

    if (comments.length === 0) return null

    return comments.length
  },

}

module.exports = {
  Post,
}

