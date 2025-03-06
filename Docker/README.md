# Docker 
![Docker](/assets/icons8-docker-96.png)
## Task:
- *Write a Dockerfile for any simple backend app*

- *Build it*

- *Create a custom bridge network* 

- *Create a container instance from your docker image and it should use the new bridge network*

## Workthrougt 
#### Setup envoiment
- install ```docker``` 
- install ```node js`` *for develop app and test it locally*

#### Develop NodeJS App
- create new directory ```zeroApp```
- create ```index.js``` file
- initialize nodejs 
```
npm init -y
```
- install required modules 
```
npm install fs path
```
- test and run app on local hsot 
```
node index.js
```
#### Write and build Docker file
- create ```Dockerfile```
```
FROM node:12.22.9
WORKDIR /app
COPY package.json /app 
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 3000

```
- **Breakdowns the file**
1. ```FROM node:12.22.9``` get base image for my new image
2. ```WORKDIR /app``` create direcotry and go on it 
3. ```COPY package.json /app``` copy the ```package.json``` file that contain configuration and required dependeancy 
4. ```COPY . /app``` copy remaining application files to dircetory we had created before
5. ```CMD node index.js``` running the app
6. ```EXPOSE 3000``` publiching app on port 3000

- **Build and Tag image**
1. build image ``` docker build . ``` *note: ensure we at same directory of docker file*
    * **DEMO** : Bulding Image
    ![image-build](/assets/building-image.png)
2. tag the image ```docker tag <IMAGE-ID> aly/zerosploit``` *note: ensure repo name is small char*
    * **DEMO** : Tagging Image
    ![tag-image](/assets/tagging-image.png)

- **Demo** : *Run the container* (test it running well on defult bridge network)
    * ```docker run -d -p 2025:3000 aly/zerosploit``` --> ```-d``` to be at background -- ```-p``` to expose the port
    ![run](/assets/run-container.png)
    * Preview
    ![running](/assets/running-container.png)

#### Create bridge network
1. note the ```ip a``` command before creating bridge network , and keep in your mind the following output
![net](/assets/defult-network.png)

2. create bridge network ``` docker network  create -d bridge zero-net``` 
*note that : new virtual interface was created*
![bride](/assets/bridge-network.png)

#### Run new container with new bridge network I have been created 
 - when use ```ip a``` command note that we see new vitual ethernet apear
 ![run](/assets/virtual-ethernet.png)

 - lets go inside the container and run ```ip a``` command , note that the network interface is map to bride network ```br-XXXX``` we see it before with same subnet
 ![inside](/assets/inside-container.png)

 #### Final Demo 
 - **you can see live preview [here](http://47.254.196.142:2026/)**
 ![demo](/assets/running.png)


