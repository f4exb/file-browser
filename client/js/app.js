(function($){

    var extensionsMap = {
        ".zip" : "fa-file-archive-o",         
        ".gz" : "fa-file-archive-o",         
        ".bz2" : "fa-file-archive-o",         
        ".xz" : "fa-file-archive-o",         
        ".rar" : "fa-file-archive-o",         
        ".tar" : "fa-file-archive-o",         
        ".tgz" : "fa-file-archive-o",         
        ".tbz2" : "fa-file-archive-o",         
        ".z" : "fa-file-archive-o",         
        ".7z" : "fa-file-archive-o",         
        ".mp3" : "fa-file-audio-o",         
        ".cs" : "fa-file-code-o",         
        ".c" : "fa-file-code-o",         
        ".c++" : "fa-file-code-o",         
        ".cpp" : "fa-file-code-o",         
        ".go" : "fa-file-code-o",         
        ".java" : "fa-file-code-o",         
        ".js" : "fa-file-code-o",         
        ".py" : "fa-file-code-o",         
        ".xls" : "fa-file-excel-o",         
        ".xlsx" : "fa-file-excel-o",         
        ".png" : "fa-file-image-o",         
        ".jpg" : "fa-file-image-o",         
        ".jpeg" : "fa-file-image-o",         
        ".gif" : "fa-file-image-o",         
        ".mpeg" : "fa-file-movie-o",         
        ".pdf" : "fa-file-pdf-o",         
        ".ppt" : "fa-file-powerpoint-o",         
        ".pptx" : "fa-file-powerpoint-o",         
        ".txt" : "fa-file-text-o",         
        ".log" : "fa-file-text-o",         
        ".doc" : "fa-file-word-o",         
        ".docx" : "fa-file-word-o",         
    };

    function getFileIcon(ext) {
        return ( ext && extensionsMap[ext.toLowerCase()]) || 'fa-file-o';
    }
  
    var currentPath = null;
    var options = {
        "dom": 'lrtip', // add 'f' for search box
        "bProcessing": true,
        "bServerSide": false,
        "bPaginate": false,
        "bAutoWidth": false,
        "sScrollY":"250px",
        "fnCreatedRow" :  function( nRow, aData, iDataIndex ) {
            if (!aData.IsDirectory) return;
            var path = aData.Path;
            $(nRow).bind("click", function(e){
                $.get('/files?path='+ path).then(function(data){
                    $('#pathlabel').text(path || '.');
                    table.fnClearTable();
                    table.fnAddData(data);
                    currentPath = path;
                });
                e.preventDefault();
            });
        }, 
        "aoColumns": [{ 
            "sTitle": "", "mData": null, "bSortable": false, "sClass": "head0", "sWidth": "55px",
            "render": function (data, type, row, meta) {
                if (data.IsDirectory) {
                    return "<a href='#' target='_blank'><i class='fa fa-folder'></i>&nbsp;" + data.Name +"</a>";
                } else {
                    return "<a href='/" + data.Path + "' target='_blank'><i class='fa " + getFileIcon(data.Ext) + "'></i>&nbsp;" + data.Name +"</a>";
                }
            }
        }]
    };

    var table = $(".linksholder").dataTable(options);

    $.get('/files').then(function(data){
        $('#pathlabel').text(currentPath || '.');
        table.fnClearTable();
        table.fnAddData(data);
    });

    $(".up").bind("click", function(e){
        if (!currentPath) return;
        var trpath = currentPath.replace(/\\/g, "/"); // make sure we only have slashes as directory separator
        var idx = trpath.lastIndexOf("/");
        var path =currentPath.substr(0, idx);
        $.get('/files?path='+ path).then(function(data){
            $('#pathlabel').text(path || '.');
            table.fnClearTable();
            table.fnAddData(data);
            currentPath = path;
        });
    });
    
    $(".filterfiles").bind("click", function(e){
        console.log($(".filtertext")[0].value);
        table.fnFilter($(".filtertext")[0].value);
    });
    
    var findoptions = {
        "dom": 'lrtip', // add 'f' for search box
        "bProcessing": true,
        "bServerSide": false,
        "bPaginate": false,
        "bAutoWidth": false,
        "bSort": false,
        "sScrollY":"250px",
        "sScrollX":"500px",
        "aoColumns": [
            { // icon
                "sTitle": "", "mData": null, "bSortable": false, "sClass": "headicon", "sWidth": "8px",
                "render": function (data, type, row, meta) {
                    return "<i class='fa " + getFileIcon(data.Ext) + "'></i>";
                }
            },
            { // file
                "sTitle": "", "mData": null, "bSortable": true, "sClass": "head0", "sWidth": "70px",
                "render": function (data, type, row, meta) {
                    return "<a href='/" + data.Path + "' target='_blank'>" + data.Path +"</a>";
                }
            },
            { // line number
                "sTitle": "", "mData": null, "bSortable": false, "sClass": "head1", "sWidth": "10px",
                "render": function (data, type, row, meta) {
                    return data.Linenumber  ;
                }
            },
            { // line text
                "sTitle": "", "mData": null, "bSortable": false, "sClass": "head2", "sWidth": "500px",
                "render": function (data, type, row, meta) {
                    return data.Linetext;
                }
            }
        ]
    };

    var findtable = $(".findlinksholder").dataTable(findoptions);

    $(".findfiles").bind("click", function(e){
        var findregex = $(".findtext")[0].value;
        findregex = findregex.replace(/\\/g, "%5C");
        var path = currentPath || '';
        $.get('/find?path=' + path + '&regex=' + findregex).then(function(data){
            findtable.fnClearTable();
            findtable.fnDestroy();
            findtable = $(".findlinksholder").dataTable(findoptions);
            if (data.length > 0) {
                findtable.fnAddData(data);
            }
        });
    });

    $(".searchfiles").bind("click", function(e){
        var searchregex = $(".searchtext")[0].value;
        searchregex = searchregex.replace(/\\/g, "%5C");
        var path = currentPath || '';
        $.get('/search?path=' + path + '&regex=' + searchregex).then(function(data){
            findtable.fnClearTable();
            if (data.length > 0) { 
                findtable.fnAddData(data);
            }
        });
    });

})(jQuery);
