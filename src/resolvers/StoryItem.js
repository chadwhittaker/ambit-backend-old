const gql = require('graphql-tag')

const LikedFragment = gql`
  fragment LikedFragment on User {
    id
  }
`;

const StoryItem = {

  async stories(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).stories()
  },

  async views(parent, args, context) {
    return context.prisma.storyItem({ id: parent.id }).views()
  },

  async likes(parent, args, context) {
    const likes = context.prisma.storyItem({ id: parent.id }).likes();
    // console.log(likes)
    return likes
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.storyItem({ id: parent.id }).likes().$fragment(LikedFragment)

    return likes.length
  },

  async likedByMe(parent, args, context) {

    if (context.request) {
      const likes = await context.prisma.storyItem({ id: parent.id }).likes({ where: { id: context.request.userId } }).$fragment(LikedFragment)
      return likes.length > 0;
    }

    // if it is a subscription response
    // had to do this bc was getting nofification errors bc context.request.userId is undefined on subscriptions
    if (context.connection) {
      if (context.connection.operationName) {
        if (context.connection.operationName === 'NEW_NOTIFICATION_SUBSCRIPTION') {
          const likes = await context.prisma.storyItem({ id: parent.id }).likes({ where: { id: context.connection.variables.id } }).$fragment(LikedFragment)
          return likes.length > 0;
        }
      }
    }

    return false
  },

}

module.exports = {
  StoryItem,
}
