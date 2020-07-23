const app = require('express')();
const redis = require('redis');
const getPost = require('./network');
 

// filtering object
let filterObject = (object , keys) => {
    let obj = {}
     for(let key  in object) {
       if(isKeyPresent(keys , key)){
         obj[key]=object[key];
       }
     }
     return obj;
  }

  let isKeyPresent = (keys , key) => { return keys.includes(key); }
  



 
// connecting with port but you can also pass another conf.
const redisClient = redis.createClient(6379)
 


// registering handler for error event
redisClient.on('error', (err) => {
    console.log("Error " + err)
});

redisClient.on('connect',() =>{
    console.log("Redis Connection Successfull");
});
 



// get all posts
app.get('/posts' , (request ,response) =>{
    console.log("route Hit"); // generating key for this posts request
    const cacheKey = 'req:posts';
    return redisClient.get(cacheKey , (err , posts) =>{
        console.log(posts);
        if(posts){
            console.log("cache hited");
            return response.json({source:"cached",payload:JSON.parse(posts)});
        }

        getPost()
        .then(posts => {
            let filters =  ["userId" , "id"]; // filtering by keys
            let filteredPosts = posts.map(ele=>filterObject(ele,filters));
            redisClient.setex(cacheKey,1080,JSON.stringify(filteredPosts));  //saving to cache
            console.log("returning response");
            console.log(filteredPosts);
            return response.json({
                source:"network_request", 
                payload:filteredPosts
            }); 
        })
        .catch(err => {
            return response.json(err);
        });

    });
});

 
// start express server at 3000 port
app.listen(3000, () => {
    console.log('Server listening on port: ', 3000)
});