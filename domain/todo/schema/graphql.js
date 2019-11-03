/** TODO add contexts, statuses, priorities */
const sortBy = require("lodash/sortBy")
const { makeExecutableSchema } = require("graphql-tools")
const {
  storedDataTypes,
  getTagType,
  compareTaskRelevant,
  comparePriorityOrder,
  compareActionableOrder
} = require("../tagmodel")
const { initialCapital } = require("../../../lib/util/javascript")

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

const actionOutputFields = `  type:String
  instant: Int`

const snoozeActionOutputFields = actionOutputFields + `
  until: Int`

const tagOutputFields = entityOutputFields

const tagInputFields = entityInputFields

//TODO auto-generate Query schema from tagmodel
const typeDefs = `
  type Query {
    ids(type:String!): [String!]

    taskList: [Task!]
    contextList: [Context!]
    priorityList: [Priority!]
    statusList: [Status!]
    scheduleList: [Schedule!]
    deadlineList: [Deadline!]
    categoryList: [Category!]
    tagList: [Tag!]
    
    task(id:String!): Task
    context(id:String!): Context
    priority(id:String!): Priority
    status(id:String!): Status
    category(id:String!): Category
    schedule(id:String!): Schedule
    deadline(id:String!): Deadline
    filterTags(filter:String!):[Tag!]
    filterRelevantTasks(filter:String!):[Task!]
    filterPriorityTasks(filter:String!):[Task!]
    filterActionableTasks(filter:String!):[Task!]
  }
  type Mutation {
    taskMerge (input:TaskInput!): Task
    taskFulfil (id:String): Task
    taskSnooze (id:String, until:Int): Task
    tagMerge (input:TagInput!): Tag
  }

  # Task to do
  type Task {
    ${taskOutputFields}
    tagList: [Tag!]
    actionList: [Action!]
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
  # Tag with ~ prefix is a Schedule
  type Schedule implements Tag{
    ${tagOutputFields}
  }
  # Tag with | prefix is a Deadline
  type Deadline implements Tag{
    ${tagOutputFields}
  }
  # Tag with no prefix is a Category
  type Category implements Tag{
    ${tagOutputFields}
  }

  interface Action {
    type:String
    instant:Int
  }

  type Create implements Action {
    ${actionOutputFields}
  }

  type Snooze implements Action {
    ${snoozeActionOutputFields}
  }

  type Fulfil implements Action {
    ${actionOutputFields}
  }
`

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
    ids: (_parent, args) => tagStore.iterateIdsByType(args.type), //lists all ids of a type
    tagList: tagStore.iterateAllTags, //aggregates multiple stored tag types
    filterTags: (_parent, args) => sortBy([...tagStore.iterateFilteredTags(args.filter)], tag => tag.id),
    filterRelevantTasks: (_parent, args) => [...tagStore.iterateFilteredTasks(args.filter)].sort(compareTaskRelevant),
    filterPriorityTasks: (_parent, args) => [...tagStore.iterateFilteredTasks(args.filter)].sort(comparePriorityOrder),
    filterActionableTasks: (_parent, args) => [...tagStore.iterateFilteredTasks(args.filter)].sort(compareActionableOrder)
  }
  //...plus query resolvers for each stored type
  for (let storedType of storedDataTypes) {
    queryResolvers[storedType] = createLookupResolver(storedType)
    queryResolvers[storedType + "List"] = createListResolver(storedType)
  }

  const allResolvers = {
    Query: queryResolvers,
    Mutation: {
      taskMerge: (_parent, args) => {
        return tagStore.mergeItem("task", args.input)
      },
      //TODO write form logic to use this mutation
      tagMerge: (_parent, args) => {
        return tagStore.mergeItem("tag", args.input)
      },
      taskSnooze: (_parent, args) => {
        const { id, until } = args
        return tagStore.addTaskActionById(id, "snooze", { until })
      },
      taskFulfil: (_parent, args) => {
        return tagStore.addTaskActionById(args.id, "fulfil")
      }
    },
    Task: {
      tagList: tagStore.iterateTaskTags,
      actionList: tagStore.iterateTaskActions,
    },
    Tag: {
      __resolveType(tag, _context, _info) {
        return initialCapital(getTagType(tag.id))
      }
    },
    Action: {
      __resolveType(action, _context, _info) {
        return initialCapital(action.type)
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
  schemaFactory,
  outputFields,
}
