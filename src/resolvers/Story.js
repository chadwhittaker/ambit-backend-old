const Story = {

  async items(parent, args, context) {
    return context.prisma.story({ id: parent.id }).items()
  },

  // async skills(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).skills()
  // },

  // async experience(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).experience()
  // },

  // async education(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).education()
  // },

  // async posts(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).posts()
  // },

  // async intro(parent, args, context) {
  //   return context.prisma.user({ id: parent.id }).intro()
  // },
}

module.exports = {
  Story,
}
