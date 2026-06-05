import axios from 'axios'

const BASE = 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE })

export const shortenURL = (url) =>
  api.post('/shorten/', { url })

export const listURLs = () =>
  api.get('/urls/')

export const getAnalytics = (alias) =>
  api.get(`/urls/${alias}/analytics/`)
