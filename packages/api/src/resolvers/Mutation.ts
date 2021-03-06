import { ObjectId } from "mongodb";
import { ApolloError } from "apollo-server";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

const removeElement = async (id, db, collectionName) => {
  const collection = db.collection(collectionName);
  try {
    const toRemove = await collection.findOne({ _id: ObjectId(id) });
    if (toRemove) await collection.deleteOne({ _id: ObjectId(id) });
    else throw new ApolloError(`Unknown ${collection}`);
    return toRemove;
  } catch (e) {
    throw new ApolloError(e);
  }
};

const Mutation = {
  signin: async (parent, args, ctx, info) => {
    try {
      const { db } = ctx;
      const { userName, pwd } = args;
      const collection = db.collection("users");
      const userData = await collection.findOne({ userName });
      if (userData) {
        throw new ApolloError("User already registered");
      }

      const res = await collection.insertOne({
        userName,
        pwd,
        authorized: false,
        token: null,
      });
      return res.ops[0];
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  login: async (parent, args, ctx, info) => {
    try {
      const { db } = ctx;
      const { userName, pwd } = args;
      const collection = db.collection("users");
      const userData = await collection.findOne({
        userName,
        pwd,
        authorized: true,
      });
      if (!userData) {
        throw new ApolloError("Non existent or not authorized userName");
      }

      const token = uuidv4();
      await collection.updateOne({ _id: userData._id }, { $set: { token } });
      return { userName, token, _id: userData._id };
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  logout: async (parent, args, ctx, info) => {
    try {
      const { db } = ctx;
      const { userid, token } = args;
      const collection = db.collection("users");
      console.log(userid);
      const userData = await collection.findOne({
        _id: ObjectId(userid),
        token,
      });
      if (!userData) {
        throw new ApolloError("Non existent or not logged");
      }

      await collection.updateOne(
        { _id: userData._id },
        { $set: { token: null } }
      );
      return { ...userData, token: null };
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  addIngredient: async (parent, args, ctx, info) => {
    const { db } = ctx;
    const { name, userid, token } = args;
    const collection = db.collection("ingredients");
    const ingredientData = await collection.findOne({ name });

    if (ingredientData) {
      throw new ApolloError(`Ingredient with name ${name} exists in database`);
    }
    const ingredient = {
      name: name,
    };

    const result = await collection.insertOne(ingredient);
    return result.ops[0];
  },

  uploadFile: async (parent, args, ctx, info) => {
    const { upload } = args;
    try {
      const { createReadStream, filename, mimetype, encoding } = await upload;
      if (!createReadStream) console.log("Not create read stream");
      const stream = createReadStream();

      const _fileName = `${uuidv4()}${filename}`;
      const url = `/images/${_fileName}`;
      const path = `./images/${_fileName}`;

      await new Promise((resolve, reject) => {
        stream
          .on("error", (error) => {
            console.log(error);
            reject(error);
          })
          .pipe(fs.createWriteStream(path))
          .on("error", reject)
          .on("finish", resolve);
      });
      console.log(`${path} written`);
      return {
        url,
        mimetype,
        encoding,
      };
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  addRecipe: async (parent, args, ctx, info) => {
    const {
      title,
      description,
      ingredients,
      steps,
      mainImage,
      images,
      userid,
      token,
    } = args;

    const { db } = ctx;
    const collectionRecipes = db.collection("recipes");
    const collectionIngredients = db.collection("ingredients");
    const query = { _id: { $in: ingredients.map((ing) => ObjectId(ing)) } };
    const ingredientsFound = await collectionIngredients.find(query).toArray();

    if (ingredients.length !== ingredientsFound.length) {
      throw new ApolloError(`Unknown ingredient`);
    }

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const recipe = {
      title,
      description,
      ingredients: ingredients.map((ing) => ObjectId(ing)),
      date: `${day}/${month}/${year}`,
      mainImage,
      steps,
      images,
      author: userid,
    };

    try {
      const result = await collectionRecipes.insertOne(recipe);
      return result.ops[0];
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  removeRecipe: async (parent, args, ctx, info) => {
    const { db } = ctx;
    const { id, userid, token } = args;
    try {
      return removeElement(id, db, "recipes");
    } catch (e) {
      throw new ApolloError(e);
    }
  },

  removeIngredient: async (parent, args, ctx, info) => {
    const { db } = ctx;
    const { id, userid, token } = args;

    try {
      return removeElement(id, db, "ingredients");
    } catch (e) {
      throw new ApolloError(e);
    }
  },
};

export { Mutation as default };
