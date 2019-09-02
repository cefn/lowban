/** TODO add contexts, statuses, priorities */
const { makeExecutableSchema } = require("graphql-tools")
const { iterateStoredTypes, iterateTraversableTypes, getTagType } = require("./tagmodel")
const { storableData } = require("./util/form")
const _ = require("lodash")

//TODO remove use of makeExecutableSchema - compiler too buggy

function outputFields(typeName) {
  switch (typeName) {
  case "task": return taskOutputFields
  default: return tagOutputFields
  }
}

/** Shared field structure for all TODO items*/
const entityInputFields = `   id: String
    label: String!
    note: String`

const entityOutputFields = `   id: String!
label: String
note: String`

const taskOutputFields =
  entityOutputFields.replace("label: String", "label: String!") +
  `   tagIds: [String!]
`

const taskInputFields =
  entityInputFields +
  `   tagIds: [String!]
`

const tagOutputFields = entityOutputFields

const tagInputFields = entityInputFields

//TODO auto-generate Query schema from tagmodel
const typeDefs = `
  type Query {
    taskList: [Task!]
    contextList: [Context!]
    priorityList: [Priority!]
    statusList: [Status!]
    categoryList: [Category!]
    task(id:String!): Task
    context(id:String!): Context
    priority(id:String!): Priority
    status(id:String!): Status
    category(id:String!): Category
    tagList: [Tag!]
    filterTaskList(filter:String!):[Task!]
    filterTagList(filter:String!):[Tag!]
  }
  type Mutation {
    taskSave (input:TaskInput!): Task
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
  //create resolvers for tagStore
  function createLookupResolver(typeName) {
    return (_parent, args) => tagStore.getById(typeName, args.id)
  }
  function createListResolver(typeName) {
    return (_parent, _args) => tagStore.iterateByType(typeName)
  }
  function createSaveResolver(typeName) {
    return (_parent, args) => tagStore.saveItem(typeName, args.input)
  }

  //populate query root with special case resolvers
  const queryResolvers = {
    tagList: tagStore.iterateAllTags, //aggregates multiple stored tag types
    filterTagList: (_parent, args) => tagStore.filterTags(args.filter),
    filterTaskList: (_parent, args) => tagStore.filterTasks(args.filter)
  }
  //...plus query resolvers for each stored type
  for (let storedType of iterateStoredTypes()) {
    queryResolvers[storedType] = createLookupResolver(storedType)
    queryResolvers[storedType + "List"] = createListResolver(storedType)
  }

  //no special case resolvers
  const mutationResolvers = {
  }
  //...plus save resolvers for all stored types
  //const saveableTypes = [...iterateStoredTypes()]
  const saveableTypes = ["task"]
  for (let storedType of saveableTypes) {
    mutationResolvers[storedType + "Save"] = createSaveResolver(storedType)
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
    },
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
  schemaFactory,
  outputFields,
  initialCapital
}
