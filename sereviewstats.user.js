// ==UserScript==
// @name         Close / Reopen status
// @namespace    https://github.com/TheHelmar/SEReviewStats
// @homepage     https://github.com/TheHelmar/SEReviewStats
// @version      0.3
// @description  Provides enhanced stats on the Stack Exchange Review pages Close, Reopen, Late Answers, First Posts & Low Quality Posts
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
// @match        https://*.stackexchange.com/review/first-posts*
// @match        https://*.stackoverflow.com/review/first-posts*
// @match        https://*.superuser.com/review/first-posts*
// @match        https://*.serverfault.com/review/first-posts*
// @match        https://*.askubuntu.com/review/first-posts*
// @match        https://*.stackapps.com/review/first-posts*
// @match        https://*.mathoverflow.net/review/first-posts*
// @match        https://*.stackexchange.com/review/low-quality-posts*
// @match        https://*.stackoverflow.com/review/low-quality-posts*
// @match        https://*.superuser.com/review/low-quality-posts*
// @match        https://*.serverfault.com/review/low-quality-posts*
// @match        https://*.askubuntu.com/review/low-quality-posts*
// @match        https://*.stackapps.com/review/low-quality-posts*
// @match        https://*.mathoverflow.net/review/low-quality-posts*
// @match        https://*.stackexchange.com/review/late-answers*
// @match        https://*.stackoverflow.com/review/late-answers*
// @match        https://*.superuser.com/review/late-answers*
// @match        https://*.serverfault.com/review/late-answers*
// @match        https://*.askubuntu.com/review/late-answers*
// @match        https://*.stackapps.com/review/late-answers*
// @match        https://*.mathoverflow.net/review/late-answers*
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
                let reviewType = /[^\/]+\/[^\/]+$/g.exec(window.location);
                reviewType = /[^\/]+/.exec(reviewType);
                if(reviewType == 'low-quality-posts' || reviewType == 'first-posts' || 'late-answers')
                {
                    //We're in First Posts / Low-Quality / Later-Answer Territory
                    if($(".subheader.answers-subheader > h2").html() == 'Answer')
                    {
                        let answer = $(".answer").attr("data-answerid");
                        let answerTimelinePath = `https://` +  window.location.host + `/admin/posts/timeline/` + answer;
                        //Query Question Page for Current Close Vote Count
                        $.get(answerTimelinePath, function(answerPage, status)
                              {

                            let html = $.parseHTML(answerPage);
                            let numberOfFlags = 0;
                            let nAA = 0;
                            let modAttention = 0;
                            let vLQ = 0;
                            let aLQ = 0;
                            let spam = 0;
                            let offensive =0;
                            $(html).find("tr[data-eventtype='flag'] > .event-verb > span").each(function()
                            {
                                try{modAttention += $(this).html().match(/PostOther/).length;}catch(err){}
                                try{nAA += $(this).html().match(/AnswerNotAnAnswer/).length;}catch(err){}
                                try{vLQ += $(this).html().match(/PostLowQuality/).length;}catch(err){}
                                try{aLQ += $(this).html().match(/PostLowQualityAuto/).length;}catch(err){}
                                try{aLQ += $(this).html().match(/PostSpam/).length;}catch(err){}
                                try{offensive += $(this).html().match(/PostOffensive/).length;}catch(err){}                                

                            });
                            
                            numberOfFlags = nAA+modAttention+vLQ+aLQ+spam+offensive;
                            $('.reviewable-post.reviewable-post-' + answer + ' > .sidebar > .module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)').after(`
<tr>
<td class="label-key">Total flags</td>
<td class="label-value">` + numberOfFlags + `</td>
</tr>
<tr>
<td class="label-key">Spam flags</td>
<td class="label-value">` + spam + `</td>
</tr>
<tr>
<td class="label-key">Offensive flags</td>
<td class="label-value">` + offensive + `</td>
</tr>
<tr>
<td class="label-key">NAA flags</td>
<td class="label-value">` + nAA + `</td>
</tr>
<tr>
<td class="label-key">LQ flags</td>
<td class="label-value">` + vLQ + `</td>
</tr>
<tr>
<td class="label-key">LQ (Auto) flags</td>
<td class="label-value">` + aLQ + `</td>
</tr>
<tr>
<td class="label-key">Mod flags</td>
<td class="label-value">` + modAttention + `</td>
</tr>
`);
                        });//answerPage
                    }
                }
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
                    //$('.module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)').after(`
                    $('.reviewable-post.reviewable-post-' + question + ' > .sidebar > .module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)').after(`
<tr>
<td class="label-key">Current Close Votes</td>
<td class="label-value">` + closeVotesNeeded + `</td>
</tr>
`);
                });//questionPage

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
                    $('.reviewable-post.reviewable-post-' + question + ' > .sidebar > .module.reviewable-post-stats > table > tbody > tr:nth-last-child(2)').after(`
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
                });//questionTimeline
            }, 1);
        }
    });
})();
