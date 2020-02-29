const Message = {

  async from(parent, args, context) {
    return context.prisma.message({ id: parent.id }).from()
  },

  async to(parent, args, context) {
    return context.prisma.message({ id: parent.id }).to()
  },

}

module.exports = {
  Message,
}

