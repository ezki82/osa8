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
          genres: { $in: [args.genre] }, 
          author: { $in: [args.author] } 
        })
      }
      if (args.author) {       
        return await Book.find({  
          author: { $in: [args.author] } 
        })
      }
      if (args.genre) {       
        return await Book.find({ 
          genres: { $in: [args.genre] } 
        })
      }
      return await Book.find({})

    },      
    allAuthors: async () => await Author.find({})
  },
  Author: {
    name: (root) => root.name,
    born: (root) => root.born,
    bookCount: async (root) => (await Book.find({ "author.name": root.name})).length,
    id: (root) => root.id
  },
  Mutation: {
    addBook: async (root, args) => {
      // try to find existing author from db.
      let newAuthor = await Author.findOne({ "name": args.author})
      console.log(newAuthor)

      // // if author does not exist, create new author and save it to db.
      if (!newAuthor) {
        newAuthor = new Author({
          name: args.author
        })
        await newAuthor.save()
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: newAuthor,
        genres: args.genres
      })
      const newBook = await book.save()
      return newBook
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      const editedAuthor = {...author, born: args.setBornTo}
      authors = authors.map(a => a.name === args.name ? editedAuthor : a)
      return editedAuthor
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