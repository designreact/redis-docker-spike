'use strict';

/* eslint no-console: "off" */
const cp = require('child_process');

const chalk = require('chalk');
const fs = require('fs-extra');

const {
  REDIS_DESCRIPTION,
  GROUP_ID,
  GROUP_DESCRIPTION,
  CACHE_TYPE,
  GROUP_COUNT,
  REPLICA_COUNT,
  SECURITY_GROUP,
} = process.env;

const argv = process.argv;
const [, , cmd, environment] = argv;

const stage = environment || 'staging';
const command = cmd || 'update';

const cloudformationRedisConfig = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description: REDIS_DESCRIPTION || `${stage.toUpperCase()} - Redis Replication Group`,
  Resources: {
    ElasticacheReplicationGroup: {
      Type: 'AWS::ElastiCache::ReplicationGroup',
      Version: '2015-02-02',
      Properties: {
        AutomaticFailoverEnabled: true,
        AutoMinorVersionUpgrade: true,
        ReplicationGroupId: GROUP_ID || `redis-${stage}`,
        ReplicationGroupDescription: GROUP_DESCRIPTION || `Redis cluster - ${stage}`,
        CacheNodeType: CACHE_TYPE || 'cache.t2.small',
        CacheParameterGroupName: 'default.redis4.0.cluster.on',
        Engine: 'redis',
        EngineVersion: '4.0',
        NumNodeGroups: GROUP_COUNT || 1,
        NodeGroupConfiguration: [
          {
            PrimaryAvailabilityZone: 'eu-west-1a',
            ReplicaAvailabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
            ReplicaCount: REPLICA_COUNT || 3,
          },
        ],
        SecurityGroupIds: [SECURITY_GROUP],
      },
    },
  },
};

const path = `./tmp/${stage}`;
const file = `./tmp/${stage}/cloudformation_template.json`;

fs.mkdirpSync(path);
fs.writeJSON(file, cloudformationRedisConfig, { spaces: 2 })
  .then(() => {
    console.log(chalk.green('✅', 'FILE CREATED SUCCESSFULLY'));
    console.log(file);

    return cp.execSync(
      `aws cloudformation ${command}-stack --stack-name redis-${stage} --template-body file://${file}`,
      {
        stdio: [0, 1, 2],
      }
    );
  })
  .then(() => {
    console.log(chalk.green('🌍 🚀', 'DEPLOYED'));
  })
  .catch(e => {
    console.log(chalk.red('************************************************************'));
    console.log(chalk.red('❌', 'FAILED', e));
    console.log(chalk.red('************************************************************'));
  });
