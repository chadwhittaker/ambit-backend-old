const Subscription = {

  messageAdded: {
    subscribe: async (parent, args, context) => {
      return context.prisma.$subscribe
        .message({
          AND: [
            { mutation_in: ['CREATED'] },
            { node: {
                chat: {
                  id: args.chatID,
                }
              }
            }
          ]
        })
        .node()
    },
    resolve: payload => {
      return payload
    },
  },

  newNotification: {
    subscribe: async (parent, args, context) => {
        return context.prisma.$subscribe
        .notification({
          AND: [
            { mutation_in: ['CREATED'] },
            { node: {
                target: {
                  id: args.id,
                }
              }
            }
          ]
        })
        .node()
    },
    resolve: payload => {
      return payload
    },
  },

}

module.exports = {
  Subscription,
}