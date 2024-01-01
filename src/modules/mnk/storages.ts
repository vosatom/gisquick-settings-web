export const storages = [
  {
    id: 'local',
    type: 'local',
    label: 'Project folder',
  },
  {
    id: 'cyklomapa-aws',
    type: 's3',
    label: 'Cyklomapa AWS',
    access_key: '1234',
    bucket: 'cyklomapa-media',
    secret_key: '123',
    store_url: 'https://cyklomapa-media.s3-eu-west-1.amazonaws.com/',
    region: 'eu-west-1',
  },
  {
    id: 'aws-s3',
    type: 's3',
    label: 'Amazon',
    access_key: '456',
    bucket: 'test',
    secret_key: '123',
    store_url: 'https://test.s3.eu-central-1.amazonaws.com/',
    region: 'eu-central-1',
  },
]
