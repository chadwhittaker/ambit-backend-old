const Message = {

  async from(parent, args, context) {
    return context.prisma.message({ id: parent.id }).from()
  },

  async to(parent, args, context) {
    return context.prisma.message({ id: parent.id }).to()
  },

  async hidden(parent, args, context) {
    return context.prisma.message({ id: parent.id }).hidden()
  },

}

module.exports = {
  Message,
}

