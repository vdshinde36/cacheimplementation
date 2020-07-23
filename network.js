/**
 * file for simulating network request
 */


 const posts = require('./posts.json');





 // simulating netwirk request of 1 second latency . WIP: random network request fails
module.exports = () => {
    return new Promise((resolve , reject) => {
        setTimeout(()=>{
            resolve(posts);
        },1000)
    });
}