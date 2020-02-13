const Story = {

  async items(parent, args, context) {
    return context.prisma.story({ id: parent.id }).items()
  },

}

module.exports = {
  Story,
}
