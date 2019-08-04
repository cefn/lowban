/** TODO add contexts, statuses, priorities */
const { makeExecutableSchema } = require("graphql-tools")
const { TagStore } = require("./tagstore")
const _ = require("lodash")

/** Shared field structure for all TODO items*/
const entityFields = `
    id: String!
    title: String
    content: String
`

const typeDefs = `
  type Query {
    tasks: [Task!]
    tags: [Tag!]
    contexts: [Context!]
    priorities: [Priority!]
    statuses: [Status!]
    categories: [Category!]
  }
  # Task to do
  type Task {
    ${entityFields}
    tags: [Tag!]
  }

  # Tag strings used to group todos
  interface Tag {
    ${entityFields}
  }

  # Tag with ! prefix is a Priority
  type Priority implements Tag{
    ${entityFields}
  }
  # Tag with # prefix is a Status
  type Status implements Tag{
    ${entityFields}
  }
  # Tag with @ prefix is a Context
  type Context implements Tag{
    ${entityFields}
    active: Boolean
  }
  # Tag with no prefix is a Category
  type Category implements Tag{
    ${entityFields}
  }
`

const resolvers = {
  Query: {
    tasks: tagStore.entityResolverFactory("task"),
    contexts: tagStore.entityResolverFactory("context"),
    priorities: tagStore.entityResolverFactory("priority"),
    statuses: tagStore.entityResolverFactory("status"),
    categories: tagStore.entityResolverFactory("category"),
    tags: tagStore.getAllTags
  },
  Task: {
    tags: tagStore.getTaskTags
  },
  Tag: {
    __resolveType(tag, context, info) {
      return initialCapital(tagStore.getTagType(tag.id))
    }
  }
  /*
  Category: {},
  Context: {},
  Priority: {},
  Status: {}
  */
}

/** Used for compatibility with e.g. GraphQL which requires types to have an initial capital */
function initialCapital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function schemaFactory(db) {
  const tagStore = new TagStore(db)
  const schema = makeExecutableSchema({ typeDefs, resolvers })
}

module.exports = {
  schemaFactory
}
