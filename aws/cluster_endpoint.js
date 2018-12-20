'use strict';

const AWS = require('aws-sdk');

const elastiCache = new AWS.ElastiCache({
  apiVersion: '2015-02-02',
  region: 'eu-west-1',
});

const { GROUP_ID } = process.env;

const argv = process.argv;
const [, , cmd, environment] = argv;

const stage = environment || 'staging';

function getRedisDescription() {
  return new Promise((resolve, reject) => {
    elastiCache.describeReplicationGroups(
      {
        ReplicationGroupId: GROUP_ID || `redis-${stage}`
      },
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.ReplicationGroups);
      }
    );
  });
}

async function getRedisHosts(stage) {
  const groups = await getRedisDescription(stage);
  return groups.map(({ ConfigurationEndpoint: { Address, Port } }) => ({ host: Address, port: Port }));
}

module.exports = function getDefaultConfig() {
  getRedisHosts().then(redisHosts => console.log(redisHosts));
}