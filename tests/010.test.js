const axios = require('axios')
const appUrl = 'http://localhost:3001'

it('return empty persons', async () => {
  expect.assertions(2)
  await axios.post(`${appUrl}/persons/flush`)
  const result = await axios.get(`${appUrl}/persons`)
  expect(result.status).toBe(200)
  expect(result.data).toHaveLength(0)
})

it('add person', async () => {
  expect.assertions(3)
  const result = await axios.post(`${appUrl}/persons/add`, {name: 'dima', birthday: 495136800000})
  expect(result.status).toBe(200)
  const personsResponse = await axios.get(`${appUrl}/persons`)
  expect(personsResponse.status).toBe(200)
  expect(personsResponse.data).toHaveLength(1)
})
