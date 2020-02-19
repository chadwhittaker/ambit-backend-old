const Subscription = {

  messageAdded: {
    subscribe: async (parent, args, context) => {
      // console.log('here')
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

  // messageAdded: {
  //   subscribe: (parent, args, context) => {
  //     console.log('setting up subscription')
  //     // return context.pubsub.asyncIterator(CHAT_CHANNEL)
  //   }
  // }

}

module.exports = {
  Subscription,
}