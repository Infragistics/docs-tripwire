# Tripwire Help Viewer

## Setup

### Getting Content

1. Create folder "help" under online/Tripwire.Web
2. Create platform folder under help folder for what you want locally: "wpf", "winforms", "asp-net", "shareplus-ios"
3. Create a folder for the volume under the platform folder like "18.1".
4. Copy API and Topics from builds folder, for example: "\\\infragistics.local\igfiles\Builds\NetAdvantage for WPF\2018.1" then:
    * \\API.Help\\[build]\EN\Infragistics.WPF.API.zip
    * \\TripWire.Help\\[build]\EN\WPF.Topics.zip
5. First extract the API and then the Topics in the version folder from step 3 and on the prompt to replace file, say yes to all.

### IIS Installation if Needed

1. Open Control Panel - Programs and Features
2. Turn Windows Features on or off
3. Select "Internet Information Services"
4. Select "Internet Information Services" -> "World Wide Web Services" -> "Application Development Features" -> "ASP.NET 4.7"
5. Install URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite

### IIS Setup

1. Open "Internet Information Services (IIS) Manager"
2. Right click "Default Web Site" and select "Add Application..."
3. Set the Alias to "help"
4. Set the physical path to the "onine\Tripwire.Web" folder from where the git repo is cloned.
5. Give "Read & execute" permissions to the "Tripwire.Web" folder to the "IIS_IUSRS"
6. Right click "Default Web Site" and select "Edit Bindings..."
7. Click "Add..."
8. Select "https"
9. Select the "IIS Express Development Certificate"
10. Click "OK"
11. Click "Close"

### Running the Website

1. Open the Tripwire.sln under online and build the solution.
2. Browse to "http://localhost/help/wpf" in your browser.