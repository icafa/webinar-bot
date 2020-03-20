var apiDomain = 'http://18.219.232.113:4001';//'';
var autoMessagesURL = apiDomain + '/api/getAllTimedMessages';
var scriptsURL = apiDomain + '/chatapi/actions';
var messages;


$('.gd-ico-more_horiz').hide();
$('.w_send_to.pull-left.dropup').html("To LIoyd");
setTimeout(function(){$('#countdown_broadcast').html("On Air");},11000);
  

// save all user messages and send them to our server every minute
var ownChatMessages = [];
var EngagementChatLines = [];
var EngagementChatLinesInterval = 0;
var saveChatInterval = 0;
var EngagementChatLines;

$.get(autoMessagesURL, function(res) {
    console.log(res);
    if (res.success){
        messages = res.tms;
        EngagementChatLines = messages.map(function (msg) {
            var new_cond = false;
            var new_sock = null;
            try {
                new_cond = JSON.parse(msg.condition);
            } catch(err) {
                new_cond = false;
                console.log("err parse", msg.condition, err );
            }
            try {
                new_sock = JSON.parse(msg.sock);
            } catch(err) {
                new_sock = false;
                console.log("err parse", msg.sock, err );
            }
            var new_msg = {
                status: 0,
                message: {
                    message: msg.message.replace(/\[NAME\]/ig, me.n),
                    sock: new_sock
                },
                videoTime: msg.videoTime,
                condition: new_cond
            };
            return new_msg;
        });
        console.log("EngagementChatLines", EngagementChatLines);

        if (EngagementChatLines.length > 0) {
            EngagementChatLinesInterval = setInterval(checkTimeAndWriteBotMessage, 1000);
        }
    }
});
// UI changes
// ding on every message
$('body').append($('<audio>').attr('id', 'incomingMessageDing').attr('hidden', true).attr('src', 'https://webinar.consulting.com/assets/ding.mp3'));
function playMessageDing()
{
    var audio = document.getElementById("incomingMessageDing");
    audio.play();
}


// event after they type any chat message
$('input#chat_message').unbind('keypress');
// everwebinar function
$('input#chat_message').keypress(function(e) {
    // Enter pressed?
    if(e.which == 10 || e.which == 13) {
        $("#chat_message").removeClass("input_error");
        if($('input#chat_message').val() == "")
        {
            $("#chat_message").addClass("input_error");
            return false;
        }
        var messageTo = $("input.messageTo").val();
        var is_question = $("input.chatType").val() === "question";
        var mid = makeGUID();
        var data = { "sock": me, "mid" : mid, "message" : $('input#chat_message').val(), "is_question" : is_question }
        var ts = Math.round(player.currentTime());
        var attendeeChat={"ts": ts, "name" : me.n,"message" : $('input#chat_message').val(), "isQuestion" : is_question };
        attendeeChats.push(attendeeChat);

        newChatMessage(data);
        // overwrite to include ts for admin
        data.message = formatTimestamp(Math.round(player.currentTime())) + ' ' + $('input#chat_message').val();

        channel.trigger("client-chatMessage", data);

        $('input#chat_message').val("");
        $("div.chat-type").removeClass("chat-type-question");
        $("div.popover_reply_type").fadeOut();
        $("div.popover_reply_type a").removeClass("active");
        $("#replyChat").addClass("active");

        var message = $('#message_container_'+ mid);
        message.attr('data-ts', ts);
        message.attr('data-question', is_question);
    }
});
// internal function
$('input#chat_message').keypress(function(e) {
    if(e.which == 10 || e.which == 13) {
        var myChatMessage = $(".chatbox").find("li.message_container.own:first").find(".message_body").text();
        var myChatTimestamp = Math.round(player.currentTime());
        var myChatTimestampHuman = formatTimestamp(myChatTimestamp);
        ownChatMessages.push({name: me.n, email: me.e, message: myChatMessage, ts: myChatTimestamp, tsHuman: myChatTimestampHuman, country: myCountry});
    }
});


// append (private) to all new admin chat messages
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        //console.log(mutation);
        var newNodes = mutation.addedNodes;
        $.each(newNodes, function(index,node) {
            if ($(node).hasClass('admin')) {
                //save moderator message
                var messageText = $(node).find('.message_body').text();
                var moderatorName = $(node).find('.message_from').text();
                $(node).find('.message_from').html("LIoyd");
                var myChatTimestamp = Math.round(player.currentTime());
                var myChatTimestampHuman = formatTimestamp(myChatTimestamp);
                ownChatMessages.push({name: 'Moderator', email: 'moderator@consulting.com', message: messageText, ts: myChatTimestamp, tsHuman: myChatTimestampHuman, country: 'Consulting'});

                // check if (private is already appended)
                var nodeText = $(node).find('.message_from').text();

                if (nodeText.indexOf('private') == -1) {
                    $(node).find('.message_from').append(
                        $('<span>').css({'color': 'rgb(235, 114, 94)', 'padding-left': '0px', 'font-size': '12px', 'font-weight': 300}).text('(private)')
                    );
                }

                playMessageDing();                
            }
        });
    });

    // stackAdminMessages(3);
});
var observerConfig = {
    childList: true,
    subtree: true,
};
//listen to all changes to #mainChatBox and child nodes
var targetNode = document.getElementById('mainChatBox');
observer.observe(targetNode, observerConfig);

function checkTimeAndWriteBotMessage()
{
    $.each(EngagementChatLines, function(index, line) {
        if (line.videoTime < 0) {
            if (line.status != 1) {
                EngagementChatLines[index].status = 1;
                newChatMessage(EngagementChatLines[index].message);
            }
        } else {
            if(! player.paused()) {
                var seconds = Math.floor(player.currentTime());
                if (seconds == line.videoTime && line.status != 1) {
                    EngagementChatLines[index].status = 1;
                    newChatMessage(EngagementChatLines[index].message);
                }
            }
        }
    });
}

function formatTimestamp(ts)
{
    var milliseconds = ts*1000;
    var date = new Date(milliseconds);
    return '(' + String('00' + date.getUTCHours()).slice(-2) + ':' + String('00' + date.getUTCMinutes()).slice(-2) + ':' + String('00' + date.getUTCSeconds()).slice(-2) +')';
}

// save chat every minute
saveChatInterval = setInterval(saveChat, 10*1000);

function saveChat()
{
    if (ownChatMessages.length > 0) {
        var postData = {action: 'saveChat', messages: JSON.stringify(ownChatMessages)}
        $.post(scriptsURL, postData, function() {
            ownChatMessages = [];
        });
    }
}