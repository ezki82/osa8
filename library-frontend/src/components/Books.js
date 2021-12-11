import { useQuery } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [books, setBooks] = useState(null)
  const [genreFilter,setGenreFilter] = useState('')


  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks)
    }
  }, [result])

  if (!props.show) {
    return null
  }

  if (!books) {
    return <div>...loading</div>
  }

  const genres = books.flatMap(b => b.genres)
  const filterGenreList = [...new Set(genres)]
  
  const filteredBooks = genreFilter.length > 0 ? books.filter(b => b.genres.includes(genreFilter)) : books

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {filterGenreList.map(g =>
        <button key={g} onClick={() => setGenreFilter(g)}>{g}</button>
        )} <br/><br/>
    <button onClick={() => setGenreFilter('')} >CLEAR FILTER</button>
    </div>
  )
}

export default Books