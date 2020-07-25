const gql = require('graphql-tag')

const LikedFragment = gql`
  fragment LikedFragment on User {
    id
  }
`;

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

  async likes(parent, args, context) {
    return context.prisma.post({ id: parent.id }).likes()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.post({ id: parent.id }).likes().$fragment(LikedFragment)

    return likes.length
  },

  async likedByMe(parent, args, context) {

    if (context.request) {
      const likes = await context.prisma.post({ id: parent.id }).likes({ where: { id: context.request.userId } }).$fragment(LikedFragment)
      return likes.length > 0;
    }

    // if it is a subscription response
    // had to do this bc was getting nofification errors bc context.request.userId is undefined on subscriptions
    if (context.connection) {
      if (context.connection.operationName) {
        if (context.connection.operationName === 'NEW_NOTIFICATION_SUBSCRIPTION') {
          const likes = await context.prisma.post({ id: parent.id }).likes({ where: { id: context.connection.variables.id } }).$fragment(LikedFragment)
          return likes.length > 0;
        }
      }
    }

    return false
  },

  async commentsCount(parent, args, context) {
    const comments = await context.prisma.post({ id: parent.id }).comments()

    if (comments.length === 0) return null

    return comments.length
  },

  async views(parent, args, context) {
    return context.prisma.post({ id: parent.id }).views()
  },

}

module.exports = {
  Post,
}

