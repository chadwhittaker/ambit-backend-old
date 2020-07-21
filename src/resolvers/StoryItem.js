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
    return context.prisma.storyItem({ id: parent.id }).likes()
  },

  async likesCount(parent, args, context) {
    const likes = await context.prisma.storyItem({ id: parent.id }).likes().$fragment(LikedFragment)

    return likes.length
  },

  async likedByMe(parent, args, context) {
    const likes = await context.prisma.storyItem({ id: parent.id }).likes({ where: { id: context.prisma.userId } }).$fragment(LikedFragment)

    return likes.length > 0;
  },

}

module.exports = {
  StoryItem,
}
