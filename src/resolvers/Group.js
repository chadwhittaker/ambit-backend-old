const Group = {

  async users(parent, args, context) {
    return context.prisma.group({ id: parent.id }).users()
  },

  async messages(parent, args, context) {
    return context.prisma.group({ id: parent.id }).messages({ first: 50, orderBy: "createdAt_DESC" })
  },

  async latestMessage (parent, args, context) {
    const messages = await context.prisma.group({ id: parent.id }).messages({ first: 1, orderBy: "createdAt_DESC" })

    return messages[0]
  },

  async hidden(parent, args, context) {
    return context.prisma.group({ id: parent.id }).hidden()
  },
}

module.exports = {
  Group,
}

