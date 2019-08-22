const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
// const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Height of messages container
  const containerHeight = $messages.scrollHeight
  // Visible Height
  const visibleHeight = $messages.offsetHeight

  const heightFromTop = $messages.scrollTop

  if(containerHeight - newMessageHeight <= heightFromTop + visibleHeight) {
    $messages.scrollTop += newMessageHeight
  }
}

socket.on('message', (message) => {
  // console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
  // console.log(url)
  const html = Mustache.render(locationMessageTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  console.log(room)
  console.log(users)
  const html = Mustache.render(sidebarTemplate, { room, users })
  document.querySelector('#sidebar').innerHTML = html
})

// document.querySelector('#sendButton').addEventListener('click', () => {
//   const message = document.querySelector('#inputMessage').value
//   // console.log(message)
//   socket.emit('messageFromClient', message)
// })

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // disable
  $messageFormButton.setAttribute('disabled', 'disabled')
  // const message = document.querySelector('input').value
  const message = e.target.elements.message.value

  socket.emit('messageFromClient', message, (error) => {
    // enable
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
     
    if(error) {
      return console.log(error)
    }
    console.log('message was delivered')
  })
})

$sendLocationButton.addEventListener('click', () => {
  
  if(!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }
  // disable
  $sendLocationButton.setAttribute('disabled', 'disabled')

  const location = navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position)

    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, (message) => {
      // enable
      $sendLocationButton.removeAttribute('disabled')
      console.log(message)
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})

// socket.on('countUpdated', (count) => {
//   console.log('count has been updated to ', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Click')
//   socket.emit('increment')
// })

