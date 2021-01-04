import * as React from "react"
import Axios from 'axios'
import { userData, defUserData, Repo, Event } from '../Components/interfaces'
import * as Icon from "../Components/svg"
import '../Components/index.css'
import { Chart } from 'chart.js'
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
    let length: number = 0
    if (props.arr.length < 9) {
        length = props.arr.length
    } else {
        length = 9
    }
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
    const total = values.reduce((a, b) => a + b)
    for (let i = 0; i < keys.length; i++) {
        out.push({
            label: keys[i],
            value: Math.floor(values[i] / total * 100),
        })
    }
    out.sort(function (a, b) {
        return b.value - a.value
    })
    return out
};
function GetCommitHist(hist: Event[]) {
    const created: Date[] = hist.map(temp => new Date(temp.created_at))
    let commits = []
    let out = []
    for (let i = 0; i < hist.length; i++) {
        if (hist[i].payload.commits === undefined) {
            continue
        }
        commits.push(hist[i].payload.commits.length)
    }
    for (let j = 0; j < created.length; j++) {
        out.push({
            x: created[j].getTime(),
            y: commits[j]
        })
    }
    return out
}

function GraphLang(props: { lang: LangStats[] }): any {
    let out = []
    for (let i = 0; i < props.lang.length; i++) {
        out.push(
            <div key={i + "graph"} className="graph__lang-div">
                <p>{props.lang[i].label} {props.lang[i].value}%</p>
                <div style={{ width: `${props.lang[i].value}%` }} />
            </div>
        )
    }
    return out
}
function EventGraph(props: { data: Event[] }) {
    if (props.data.length <= 0) {
        return <></>
    }
    const data = props.data[0]
    const date = new Date(data.created_at).toDateString()
    let message = ''
    if (data.type === "PushEvent") {
        message = data.payload.commits[0].message
    }
    else if (data.type === 'IssuesEvent' || data.type === 'IssueCommentEvent') {
        message = data.payload.issue.title
    }
    else if (data.type === 'PullRequestEvent') {
        message = data.payload.pull_request.title
    }
    return (
        <div className="commit">
            <h1>Recent Event</h1>
            <h5>Type</h5>
            <p>{data.type}</p>
            <h5>To </h5>
            <p>{data.repo.name}</p>
            <h5>Message</h5>
            <p>{message}</p>
            <h5>At</h5>
            <p>{date}</p>
        </div>
    )
}
type sort = "stars" | "forks" | 'size';
interface LangStats {
    label: string,
    value: number,
}
let isActive = true
let isEvent = true
export default function IndexPage() {

    const [user, setUser] = React.useState<string>('NikSchaefer')
    const [userData, setUserData] = React.useState<userData>(defUserData)

    const [repoData, setRepoData] = React.useState<Repo[]>([])
    const [sortType, setSortType] = React.useState<sort>("stars")
    const [eventData, setEventData] = React.useState([])

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
    async function GetRepo(user: string) {
        try {
            const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=10000`)
            setRepoData(data.data)
        } catch (err) {
            window.location.href = '/'
        }
    } async function GetEvent(user: string) {
        try {
            const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(user)}/events`)
            setEventData(data.data)
        } catch (err) {
            window.location.href = '/'
        }
    }

    async function Get(user: string) {
        try {
            const data = await Axios.get(`https://api.github.com/users/${encodeURIComponent(user)}`)
            setUserData(data.data)
        } catch (err) {
            window.location.href = '/'
        }
    }
    React.useEffect(() => {
        if (isActive && repoData.length > 0) {
            setLangData(getLangStats(repoData))
            isActive = false
        }
        if (isEvent && eventData.length > 0) {
            const data = GetCommitHist(eventData)
            const toDate = data.map(temp => temp.x)
            new Chart(document.getElementById('hist'), {
                type: 'scatter',
                data: {
                    labels: toDate,
                    datasets: [{
                        label: 'Recent Commit History',
                        borderColor: 'blue',
                        fill: false,
                        data: data,
                        showLine: true

                    }],
                },
                options: {
                    title: {
                        text: 'Chart.js Time Scale'
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            type: 'time',
                            time: {

                                tooltipFormat: 'll HH:mm'
                            },

                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    },
                }
            })
            isEvent = false
        }
    })
    React.useEffect(() => {
        const a = window.location.href.split('=')
        Get(a[a.length - 1])
        GetRepo(a[a.length - 1])
        setUser(a[a.length - 1])
        GetEvent(a[a.length - 1])
    }, [])

    return (
        <div>
            <section className="info">
                <a href="https://github.com/NikSchaefer/Octo-Stats"><Icon.Logo /></a>
                <img src={userData.avatar_url} alt="..." className="avatar" />
                <div className="info-text">
                    <h1>{userData.name}</h1>
                    <a href={userData.html_url}>@{user}</a>
                    <p>{userData.bio}</p>
                    <div className='flex'>
                        <div className="info__subtext">
                            <Icon.City /><p>{userData.company}</p>
                        </div>
                        <div className="info__subtext">
                            <Icon.Location /><p>{userData.location}</p>
                        </div>
                        <div className="info__subtext">
                            <Icon.Date /><p> Joined {new Date(userData.created_at).toDateString()}</p>
                        </div>
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
                <EventGraph data={eventData} />
                <div className="graph">
                    <canvas id='hist' width='300' height='400'></canvas>
                </div>

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
            <footer>
                <p>Made
                    with <span aria-label='Love'>❤️</span> by <a
                        href="https://github.com/NikSchaefer" style={{ color: 'var(--blue)' }}>
                        Nik Schaefer</a></p>
            </footer>
        </div>
    )
}