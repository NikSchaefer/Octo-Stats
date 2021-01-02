import * as React from "react"
import Axios from 'axios'
import { userData, defUserData, Repo } from './interfaces'
import './index.css'
import { IconFork, IconRepo, IconStar } from "./svg"
function Box(props: { num: number, name: string }) {
  return (
    <div className='box'>
      <h2>{props.num}</h2>
      <h3>{props.name}</h3>
    </div>
  )
}
function Graph(props: {}) {
  return (
    <div className="graph">

    </div>
  )
}
function Repos(props: { arr: Repo[] }): any {
  let out = []
  const arr: Repo[] = props.arr.sort(function (a, b) {
    return b.stargazers_count - a.stargazers_count
  })
  for (let i = 0; i < props.arr.length; i++) {
    out.push(
      <a href={arr[i].html_url} className="repo">
        <h2><IconRepo /> {arr[i].name}</h2>
        <p>{arr[i].description}</p>
        <div className="repo__bottom">
          <IconStar />
          <p>{arr[i].stargazers_count}</p>
          <IconFork />
          <p>{arr[i].forks_count}</p>
          <p style={{ fontSize: '15px', marginLeft: 'auto' }}>{arr[i].size} KB</p>
        </div>
      </a>
    )
  }
  return out
}
export default function IndexPage() {

  const [user, setUser] = React.useState<string>('NikSchaefer')
  const [userData, setUserData] = React.useState<userData>(defUserData)

  const [repoData, setRepoData] = React.useState<Repo[]>([])

  async function GetRepo() {
    const data = await Axios.get(`https://api.github.com/users/${user}/repos`)
    setRepoData(data.data)
  }
  async function Get() {
    const data = await Axios.get(`https://api.github.com/users/${user}`)
    setUserData(data.data)
  }
  window.onload = function () {
    Get()
    GetRepo()
  }
  return (
    <main>
      <section className="info">
        <img src={userData.avatar_url} alt="..." className="avatar" />
        <div className="info-text">
          <h1>{userData.name}</h1>
          <a href={userData.html_url}>@{user}</a>
          <p>{userData.bio}</p>
        </div>
        <div className="boxes">
          <Box num={222} name='Repositories' />
          <Box num={222} name='Repositories' />
          <Box num={222} name='Repositories' />
        </div>
      </section>
      <div id='graph__color' />
      <section className="graphs">
        <Graph />
        <Graph />
        <Graph />
      </section>

      <section className="repos">
        <Repos arr={repoData} />
      </section>

    </main>
  )
}