import * as React from "react"
import Axios from 'axios'
import { userData, defUserData, Repo } from './interfaces'
import './index.css'
import * as Icon from "./svg"
function Box(props: { num: number, name: string }) {
  function numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return (
    <div className='box'>
      <h2>{numberWithCommas(props.num)}</h2>
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
function Repos(props: { arr: Repo[], sort: sort }): any {
  let out = []
  let arr: Repo[] = []
  if (props.sort === 'size') {
    arr = props.arr.sort(function (a, b) {
      return b.size - a.size
    })
  }
  else if (props.sort === 'forks') {
    arr = props.arr.sort(function (a, b) {
      return b.forks_count - a.forks_count
    })
  }
  else {
    arr = props.arr.sort(function (a, b) {
      return b.stargazers_count - a.stargazers_count
    })

  }
  for (let i = 0; i < props.arr.length; i++) {
    out.push(
      <a href={arr[i].html_url} className="repo">
        <h2><Icon.Repo /> {arr[i].name}</h2>
        <p>{arr[i].description}</p>
        <div className="repo__bottom">
          <Icon.Star />
          <p>{arr[i].stargazers_count}</p>
          <Icon.Fork />
          <p>{arr[i].forks_count}</p>
          <p style={{ fontSize: '15px', marginLeft: 'auto' }}>{arr[i].size} KB</p>
        </div>
      </a>
    )
  }
  return out
}

type sort = "stars" | "forks" | 'size'
export default function IndexPage() {

  const [user, setUser] = React.useState<string>('eddiejaoude')
  const [userData, setUserData] = React.useState<userData>(defUserData)

  const [repoData, setRepoData] = React.useState<Repo[]>([])
  const [sortType, setSortType] = React.useState<sort>("stars")

  async function GetRepo() {
    const data = await Axios.get(`https://api.github.com/users/${user}/repos?per_page=10000`)
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
          <div className="info__subtext">
            <Icon.Location /><p>{userData.location}</p>
          </div>
        </div>
        <div className="boxes">
          <Box num={userData.public_repos} name='Repositories' />
          <Box num={userData.followers} name='Followers' />
          <Box num={userData.following} name='Following' />
        </div>
      </section>
      <div id='graph__color' />
      <section className="graphs">
        <Graph />
        <Graph />
        <Graph />
      </section>

      <section className="repos">
        <div className="sorting-options">
          <h1 className='repos__title'>Top Repos</h1>
          <div className='sort-by'>
            <h2>Sort By</h2>
            <p onClick={function () { setSortType('stars') }}>Stars</p>
            <p onClick={function () { setSortType('forks') }}>Forks</p>
            <p onClick={function () { setSortType('size') }}>Size</p>
          </div>
        </div>
        <Repos sort={sortType} arr={repoData} />
      </section>

    </main>
  )
}