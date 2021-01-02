import * as React from "react"
import '../Components/index.css'
import github from '../images/github.svg'
import Axios from 'axios'
import { navigate } from "@reach/router"

export default function IndexPage() {
  const [input, setInput] = React.useState<string>('')
  async function handleClick() {
    try {
      const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(input)}`)
      window.location.href = (`/user?id=${input}`);
    } catch (err) {
      const temp = input
      setInput("UserNotFound")
      setTimeout(() => {
        setInput(temp)
      }, 2000)
    }
  }

  React.useEffect(() => {
    document.getElementById('email').onkeydown = function (e) {
      if (e.key == "Enter") {
        handleClick()
      }
    };
  })
  return (
    <main className='home'>
      <img src={github} />
      <h1>Octo Stats</h1>
      <h3>Github Information</h3>
      <input id='email' value={input} placeholder="Enter Username" onChange={function (e) { setInput(e.target.value) }} />
    </main>
  )
}