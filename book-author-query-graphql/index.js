const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const { Book, Author } = require('./models')
const { collection } = require('./models/book')

const MONGODB_URI = 'mongodb+srv://fullStack:fullStack123@hyfullstack.igxgw.mongodb.net/GraphQL?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre && args.author) {
        return await Book.find({
          genres: { $in: [args.genre] }
        }).populate('author')
      }
      if (args.author) {
        return await Book.find({
        }).populate('author')
      }
      if (args.genre) {
        return await Book.find({
          genres: { $in: [args.genre] }
        }).populate('author')
      }
      return await Book.find({}).populate('author')
    },
    allAuthors: async () => await Author.find({})
  },
  Author: {
    name: (root) => root.name,
    born: (root) => root.born,
    bookCount: async (root) => {
      const books = await Book.find({ "author.name": root.name }, { "author.name": 1 })
    },
    id: (root) => root.id
  },
  Mutation: {
    addBook: async (root, args) => {
      // try to find existing author from db.
      let newAuthor = await Author.findOne({ "name": args.author })

      // // if author does not exist, create new author and save it to db.
      if (!newAuthor) {
        newAuthor = new Author({
          name: args.author,
          born: null
        })
        try {
          await newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: newAuthor,
        genres: args.genres
      })
      try {
        return await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ "name": args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})