const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { Subscription } = require('./Subscription')
const { User } = require('./User')
const { Post } = require('./Post')
const { Comment } = require('./Comment')
const { Update } = require('./Update')
const { Story } = require('./Story')
const { StoryItem } = require('./StoryItem')
const { Topic } = require('./Topic')
const { Group } = require('./Group')
const { Message } = require('./Message')
const { Notification } = require('./Notification')

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
  Comment,
  Update,
  Story,
  StoryItem,
  Topic,
  Group,
  Message,
  Notification
}

module.exports = {
  resolvers,
}