

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

const getState = (name) => {
    const state = localStorage.getItem(name)
    if (state) return JSON.parse(state)
    return null
}

const setState = (name, state) => {
    localStorage.setItem(name, JSON.stringify(state))
}


const url = getRequestURL('https://docs.google.com/spreadsheets/d/1sxCPH3q_MdYJjDmeg61igLR5sPpo3WzDuY0O6Ra-i-M/edit?gid=0#gid=0')

const removeQuotes = (str) => str.slice(1, -1)
const processCellValue = (value) => removeQuotes(value).trim()

const parseSheet = (text) => {

    const headers = text.split('\n')[0].split(',').map(processCellValue)

    const data = text.split('\n').slice(1).map(row => {
        const values = row.split(',')
        return headers.reduce((acc, header, index) => {
            acc[header] = processCellValue(values[index])
            return acc
        }, {})
    })

    return {
        headers,
        data
    }

}

const updateSheetState = async (url) => {
    const savedText = getState(url)
    const text = await fetch(url).then(response => response.text())
    if (savedText === text) return null
    console.warn("Sheet state has changed")
    setState(url, text)
    return parseSheet(text)
}



const chooseRandomIdx = (arr) => Math.floor(Math.random() * arr.length)
const updateMessage = (messages, idx = chooseRandomIdx(messages)) =>  {
    const adjective = document.getElementById('adjective')
    adjective.innerText = messages[idx].toLowerCase()
    // const message = document.getElementById('message')
    // message.innerText = messages[idx]
}

onLoaded(async () => {
    const text = getState(url)
    const state = text ? parseSheet(text) : await updateSheetState(url)
    if (text) updateSheetState(url) // Always update sheet state in the background to add new messages
    const messages = state.data.map(row => row['Message'])
    const idx = (getState('idx') || 0 )% messages.length
    updateMessage(messages, idx)
    setState('idx', idx)
    localStorage.setItem('idx', idx + 1)
})