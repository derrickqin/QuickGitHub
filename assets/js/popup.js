function constructDataTableInput (results) {
    githubVisitJson = JSON.parse(results[0]);
    let dataSet = [];
    maxTime = 0;
    Object.keys(githubVisitJson).forEach(function (key) {
        item = [
            key.replace('repository:', ''),
            githubVisitJson[key].visitCount,
            new Date(githubVisitJson[key].lastVisitedAt * 1000).toISOString()
        ];
        if (githubVisitJson[key].lastVisitedAt > maxTime) {
            dataSet.push(item);
        }
        else {
            dataSet.unshift(item);
        }
    })
    return dataSet
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab.url!= undefined && tab.url.startsWith("https://github.com/")) {
        chrome.tabs.executeScript(tab.id, { code: "localStorage.getItem('jump_to:page_views')" }, (results) => {
            if(results!=null) {
                dataSet = constructDataTableInput(results);
    
                $('#gh-visits').DataTable({
                    data: dataSet,
                    searching: false,
                    lengthChange: false,
                    order: [[1, "desc"]],
                    columns: [
                        {
                            title: "Repo",
                            render: function (data, type, row, meta) {
                                return '<a href="' + 'https://github.com/' + data + '">' + '<svg class="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>' + data + '</a>';
                            }
                        },
                        { title: "Visits" },
                        {
                            title: "Last Visit",
                            render: function (data, type) {
                                return type === 'sort' ? data : moment(data).format('L');
                            }
                        }
                    ]
                });
    
                // Remove "entries" from "Show x entries" to save some space
                $("label").each(function() {
                    $(this).html($(this).html().replace(/entries/g,""));
                });
    
                // A tag link is not working by default on popup.html in Chrome Extension
                $("td").on('click', function (e) {
                    if (e.target.href !== undefined) {
                        chrome.tabs.create({ url: e.target.href })
                    }
                });
            };
        });
    };

});

