/* 
    copies all topic images from the source location
    into the appropriate directiories for the online
    and offline applications
*/
module.exports =  function (grunt) {
    return {
        // using grunt API, all file paths are relative to the Gruntfile
        offline: {
            src: './topics',
            dests: ['./offline/Tripwire.Offline/help']
        },
        
        online: {
            src: './topics',
            dests: ['./online/Tripwire.Web/help/<%= major %>.<%= minor %>/']
        }
        
    };
};