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
    name: "PostLike",
    embedded: false
  },
  {
    name: "Comment",
    embedded: false
  },
  {
    name: "CommentLike",
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
  endpoint: `https://eu1.prisma.sh/ambit-workspace/ambit-prisma/dev`
});
exports.prisma = new exports.Prisma();
