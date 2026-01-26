module.exports = {
    
  /* deprecated */     
    md2html:{
        options: {
              layout: './offline/templates/index-template.html',
              basePath: '',
              markedOptions: {
                gfm: true
              }
        },
        files: [{
          src: ['./topic-files/home-page.md'],
          dest: './offline/Tripwire.Offline/help/index.html'
        }]
    }
};