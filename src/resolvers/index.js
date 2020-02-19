const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { Subscription } = require('./Subscription')
const { User } = require('./User')
const { Post } = require('./Post')
const { Comment } = require('./Comment')
const { Update } = require('./Update')
const { Story } = require('./Story')
const { Topic } = require('./Topic')
const { Chat } = require('./Chat')
const { Message } = require('./Message')



const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
  Comment,
  Update,
  Story,
  Topic,
  Chat,
  Message
}

module.exports = {
  resolvers,
}