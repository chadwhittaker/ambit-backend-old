const Update = {

  async parentPost(parent, args, context) {
    return context.prisma.update({ id: parent.id }).parentPost()
  },

  async comments(parent, args, context) {
    return context.prisma.update({ id: parent.id }).comments()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.update({ id: parent.id }).likes()

    if (likes.length === 0) return null

    return likes.length
  },

  async likedByMe(parent, args, context) {
    const likes = await context.prisma.update({ id: parent.id }).likes()

    return likes.includes(context.request.userId)
  },

  async commentsCount(parent, args, context) {
    const comments = await context.prisma.update({ id: parent.id }).comments()

    if (comments.length === 0) return null

    return comments.length
  },

}

module.exports = {
  Update,
}

