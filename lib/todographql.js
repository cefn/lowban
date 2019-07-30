/** TODO add contexts, statuses, priorities */
const _ = require('lodash')

const { makeExecutableSchema } = require('graphql-tools')
const { loadDb } = require('./lowloader')

const db = loadDb('db.json')

const entityFields = `
id: String!
title: String!
content: String
`

const typeDefs = `
  type Query {
    tasks: [Task!]
  }
  type Task {
    ${entityFields}
    tags: [String!]
  }
  type Tag {
    ${entityFields}    
  }
  type Context {
    ${entityFields}
    active: Boolean    
  }
`

const resolvers = {
  Query: {
    tasks: (parent, args, context, info) => db.get('tasks').value()
  },
  Task: {
    tags: function * (task) {
      if (typeof task.tags === 'string') {
        for (let entry of task.tags.split(',')) {
          yield entry.trim()
        }
      }
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

module.exports = schema
