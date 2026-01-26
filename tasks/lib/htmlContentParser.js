/*
 * Extracts topic content, metadata and title from HTML string
 * Strips out all tags and quotes (double & single) from topic text
 */
(function (module) {

    module.parseDocument = function (text) {
        var cheerio = require('cheerio'),
            $ = cheerio.load(text),
            title, content, text = "",
            meta, metaString, type, subType;

        if ($("#BodyContent").length) {
            /* DocumentX! Templates
             * Those are handleled by their type to extract only meaninful content (or close to)
             * to reduce massive repeated content and search words rating skew. Also additional
             * class/memeber names are extracted for additional Solr field for direct matches.
             */
            type = "docx";
            subType = $('meta[name=Microsoft\\.Help\\.ContentType]').attr("content"); // Concepts for topics and Reference in generated API

            meta = {
                // <meta name="Microsoft.Help.Id" content="Infragistics.Web.Mvc~Infragistics.Web.Mvc_namespace"/> ? // some templates don't have TopicID meta, just the default
                fileName: $('meta[name=Microsoft\\.Help\\.Id]').attr("content"),
                controlName: [], //TODO?
                tags: $('meta[name=Tags]').attr("content"), //these don't exist in generated files
                netAPINames : []
            };
            if (meta.tags) {
                meta.tags = meta.tags.split(",");
            } else {
                meta.tags = [];
            }
            // TODO: Add DocX specific tag?
            if (subType == "Reference") {
                meta.tags.push("API");
            }

            title = $('#PageTitle').text();
            
            text = getDocXTopicContent($, meta);

        } else {
            // Markdown/AsciiDoc clean html output
            type = "tripwire";

             //strip code snippets, misc:
            $("pre").remove();
            $("style").remove();

            content = $.root();

            //get metadata:
           
            metaString = content.html().split('|metadata|');
            if (metaString[1]) {
                meta = JSON.parse(metaString[1]);
                if (!meta.fileName && meta.name) {
                    // patch new AsciiDoc metadata format
                    meta.fileName = meta.name;
                }
            } else {
                // let calling module log errors
                meta = {};
            }
            
            //D.P. Extend title extraction to H2-s as well, in case there's no H1 on the page
            title = $("h1, h2").eq(0).text();
            text = content.text();
        }

        var topic = {
            metadata: meta,
            title: title,
            type: type,
            subType: subType,
            content: (' ' + cleanUpText(text.trim())).substr(1)
        };

        return topic;
    };

    var getDocXTopicContent = function($, meta) {
        var content = $("#BodyContent");
        // assembly ID: Assembly
        if (meta.fileName.indexOf("~") === -1) {
            meta.netAPINames.push( meta.fileName );

            fixTablesText($);
            // just take all the text? TODO
            return content.text();
        }

        // namespace ID: Assembly~Namespace_namespace
        if (meta.fileName.indexOf("_namespace") !== -1) {
            meta.netAPINames.push( meta.fileName.split("~").pop().split("_namespace")[0] );

            // dump tables content (duplicated in their pages): 
            $("table").find(".LinkCell").add(".DescriptionCell").remove();
            fixTablesText($);
            return content.text();
        }

        // Assembly~Namespace.Class_members
        // Assembly~Namespace.Class_methods ||  _properties
        if (/(_members|_methods|_properties)$/.test(meta.fileName)) {
            // Class
            meta.netAPINames.push( meta.fileName.split("~").pop().split(".").pop().split("_")[0].split("`")[0] );
            // Namespace.Class
            meta.netAPINames.push( meta.fileName.split("~").pop().split("_")[0].split("`")[0] );

            // thse are mostly junk content, take top description and titles.
            stripJunkContent(content);
            var basicContent = [];
            $(".SectionHeadingText").each(function(){
                basicContent.push($(this).text());
            });
            //basicContent.push($("#publicMethodsSectionHeading").text());
            //$("#publicMethodsSectionContent").remove();
            //basicContent.push($("#protectedMethodsSectionHeading").text());
            //$("#protectedMethodsSectionContent").remove();
            return basicContent.join(" ");
        }

        // class ID: Assembly~Namespace.Class/Enum OR Assembly~Namespace.Class/Enum`N
        if (/^[^~]+~[^~]+$/.test(meta.fileName)) {
             // Class
            meta.netAPINames.push( meta.fileName.split("~").pop().split(".").pop().split("`")[0] );
            // Namespace.Class
            meta.netAPINames.push( meta.fileName.split("~").pop().split("`")[0] );

            // remove parts only, so occasional remarks can get indexed:
            stripJunkContent(content);
            fixTablesText($);
            return content.text();
        }

        // member ID: Assembly~Namespace.Class~Member
        if (/^[^~]+~[^~]+~[^~]+$/.test(meta.fileName)) {
            if (meta.fileName.indexOf("_ctor") !== -1) {
                // Class
                meta.netAPINames.push( meta.fileName.split("~")[1].split(".").pop().split("`")[0] );
                // Namespace.Class
                meta.netAPINames.push( meta.fileName.split("~")[1].split("`")[0] );
            } else {
                // Member
                var memberName = meta.fileName.split("~").pop();
                if (memberName.indexOf("(") !== -1) {
                    // Method
                    memberName = memberName.split("(")[0];
                }
                meta.netAPINames.push( memberName );
                // Class.Member
                meta.netAPINames.push( meta.fileName.split("~")[1] .split(".").pop().split("`")[0] + "." + memberName );
                // Namespace.Class.Member
                meta.netAPINames.push( meta.fileName.split("~")[1].split("`")[0] + "." + memberName );
            }

            // method members/ctor can have overloads tables, remove:
            content.find("#overloadlistSectionContent").remove();

            // remove parts only, so occasional remarks can get indexed:
            stripJunkContent(content);
            fixTablesText($);
            return content.text();
        }
    };

    var stripJunkContent = function(content) {
        //strip code snippets tab
        content.find("#TabContainer, .TabContainer").remove();
        //strip Requirements section
        content.find("#requirementsSectionHeading").remove();
        content.find("#requirementsSectionContent").remove();
        //strip See Also section
        content.find("#seealsoSectionHeading").remove();
        content.find("#seealsoSectionContent").remove();
    };

    var fixTablesText = function($) {
        // .text() merges values for DocX content (parser text fail)
        // add spaces for span headings
        $(".SectionHeadingText").add(".subHeading").add("h4").each(function(){
            $(this).text($(this).text() + " ");
        });
        // add spaces for table cells (parser text fail)
        $("table td").add("table th").each(function(){
            $(this).text($(this).text() + " ");
        });
    };

    var cleanUpText = function (text) {
        //text = text.replace(/<[^>]*>/g, '');
        text = text.replace(/"/g, '');
        text = text.replace(/'/g, '');

        // TODO: keep these?
        text = text.replace(/[\n\r]/g, ' ');   // remove line breaks, keep at least space between new lines
        text = text.replace(/\s{2,}/g, ' ');   // remove extra spaces
        return text;
    };

}(module.exports));