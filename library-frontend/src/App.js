import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const client = useApolloClient()

  useEffect(() => {
    const token = window.localStorage.getItem('library-user-token')
    if (token) {
      setToken(token)
    }
  },[token])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  const errorNotify = (errorNotify) => {
    setErrorMessage(errorNotify)
    setTimeout(() => {
      setErrorMessage('')
    }, 5000)
  }

  return (
    <div>
      <div style={{color: "red", fontSize: 30}}>
        {errorMessage}
      </div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token === null ?
          <button onClick={() => setPage('login')}>login</button> :
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </>}
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

      <LoginForm
        show={page === 'login'} setToken={setToken} setError={errorNotify} setPage={setPage}
      />
    </div>
  )
}

export default App