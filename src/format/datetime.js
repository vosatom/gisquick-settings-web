const df = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
// const date = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' })
const dtf = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium' })
const tf = new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' })


function toDate (v) {
  return typeof v === 'string' ? new Date(v) : v
}

// export function utcToLocalDate (d) {
//   return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
// }

// export function localToUtcDate (d) {
//   return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
// }

// const formatDate = d => date.format(toDate(d))
// const formatDate = d => ({
//   datetime: datetime.format(toDate(d)),
//   date: date.format(toDate(d))
// })

export function formatDatetime (v) {
  return datetime.format(toDate(d))
}

export default {
  datetime: v => v && dtf.format(toDate(v)),
  date: v => v && df.format(toDate(v)),
  time: v => v && tf.format(toDate(v))
}