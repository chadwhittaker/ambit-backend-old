const Message = {

  async from(parent, args, context) {
    return context.prisma.message({ id: parent.id }).from()
  },

  async chat(parent, args, context) {
    return context.prisma.message({ id: parent.id }).chat()
  },

}

module.exports = {
  Message,
}

