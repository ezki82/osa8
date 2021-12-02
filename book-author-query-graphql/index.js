const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { Book, Author, User } = require('./models')

const MONGODB_URI = 'mongodb+srv://fullStack:fullStack123@hyfullstack.igxgw.mongodb.net/GraphQL?retryWrites=true&w=majority'
const JWT_SECRET = 'TOPSECRET'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

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
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

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
    me: (root, args, context) => context.currentUser,
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
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "123") {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    },
    createUser: async (root, args) => {
      const user = new User({
         username: args.username,
         favoriteGenre: args.favoriteGenre
      })

      try {
        return await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs:args
        })
      }
    },
    addBook: async (root, args, context) => {
      // check user authentication
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
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
    editAuthor: async (root, args, context) => {
      // check user authentication
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
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
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})