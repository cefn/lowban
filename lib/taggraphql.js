/** TODO add contexts, statuses, priorities */
const { makeExecutableSchema } = require("graphql-tools")
const { iterateStoredTypes, getTagType } = require("./tagmodel")
const { storableData } = require("./util/schema")
const _ = require("lodash")

/** Shared field structure for all TODO items*/
const entityInputFields = `   id: String
    label: String!
    note: String`

const entityOutputFields = `   id: String!
label: String!
note: String`

const taskOutputFields =
  entityOutputFields +
  `   tagIds: [String!]
`

const taskInputFields =
  entityInputFields +
  `   tagIds: String!
`

const tagOutputFields = entityOutputFields

const tagInputFields = entityInputFields

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
  type Mutation {
    saveEditedTask (input:TaskInput!): Task
  }
  # Task to do
  type Task {
    ${taskOutputFields}
    tagList: [Tag!]
  }
  # Values submitted when making a task
  input TaskInput{
    ${taskInputFields}
  }

  # Tag strings used to group todos
  interface Tag {
    ${tagOutputFields}
  }
  input TagInput{
    ${tagInputFields}
  }

  # Tag with ! prefix is a Priority
  type Priority implements Tag{
    ${tagOutputFields}
  }
  # Tag with # prefix is a Status
  type Status implements Tag{
    ${tagOutputFields}
  }
  # Tag with @ prefix is a Context
  type Context implements Tag{
    ${tagOutputFields}
    active: Boolean
  }
  # Tag with no prefix is a Category
  type Category implements Tag{
    ${tagOutputFields}
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

  const mutationResolvers = {
    saveEditedTask: (parent, args) => {
      const data = storableData(args.input)
      return tagStore.saveItem("task", data)
    }
  }

  const allResolvers = {
    Query: queryResolvers,
    Mutation: mutationResolvers,
    Task: {
      tagList: tagStore.iterateTaskTags
    },
    Tag: {
      __resolveType(tag, context, info) {
        return initialCapital(getTagType(tag.id))
      }
    }
    //All other types (e.g. Category, Context, Priority, Status)
    //are simple JSON entities handled by default resolvers
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
