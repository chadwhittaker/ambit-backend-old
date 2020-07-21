const gql = require('graphql-tag')

const LikedFragment = gql`
  fragment LikedFragment on User {
    id
  }
`;

const Comment = {

  // THIS ISNT WORKING
  async owner(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).owner()
  },

  async parentPost(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).parentPost()
  },

  async parentUpdate(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).parentUpdate()
  },

  async parentComment(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).parentComment()
  },

  async likes(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).likes()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.comment({ id: parent.id }).likes().$fragment(LikedFragment)

    return likes.length
  },

  async likedByMe(parent, args, context) {
    const likes = await context.prisma.comment({ id: parent.id }).likes({ where: { id: context.request.userId } }).$fragment(LikedFragment)

    return likes.length > 0;
  },

  async comments(parent, args, context) {
    return context.prisma.comment({ id: parent.id }).comments()
  },

  async commentsCount(parent, args, context) {
    const comments = await context.prisma.comment({ id: parent.id }).comments()

    if (comments.length === 0) return null

    return comments.length
  },

}

module.exports = {
  Comment,
}
