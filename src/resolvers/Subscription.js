const Subscription = {

  newMessageToMe: {
    subscribe: async (parent, args, context) => {
      return context.prisma.$subscribe
        .message({
          AND: [
            { mutation_in: ['CREATED'] },
            {
              node: {
                to: {
                  users_some: { id: args.id },
                },
                from: {
                  id_not: args.id,
                }
              }
            },
            // {
            //   node: {
            //     from: {
            //       id_not: { id: args.id },
            //     }
            //   }
            // },
          ]
        })
        .node()
    },
    resolve: payload => {
      return payload
    },
  },

  // newNotification: {
  //   subscribe: async (parent, args, context) => {
  //     return context.prisma.$subscribe
  //       .notification({
  //         AND: [
  //           { mutation_in: ['CREATED'] },
  //           {
  //             node: {
  //               target: {
  //                 id: args.id,
  //               }
  //             }
  //           }
  //         ]
  //       })
  //       .node()
  //   },
  //   resolve: payload => {
  //     return payload
  //   },
  // },

}

module.exports = {
  Subscription,
}