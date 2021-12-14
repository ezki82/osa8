import { useLazyQuery } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { RECOMMEND_BOOKS } from '../queries'

const Recommend = (props) => {
  const [getRecommendBooks, result] = useLazyQuery(RECOMMEND_BOOKS)

  const [recommendBooks, setRecommendBooks] = useState(null)

  const showRecommendBooks = (genre) => {
    getRecommendBooks({ variables: { genre } })
  }

  useEffect(() => {
    if (props.currentUser) {
      showRecommendBooks(props.currentUser.favoriteGenre)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show])

  useEffect(() => {
    if (result.data) {
      setRecommendBooks(result.data.allBooks)
    }
  },[result])

  if (!props.show) {
    return null
  }

  if (!recommendBooks) {
    return <div>...loading</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre:</p>
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
          {recommendBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend