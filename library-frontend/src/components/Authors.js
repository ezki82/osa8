import { useQuery, useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'


const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [authors, setAuthors] = useState(null)
  const [name, setName] = useState('')
  const [bornYear, setBornYear] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ {query: ALL_AUTHORS} ]
  })

  useEffect(() => {
    if (result.data) {
      setAuthors(result.data.allAuthors)
    }
  }, [result])

  if (!props.show) {
    return null
  }

  if (!authors) {
    return <div>...loading</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    editAuthor({ variables: {name, setBornTo:bornYear}})

    setName('')
    setBornYear('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {props.token === null ? 
      <></> : 
      <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option>select author</option>
            {authors.map((a) => <option key={a.name.concat(a.born)} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div>
          born
          <input
            value={bornYear}
            onChange={({ target }) => setBornYear(Number(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
      </div>}
    </div>
  )
}

export default Authors