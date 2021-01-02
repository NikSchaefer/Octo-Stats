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
function Repos(props: { arr: Repo[], sort: sort, value: boolean }): any {
  let out = []
  let arr: Repo[] = []
  if (props.arr.length === 0) {
    return <></>;
  }
  let length: number = 10
  if (props.value) {
    length = props.arr.length
  }

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
  for (let i = 0; i < length; i++) {
    out.push(
      <a key={arr[i].name} href={arr[i].html_url} className="repo">
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
function getLangStats(repos: any[]) {
  let mapper = function (ent: { language: any }) {
    return ent.language
  }
  let reducer = function (stats: { [x: string]: any }, lang: string | number) {
    stats[lang] = (stats[lang] || 0) + 1;
    return stats
  }
  const langStats = repos.map(mapper).reduce(reducer, {});
  delete langStats['null'];

  let out: LangStats[] = []
  const keys: string[] = Object.keys(langStats)
  const values: number[] = Object.values(langStats)
  for (let i = 0; i < keys.length; i++) {
    out.push({
      label: keys[i],
      value: values[i],
    })
  }
  out.sort(function (a, b) {
    return b.value - a.value
  })
  return out
};
function GraphLang(props: { lang: LangStats[] }): any {
  let out = []
  for (let i = 0; i < props.lang.length; i++) {
    out.push(
      <div className="graph__lang-div">
        <p>{props.lang[i].label} {props.lang[i].value}%</p>
        <div style={{ width: `${props.lang[i].value}%` }} />
      </div>
    )
  }
  return out
}

type sort = "stars" | "forks" | 'size';
interface LangStats {
  label: string,
  value: number,
}
let isActive = true
export default function IndexPage() {

  const [user, setUser] = React.useState<string>('eddiejaoude')
  const [userData, setUserData] = React.useState<userData>(defUserData)

  const [repoData, setRepoData] = React.useState<Repo[]>([])
  const [sortType, setSortType] = React.useState<sort>("stars")

  const [viewMore, setViewMore] = React.useState<boolean>(false)
  const [langData, setLangData] = React.useState<LangStats[]>([])

  function ViewMore(props: { value: boolean }) {
    function Toggle() {
      setViewMore(!viewMore)
    }
    if (props.value) {
      return <p onClick={Toggle} className='view-more'>View Less</p>
    }
    return <p onClick={Toggle} className='view-more'>View More</p>
  }

  async function GetRepo() {
    const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=10000`)
    setRepoData(data.data)
  }
  async function Get() {
    const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(user)}`)
    setUserData(data.data)
  }

  React.useEffect(() => {
    if (isActive && repoData.length > 0) {
      setLangData(getLangStats(repoData))
      isActive = false
    }
    Get()
    GetRepo()
  })
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
        <div className="graph">
          <h1>Top Languages</h1>
          <div className='graph-container'>
            <GraphLang lang={langData} />
          </div>
        </div>
        <div className="graph"></div>
        <div className="graph"></div>

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
        <Repos value={viewMore} sort={sortType} arr={repoData} />
        <ViewMore value={viewMore} />
      </section>

    </main>
  )
}