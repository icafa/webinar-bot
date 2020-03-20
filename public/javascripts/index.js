var apiDomain = '';//'http://18.219.232.113:4001';//'';
var autoMessagesURL = apiDomain + '/api/getAllTimedMessages';
var newAutoMessagesURL = apiDomain + '/api/addTimedMessages';
var removeAutoMessagesURL = apiDomain + '/api/removeTimedMessage';
var updateAutoMessagesURL = apiDomain + '/api/updateTimedMessages';
var setModeratorNameURL = apiDomain + '/api/setModeratorName';
var getModeratorNameURL = apiDomain + '/api/getModeratorName';

var messages;

$.get(getModeratorNameURL, function(res) {
    console.log(res);
    if (res.success && res.moderator && res.moderator.name){
        $('#moderator-name').val(res.moderator.name);
    }
});
function analyzeInfo(msg) {
    var new_cond = false;
    var new_sock = null, mod_name = null;
    try {
        new_cond = JSON.parse(msg.condition);
    } catch(err) {
        new_cond = false;
        // console.log("err parse", msg.condition, err );
    }
    try {
        new_sock = JSON.parse(msg.sock);
        mod_name = new_sock.n;
    } catch(err) {
        new_sock = false;
        // console.log("err parse", msg.sock, err );
    }
    var new_msg = {
        id: msg.id,
        message: msg.message,
        mod_name: mod_name,
        videoTime: msg.videoTime,
        condition: new_cond
    };
    return new_msg;
}
function renderMessages(){
    var html = `        
        <tr>
            <th>No</th>
            <th>Video Time</th>
            <th>To say</th>
            <th>Moderator Name</th>
            <td>Actions</td>
        </tr>`
    for (var i = 0; i < messages.length; i ++) {
        html += `
            <tr>
                <td>${i+1}</td>
                <td>${messages[i].videoTime}</td>
                <td>${messages[i].message}</td>
                <td>${messages[i].mod_name}</td>
                <td><button onclick='onDeleteMessage(${i})'>Delete</button></td>
            </tr>`
    }
    html += `
        <tr>
            <td></td>
            <td><input id="new-video-time" class="full-width" /></td>
            <td><input id="new-message" class="full-width" /></td>
            <td><input id="new-mod-name" class="full-width" value="${$('#moderator-name').val()}"/></td>
            <td><button onclick='onAddMessage()'>Add</button></td>
        </tr>`
    $('#messageTable').html(html);
}
$.get(autoMessagesURL, function(res) {
    console.log(res);
    if (res.success){
        messages = res.tms.map(analyzeInfo);
        renderMessages();
    }
});

function onDeleteMessage(index) {
    console.log("deleteMessage", messages[index].id);
    var postData = {
        messageId: messages[index].id
    }
    $.post(removeAutoMessagesURL, postData, function(res) {
        if(res.success){
            messages.splice(index, 1);
            renderMessages();
        }
        console.log("removeAutoMessage result ", res);
    });
}
function onAddMessage(){
    console.log($("#new-video-time").val());
    console.log($("#new-message").val());
    console.log($("#new-mod-name").val());
    var modName = $("#new-mod-name").val();
    var videoTime = $("#new-video-time").val();
    var message = $("#new-message").val();
    var postData = {
        sock: JSON.stringify({
            n: modName
        }),
        videoTime: videoTime,
        message: message
    }
    $.post(newAutoMessagesURL, postData, function(res) {
        if (res.success) {
            messages.push(analyzeInfo(res.tm));
            messages.sort(function(a, b){return a.videoTime > b.videoTime});
            renderMessages();
        }
        console.log("newAutoMessagesURL result ", res);
    });
}
function setModeratorName(){
    var postData = {
        newName: $('#moderator-name').val()
    }
    $.post(setModeratorNameURL, postData, function(res) {
        if (res.success) {
            alert("set moderator name successfully!");
        } else {
            alert("error setting moderator name" + JSON.stringify(res.err));
        }
    });
}