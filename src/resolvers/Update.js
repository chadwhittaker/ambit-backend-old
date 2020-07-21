const gql = require('graphql-tag')

const LikedFragment = gql`
  fragment LikedFragment on User {
    id
  }
`;

const Update = {

  async parentPost(parent, args, context) {
    return context.prisma.update({ id: parent.id }).parentPost()
  },

  async comments(parent, args, context) {
    return context.prisma.update({ id: parent.id }).comments()
  },

  async likes(parent, args, context) {
    return context.prisma.update({ id: parent.id }).likes()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.update({ id: parent.id }).likes().$fragment(LikedFragment)

    return likes.length
  },

  async likedByMe(parent, args, context) {
    const likes = await context.prisma.update({ id: parent.id }).likes({ where: { id: context.request.userId } }).$fragment(LikedFragment)

    return likes.length > 0;
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

