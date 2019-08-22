const users = []

const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate data
  if(!username || !room) {
    return {
      error: 'uesrname and room are required!'
    }
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // Validate username
  if(existingUser) {
    return {
      error: 'username is taken!'
    }
  }

  // Store user

  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id) // returns -1 if not found else >0
  if(index !== -1) {
    return users.splice(index, 1)[0] // returns array of the removed items
  }
}

const getUser = (id) => {
  return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}

// addUser({ id:22, username: 'Manish    ', room: 'central room' })
// console.log(users)



// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)

// console.log(getUser(22))
// console.log(getUsersInRoom('central room'))
// const res = addUser({
//   id: 007,
//   username: 'Manish       ',
//   room: 'central room  '
// })

// console.log(res)