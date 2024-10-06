

const onLoaded = (fn) => {
    if (document.readyState === 'loading') return document.addEventListener('DOMContentLoaded', fn)
    fn()
}

const getRequestURL = (googleSheetUrl) => {
    const url = new URL(googleSheetUrl)
    const key = url.pathname.split('/')[3]
    const sheetName = url.searchParams.get('gid')
    return `https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
}

const url = getRequestURL('https://docs.google.com/spreadsheets/d/1sxCPH3q_MdYJjDmeg61igLR5sPpo3WzDuY0O6Ra-i-M/edit?gid=0#gid=0')

const STATES = {}

const removeQuotes = (str) => str.slice(1, -1)
const processCellValue = (value) => removeQuotes(value).trim()

const getCSVData = async (url) => {
    if (STATES[url]) return STATES[url]
    const text = await fetch(url).then(response => response.text())
    const headers = text.split('\n')[0].split(',').map(processCellValue)

    const data = text.split('\n').slice(1).map(row => {
        const values = row.split(',')
        return headers.reduce((acc, header, index) => {
            acc[header] = processCellValue(values[index])
            return acc
        }, {})
    })

    const state = STATES[url] = {
        headers,
        data
    }

    return state
}



const chooseRandomIdx = (arr) => Math.floor(Math.random() * arr.length)
const updateMessage = (messages, idx = chooseRandomIdx(messages)) =>  {
    const adjective = document.getElementById('adjective')
    adjective.innerText = messages[idx].toLowerCase()
    // const message = document.getElementById('message')
    // message.innerText = messages[idx]
}



onLoaded(async () => {
    const state = await getCSVData(url)
    const messages = state.data.map(row => row['Message'])
    const idx = (localStorage.getItem('idx') || 0) % messages.length
    updateMessage(messages, idx)
    localStorage.setItem('idx', idx + 1)
})