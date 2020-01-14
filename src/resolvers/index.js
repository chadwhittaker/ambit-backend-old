const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { User } = require('./User')
const { Post } = require('./Post')
const { Comment } = require('./Comment')
const { Update } = require('./Update')
const { Story } = require('./Story')
const { Topic } = require('./Topic')

const resolvers = {
  Query,
  Mutation,
  User,
  Post,
  Comment,
  Update,
  Story,
  // Topic,
}

module.exports = {
  resolvers,
}