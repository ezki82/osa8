import { useLazyQuery, useQuery } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { CURRENT_USER, RECOMMEND_BOOKS } from '../queries'

const Recommend = (props) => {
  const currentUserResult = useQuery(CURRENT_USER, {
    onCompleted: () => setCurrentUser(currentUserResult.data.me)
  })
  const [getRecommendBooks, result] = useLazyQuery(RECOMMEND_BOOKS)

  const [recommendBooks, setRecommendBooks] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const showRecommendBooks = (genre) => {
    getRecommendBooks({ variables: { genre } })
  }

  useEffect(() => {
    if (result.data) {
      setRecommendBooks(result.data.allBooks)
    }
    if (currentUser) {
      showRecommendBooks(currentUser.favoriteGenre)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.show, currentUser])

  if (!props.show) {
    return null
  }

  if (!recommendBooks || !currentUser) {
    return <div>...loading</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre: {currentUser.favoriteGenre} </p>
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