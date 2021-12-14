import React, { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useMutation} from '@apollo/client'
import { LOGIN, CURRENT_USER } from '../queries'

const LoginForm = ({setError, setToken, setCurrentUser, show, setPage}) => {
  const [getCurrentUser, currentUserResult] = useLazyQuery(CURRENT_USER, {
    onCompleted: () => setCurrentUser(currentUserResult.data.me)
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    },
    onCompleted: () => {
      setPage('authors')
    }
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      getCurrentUser()
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) // eslint-disable-line

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: {username, password } })
    setUsername('')
    setPassword('')
  }

  return(
    <div>
      <h2>login</h2>
      <form onSubmit={submit}>
      <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm