/** TODO add contexts, statuses, priorities */
const { makeExecutableSchema } = require("graphql-tools")
const { iterateStoredTypes, getTagType } = require("./tagmodel")
const _ = require("lodash")

/** Shared field structure for all TODO items*/
const entityFields = `
    id: String!
    title: String
    text: String
`

//TODO auto-generate Query schema from tagmodel
const typeDefs = `
  type Query {
    taskList: [Task!]
    tagList: [Tag!]
    contextList: [Context!]
    priorityList: [Priority!]
    statusList: [Status!]
    categoryList: [Category!]
  }
  # Task to do
  type Task {
    ${entityFields}
    tagIds: [String!]
    tagList: [Tag!]
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

/** Used for compatibility with e.g. GraphQL which requires types to have an initial capital */
function initialCapital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function resolverFactory(tagStore) {
  const queryResolvers = {
    //'tags' is special case - aggregates multiple tag types
    tagList: tagStore.iterateAllTags
  }
  //auto-generate remaining resolvers - stored types
  for (let storedType of iterateStoredTypes()) {
    const fieldName = storedType + "List"
    queryResolvers[fieldName] = tagStore.entityResolverFactory(storedType)
  }

  const allResolvers = {
    Query: queryResolvers,
    Task: {
      tagList: tagStore.iterateTaskTags
    },
    Tag: {
      __resolveType(tag, context, info) {
        return initialCapital(getTagType(tag.id))
      }
    }
    /* //handled by default resolvers - just JSON objects
    Category: {},
    Context: {},
    Priority: {},
    Status: {}
    */
  }
  return allResolvers
}

function schemaFactory(tagStore) {
  const resolvers = resolverFactory(tagStore)
  return makeExecutableSchema({ typeDefs, resolvers })
}

module.exports = {
  schemaFactory
}
