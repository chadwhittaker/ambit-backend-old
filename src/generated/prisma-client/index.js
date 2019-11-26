"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Role",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Story",
    embedded: false
  },
  {
    name: "StoryItem",
    embedded: false
  },
  {
    name: "Skill",
    embedded: false
  },
  {
    name: "Experience",
    embedded: false
  },
  {
    name: "Education",
    embedded: false
  },
  {
    name: "Post",
    embedded: false
  },
  {
    name: "Update",
    embedded: false
  },
  {
    name: "Comment",
    embedded: false
  },
  {
    name: "Meeting",
    embedded: false
  },
  {
    name: "Filter",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://us1.prisma.sh/ambit-workspace-2/ambit-prisma3/dev`
});
exports.prisma = new exports.Prisma();
