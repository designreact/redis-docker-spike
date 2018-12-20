### Prerequisites

Install apps
```
brew cask install docker
brew cask install redis
brew cask install yarn
```

Pull docker image
```
docker pull grokzen/redis-cluster:4.0.0
```

Install npm modules
```
yarn
```


### Useful

Mapping docker ports is easy with Kitematic from the settings tab

```
brew cask install kitematic
```


### Start Redis Cluster

```
docker run -e "IP=0.0.0.0" grokzen/redis-cluster:4.0.0
```


### Debug lambda handler

```
yarn debug
```


### Crudely deploy to AWS

Zip everything up and upload to AWS lambda. Set the relevant environment variables
```
zip -r test.zip .
```

### Deploy/Update cluster via Cloudformation
```
yarn deploy:stack create $ENVIRONMENT
```
```
yarn deploy:stack update $ENVIRONMENT
```

### Log Redis configuration endpoint
```
yarn log:host $ENVIRONMENT
```