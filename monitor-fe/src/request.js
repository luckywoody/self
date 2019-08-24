import axios from 'axios'
if (process.env.NODE_ENV !== 'production') {
  axios.defaults.baseURL = 'http://localhost:3002'
} else {
  axios.defaults.baseURL = '/'
}
export default axios
