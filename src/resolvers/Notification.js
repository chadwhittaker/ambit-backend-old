const Notification = {

  async target(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).target()
  },

  async user(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).user()
  },

  async users(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).users()
  },

  async post(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).post()
  },

  async update(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).update()
  },

  async comment(parent, args, context) {
    return context.prisma.notification({ id: parent.id }).comment()
  },
}

module.exports = {
  Notification,
}
