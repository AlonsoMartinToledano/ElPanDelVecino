import { ApolloServer, gql } from "apollo-server";
import * as fs from "fs";
import connectToDb from "./db";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Ingredient from "./resolvers/Ingredient";
import Recipe from "./resolvers/Recipe";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const userName = process.env.MONGO_DB_USERNAME;
const pwd = process.env.MONGO_DB_PASSWORD;
const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB_NAME;

const typeDefs = gql`
  ${fs.readFileSync(__dirname.concat("/schemas/schema.graphql"), "utf8")}
`;

/**
 * Starts GraphQL server, with MongoDB Client in context Object
 * @param {client: MongoClinet} context The context for GraphQL Server -> MongoDB Client
 */
const runGraphQLServer = function (context) {
  const resolvers = {
    Query,
    Mutation,
    Ingredient,
    Recipe,
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  const options = {
    port: 4000,
  };

  server
    .listen(options)
    .then(({ url }) => {
      console.log(`Server started, listening on ${url} for incoming requests.`);
    })
    .catch((e) => {
      console.info(e);
      server.stop();
    });
};

const startServer = async function () {
  const { client, db } = await connectToDb(userName, pwd, url, dbName);
  console.info("Connected to Mongo DB");
  try {
    runGraphQLServer({ client, db });
  } catch (e) {
    console.log(e);
    client.close();
  }
};

startServer();
