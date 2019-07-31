/** TODO add contexts, statuses, priorities */
const { makeExecutableSchema } = require("graphql-tools");
const { loadDb } = require("./lowloader");
const _ = require("lodash");

const db = loadDb("db.json");

/** Shared field structure for all TODO items*/
const entityFields = `
    id: String!
    title: String
    content: String
`;

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
`;

const tagTypeByPrefix = {
  "!": "priority",
  "#": "status",
  "@": "context",
  "": "category"
};

const resolvers = {
  Query: {
    tasks: entityResolverFactory("task"),
    contexts: entityResolverFactory("context"),
    priorities: entityResolverFactory("priority"),
    statuses: entityResolverFactory("status"),
    categories: entityResolverFactory("category"),
    tags: getAllTags
  },
  Task: {
    tags: getTaskTags
  },
  Tag: {
    __resolveType(tag, context, info) {
      return getTagType(tag.id, true);
    }
  },
  Category: {},
  Context: {},
  Priority: {},
  Status: {}
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

/**
 * Return child properties from db.
 * The db is a JSON map of plural entity names
 * to lists of entity objects.
 * @param {*} name
 */
function* entitiesByType(name) {
  let collection = db.get(name).value();
  if (Array.isArray(collection)) {
    yield* collection;
  } else if (_.isPlainObject(collection)) {
    for (id in collection) {
      yield Object.assign({ id }, collection[id]); //merge id into object properties
    }
  } else {
    throw "Top level items should be collections";
  }
}

function entityById(name, id) {
  for (entity of entitiesByType(name)) {
    if (entity.id === id) {
      return entity;
    }
  }
  return null;
}

function lazyCreateTag(tagId) {
  let tagType = getTagType(tagId);
  let tag = entityById(tagType, tagId);
  return tag ? tag : { id: tagId };
}

/** The type of a tag is determined by the first character of its id */
function getTagType(tagId, titleCase = false) {
  let prefix = tagId.slice(0, 1);
  if (!(prefix in tagTypeByPrefix)) {
    prefix = "";
  }
  let tagType = tagTypeByPrefix[prefix];
  if (titleCase) {
    tagType = tagType.charAt(0).toUpperCase() + tagType.slice(1);
  }
  return tagType;
}

/**
 * Generates tag ids from a task's optional comma-separated tags property.
 * @param {} task
 */
function* getTaskTagIds(task) {
  if (typeof task.tags === "string") {
    for (let entry of task.tags.split(",")) {
      yield entry.trim();
    }
  }
}

function* getTaskTags(task) {
  for (tagId in getTaskTagIds(task)) {
    yield lazyCreateTag(tagId);
  }
}

function getTagTypes() {
  return Object.values(tagTypeByPrefix);
}

/**
 * Provides a map of all tags by id
 * Declared tag Entities contain a tag id and associated metadata
 * Minimal tags are simply comma-separated ids in a Task's tag field
 * This function normalises all of them into a deduplicated map by id
 */
function createTagMap() {
  const tagMap = {};
  for (let tagType of getTagTypes()) {
    //declared tags (entities with metadata)
    for (let tag of entitiesByType(tagType)) {
      if (!(id in tagMap)) {
        tagMap[id] = { id };
      } else {
        throw "Duplicate declared tag";
      }
    }
  }
  for (let task of entitiesByType("task")) {
    //referenced tags (from task entities' tag property)
    for (let id of getTaskTagIds(task)) {
      if (!(id in tagMap)) {
        //don't overwrite declared tags
        tagMap[id] = { id };
      }
    }
  }
  return tagMap;
}

function* getAllTags() {
  const tagMap = createTagMap();
  for (id in tagMap) {
    yield tagMap[id];
  }
}

function* getTaskTags(task) {
  for (let tagId of getTaskTagIds(task)) {
    yield lazyCreateTag(tagId);
  }
}

function entityResolverFactory(name) {
  return (parent, args, context, info) => entitiesByType(name);
}

module.exports = schema;
