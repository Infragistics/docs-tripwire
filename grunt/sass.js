module.exports = {
                                	   // Task
    dist: {                            // Target
      options: {                       // Target options
        style: 'expanded'
      },
      files: {                         // Dictionary of files
        './online/Tripwire.Web/Content/main.css': './online/Tripwire.Web/Content/main.scss'      // 'destination': 'source'
      }
    },
    min: {                            // Target
      options: {                       // Target options
        style: 'compressed'
      },
      files: {                         // Dictionary of files
        './online/Tripwire.Web/Content/main.min.css': './online/Tripwire.Web/Content/main.scss'      // 'destination': 'source'
      }
    }
    
};