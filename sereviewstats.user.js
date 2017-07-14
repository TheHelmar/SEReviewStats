// ==UserScript==
// @name         Close / Reopen status
// @namespace    https://github.com/TheHelmar/SEReviewStats
// @homepage     https://github.com/TheHelmar/SEReviewStats
// @version      0.1
// @description  Provides enhanced stats on the Stack Exchange Review pages Close & Reopen
// @author       Helmar
// @match        https://*.stackexchange.com/review/close*
// @match        https://*.stackoverflow.com/review/close*
// @match        https://*.superuser.com/review/close*
// @match        https://*.serverfault.com/review/close*
// @match        https://*.askubuntu.com/review/close*
// @match        https://*.stackapps.com/review/close*
// @match        https://*.mathoverflow.net/review/close*
// @match        https://*.stackexchange.com/review/reopen*
// @match        https://*.stackoverflow.com/review/reopen*
// @match        https://*.superuser.com/review/reopen*
// @match        https://*.serverfault.com/review/reopen*
// @match        https://*.askubuntu.com/review/reopen*
// @match        https://*.stackapps.com/review/reopen*
// @match        https://*.mathoverflow.net/review/reopen*
// @downloadURL  https://github.com/TheHelmar/SEReviewStats/raw/master/sereviewstats.user.js
// @updateURL    https://github.com/TheHelmar/SEReviewStats/raw/master/sereviewstats.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    $(document).ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions)
    {
        if ( ajaxOptions.url.indexOf("/review/next-task")==0 || ajaxOptions.url.indexOf("/review/task-reviewed")==0 )
        {
            // defer until after the current event processing so that review has time to initialize the task
            setTimeout(function()
            {
                //Ready to react to review stuff
                let review = /[^\/]+$/g.exec(window.location);
                let question = $(".question").attr("data-questionid");
                let timelinePath = `https://` +  window.location.host + `/admin/posts/timeline/` + question;  
                let questionPath = `https://` +  window.location.host + `/questions/` + question;    

                //Query Question Page for Current Close Vote Count
                $.get(questionPath, function(questionPage, status)
                {
                    
                    let html = $.parseHTML(questionPage);
                    let closeVotesNeeded = 0;
                    
                    $(html).find(".close-question-link > span").each(function() 
                    {          
                        closeVotesNeeded=$(this).html();
                    });

                    $(".module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)").after(`
<tr>
<td class="label-key">Current Close Votes</td>
<td class="label-value">` + closeVotesNeeded + `</td>
</tr>
`);              
                });

                //Query timeline for more stats
                //Only works with modly powers
                $.get(timelinePath, function(timeline, status)
                      {
                    let html = $.parseHTML(timeline);
                    let voteCloseCount = 0;
                    let voteOpenCount = 0;
                    let closedCount = 0;
                    let reopenedCount = 0;

                    $(html).find(".closure").each(function() 
                                                  {          
                        try{voteCloseCount += $(this).html().match(/close/).length;}catch(err){}
                        try{voteOpenCount += $(this).html().match(/reopen/).length;}catch(err){}
                    });

                    $(html).find(".event-verb > span").each(function() 
                                                            {     
                        try{closedCount += $(this).html().match(/closed/).length;}catch(err){}
                        try{reopenedCount += $(this).html().match(/reopened/).length;}catch(err){}
                    }); 
                    $(".module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)").after(`
<tr>
<td class="label-key">Total Close Votes</td>
<td class="label-value">` + voteCloseCount + `</td>
</tr>
<tr>
<td class="label-key">Total Reopen Votes</td>
<td class="label-value">` + voteOpenCount + `</td>
</tr>
<tr>
<td class="label-key">Times Closed</td>
<td class="label-value">` + closedCount + `</td>
</tr>
<tr>
<td class="label-key">Times Reopened</td>
<td class="label-value">` + reopenedCount + `</td>
</tr>
`);              
                });
                               
            }, 1);
 
        }
    });
})();
