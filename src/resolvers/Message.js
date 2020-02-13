const Message = {

  async from(parent, args, context) {
    return context.prisma.message({ id: parent.id }).from()
  },

}

module.exports = {
  Message,
}

